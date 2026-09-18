<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'

const props = defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
})

const route = useRoute()

function findMenuTrail(items, path, parents = []) {
  for (const item of items) {
    const trail = [...parents, item]
    if (item.path === path) return trail

    const matched = findMenuTrail(item.children || [], path, trail)
    if (matched.length) return matched
  }

  return []
}

const breadcrumbs = computed(() => {
  const trail = findMenuTrail(props.menus, route.path)
  const home = props.menus.find((item) => item.path === '/dashboard') || {
    name: '首页',
    path: '/dashboard',
    icon: 'HomeFilled',
  }

  if (!trail.length) return [home, { name: route.meta.title || '当前页面', path: route.path, icon: route.meta.icon }]
  if (trail[0]?.path === home.path) return trail
  return [home, ...trail]
})
</script>

<template>
  <el-breadcrumb separator="/" class="app-breadcrumb">
    <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="`${item.path}-${index}`">
      <RouterLink v-if="index < breadcrumbs.length - 1 && !item.children?.length" :to="item.path">
        <AppIcon :name="item.icon" />{{ item.name }}
      </RouterLink>
      <span v-else class="breadcrumb-label"><AppIcon :name="item.icon" />{{ item.name }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped lang="scss">
.app-breadcrumb {
  min-width: 0;

  :deep(.el-breadcrumb__inner),
  :deep(.el-breadcrumb__inner a) {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: var(--text-secondary);
    font-size: 13px;
    font-weight: 500;
  }

  .breadcrumb-label {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
    color: var(--text);
    font-weight: 600;
  }
}
</style>
