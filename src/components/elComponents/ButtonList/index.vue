<template>
  <div v-bind="$attrs">
    <el-button
      v-for="(item, index) in $attrs.list"
      :key="index"
      v-bind="item"
      v-on="item.on"
    >
      <Render :content="item.render()" />
    </el-button>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: "Input",
  inheritAttrs: false,
});
const props = defineProps({
  formItemAttr: { type: Object, default: () => {} },
});
</script>
<style lang="scss" scoped></style>
