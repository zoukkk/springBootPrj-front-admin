<script setup>
import { computed, nextTick, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Moon, Sunny, User } from '@element-plus/icons-vue'
import mountain from '@/assets/fujiMountain.jpg'
import AuthApi from '@/api/auth'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { isDark } = storeToRefs(themeStore)
const formRef = ref()
const mode = ref('login')
const loading = ref(false)
const pulling = ref(false)
const loginForm = reactive({ username: '', password: '', remember: true })
const registerForm = reactive({ username: '', password: '', confirmPassword: '' })
const forgotForm = reactive({ username: '', email: '' })

const title = computed(() => ({ login: '密码登录', register: '注册账号', forgot: '找回密码' })[mode.value])
const submitLabel = computed(() => ({ login: '确认', register: '创建账号', forgot: '发送重置链接' })[mode.value])
const activeForm = computed(() => ({ login: loginForm, register: registerForm, forgot: forgotForm })[mode.value])
const accountRules = [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 2, max: 18, message: '用户名长度为 2 至 18 位', trigger: 'blur' }]
const passwordRules = [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 2, max: 18, message: '密码长度为 2 至 18 位', trigger: 'blur' }]
const rules = computed(() => ({
  username: accountRules,
  password: mode.value === 'forgot' ? [] : passwordRules,
  confirmPassword: mode.value === 'register' ? [{ validator: validateConfirmPassword, trigger: 'blur' }] : [],
  email: mode.value === 'forgot' ? [{ required: true, message: '请输入注册邮箱', trigger: 'blur' }, { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }] : [],
}))

function validateConfirmPassword(rule, value, callback) {
  if (!value) callback(new Error('请再次输入密码'))
  else if (value !== registerForm.password) callback(new Error('两次输入的密码不一致'))
  else callback()
}

async function switchMode(nextMode) {
  if (nextMode === 'register') Object.assign(registerForm, { username: '', password: '', confirmPassword: '' })
  if (nextMode === 'forgot') Object.assign(forgotForm, { username: '', email: '' })
  mode.value = nextMode
  await nextTick()
  formRef.value?.clearValidate()
}

function toggleTheme() {
  pulling.value = true
  themeStore.toggle()
  window.setTimeout(() => { pulling.value = false }, 420)
}

async function completeLogin(credentials, remember = true) {
  await authStore.login(credentials, remember)
  ElMessage.success('登录成功')
  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
  await router.replace(redirect.startsWith('/') ? redirect : '/dashboard')
}

