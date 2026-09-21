<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PageContainer from '@/components/PageContainer.vue'

const route = useRoute()
const title = computed(() => route.meta.title || '页面待建设')
</script>

<template>
  <PageContainer :title="title" description="该菜单已经开放，业务页面正在建设中">
    <el-empty description="暂无可用内容" />
  </PageContainer>
</template>
