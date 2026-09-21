<script setup>
import { useRoute } from 'vue-router'
import AppTabs from './AppTabs.vue'

defineProps({
  refreshKey: {
    type: Number,
    default: 0,
  },
})

const route = useRoute()
</script>

<template>
  <div class="app-main">
    <AppTabs />
    <el-main id="main-content" class="content" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <component :is="Component" :key="`${route.fullPath}:${refreshKey}`" />
      </RouterView>
    </el-main>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-main){
  padding: 0;
}
.app-main {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  border-radius: 6px;
  gap:10px
}

.content {
  min-height: 0;
  flex: 1;
  overflow: auto;
  background: var(--workspace);
  scrollbar-width: none;
}

.content::-webkit-scrollbar {
  display: none;
}

@media (max-width: 768px) {
  .content { 
  }
}
</style>
