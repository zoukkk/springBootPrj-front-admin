<script setup>
import { h } from "vue";
import {
  Delete,
  Edit,
  Plus,
  RefreshLeft,
  Search,
  View,
} from "@element-plus/icons-vue";
import { ElButton, ElMessageBox, ElSwitch } from "element-plus";
import FactionApi from "@/api/depts/faction";
import HeroApi from "@/api/depts/hero";
import PositionApi from "@/api/positions";
import PageContainer from "@/components/PageContainer.vue";
import SearchForm from "@/components/SearchForm.vue";
import Table from "@/components/table/index.vue";
import HeroDetailDialog from "@/views/faction/components/HeroDetailDialog.vue";
import HeroFormDialog from "@/views/faction/components/HeroFormDialog.vue";

const rows = ref([]);
const factions = ref([]);
const positions = ref([]);
const searchModel = reactive({
  keyword: "",
  factionId: "",
  positionId: "",
  status: "",
});
const loading = ref(false);
const dictionaryLoading = ref(false);
const statusLoading = reactive(new Set());
const formVisible = ref(false);
const detailVisible = ref(false);
const editingId = ref(null);
const detailId = ref(null);
const pagingData = reactive({
  total: 0,
  pageObj: { pageNum: 1, pageSize: 10 },
});

function flattenTree(items) {
  return items.flatMap((item) => [item, ...flattenTree(item.children || [])]);
}

const factionOptions = computed(() => flattenTree(factions.value));
const factionMap = computed(
  () =>
    new Map(factionOptions.value.map((item) => [String(item.id), item.name])),
);
const positionMap = computed(
  () => new Map(positions.value.map((item) => [String(item.id), item.name])),
);
const searchFields = computed(() => [
  {
    type: "Input",
    label: "员工关键词",
    prop: "keyword",
    width: "260px",
    searchOnClear: true,
    componentAttr: { placeholder: "搜索员工姓名或昵称" },
  },
  {
    type: "Select",
    label: "所属阵营",
    prop: "factionId",
    width: "180px",
    componentAttr: {
      filterable: true,
      loading: dictionaryLoading.value,
      placeholder: "所属阵营",
      options: factionOptions.value.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    },
  },
  {
    type: "Select",
    label: "岗位",
    prop: "positionId",
    width: "180px",
    componentAttr: {
      filterable: true,
      loading: dictionaryLoading.value,
      placeholder: "岗位",
      options: positions.value.map((item) => ({
        label: item.name,
        value: item.id,
      })),
    },
  },
  {
    type: "Select",
    label: "状态",
    prop: "status",
    width: "120px",
    componentAttr: {
      placeholder: "状态",
      options: [
        { label: "启用", value: "1" },
        { label: "停用", value: "0" },
      ],
    },
  },
  {
    type: "Buttons",
    prop: "actions",
    label: "",
    componentAttr: {
      list: [
        { type: "primary", icon: Search, render: () => "查询", searchAction: true, searchOnEnter: true, on: { click: search } },
        { icon: RefreshLeft, render: () => "重置", on: { click: reset } },
        { type: "primary", plain: true, icon: Plus, render: () => "新增员工", on: { click: openCreate } },
      ],
    },
  },
]);

function getFactionName(id) {
  return id === null || id === undefined || id === ""
    ? "未分配"
    : factionMap.value.get(String(id)) || `阵营 ${id}`;
}

function getPositionLabel(row) {
  const labels = (Array.isArray(row.positionIds) ? row.positionIds : [])
    .map((id) => positionMap.value.get(String(id)))
    .filter(Boolean);
  return labels.join("、") || row.position || "未设置";
}

function formatName(row) {
  return row.name;
}

function formatDisplayName(row) {
  return row.nickname ? `${row.name}（${row.nickname}）` : row.name;
}

function getGenderLabel(gender) {
  return { 0: "未知", 1: "男", 2: "女" }[gender] || "未知";
}

