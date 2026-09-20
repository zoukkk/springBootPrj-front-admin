<template>
  <el-checkbox-group v-bind="$attrs" v-on="$attrs.on">
    <el-checkbox
      v-for="item in $attrs.options"
      :key="item.value"
      v-bind="item"
    />
  </el-checkbox-group>
</template>

<script setup lang="ts">
defineOptions({
  name: "Select",
  inheritAttrs: false,
});
const props = defineProps({
  formItemAttr: { type: Object, default: () => {} },
});
</script>
<style lang="scss">
.el-select {
  width: 100%;
}
</style>
