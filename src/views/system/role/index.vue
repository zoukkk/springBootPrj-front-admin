<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const keyword = ref('')
const roleLabels = { admin: '超级管理员', user: '普通用户' }
const rows = computed(() =>
  (userInfo.value?.roles || [])
    .map((code, index) => ({ id: index + 1, code, name: roleLabels[code] || code, status: '正常' }))
    .filter((row) => !keyword.value.trim() || `${row.code}${row.name}`.toLowerCase().includes(keyword.value.trim().toLowerCase())),
)
</script>

<template>
  <PageContainer title="角色管理" description="查看当前账号已分配的系统角色">
    <div class="toolbar">
      <el-input v-model="keyword" class="search-input" clearable placeholder="搜索角色名称或编码" :prefix-icon="Search" />
      <el-button type="primary">查询</el-button>
      <el-button @click="keyword = ''">重置</el-button>
    </div>
    <div class="table-wrap">
      <el-table :data="rows" empty-text="暂无匹配角色">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="name" label="角色名称" min-width="180" />
        <el-table-column prop="code" label="角色编码" min-width="180" />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }"><el-tag type="success" effect="light">{{ row.status }}</el-tag></template>
        </el-table-column>
      </el-table>
    </div>
  </PageContainer>
</template>