const columns = [
  { prop: "id", label: "员工 ID", width: 92, align: "center" },
  {
    prop: "name",
    label: "员工名称",
    minWidth: 150,
    showOverflowTooltip: true,
    render: ({ row }) => h("strong", formatName(row)),
  },
  { prop: "nickname", label: "昵称", minWidth: 130, showOverflowTooltip: true },
  {
    label: "所属阵营",
    minWidth: 140,
    showOverflowTooltip: true,
    render: ({ row }) => getFactionName(row.factionId),
  },
  {
    label: "岗位/定位",
    minWidth: 150,
    showOverflowTooltip: true,
    render: ({ row }) => getPositionLabel(row),
  },
  {
    label: "性别",
    width: 80,
    align: "center",
    render: ({ row }) => getGenderLabel(row.gender),
  },
  {
    prop: "status",
    label: "状态",
    width: 94,
    align: "center",
    render: ({ row }) =>
      h(ElSwitch, {
        modelValue: row.status === 1,
        loading: statusLoading.has(row.id),
        inlinePrompt: true,
        activeText: "启",
        inactiveText: "停",
        beforeChange: () => updateStatus(row),
      }),
  },
  { prop: "createTime", label: "创建时间", width: 168 },
  { prop: "updateTime", label: "修改时间", width: 168 },
  {
    label: "操作",
    width: 220,
    align: "center",
    fixed: "right",
    render: ({ row }) =>
      h("div", { class: "table-actions" }, [
        h(
          ElButton,
          {
            link: true,
            type: "primary",
            icon: View,
            onClick: () => openDetail(row),
          },
          () => "详情",
        ),
        h(
          ElButton,
          {
            link: true,
            type: "primary",
            icon: Edit,
            onClick: () => openEdit(row),
          },
          () => "编辑/调整",
        ),
        h(
          ElButton,
          {
            link: true,
            type: "danger",
            icon: Delete,
            onClick: () => deleteEmployee(row),
          },
          () => "删除",
        ),
      ]),
  },
];

async function loadDictionaries() {
  dictionaryLoading.value = true;
  const [factionResult, positionResult] = await Promise.allSettled([
    FactionApi.getFactionTree(),
    PositionApi.getAllPositions(),
  ]);
  factions.value =
    factionResult.status === "fulfilled" ? factionResult.value || [] : [];
  positions.value =
    positionResult.status === "fulfilled" ? positionResult.value || [] : [];
  dictionaryLoading.value = false;
}

async function loadEmployees() {
  loading.value = true;
  try {
    const result = await HeroApi.getHeroList({
      keyword: searchModel.keyword.trim() || undefined,
      factionId: searchModel.factionId || undefined,
      positionId: searchModel.positionId || undefined,
      status:
        searchModel.status === "" ? undefined : Number(searchModel.status),
      pageNum: pagingData.pageObj.pageNum,
      pageSize: pagingData.pageObj.pageSize,
    });
    rows.value = result.list || [];
    pagingData.total = result.total || 0;
    pagingData.pageObj.pageNum = result.pageNum || pagingData.pageObj.pageNum;
    pagingData.pageObj.pageSize =
      result.pageSize || pagingData.pageObj.pageSize;
  } finally {
    loading.value = false;
  }
}

function search() {
  pagingData.pageObj.pageNum = 1;
  loadEmployees();
}

function reset() {
  Object.assign(searchModel, {
    keyword: "",
    factionId: "",
    positionId: "",
    status: "",
  });
  search();
}

function openCreate() {
  editingId.value = null;
  formVisible.value = true;
}

function openEdit(row) {
  editingId.value = row.id;
  formVisible.value = true;
}

function openDetail(row) {
  detailId.value = row.id;
  detailVisible.value = true;
}

async function updateStatus(row) {
  const nextStatus = row.status === 1 ? 0 : 1;
  statusLoading.add(row.id);
  try {
    await HeroApi.updateHeroStatus(row.id, nextStatus);
    ElMessage.success(`员工已${nextStatus === 1 ? "启用" : "停用"}`);
    await loadEmployees();
    return true;
  } catch {
    return false;
  } finally {
    statusLoading.delete(row.id);
  }
}

async function deleteEmployee(row) {
  const confirmed = await ElMessageBox.confirm(
    `删除员工档案“${formatDisplayName(row)}”后将无法恢复，是否继续？`,
    "删除员工",
    {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
    },
  ).catch(() => false);
  if (!confirmed) return;

  try {
    await HeroApi.deleteHero(row.id);
    ElMessage.success("员工删除成功");
    if (rows.value.length === 1 && pagingData.pageObj.pageNum > 1)
      pagingData.pageObj.pageNum -= 1;
    await loadEmployees();
  } catch {
    // request.js displays the backend error message.
  }
}

onMounted(async () => {
  await Promise.all([loadDictionaries(), loadEmployees()]);
});
</script>

<template>
  <PageContainer>
    <SearchForm
      v-model="searchModel"
      :form-list="searchFields"
    />

    <el-card
      v-loading="loading"
      class="employee-table-wrap"
      shadow="never"
      :body-style="{ padding: 0 }"
    >
      <Table
        :data="rows"
        :columns="columns"
        :paging-data="pagingData"
        row-key="id"
        empty-text="暂无员工数据"
        @change-page="loadEmployees"
      />
    </el-card>

    <HeroFormDialog
      v-model="formVisible"
      :hero-id="editingId"
      :factions="factionOptions"
      :positions="positions"
      global-mode
      @saved="loadEmployees"
    />
    <HeroDetailDialog
      v-model="detailVisible"
      :hero-id="detailId"
      :factions="factionOptions"
      :positions="positions"
      global-mode
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.employee-table-wrap {
  overflow: hidden;
}

.employee-table-wrap :deep(.el-card__body) {
  overflow-x: auto;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
}

</style>
