<template>
  <el-table-column header-align="center" align="center" v-bind="$attrs">
    <template #header v-if="$attrs.renderHeader">
      <Render :content="$attrs.renderHeader()" />
    </template>
    <template #default="scope" v-if="!$attrs.children && !$attrs.type">
      <slot :name="$attrs.slot" :scope="scope" v-if="$attrs.slot"></slot>
      <template v-else-if="$attrs.render">
        <Render :content="$attrs.render(scope)" />
      </template>
      <template v-else> {{ scope.row[$attrs.prop] }}</template>
    </template>
    <template v-if="$attrs.children">
      <TableColumn v-for="o in $attrs.children" :key="o.prop" v-bind="o">
        <template #[o.slot]="{ scope }" v-if="o.slot">
          <slot :name="o.slot" :scope="scope"></slot>
        </template>
      </TableColumn>
    </template>
  </el-table-column>
</template>

<script setup>
import Render from '@/components/elComponents/Render/index.vue'

defineOptions({
  name: "TableColumn",
  inheritAttrs: false,
});
</script>
