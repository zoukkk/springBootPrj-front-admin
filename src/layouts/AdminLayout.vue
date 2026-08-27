<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowDown, Document, FolderOpened, House, Moon, Sunny, User, UserFilled } from '@element-plus/icons-vue'
const router = useRouter(); const route = useRoute()
const dark = ref(localStorage.getItem('theme') === 'dark'); const glass = ref(localStorage.getItem('glass') !== 'off')
const userName = ref(localStorage.getItem('userName') || '管理员'); const title = computed(() => route.meta.title || '首页')
function setTheme() { dark.value = !dark.value; localStorage.setItem('theme', dark.value ? 'dark' : 'light') }
function setGlass() { glass.value = !glass.value; localStorage.setItem('glass', glass.value ? 'on' : 'off') }
function logout() { localStorage.removeItem('token'); localStorage.removeItem('userName'); router.push('/login') }
</script>
<template>
  <el-container :class="['app-shell', { dark, 'no-glass': !glass }]">
    <el-aside width="238px" class="sidebar glass">
      <div class="brand"><span class="brand-mark">A</span><span>Article Admin</span></div>
      <el-menu :default-active="route.path" router class="menu" :collapse-transition="false">
        <el-menu-item index="/dashboard"><el-icon><House /></el-icon><span>首页</span></el-menu-item>
        <el-menu-item index="/users"><el-icon><User /></el-icon><span>用户管理</span></el-menu-item>
        <el-menu-item index="/articles"><el-icon><Document /></el-icon><span>文章管理</span></el-menu-item>
        <el-menu-item index="/categories"><el-icon><FolderOpened /></el-icon><span>分类管理</span></el-menu-item>
      </el-menu>
      <div class="side-footer">内容管理后台<br><small>Vue 3 · Element Plus</small></div>
    </el-aside>
    <el-container>
      <el-header class="topbar glass">
        <el-breadcrumb separator="/"><el-breadcrumb-item>管理后台</el-breadcrumb-item><el-breadcrumb-item>{{ title }}</el-breadcrumb-item></el-breadcrumb>
        <div class="header-actions">
          <el-tooltip content="切换明暗主题"><el-button circle text @click="setTheme"><el-icon><Moon v-if="!dark" /><Sunny v-else /></el-icon></el-button></el-tooltip>
          <el-tooltip :content="glass ? '关闭毛玻璃' : '开启毛玻璃'"><el-button circle text @click="setGlass"><el-icon><Document /></el-icon></el-button></el-tooltip>
          <el-dropdown @command="(command) => command === 'logout' && logout()"><span class="user-trigger"><el-avatar :size="32" :icon="UserFilled" />{{ userName }}<el-icon><ArrowDown /></el-icon></span><template #dropdown><el-dropdown-menu><el-dropdown-item command="logout">退出登录</el-dropdown-item></el-dropdown-menu></template></el-dropdown>
        </div>
      </el-header>
      <el-main class="content"><RouterView /></el-main>
    </el-container>
  </el-container>
</template>
<style scoped>
.sidebar{min-height:100vh;border-radius:0 8px 8px 0;padding:18px 12px;display:flex;flex-direction:column}.brand{height:50px;display:flex;align-items:center;gap:10px;padding:0 10px;font-weight:750;font-size:17px}.brand-mark{display:grid;place-items:center;width:29px;height:29px;border-radius:7px;background:#0d7d70;color:white}.menu{border:0;background:transparent;margin-top:24px}.menu :deep(.el-menu-item){border-radius:6px;margin:5px 0;color:var(--muted)}.menu :deep(.el-menu-item.is-active){background:rgba(13,125,112,.13);color:var(--accent);font-weight:650}.side-footer{margin-top:auto;padding:12px 10px;color:var(--muted);font-size:12px;line-height:1.7}.topbar{height:68px;margin:12px 16px 0;border-radius:8px;display:flex;align-items:center;justify-content:space-between;padding:0 18px}.header-actions,.user-trigger{display:flex;align-items:center;gap:10px}.user-trigger{cursor:pointer;font-size:14px;color:var(--text)}.content{padding:16px;overflow:auto}@media(max-width:700px){.sidebar{width:64px!important;padding:12px 7px}.brand span:last-child,.menu :deep(span),.side-footer{display:none}.brand{padding:0;justify-content:center}.topbar{margin-left:8px;margin-right:8px}.content{padding:8px}.user-trigger{font-size:0}}
</style>
