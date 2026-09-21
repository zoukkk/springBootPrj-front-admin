<script setup>
import { storeToRefs } from 'pinia'
import {
  ArrowDown,
  Expand,
  Fold,
  FullScreen,
  Menu,
  Moon,
  Sunny,
  UserFilled,
} from '@element-plus/icons-vue'
import AppBreadcrumb from './AppBreadcrumb.vue'
import { useThemeStore } from '@/stores/theme'

defineProps({
  collapsed: Boolean,
  menus: {
    type: Array,
    default: () => [],
  },
  userInfo: {
    type: Object,
    default: null,
  },
  userName: {
    type: String,
    default: '管理员',
  },
  logoutLoading: Boolean,
})

const emit = defineEmits(['toggleSidebar', 'openMobile', 'logout'])
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)

function toggleFullscreen() {
  if (document.fullscreenElement) document.exitFullscreen()
  else document.documentElement.requestFullscreen()
}
</script>

<template>
  <header class="app-header">
    <div class="header-start">
      <el-button
        class="desktop-collapse"
        text
        :icon="collapsed ? Expand : Fold"
        :aria-label="collapsed ? '展开侧栏' : '收起侧栏'"
        @click="emit('toggleSidebar')"
      />
      <el-button class="mobile-nav-button" text :icon="Menu" aria-label="打开导航菜单" @click="emit('openMobile')" />
      <AppBreadcrumb :menus="menus" />
    </div>

    <div class="header-actions">
      <el-tooltip content="全屏">
        <el-button circle text :icon="FullScreen" aria-label="切换全屏" @click="toggleFullscreen" />
      </el-tooltip>
      <el-tooltip :content="isDark ? '切换至浅色主题' : '切换至深色主题'">
        <el-button circle text :aria-label="isDark ? '切换至浅色主题' : '切换至深色主题'" @click="themeStore.toggle">
          <el-icon><Moon v-if="!isDark" /><Sunny v-else /></el-icon>
        </el-button>
      </el-tooltip>
      <el-dropdown @command="(command) => command === 'logout' && emit('logout')">
        <span class="user-trigger">
          <el-avatar :size="30" :src="userInfo?.avatar || undefined" :icon="UserFilled" />
          <span class="user-name">{{ userName }}</span>
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" :disabled="logoutLoading">
              {{ logoutLoading ? '退出中...' : '退出登录' }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  flex: 0 0 56px;
  padding: 0 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.header-start,
.header-actions,
.user-trigger {
  display: flex;
  align-items: center;
}

.header-start {
  min-width: 0;
  gap: 8px;
}

.header-actions {
  flex: 0 0 auto;
  gap: 4px;
}

.user-trigger {
  gap: 8px;
  margin-left: 8px;
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
}

.mobile-nav-button {
  display: none;
}

@media (max-width: 768px) {
  .desktop-collapse {
    display: none;
  }

  .mobile-nav-button {
    display: inline-flex;
  }

  .app-header {
    padding: 0 12px;
  }

  .user-name,
  .user-trigger > .el-icon {
    display: none;
  }
}
</style>
