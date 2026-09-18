<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Menu, Setting, User } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { menus, userInfo } = storeToRefs(authStore)
const systemMenu = computed(() => menus.value.find((item) => item.path === '/system'))
const stats = computed(() => [
  { label: '授权菜单', value: systemMenu.value?.children?.length || 0, icon: Menu },
  { label: '当前角色', value: userInfo.value?.roles?.length || 0, icon: User },
  { label: '系统状态', value: '正常', icon: Setting },
])
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
})
</script>

<template>
  <div class="dashboard">
    <section class="welcome-panel">
      <div class="welcome-avatar">{{ userInfo?.nickname?.slice(0, 1) || '管' }}</div>
      <div>
        <h1>{{ greeting }}，{{ userInfo?.nickname || userInfo?.username }}</h1>
        <p>今天也要保持专注，高效完成系统管理工作。</p>
      </div>
      <time>{{ new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }) }}</time>
    </section>

    <section class="overview-grid" aria-label="系统概览">
      <article v-for="item in stats" :key="item.label">
        <el-icon><component :is="item.icon" /></el-icon>
        <div><span>{{ item.label }}</span><strong>{{ item.value }}</strong></div>
      </article>
    </section>

    <section class="quick-panel">
      <h2>快捷入口</h2>
      <div class="quick-links">
        <RouterLink v-for="item in systemMenu?.children || []" :key="item.id" :to="item.path">
          <span>{{ item.name }}</span><small>进入管理</small>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  display: grid;
  gap: 16px;
}

.welcome-panel,
.quick-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.welcome-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 116px;
  padding: 22px 26px;

  h1 {
    margin: 0 0 6px;
    color: var(--text);
    font-size: 20px;
  }

  p,
  time {
    color: var(--text-secondary);
    font-size: 13px;
  }

  p {
    margin: 0;
  }

  time {
    margin-left: auto;
  }
}

.welcome-avatar {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  color: #fff;
  background: var(--primary);
  border-radius: 50%;
  font-size: 20px;
  font-weight: 700;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  article {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .el-icon {
    padding: 10px;
    color: var(--primary);
    background: var(--primary-soft);
    border-radius: 6px;
    font-size: 22px;
  }

  span,
  strong {
    display: block;
  }

  span {
    color: var(--text-secondary);
    font-size: 13px;
  }

  strong {
    margin-top: 4px;
    color: var(--text);
    font-size: 22px;
  }
}

.quick-panel {
  padding: 22px;

  h2 {
    margin: 0 0 16px;
    font-size: 16px;
  }
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  a {
    padding: 16px;
    color: var(--text);
    text-decoration: none;
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  a:hover {
    color: var(--primary);
    border-color: var(--primary);
  }

  span,
  small {
    display: block;
  }

  small {
    margin-top: 5px;
    color: var(--text-tertiary);
  }
}

@media (max-width: 760px) {
  .overview-grid,
  .quick-links {
    grid-template-columns: 1fr;
  }

  .welcome-panel time {
    display: none;
  }
}
</style>
