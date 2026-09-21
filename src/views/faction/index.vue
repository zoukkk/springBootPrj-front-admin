<script setup>
import { h } from 'vue'
import { CircleCheck, CircleClose, Delete, Edit, MoreFilled, Plus, RefreshLeft, Search, View } from '@element-plus/icons-vue'
import { ElButton, ElSwitch, ElTag } from 'element-plus'
import FactionApi from '@/api/depts/faction'
import HeroApi from '@/api/depts/hero'
import RiotApi from '@/api/depts/riot'
import PageContainer from '@/components/PageContainer.vue'
import Table from '@/components/table/index.vue'
import { getChampionPosition } from '@/utils/riot'
import FactionFormDialog from './components/FactionFormDialog.vue'
import HeroDetailDialog from './components/HeroDetailDialog.vue'
import HeroFormDialog from './components/HeroFormDialog.vue'

const factionTree = ref([])
const allFactions = ref([])
const factionMembers = ref([])
const selectedFaction = ref(null)
const loading = ref(false)
const tableLoading = ref(false)
const detailLoading = ref(false)
const keyword = ref('')
const treeRef = ref()
const factionDialogVisible = ref(false)
const factionEditId = ref(null)
const factionParentId = ref(0)
const factionDetailVisible = ref(false)
const factionDetail = ref(null)
const heroDialogVisible = ref(false)
const heroDetailVisible = ref(false)
const currentHeroId = ref(null)
const recycleVisible = ref(false)
const recycleLoading = ref(false)
const deletedFactions = ref([])
const restoringIds = reactive(new Set())
const heroStatusLoading = reactive(new Set())
let nodeRequestId = 0

const pagingData = reactive({
  total: 0,
  pageObj: { pageNum: 1, pageSize: 20 },
})

function flattenTree(items) {
  return items.flatMap((item) => [item, ...flattenTree(item.children || [])])
}

const factionRows = computed(() => flattenTree(factionTree.value))
const leaderMember = computed(() =>
  factionMembers.value.find((member) => member.id === selectedFaction.value?.leaderHeroId),
)
const sortedFactionMembers = computed(() => {
  const leaderId = selectedFaction.value?.leaderHeroId
  return [...factionMembers.value].sort(
    (left, right) => Number(right.id === leaderId) - Number(left.id === leaderId),
  )
})

const memberColumns = [
  { prop: 'id', label: '档案 ID', width: 86, align: 'center' },
  {
    prop: 'name',
    label: '英雄',
    minWidth: 170,
    showOverflowTooltip: true,
    render: ({ row }) => h('strong', formatHeroName(row)),
  },
  {
    prop: 'role',
    label: '阵营身份',
    minWidth: 120,
    showOverflowTooltip: true,
    render: ({ row }) =>
      row.id === selectedFaction.value?.leaderHeroId
        ? h(ElTag, { type: 'warning', effect: 'light' }, () => row.role || '阵营领袖')
        : h('span', row.role || '阵营成员'),
  },
  { prop: 'position', label: '定位', minWidth: 105, showOverflowTooltip: true },
  {
    prop: 'gender',
    label: '性别',
    width: 72,
    align: 'center',
    render: ({ row }) => getGenderLabel(row.gender),
  },
  { prop: 'createTime', label: '创建时间', width: 168 },
  { prop: 'updateTime', label: '修改时间', width: 168 },
  {
    prop: 'status',
    label: '状态',
    width: 92,
    align: 'center',
    render: ({ row }) =>
      h(ElSwitch, {
        modelValue: row.status === 1,
        loading: heroStatusLoading.has(row.id),
        inlinePrompt: true,
        activeText: '启',
        inactiveText: '停',
        beforeChange: () => updateHeroStatus(row),
      }),
  },
  {
    label: '操作',
    width: 188,
    align: 'center',
    fixed: 'right',
    render: ({ row }) =>
      h('div', { class: 'table-actions' }, [
        h(ElButton, { link: true, type: 'primary', icon: View, onClick: () => openHeroDetail(row) }, () => '详情'),
        h(ElButton, { link: true, type: 'primary', icon: Edit, onClick: () => openHeroEdit(row) }, () => '编辑'),
        h(ElButton, { link: true, type: 'danger', icon: Delete, onClick: () => deleteHero(row) }, () => '删除'),
      ]),
  },
]

function formatHeroName(hero) {
  return hero.nickname ? `${hero.nickname}-${hero.name}` : hero.name
}

