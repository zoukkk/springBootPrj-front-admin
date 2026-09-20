<template>
  <el-switch v-bind="$attrs" v-on="$attrs.on" />
</template>

<script setup lang="ts">
defineOptions({
  name: "Switch",
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
