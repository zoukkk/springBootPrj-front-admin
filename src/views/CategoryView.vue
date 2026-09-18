<script setup>
import { reactive, ref } from 'vue'
import { Delete, Edit, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const dialog = ref(false)
const saving = ref(false)
const form = reactive({ id: null, categoryName: '', categoryAlias: '' })
const rows = ref([
  { id: 1, categoryName: '前端开发', categoryAlias: 'frontend', time: '2026-08-20' },
  { id: 2, categoryName: '后端开发', categoryAlias: 'backend', time: '2026-08-19' },
  { id: 3, categoryName: '生活随笔', categoryAlias: 'life', time: '2026-08-17' },
])

function add() {
  Object.assign(form, { id: null, categoryName: '', categoryAlias: '' })
  dialog.value = true
}

function edit(row) {
  Object.assign(form, row)
  dialog.value = true
}

async function del(row) {
  try {
    await ElMessageBox.confirm(`确定删除“${row.categoryName}”吗？该分类下的文章需要后续重新归类。`, '删除分类', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger',
      type: 'warning',
    })
    rows.value = rows.value.filter((item) => item.id !== row.id)
    ElMessage.success('分类已删除')
  } catch {
    // The cancel action intentionally keeps the category unchanged.
  }
}

async function save() {
  saving.value = true
  try {
    if (form.id) {
      Object.assign(rows.value.find((item) => item.id === form.id), form)
    } else {
      rows.value.unshift({ ...form, id: Date.now(), time: new Date().toISOString().slice(0, 10) })
    }
    dialog.value = false
    ElMessage.success('分类已保存')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="page-panel">
    <div class="page-heading"><div><h1>分类管理</h1><p>为文章维护清晰的分类体系</p></div><el-button type="primary" :icon="Plus" @click="add">新增分类</el-button></div>
    <div v-if="rows.length" class="table-wrap">
      <el-table :data="rows">
        <el-table-column prop="categoryName" label="分类名称" min-width="220"><template #default="{ row }"><span class="category-name">{{ row.categoryName }}</span></template></el-table-column>
        <el-table-column prop="categoryAlias" label="分类别名" min-width="200" />
        <el-table-column label="更新时间" width="150"><template #default="{ row }"><span class="time-value">{{ row.time }}</span></template></el-table-column>
        <el-table-column label="操作" width="152" fixed="right"><template #default="{ row }"><el-button text :icon="Edit" @click="edit(row)">编辑</el-button><el-button text type="danger" :icon="Delete" @click="del(row)">删除</el-button></template></el-table-column>
      </el-table>
    </div>
    <div v-else class="empty-result"><el-empty description="暂无分类"><el-button type="primary" :icon="Plus" @click="add">新增分类</el-button></el-empty></div>
    <el-dialog v-model="dialog" :title="form.id ? '编辑分类' : '新增分类'" width="440px" :close-on-click-modal="false">
      <el-form label-position="top"><el-form-item label="分类名称" required><el-input v-model="form.categoryName" placeholder="请输入分类名称" /></el-form-item><el-form-item label="分类别名" required><el-input v-model="form.categoryAlias" placeholder="请输入分类别名" /><p class="field-help">别名用于分类标识，建议使用简短英文。</p></el-form-item></el-form>
      <template #footer><el-button @click="dialog = false">取消</el-button><el-button type="primary" :loading="saving" @click="save">保存</el-button></template>
    </el-dialog>
  </section>
</template>

<style scoped>
.category-name { color: var(--text); font-weight: 500; }
</style>
