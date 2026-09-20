<template>
  <el-input
    clearable
    :placeholder="placeholder"
    v-bind="$attrs"
    v-on="$attrs.on"
    v-model.trim="value"
    @keydown.e="handleKeydown"
  >
    <template
      #[slot.name]="{ scope }"
      v-for="slot in slotList"
      :key="slot.name"
    >
      <Render :content="slot.render(scope)" />
    </template>
  </el-input>
</template>

<script setup lang="ts">
defineOptions({
  name: "Input",
  inheritAttrs: false,
});
const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  formItemAttr: { type: Object, default: () => {} },
  modelValue: {
    type: String,
    default: () => "",
  },
  slots: { type: Object, default: () => {} },
});
const value = computed({
  get: () => props.modelValue,
  set: (newVal) => {
    emit("update:modelValue", newVal);
  },
});
const placeholder = computed(() =>
  props.formItemAttr && props.formItemAttr.label
    ? "请输入" + props.formItemAttr.label
    : ""
);
const slotList = computed(() => {
  return Object.keys(props.slots || {}).map((name) => {
    return {
      name,
      render: props.slots[name],
    };
  });
});
const handleKeydown = (event: { returnValue: boolean }) => {
  if (props.formItemAttr.componentAttr.type === "number") {
    event.returnValue = false;
    return false;
  }
};
</script>
<style lang="scss" scoped>
.el-input {
  width: 100%;
}
</style>
