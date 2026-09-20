<template>
  <el-table v-bind="$attrs" border style="width: 100%">
    <el-table-column
      v-if="showIndex"
      type="index"
      label="序号"
      width="70"
      align="center"
    />
    <TableColumn v-for="column in columns" :key="column.prop" v-bind="column">
      <template #header v-if="$attrs.renderHeader">
        <div>{{ $attrs.renderHeader({ column: $attrs }) }}</div>
      </template>

      <template #[column.slot]="{ scope }" v-if="column.slot">
        <slot :name="column.slot" :scope="scope"></slot>
      </template>
      <template
        #[slots.slot]="{ scope }"
        v-for="slots in getChildrenSlot(column)"
      >
        <slot :name="slots.slot" :scope="scope"></slot>
      </template>
    </TableColumn>
  </el-table>

  <pagination
    v-if="pagingData.total > 0"
    v-model:total="pagingData.total"
    v-model:page="pagingData.pageObj.pageNum"
    v-model:limit="pagingData.pageObj.pageSize"
    @pagination="handlePagination"
  />
</template>

<script setup>
const Emit = defineEmits();
defineOptions({
  name: "Table",
  inheritAttrs: false,
});
defineProps({
  columns: { type: Array, default: () => [] },
  pagingData: { type: Object, default: () => ({}) },
  showIndex: {
    type: Boolean,
    default: false,
  },
});

const getChildrenSlot = (column) => {
  let arr = column.children || [];
  if (column.children && column.children.length) {
    arr = [
      ...arr,
      ...column.children.reduce((a, b) => [...a, ...getChildrenSlot(b)], []),
    ];
  }
  return arr;
};
const handlePagination = () => {
  Emit("changePage");
};
</script>
<style lang="scss">
.header-container {
  background-color: #f4f4f4 !important;
}
</style>
