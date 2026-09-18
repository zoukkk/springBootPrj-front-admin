<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { userInfo } = storeToRefs(authStore)
const keyword = ref('')
const rows = computed(() => {
  const user = userInfo.value
  if (!user) return []
  const row = { ...user, roleText: user.roles?.join('、') || '-' }
  const query = keyword.value.trim().toLowerCase()
  return !query || [row.username, row.nickname, row.roleText].some((value) => value?.toLowerCase().includes(query))
    ? [row]
    : []
})
</script>

<template>
  <PageContainer title="用户管理" description="查看当前系统用户及其角色信息">
    <div class="toolbar">
      <el-input v-model="keyword" class="search-input" clearable placeholder="搜索用户名、昵称或角色" :prefix-icon="Search" />
      <el-button type="primary" @click="keyword = keyword.trim()">查询</el-button>
      <el-button @click="keyword = ''">重置</el-button>
    </div>
    <div class="table-wrap">
      <el-table :data="rows" empty-text="暂无匹配用户">
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="username" label="用户名" min-width="150" />
        <el-table-column prop="nickname" label="昵称" min-width="150" />
        <el-table-column prop="roleText" label="角色" min-width="160" />
        <el-table-column label="状态" width="110">
          <template #default><el-tag type="success" effect="light">正常</el-tag></template>
        </el-table-column>
      </el-table>
    </div>
  </PageContainer>
</template>
