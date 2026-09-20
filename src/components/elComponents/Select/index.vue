<template>
  <el-select
    clearable
    :placeholder="placeholder"
    v-bind="$attrs"
    v-on="$attrs.on"
  >
    <el-option v-for="item in $attrs.options" :key="item.value" v-bind="item" />
  </el-select>
</template>

<script setup lang="ts">
defineOptions({
  name: "Select",
  inheritAttrs: false,
});
const props = defineProps({
  formItemAttr: { type: Object, default: () => {} },
});
const placeholder = computed(() =>
  props.formItemAttr && props.formItemAttr.label
    ? "请选择" + props.formItemAttr.label
    : ""
);
</script>
<style lang="scss">
.el-select {
  width: 100%;
}
</style>
