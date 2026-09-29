<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

async function logout() {
  if (loading.value) return

  loading.value = true
  try {
    const succeeded = await authStore.logout()
    if (succeeded) ElMessage.success('退出登录成功')
    else ElMessage.error('退出请求失败，已清理本地登录状态')
    await router.replace({ name: 'login' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="error-page">
    <el-result icon="warning" title="无权访问" sub-title="当前账号没有访问此页面的权限">
      <template #extra>
        <el-button type="primary" :loading="loading" @click="logout">退出登录</el-button>
      </template>
    </el-result>
  </main>
</template>

<style scoped lang="scss">
.error-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  background: var(--workspace);
}
</style>
