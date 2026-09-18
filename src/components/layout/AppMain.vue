<script setup>
import AppTabs from './AppTabs.vue'
</script>

<template>
  <div class="app-main">
    <AppTabs />
    <el-main id="main-content" class="content" tabindex="-1">
      <RouterView />
    </el-main>
  </div>
</template>

<style scoped lang="scss">
.app-main {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
}

.content {
  min-height: 0;
  flex: 1;
  padding: 20px;
  overflow: auto;
  background: var(--workspace);
}

@media (max-width: 768px) {
  .content {
    padding: 12px 0;
  }
}
</style>