async function handleRegistrationSuccess() {
  const credentials = { username: registerForm.username, password: registerForm.password }

  try {
    await ElMessageBox.confirm('账号注册成功，是否现在登录？', '注册成功', {
      confirmButtonText: '现在登录',
      cancelButtonText: '稍后登录',
      type: 'success',
      closeOnClickModal: false,
    })
    await completeLogin(credentials, loginForm.remember)
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') throw error
    await switchMode('login')
    ElMessage.success('注册成功，请登录')
  }
}

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  if (mode.value === 'forgot') {
    ElMessage.warning('后端尚未提供匿名找回密码接口')
    return
  }

  loading.value = true
  try {
    if (mode.value === 'register') {
      await AuthApi.register({ username: registerForm.username, password: registerForm.password })
      await handleRegistrationSuccess()
      return
    }

    await completeLogin({ username: loginForm.username, password: loginForm.password }, loginForm.remember)
  } catch {
    // 请求层统一展示失败原因。
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page" :style="{ '--login-background': `url(${mountain})` }">
    <button :class="['theme-pull', { pulling }]" type="button" :aria-label="isDark ? '切换至浅色主题' : '切换至深色主题'"
      @click="toggleTheme">
      <span></span><el-icon>
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </button>

    <section class="login-card" :aria-label="title">
      <header class="login-brand">
        <span class="brand-symbol"><i></i><i></i><i></i></span>
        <span>Article 管理系统</span>
      </header>
      <h1>{{ title }}</h1>

      <el-form ref="formRef" :model="activeForm" :rules="rules" :validate-on-rule-change="false" @submit.prevent="submit">
        <el-form-item prop="username">
          <el-input v-model="activeForm.username" size="large" autocomplete="username" placeholder="请输入用户名"
            :prefix-icon="User" />
        </el-form-item>
        <el-form-item v-if="mode !== 'forgot'" prop="password">
          <el-input v-model="activeForm.password" size="large" type="password" autocomplete="current-password" show-password
            placeholder="请输入密码" :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item v-if="mode === 'register'" prop="confirmPassword">
          <el-input v-model="registerForm.confirmPassword" size="large" type="password" autocomplete="new-password"
            show-password placeholder="请再次输入密码" :prefix-icon="Lock" />
        </el-form-item>
        <el-form-item v-if="mode === 'forgot'" prop="email">
          <el-input v-model="forgotForm.email" size="large" autocomplete="email" placeholder="请输入注册邮箱" />
        </el-form-item>

        <div v-if="mode === 'login'" class="login-options">
          <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          <button type="button" @click="switchMode('forgot')">忘记密码？</button>
        </div>

        <el-button native-type="submit" type="primary" size="large" :loading="loading" class="login-submit">
          {{ submitLabel }}
        </el-button>
      </el-form>

      <div class="secondary-actions">
        <el-button v-if="mode === 'login'" native-type="button" @click="switchMode('register')">注册账号</el-button>
        <el-button v-else native-type="button" @click="switchMode('login')">返回登录</el-button>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss">
.login-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background: linear-gradient(var(--login-wash), var(--login-wash)), var(--login-background) center/cover;
  transition: background-color 320ms ease, color 320ms ease;
}

.login-card {
  width: min(448px, 100%);
  padding: 32px 30px 28px;
  color: var(--text);
  background: color-mix(in srgb, var(--surface) 88%, transparent);
  border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
  border-radius: 10px;
  box-shadow: 0 18px 50px var(--login-shadow);
  backdrop-filter: blur(10px);
  transition: background-color 320ms ease, border-color 320ms ease, box-shadow 320ms ease;

  h1 {
    margin: 0 0 24px;
    color: var(--primary);
    font-size: 17px;
    font-weight: 600;
  }

  :deep(.el-form-item) {
    margin-bottom: 18px;
  }
}

.login-brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 28px;
  color: var(--primary);
  font-size: 28px;
  font-weight: 600;
}

.brand-symbol {
  display: grid;
  grid-template-columns: repeat(2, 12px);
  gap: 4px;
  padding: 8px;
  background: var(--primary);
  border-radius: 8px;
  transform: rotate(8deg);

  i {
    width: 12px;
    height: 12px;
    background: #fff;
    border-radius: 3px;
  }

  i:last-child {
    grid-column: 1 / 3;
    opacity: .55;
  }
}

.login-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 22px;

  button {
    padding: 0;
    color: var(--text);
    background: none;
    border: 0;
    cursor: pointer;
  }

  button:hover {
    color: var(--primary);
  }
}

.login-submit {
  width: 100%;
  height: 46px;
  border-radius: 23px;
}

.secondary-actions {
  display: grid;
  margin-top: 18px;
}

.theme-pull {
  position: fixed;
  z-index: 2;
  top: 0;
  right: clamp(22px, 5vw, 68px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  color: var(--text);
  background: none;
  border: 0;
  cursor: pointer;

  span {
    width: 2px;
    height: 42px;
    background: var(--text-secondary);
    transform-origin: top;
    transition: height 220ms ease;
  }

  .el-icon {
    display: grid;
    width: 34px;
    height: 34px;
    place-items: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 50%;
    box-shadow: 0 5px 16px var(--login-shadow);
    transition: transform 220ms ease, background-color 320ms ease;
  }

  &.pulling span {
    height: 57px;
  }

  &.pulling .el-icon {
    transform: rotate(24deg);
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 28px 20px 24px;
  }

  .login-brand {
    justify-content: flex-start;
    font-size: 23px;
  }
}
</style>
