<script setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppMain from '@/components/layout/AppMain.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { menus, userInfo } = storeToRefs(authStore)
const sidebarCollapsed = ref(false)
const mobileNavOpen = ref(false)
const logoutLoading = ref(false)
const routeRefreshKey = ref(0)
const userName = computed(() => userInfo.value?.nickname || userInfo.value?.username || '管理员')

function handleMenuSelect(path) {
  if (path === route.path) routeRefreshKey.value += 1
}

async function logout() {
  if (logoutLoading.value) return

  logoutLoading.value = true
  try {
    const succeeded = await authStore.logout()
    if (succeeded) ElMessage.success('退出登录成功')
    await router.replace('/login')
  } finally {
    logoutLoading.value = false
  }
}
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">跳至主要内容</a>
    <AppSidebar
      v-model:mobile-open="mobileNavOpen"
      :menus="menus"
      :active-path="route.path"
      :collapsed="sidebarCollapsed"
      @menu-select="handleMenuSelect"
    />
    <div class="main-shell">
      <AppHeader
        :collapsed="sidebarCollapsed"
        :menus="menus"
        :user-info="userInfo"
        :user-name="userName"
        :logout-loading="logoutLoading"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
        @open-mobile="mobileNavOpen = true"
        @logout="logout"
      />
      <AppMain :refresh-key="routeRefreshKey" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  display: flex;
  height: 100dvh;
  min-width: 320px;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
  background: var(--workspace);
}

.main-shell {
  display: flex;
  height: 100%;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
}
</style>
