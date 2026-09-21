<script setup>
import AppMenu from './AppMenu.vue'

defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
  activePath: {
    type: String,
    default: '',
  },
  collapsed: Boolean,
  mobileOpen: Boolean,
})

const emit = defineEmits(['update:mobileOpen', 'menuSelect'])

function handleMobileSelect(path) {
  emit('menuSelect', path)
  emit('update:mobileOpen', false)
}
</script>

<template>
  <aside :class="['app-sidebar', 'desktop-sidebar', { collapsed }]">
    <div class="sidebar-brand">
      <span class="brand-mark"><i></i><i></i><i></i></span>
      <span class="brand-name">Article 管理系统</span>
    </div>
    <el-menu
      :default-active="activePath"
      :collapse="collapsed"
      :collapse-transition="true"
      router
      class="sidebar-menu"
      @select="emit('menuSelect', $event)"
    >
      <AppMenu :menus="menus" />
    </el-menu>
  </aside>

  <el-drawer
    :model-value="mobileOpen"
    direction="ltr"
    size="260px"
    title="Article 管理系统"
    class="mobile-nav"
    @update:model-value="emit('update:mobileOpen', $event)"
  >
    <el-menu :default-active="activePath" router class="sidebar-menu" @select="handleMobileSelect">
      <AppMenu :menus="menus" />
    </el-menu>
  </el-drawer>
</template>

<style scoped lang="scss">
.app-sidebar {
  width: 220px;
  min-width: 220px;
  height: 100%;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  transition:
    width 260ms cubic-bezier(.4, 0, .2, 1),
    min-width 260ms cubic-bezier(.4, 0, .2, 1);

  &.collapsed {
    width: 64px;
    min-width: 64px;
  }
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 62px;
  padding: 0 16px;
  color: var(--primary);
  border-bottom: 1px solid var(--divider);
  white-space: nowrap;
}

.brand-name {
  width: 150px;
  overflow: hidden;
  font-size: 16px;
  font-weight: 700;
  opacity: 1;
  transform: translateX(0);
  transition:
    width 220ms ease,
    opacity 150ms ease,
    transform 220ms ease;

  .collapsed & {
    width: 0;
    opacity: 0;
    transform: translateX(-8px);
  }
}

.brand-mark {
  display: grid;
  grid-template-columns: repeat(2, 9px);
  gap: 3px;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  padding: 5px;
  background: var(--primary);
  border-radius: 6px;
  transform: rotate(8deg);

  i {
    background: #fff;
    border-radius: 2px;
  }

  i:last-child {
    grid-column: 1 / 3;
    opacity: .55;
  }
}

.sidebar-menu {
  width: 100%;
  padding: 10px 8px;
  border: 0;
  background: transparent;

  &:not(.el-menu--collapse) {
    width: 100%;
  }

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 42px;
    margin: 2px 0;
    color: var(--text-secondary);
    border-radius: 6px;
  }

  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    color: var(--primary);
    background: var(--surface-subtle);
  }

  :deep(.el-menu-item.is-active) {
    color: var(--primary);
    background: var(--primary-soft);
    font-weight: 600;
  }

  :deep(.el-menu--inline) {
    background: transparent;
  }
}

:global(.mobile-nav .el-drawer__header) {
  height: 62px;
  padding: 0 18px;
  margin: 0;
  color: var(--primary);
  border-bottom: 1px solid var(--divider);
  font-weight: 700;
}

:global(.mobile-nav .el-drawer__body) {
  padding: 0;
}

@media (max-width: 768px) {
  .desktop-sidebar {
    display: none;
  }
}
</style>
