<script setup>
import { computed, ref, reactive, h } from "vue";
import { storeToRefs } from "pinia";
import { Search } from "@element-plus/icons-vue";
import PageContainer from "@/components/PageContainer.vue";
import { useAuthStore } from "@/stores/auth";
import Table from "@/components/table/index.vue";
import { ElButton } from "element-plus";

const authStore = useAuthStore();
const { userInfo } = storeToRefs(authStore);
const keyword = ref("");
const columnsByInfo = [
  {
    label: "序号",
    prop: "etlSystem",
  },
  {
    label: "开始日期",
    prop: "starttime",
    "show-overflow-tooltip": true,
    render(scope) {
      return h("div", scope.row.starttime);
    },
  },
  {
    label: "结束日期",
    prop: "endtime",
    "show-overflow-tooltip": true,
    render(scope) {
      return h("div", scope.row.endtime);
    },
  },
  {
    label: "操作人",
    prop: "operatorId",
    "show-overflow-tooltip": true,
  },
  {
    label: "操作",
    align: "center",
    render(scope) {
      return h("div", [
        h(
          ElButton,
          {
            type: "primary",
            size: "small",
            icon: "Edit",
            plain: true,
            onClick() {},
          },
          "编辑"
        ),
      ]);
    },
  },
];
const infoList = ref([
  {
    starttime: "2026-08-13 23:00:14",
    endtime: "2026-08-13 23:00:14",
    operatorId: "Auto",
    operationDate: "2026-08-13 23:00:12",
  },
]);
const pagingDataByInfo = reactive({
  total: 0,
  attr: {
    pageSizes: [10, 20, 30, 50],
    layout: "total, sizes, prev, pager, next, jumper",
  },
  pageObj: {
    pageNum: 1,
    pageSize: 10,
  },
});
function changePage() {}
</script>

<template>
  <PageContainer title="用户管理" description="查看当前系统用户及其角色信息">
    <div class="toolbar">
      <el-input
        v-model="keyword"
        class="search-input"
        clearable
        placeholder="搜索用户名、昵称或角色"
        :prefix-icon="Search"
      />
      <el-button type="primary" @click="keyword = keyword.trim()">查询</el-button>
      <el-button @click="keyword = ''">重置</el-button>
    </div>
    <div class="table-wrap">
      <Table
        :columns="columnsByInfo"
        :data="infoList"
        :pagingData="pagingDataByInfo"
        @change-page="changePage"
      />
    </div>
  </PageContainer>
</template>
