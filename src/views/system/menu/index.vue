<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Search } from '@element-plus/icons-vue'
import PageContainer from '@/components/PageContainer.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { menus } = storeToRefs(authStore)
const keyword = ref('')

function filterMenus(items, query) {
  return items.reduce((result, item) => {
    const children = filterMenus(item.children || [], query)
    const matched = `${item.name}${item.path}${item.component}`.toLowerCase().includes(query)
    if (matched || children.length) result.push({ ...item, children })
    return result
  }, [])
}

const rows = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return query ? filterMenus(menus.value, query) : menus.value
})
</script>

<template>
  <PageContainer title="菜单管理" description="查看当前账号可访问的菜单树与页面映射">
    <div class="toolbar">
      <el-input v-model="keyword" class="search-input" clearable placeholder="搜索菜单名称、路径或组件" :prefix-icon="Search" />
      <el-button type="primary">查询</el-button>
      <el-button @click="keyword = ''">重置</el-button>
    </div>
    <div class="table-wrap">
      <el-table :data="rows" row-key="id" default-expand-all empty-text="暂无匹配菜单">
        <el-table-column prop="name" label="菜单名称" min-width="180" />
        <el-table-column prop="path" label="路由路径" min-width="180" />
        <el-table-column prop="component" label="页面组件" min-width="170" />
        <el-table-column prop="icon" label="图标" min-width="130" />
        <el-table-column prop="sort" label="排序" width="90" />
      </el-table>
    </div>
  </PageContainer>
</template>