function getGenderLabel(gender) {
  return { 0: '未知', 1: '男', 2: '女' }[gender] || '未知'
}

function getFactionName(id) {
  if (!id) return '无（顶级阵营）'
  return factionRows.value.find((item) => item.id === id)?.name || `阵营 ${id}`
}

function getLeaderLabel(faction) {
  if (!faction?.leaderHeroId) return '待任命'
  const members = faction.members || factionMembers.value
  return members.find((member) => member.id === faction.leaderHeroId)?.name || `档案 ${faction.leaderHeroId}`
}

async function enrichHeroPositions(list) {
  const versions = [...new Set(list.map((item) => item.dataVersion).filter(Boolean))]
  const catalogs = Object.fromEntries(
    await Promise.all(versions.map(async (version) => [version, await RiotApi.getChampionCatalog(version)])),
  )
  return list.map((item) => ({
    ...item,
    position: getChampionPosition(catalogs[item.dataVersion]?.[item.riotChampionId]?.tags),
  }))
}

async function loadHeroes(factionId = selectedFaction.value?.id) {
  if (!factionId) {
    factionMembers.value = []
    pagingData.total = 0
    return
  }
  tableLoading.value = true
  try {
    const result = await HeroApi.getHeroList({
      factionId,
      keyword: keyword.value.trim() || undefined,
      pageNum: pagingData.pageObj.pageNum,
      pageSize: pagingData.pageObj.pageSize,
    })
    factionMembers.value = await enrichHeroPositions(result.list || [])
    pagingData.total = result.total || 0
    pagingData.pageObj.pageNum = result.pageNum || 1
    pagingData.pageObj.pageSize = result.pageSize || 20
  } finally {
    tableLoading.value = false
  }
}

async function loadFactions() {
  nodeRequestId += 1
  loading.value = true
  try {
    factionTree.value = await FactionApi.getFactionTree()
    allFactions.value = flattenTree(factionTree.value)
    const current = allFactions.value.find((item) => item.id === selectedFaction.value?.id) || allFactions.value[0] || null
    selectedFaction.value = current
    pagingData.pageObj.pageNum = 1
    await nextTick()
    if (current) treeRef.value?.setCurrentKey(current.id)
    await loadHeroes(current?.id)
  } finally {
    loading.value = false
  }
}

function searchHeroes() {
  pagingData.pageObj.pageNum = 1
  loadHeroes()
}

async function handleNodeClick(row) {
  const requestId = ++nodeRequestId
  selectedFaction.value = row
  pagingData.pageObj.pageNum = 1
  tableLoading.value = true
  try {
    const result = await FactionApi.getFactionTree({ keyword: row.name })
    if (requestId !== nodeRequestId) return
    selectedFaction.value = flattenTree(result).find((item) => item.id === row.id) || row
    await loadHeroes(row.id)
  } finally {
    if (requestId === nodeRequestId) tableLoading.value = false
  }
}

function handleReset() {
  keyword.value = ''
  searchHeroes()
}

function handleTreeCommand(command, row) {
  if (command === 'add') openFactionCreate(row)
  if (command === 'edit') openFactionEdit(row)
  if (command === 'status') updateFactionStatus(row)
  if (command === 'delete') deleteFaction(row)
}

function openFactionCreate(parent) {
  factionEditId.value = null
  factionParentId.value = parent?.id || 0
  factionDialogVisible.value = true
}

function openFactionEdit(row) {
  factionEditId.value = row.id
  factionParentId.value = row.parentId || 0
  factionDialogVisible.value = true
}

async function openFactionDetail(row) {
  factionDetailVisible.value = true
  detailLoading.value = true
  factionDetail.value = null
  try {
    factionDetail.value = await FactionApi.getFactionDetail(row.id)
  } finally {
    detailLoading.value = false
  }
}

async function updateFactionStatus(row) {
  const nextStatus = row.status === 1 ? 0 : 1
  const actionText = nextStatus === 1 ? '启用' : '停用'
  const cascade = nextStatus === 0
  const description = cascade
    ? `停用“${row.name}”将同步停用其下属阵营及人物，是否继续？`
    : `是否启用阵营“${row.name}”？`
  const confirmed = await ElMessageBox.confirm(description, `${actionText}阵营`, {
    type: 'warning', confirmButtonText: `确认${actionText}`, cancelButtonText: '取消',
  }).catch(() => false)
  if (!confirmed) return
  await FactionApi.updateFactionStatus(row.id, { status: nextStatus, cascade })
  ElMessage.success(`阵营${actionText}成功`)
  await loadFactions()
}

