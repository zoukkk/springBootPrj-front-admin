<template>
  <el-date-picker
    clearable
    format="YYYY-MM-DD"
    value-format="YYYY-MM-DD HH:mm:ss"
    :placeholder="placeholder"
    :start-placeholder="placeholder[0]"
    :end-placeholder="placeholder[1]"
    :default-time="defaultTime"
    v-bind="$attrs"
    v-on="$attrs.on"
  />
</template>

<script setup lang="ts">
defineOptions({
  name: "Input",
  inheritAttrs: false,
});
const attrs = useAttrs();
const props = defineProps({
  formItemAttr: { type: Object, default: () => {} },
});
const placeholder = computed(() =>
  attrs.type === "daterange"
    ? ["开始日期", "结束日期"]
    : props.formItemAttr && props.formItemAttr.label
      ? "请选择" + props.formItemAttr.label
      : ""
);
const defaultTime = computed(() =>
  attrs.type === "daterange"
    ? [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]
    : new Date(2000, 1, 1, 0, 0, 0)
);
</script>
<style lang="scss">
.el-date-editor.el-input {
  width: 100%;
}
</style>
