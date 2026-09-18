<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  ArrowRight,
  Close,
  CircleClose,
  Delete,
  Lock,
  Unlock,
} from '@element-plus/icons-vue'
import AppIcon from './AppIcon.vue'

const route = useRoute()
const router = useRouter()
const tabs = ref([])
const tabsViewport = ref()

function createTab(currentRoute) {
  return {
    fullPath: currentRoute.fullPath,
    path: currentRoute.path,
    title: currentRoute.meta.title || '当前页面',
    icon: currentRoute.meta.icon || 'Menu',
    pinned: currentRoute.path === '/dashboard',
  }
}

function scrollActiveTabIntoView() {
  nextTick(() => {
    const active = tabsViewport.value?.querySelector('.route-tab.active')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  })
}

watch(
  () => route.fullPath,
  () => {
    const existingTab = tabs.value.find((tab) => tab.path === route.path)

    if (existingTab) {
      Object.assign(existingTab, createTab(route), { pinned: existingTab.pinned })
    } else {
      tabs.value.push(createTab(route))
    }
    scrollActiveTabIntoView()
  },
  { immediate: true },
)

function navigate(tab) {
  if (tab.fullPath !== route.fullPath) router.push(tab.fullPath)
}

function updateTabs(nextTabs, closedIndex) {
  const activeWasClosed = !nextTabs.some((tab) => tab.path === route.path)
  tabs.value = nextTabs

  if (!activeWasClosed) return
  const fallback = nextTabs[Math.min(closedIndex, nextTabs.length - 1)] || nextTabs.at(-1)

  if (!fallback && route.path === '/dashboard') {
    tabs.value = [createTab(route)]
    return
  }
  router.push(fallback?.fullPath || '/dashboard')
}

function closeTab(target) {
  if (target.pinned) return
  const index = tabs.value.findIndex((tab) => tab.path === target.path)
  updateTabs(tabs.value.filter((tab) => tab.path !== target.path), index)
}

function closeOthers(target) {
  const index = tabs.value.findIndex((tab) => tab.path === target.path)
  updateTabs(tabs.value.filter((tab) => tab.pinned || tab.path === target.path), index)
}

function closeLeft(target) {
  const index = tabs.value.findIndex((tab) => tab.path === target.path)
  updateTabs(tabs.value.filter((tab, currentIndex) => currentIndex >= index || tab.pinned), index)
}

function closeRight(target) {
  const index = tabs.value.findIndex((tab) => tab.path === target.path)
  updateTabs(tabs.value.filter((tab, currentIndex) => currentIndex <= index || tab.pinned), index)
}

function closeAll() {
  const activeIndex = tabs.value.findIndex((tab) => tab.path === route.path)
  updateTabs(tabs.value.filter((tab) => tab.pinned), activeIndex)
}

function togglePin(target) {
  target.pinned = !target.pinned
  tabs.value = [
    ...tabs.value.filter((tab) => tab.pinned),
    ...tabs.value.filter((tab) => !tab.pinned),
  ]
}

function handleCommand(command, target) {
  const actions = {
    close: () => closeTab(target),
    closeOthers: () => closeOthers(target),
    closeLeft: () => closeLeft(target),
    closeRight: () => closeRight(target),
    closeAll,
    togglePin: () => togglePin(target),
  }
  actions[command]?.()
}
</script>

<template>
  <nav ref="tabsViewport" class="app-tabs" aria-label="已访问页面">
    <el-dropdown
      v-for="(tab, index) in tabs"
      :key="tab.path"
      trigger="contextmenu"
      @command="handleCommand($event, tab)"
    >
      <div :class="['route-tab', { active: tab.path === route.path }]">
        <button class="tab-main" type="button" @click="navigate(tab)">
          <AppIcon :name="tab.icon" />
          <span>{{ tab.title }}</span>
          <el-icon v-if="tab.pinned" class="pin-icon"><Lock /></el-icon>
        </button>
        <button
          v-if="!tab.pinned"
          class="tab-close"
          type="button"
          :aria-label="`关闭${tab.title}`"
          @click.stop="closeTab(tab)"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="close" :icon="Close" :disabled="tab.pinned">关闭</el-dropdown-item>
          <el-dropdown-item command="closeOthers" :icon="CircleClose" divided>关闭其他</el-dropdown-item>
          <el-dropdown-item command="closeLeft" :icon="ArrowLeft" :disabled="index === 0">关闭左侧</el-dropdown-item>
          <el-dropdown-item command="closeRight" :icon="ArrowRight" :disabled="index === tabs.length - 1">关闭右侧</el-dropdown-item>
          <el-dropdown-item command="closeAll" :icon="Delete" divided>关闭所有</el-dropdown-item>
          <el-dropdown-item command="togglePin" :icon="tab.pinned ? Unlock : Lock">
            {{ tab.pinned ? '取消固定' : '固定标签' }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </nav>
</template>

<style scoped lang="scss">
.app-tabs {
  display: flex;
  align-items: end;
  gap: 4px;
  height: 44px;
  flex: 0 0 auto;
  padding: 0 18px;
  overflow-x: auto;
  overflow-y: hidden;
  background: var(--surface);
  border-bottom: 1px solid var(--divider);
  scrollbar-width: thin;
}

.route-tab {
  display: flex;
  align-items: center;
  height: 34px;
  color: var(--text-secondary);
  white-space: nowrap;
  background: transparent;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  transition: color 150ms ease, background-color 150ms ease;

  &:hover {
    color: var(--primary);
    background: var(--surface-subtle);
  }

  &.active {
    color: var(--primary);
    background: var(--primary-soft);
    font-weight: 600;
  }
}

.tab-main,
.tab-close {
  display: flex;
  align-items: center;
  color: inherit;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.tab-main {
  gap: 6px;
  height: 100%;
  padding: 0 6px 0 12px;
  font: inherit;
}

.tab-close {
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-right: 5px;
  padding: 0;
  border-radius: 4px;
  opacity: .65;

  &:hover {
    color: var(--primary);
    background: var(--surface);
    opacity: 1;
  }
}

.pin-icon {
  margin-left: 2px;
  font-size: 11px;
  opacity: .7;
}

@media (max-width: 768px) {
  .app-tabs {
    padding: 0 12px;
  }
}
</style>
