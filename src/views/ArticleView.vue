<script setup>
import { computed, reactive, ref } from 'vue'
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const query = reactive({ keyword: '', state: '' })
const selected = ref([])
const dialog = ref(false)
const saving = ref(false)
const editing = reactive({ title: '', categoryId: '', state: '草稿', content: '' })
const rows = ref([
  { id: 1, title: 'Vue 3 组合式 API 入门', category: '前端开发', state: '已发布', time: '2026-08-26' },
  { id: 2, title: 'Spring Boot 项目部署笔记', category: '后端开发', state: '草稿', time: '2026-08-25' },
  { id: 3, title: '接口鉴权与 JWT 实践', category: '后端开发', state: '已发布', time: '2026-08-23' },
])

const filtered = computed(() => rows.value.filter((item) => (
  (!query.keyword || item.title.includes(query.keyword)) && (!query.state || item.state === query.state)
)))
const hasFilter = computed(() => Boolean(query.keyword || query.state))

function edit(row) {
  Object.assign(editing, row)
  dialog.value = true
}

function add() {
  Object.assign(editing, { id: null, title: '', categoryId: '', state: '草稿', content: '' })
  dialog.value = true
}

function clearFilters() {
  query.keyword = ''
  query.state = ''
}

async function remove() {
  const count = selected.value.length
  if (!count) return
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${count} 篇文章吗？此操作无法恢复。`, '删除文章', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
      type: 'warning',
    })
    rows.value = rows.value.filter((item) => !selected.value.includes(item))
    selected.value = []
    ElMessage.success('已删除选中文章')
  } catch {
    // The cancel action intentionally keeps the current selection.
  }
}

async function save() {
  saving.value = true
  try {
    // Keep the current local-demo behavior; an API call can replace this block later.
    if (editing.id) {
      Object.assign(rows.value.find((item) => item.id === editing.id), editing)
    } else {
      rows.value.unshift({ ...editing, id: Date.now(), category: editing.categoryId === '2' ? '后端开发' : '前端开发', time: new Date().toISOString().slice(0, 10) })
    }
    dialog.value = false
    ElMessage.success('文章已保存')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="page-panel">
    <div class="page-heading">
      <div><h1>文章管理</h1><p>查看、筛选和维护文章内容</p></div>
      <el-button type="primary" :icon="Plus" @click="add">新增文章</el-button>
    </div>

    <div class="toolbar" aria-label="文章筛选">
      <el-input v-model="query.keyword" class="search-input" :prefix-icon="Search" placeholder="搜索文章标题" clearable aria-label="搜索文章标题" />
      <el-select v-model="query.state" class="state-filter" placeholder="文章状态" clearable aria-label="按文章状态筛选">
        <el-option label="已发布" value="已发布" />
        <el-option label="草稿" value="草稿" />
      </el-select>
      <el-button class="danger-action" plain type="danger" :icon="Delete" :disabled="!selected.length" @click="remove">删除选中<span v-if="selected.length">（{{ selected.length }}）</span></el-button>
    </div>

    <div v-if="filtered.length" class="table-wrap">
      <el-table :data="filtered" @selection-change="selected = $event">
        <el-table-column type="selection" width="48" />
        <el-table-column prop="title" label="标题" min-width="260">
          <template #default="{ row }"><el-tooltip :content="row.title" :show-after="300"><span class="article-title">{{ row.title }}</span></el-tooltip></template>
        </el-table-column>
        <el-table-column prop="category" label="分类" width="140" />
        <el-table-column label="状态" width="104"><template #default="{ row }"><el-tag class="status-tag" :class="row.state === '已发布' ? 'published' : 'draft'">{{ row.state }}</el-tag></template></el-table-column>
        <el-table-column label="更新时间" width="132"><template #default="{ row }"><span class="time-value">{{ row.time }}</span></template></el-table-column>
        <el-table-column label="操作" width="76" fixed="right"><template #default="{ row }"><el-tooltip content="编辑文章"><el-button text :icon="Edit" :aria-label="`编辑文章：${row.title}`" @click="edit(row)" /></el-tooltip></template></el-table-column>
      </el-table>
    </div>
    <div v-else class="empty-result">
      <el-empty :description="hasFilter ? '没有匹配的文章' : '暂无文章'">
        <el-button v-if="hasFilter" @click="clearFilters">清除筛选</el-button>
        <el-button v-else type="primary" :icon="Plus" @click="add">新增文章</el-button>
      </el-empty>
    </div>

    <div v-if="filtered.length" class="pagination"><el-pagination background layout="prev, pager, next" :total="filtered.length" /></div>

    <el-dialog v-model="dialog" :title="editing.id ? '编辑文章' : '新增文章'" width="600px" :close-on-click-modal="false">
      <el-form label-position="top">
        <section class="form-section"><h2 class="form-section-title">基本信息</h2>
          <el-form-item label="标题" required><el-input v-model="editing.title" placeholder="请输入文章标题" /></el-form-item>
          <el-form-item label="分类" required><el-select v-model="editing.categoryId" placeholder="选择分类" style="width: 100%"><el-option label="前端开发" value="1" /><el-option label="后端开发" value="2" /></el-select></el-form-item>
          <el-form-item label="状态" required><el-radio-group v-model="editing.state"><el-radio value="草稿">草稿</el-radio><el-radio value="已发布">已发布</el-radio></el-radio-group></el-form-item>
        </section>
        <section class="form-section"><h2 class="form-section-title">正文内容</h2><el-form-item label="内容" required><el-input v-model="editing.content" type="textarea" :rows="6" resize="vertical" placeholder="请输入文章正文" /></el-form-item></section>
      </el-form>
      <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.article-title { display: block; overflow: hidden; color: var(--text); font-weight: 500; text-overflow: ellipsis; white-space: nowrap; }
</style>
