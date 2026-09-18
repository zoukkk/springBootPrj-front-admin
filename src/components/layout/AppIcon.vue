<script setup>
import {
  CollectionTag,
  Document,
  Folder,
  Grid,
  HomeFilled,
  Menu,
  Setting,
  User,
  UserFilled,
} from '@element-plus/icons-vue'

defineProps({
  name: {
    type: String,
    default: 'Menu',
  },
})

const iconMap = {
  CollectionTag,
  Document,
  Folder,
  Grid,
  HomeFilled,
  Menu,
  Setting,
  User,
  UserFilled,
}
</script>

<template>
  <el-icon><component :is="iconMap[name] || Menu" /></el-icon>
</template>
