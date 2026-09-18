<script setup>
import AppIcon from './AppIcon.vue'

defineOptions({ name: 'AppMenu' })

defineProps({
  menus: {
    type: Array,
    default: () => [],
  },
})

</script>

<template>
  <template v-for="item in menus" :key="item.id">
    <el-sub-menu v-if="item.children?.length" :index="item.path || String(item.id)">
      <template #title>
        <AppIcon :name="item.icon" />
        <span>{{ item.name }}</span>
      </template>
      <AppMenu :menus="item.children" />
    </el-sub-menu>
    <el-menu-item v-else :index="item.path">
      <AppIcon :name="item.icon" />
      <span>{{ item.name }}</span>
    </el-menu-item>
  </template>
</template>