async function deleteFaction(row) {
  const confirmed = await ElMessageBox.confirm(
    `删除后“${row.name}”将进入回收站，可在回收站恢复。是否继续？`,
    '删除阵营',
    { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' },
  ).catch(() => false)
  if (!confirmed) return
  await FactionApi.deleteFaction(row.id)
  ElMessage.success('阵营已移入回收站')
  await loadFactions()
}

async function openRecycle() {
  recycleVisible.value = true
  recycleLoading.value = true
  try {
    deletedFactions.value = await FactionApi.getDeletedFactions()
  } finally {
    recycleLoading.value = false
  }
}

async function restoreFaction(row) {
  const confirmed = await ElMessageBox.confirm(`是否恢复阵营“${row.name}”？`, '恢复阵营', {
    type: 'info', confirmButtonText: '确认恢复', cancelButtonText: '取消',
  }).catch(() => false)
  if (!confirmed) return
  restoringIds.add(row.id)
  try {
    await FactionApi.restoreFaction(row.id)
    ElMessage.success('阵营恢复成功')
    deletedFactions.value = await FactionApi.getDeletedFactions()
    await loadFactions()
  } finally {
    restoringIds.delete(row.id)
  }
}

function openHeroCreate() {
  if (!selectedFaction.value) return
  currentHeroId.value = null
  heroDialogVisible.value = true
}

function openHeroEdit(row) {
  currentHeroId.value = row.id
  heroDialogVisible.value = true
}

function openHeroDetail(row) {
  currentHeroId.value = row.id
  heroDetailVisible.value = true
}

async function updateHeroStatus(row) {
  const nextStatus = row.status === 1 ? 0 : 1
  heroStatusLoading.add(row.id)
  try {
    await HeroApi.updateHeroStatus(row.id, nextStatus)
    row.status = nextStatus
    ElMessage.success(`人物已${nextStatus === 1 ? '启用' : '停用'}`)
    return true
  } catch {
    return false
  } finally {
    heroStatusLoading.delete(row.id)
  }
}

async function deleteHero(row) {
  const confirmed = await ElMessageBox.confirm(
    `此操作会删除人物档案“${formatHeroName(row)}”，不是仅移出当前阵营。是否继续？`,
    '删除人物',
    { type: 'warning', confirmButtonText: '确认删除', cancelButtonText: '取消' },
  ).catch(() => false)
  if (!confirmed) return
  await HeroApi.deleteHero(row.id)
  ElMessage.success('人物档案删除成功')
  await loadFactions()
}

onMounted(loadFactions)
</script>

<template>
  <PageContainer class="faction-page" title="阵营管理" :show-header="false">
    <div v-loading="loading" class="faction-layout">
      <el-card class="faction-tree-panel" shadow="never">
        <template #header>
          <div class="panel-title">
            <div><strong>Runeterra Factions</strong><span>{{ factionRows.length }} 个阵营</span></div>
            <el-tooltip content="阵营回收站" placement="top">
              <el-button circle text :icon="Delete" aria-label="阵营回收站" @click="openRecycle" />
            </el-tooltip>
          </div>
        </template>
        <el-tree ref="treeRef" :data="factionTree" node-key="id" highlight-current default-expand-all
          :expand-on-click-node="false" :props="{ label: 'name', children: 'children' }" @node-click="handleNodeClick">
          <template #default="{ data }">
            <div class="tree-node">
              <img v-if="data.iconUrl" :src="data.iconUrl" :alt="`${data.name}徽章`" />
              <span v-else class="faction-dot" :style="{ backgroundColor: data.themeColor }" />
              <span class="tree-label">{{ data.name }}</span><small>{{ data.code }}</small>
              <span class="tree-actions" @click.stop>
                <el-dropdown trigger="click" @command="handleTreeCommand($event, data)">
                  <el-button text circle size="small" :icon="MoreFilled" aria-label="阵营操作" @click.stop />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="add" :icon="Plus">新增子阵营</el-dropdown-item>
                      <el-dropdown-item command="edit" :icon="Edit">编辑阵营</el-dropdown-item>
                      <el-dropdown-item command="status" :icon="data.status === 1 ? CircleClose : CircleCheck" divided>
                        {{ data.status === 1 ? '停用阵营' : '启用阵营' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" :icon="Delete">删除阵营</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </span>
            </div>
          </template>
        </el-tree>
      </el-card>

      <main class="faction-content">
        <el-card v-if="selectedFaction" class="faction-summary" shadow="never"
          :style="{ borderLeftColor: selectedFaction.themeColor || '#646cff' }">
          <div class="summary-content">
            <div class="faction-identity">
              <img v-if="selectedFaction.iconUrl" :src="selectedFaction.iconUrl" :alt="`${selectedFaction.name}徽章`" />
              <span v-else class="summary-mark" :style="{ backgroundColor: selectedFaction.themeColor }" />
              <div><span class="summary-code">{{ selectedFaction.code }}</span><h2>{{ selectedFaction.name }}</h2>
                <p>{{ selectedFaction.description || '暂无阵营背景描述' }}</p></div>
            </div>
            <dl class="summary-stats">
              <div><dt>层级</dt><dd>{{ selectedFaction.level }}</dd></div>
              <div><dt>状态</dt><dd>{{ selectedFaction.status === 1 ? '启用' : '停用' }}</dd></div>
              <div><dt>成员</dt><dd>{{ pagingData.total }}</dd></div>
              <div><dt>领袖</dt><dd>{{ leaderMember?.name || getLeaderLabel(selectedFaction) }}</dd></div>
            </dl>
            <el-button link type="primary" :icon="View" @click="openFactionDetail(selectedFaction)">详情</el-button>
          </div>
        </el-card>

        <el-card class="faction-toolbar" shadow="never">
          <el-space wrap>
            <el-input v-model="keyword" class="faction-search" clearable placeholder="搜索当前阵营的人物、称号或身份"
              :prefix-icon="Search" @keyup.enter="searchHeroes" @clear="searchHeroes" />
            <el-button type="primary" @click="searchHeroes">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="primary" plain :icon="Plus" :disabled="!selectedFaction" @click="openHeroCreate">新增人物</el-button>
          </el-space>
        </el-card>

        <el-card v-loading="tableLoading" class="faction-table-wrap" shadow="never" :body-style="{ padding: 0 }">
          <Table :data="sortedFactionMembers" :columns="memberColumns" :paging-data="pagingData"
            max-height="calc(100vh - 370px)" row-key="id" empty-text="当前阵营暂无英雄成员" @change-page="loadHeroes()" />
        </el-card>
      </main>
    </div>

    <FactionFormDialog v-model="factionDialogVisible" :edit-id="factionEditId" :parent-id="factionParentId"
      :faction-tree="factionTree" @saved="loadFactions()" />
    <HeroFormDialog v-model="heroDialogVisible" :hero-id="currentHeroId" :selected-faction="selectedFaction"
      :factions="allFactions" @saved="loadFactions()" />
    <HeroDetailDialog v-model="heroDetailVisible" :hero-id="currentHeroId" />

    <el-dialog v-model="factionDetailVisible" title="阵营档案" width="720px">
      <div v-loading="detailLoading" class="detail-body">
        <template v-if="factionDetail">
          <div class="detail-hero" :style="{ borderColor: factionDetail.themeColor }">
            <el-image v-if="factionDetail.iconUrl" :src="factionDetail.iconUrl"
              :preview-src-list="[factionDetail.iconUrl]" fit="contain" />
            <div><el-text type="info">{{ factionDetail.code }}</el-text><h2>{{ factionDetail.name }}</h2>
              <p>{{ factionDetail.description || '暂无阵营背景资料' }}</p></div>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="阵营 ID">{{ factionDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="上级阵营">{{ getFactionName(factionDetail.parentId) }}</el-descriptions-item>
            <el-descriptions-item label="层级">{{ factionDetail.level }}</el-descriptions-item>
            <el-descriptions-item label="排序">{{ factionDetail.sort }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ factionDetail.status === 1 ? '启用' : '停用' }}</el-descriptions-item>
            <el-descriptions-item label="领袖">{{ getLeaderLabel(factionDetail) }}</el-descriptions-item>
            <el-descriptions-item label="主题色"><el-color-picker :model-value="factionDetail.themeColor" disabled /> {{ factionDetail.themeColor || '-' }}</el-descriptions-item>
            <el-descriptions-item label="成员数量">{{ factionDetail.members?.length || 0 }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ factionDetail.createTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="修改时间">{{ factionDetail.updateTime || '-' }}</el-descriptions-item>
            <el-descriptions-item label="徽章地址" :span="2">
              <el-link v-if="factionDetail.iconUrl" :href="factionDetail.iconUrl" target="_blank" type="primary">{{ factionDetail.iconUrl }}</el-link>
              <span v-else>-</span>
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </div>
    </el-dialog>

    <el-drawer v-model="recycleVisible" title="阵营回收站" size="480px">
      <div v-loading="recycleLoading">
        <el-empty v-if="!deletedFactions.length" description="回收站暂无阵营" />
        <el-card v-for="item in deletedFactions" v-else :key="item.id" class="recycle-item" shadow="never">
          <div><strong>{{ item.name }}</strong><el-text type="info" size="small">{{ item.code }}</el-text></div>
          <el-button type="primary" link :icon="RefreshLeft" :loading="restoringIds.has(item.id)" @click="restoreFaction(item)">恢复</el-button>
        </el-card>
      </div>
    </el-drawer>
  </PageContainer>
</template>

<style scoped lang="scss">
.faction-page, .faction-tree-panel, .faction-content { min-height: 0; }
.faction-page, .faction-tree-panel, .faction-content { display: flex; flex-direction: column; }
.faction-page { height: 100%; overflow: hidden; }
.faction-layout { display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 0; flex: 1; gap: 14px; overflow: hidden; }
.faction-tree-panel :deep(.el-card__header), .faction-toolbar :deep(.el-card__body) { padding: 12px; }
.faction-tree-panel :deep(.el-card__body) { min-height: 0; padding: 10px; flex: 1; overflow: auto; }
.panel-title, .tree-node, .summary-content, .faction-identity, .recycle-item :deep(.el-card__body) { display: flex; align-items: center; }
.panel-title, .recycle-item :deep(.el-card__body) { justify-content: space-between; }
.panel-title strong, .panel-title span { display: block; }
.panel-title span, .tree-node small, .summary-code { color: var(--text-tertiary); font-size: 12px; }
.faction-tree-panel :deep(.el-tree) { margin-top: 8px; background: transparent; }
.faction-tree-panel :deep(.el-tree-node__content) { height: 40px; border-radius: 5px; }
.tree-node { min-width: 0; flex: 1; gap: 7px; }
.tree-node img { width: 24px; height: 24px; flex: 0 0 auto; object-fit: contain; }
.tree-label { overflow: hidden; color: var(--text); text-overflow: ellipsis; white-space: nowrap; }
.tree-node small { margin-right: auto; }
.faction-dot, .summary-mark { width: 12px; height: 12px; flex: 0 0 auto; border: 2px solid var(--surface); border-radius: 50%; box-shadow: 0 0 0 1px var(--border); }
.faction-content { gap: 14px; overflow: auto; }
.faction-summary { flex: 0 0 auto; border-left-width: 4px; }
.summary-content { gap: 18px; }
.faction-identity { min-width: 0; gap: 14px; }
.faction-identity img { width: 54px; height: 54px; object-fit: contain; }
.faction-identity h2, .detail-hero h2 { margin: 2px 0; color: var(--text); }
.faction-identity p, .detail-hero p { margin: 0; color: var(--text-secondary); line-height: 1.6; }
.summary-stats { display: flex; flex: 0 0 auto; gap: 18px; margin: 0 0 0 auto; text-align: center; }
.summary-stats dt { color: var(--text-tertiary); font-size: 11px; }
.summary-stats dd { margin: 4px 0 0; color: var(--text); font-weight: 700; }
.faction-search { width: min(320px, 100%); }
.faction-table-wrap { min-height: 0; flex: 0 1 auto; overflow: hidden; }
.table-actions { white-space: nowrap; }
.detail-body { min-height: 230px; }
.detail-hero { display: flex; align-items: center; gap: 18px; margin-bottom: 18px; padding: 18px; background: var(--surface-subtle); border-left: 4px solid; border-radius: 6px; }
.detail-hero .el-image { width: 72px; height: 72px; flex: 0 0 auto; }
.recycle-item + .recycle-item { margin-top: 10px; }
.recycle-item strong, .recycle-item .el-text { display: block; }
@media (max-width: 980px) { .faction-layout { grid-template-columns: 1fr; overflow: auto; } .faction-tree-panel { max-height: 320px; } .faction-content { min-height: 600px; overflow: visible; } }
@media (max-width: 1280px) { .summary-content { align-items: flex-start; flex-wrap: wrap; } }
@media (max-width: 640px) { .faction-toolbar .el-button, .faction-search { width: 100%; margin-left: 0; } .summary-content { flex-direction: column; } .summary-stats { width: 100%; margin-left: 0; justify-content: space-around; } }
</style>
