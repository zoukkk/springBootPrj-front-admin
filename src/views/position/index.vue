<script setup>
import {
  Delete,
  Edit,
  Plus,
  RefreshLeft,
  Search,
  View,
} from "@element-plus/icons-vue";
import { ElButton, ElMessageBox, ElSwitch } from "element-plus";
import PositionApi from "@/api/positions";
import PageContainer from "@/components/PageContainer.vue";
import SearchForm from "@/components/SearchForm.vue";
import Table from "@/components/table/index.vue";
import PositionDetailDialog from "./components/PositionDetailDialog.vue";
import PositionFormDialog from "./components/PositionFormDialog.vue";

const rows = ref([]);
const searchModel = reactive({ keyword: "" });
const searchFields = [
  {
    type: "Input",
    label: "岗位关键词",
    prop: "keyword",
    width: "300px",
    searchOnClear: true,
    componentAttr: { placeholder: "搜索岗位名称或编码" },
  },
  {
    type: "Buttons",
    prop: "actions",
    label: "",
    componentAttr: {
      list: [
        { type: "primary", icon: Search, render: () => "查询", searchAction: true, searchOnEnter: true, on: { click: search } },
        { icon: RefreshLeft, render: () => "重置", on: { click: reset } },
        { type: "primary", plain: true, icon: Plus, render: () => "新增岗位", on: { click: openCreate } },
      ],
    },
  },
];
const loading = ref(false);
const statusLoading = reactive(new Set());
const dialogVisible = ref(false);
const detailVisible = ref(false);
const editingId = ref(null);
const detailId = ref(null);
const pagingData = reactive({
  total: 0,
  pageObj: { pageNum: 1, pageSize: 20 },
});

const columns = [
  { prop: "id", label: "ID", width: 90, align: "center" },
  { prop: "name", label: "岗位名称", minWidth: 180, showOverflowTooltip: true },
  { prop: "code", label: "岗位编码", minWidth: 190, showOverflowTooltip: true },
  { prop: "sort", label: "排序", width: 100, align: "center" },
  {
    prop: "status",
    label: "状态",
    width: 110,
    align: "center",
    render: ({ row }) =>
      h("div", { class: "status-cell" }, [
        h(ElSwitch, {
          modelValue: row.status === 1,
          loading: statusLoading.has(row.id),
          inlinePrompt: true,
          activeText: "启",
          inactiveText: "禁",
          beforeChange: () => updateStatus(row),
        }),
      ]),
  },
  {
    label: "操作",
    width: 210,
    align: "center",
    fixed: "right",
    render: ({ row }) =>
      h("div", { class: "table-actions" }, [
        h(
          ElButton,
          {
            link: true,
            type: "primary",
            icon: View,
            onClick: () => openDetail(row),
          },
          () => "查看",
        ),
        h(
          ElButton,
          {
            link: true,
            type: "primary",
            icon: Edit,
            onClick: () => openEdit(row),
          },
          () => "编辑",
        ),
        h(
          ElButton,
          {
            link: true,
            type: "danger",
            icon: Delete,
            onClick: () => deletePosition(row),
          },
          () => "删除",
        ),
      ]),
  },
];

async function loadPositions() {
  loading.value = true;
  try {
    const result = await PositionApi.getPositionList({
      keyword: searchModel.keyword.trim() || undefined,
      pageNum: pagingData.pageObj.pageNum,
      pageSize: pagingData.pageObj.pageSize,
    });
    rows.value = result.list || [];
    pagingData.total = result.total || 0;
    pagingData.pageObj.pageNum = result.pageNum || 1;
    pagingData.pageObj.pageSize = result.pageSize || 20;
  } finally {
    loading.value = false;
  }
}

function search() {
  pagingData.pageObj.pageNum = 1;
  loadPositions();
}
function reset() {
  searchModel.keyword = "";
  search();
}
function openCreate() {
  editingId.value = null;
  dialogVisible.value = true;
}
function openEdit(row) {
  editingId.value = row.id;
  dialogVisible.value = true;
}
function openDetail(row) {
  detailId.value = row.id;
  detailVisible.value = true;
}

async function updateStatus(row) {
  const nextStatus = row.status === 1 ? 0 : 1;
  statusLoading.add(row.id);
  try {
    await PositionApi.updatePosition({
      id: row.id,
      name: row.name,
      code: row.code,
      sort: row.sort,
      status: nextStatus,
    });
    row.status = nextStatus;
    ElMessage.success(`岗位已${nextStatus === 1 ? "启用" : "禁用"}`);
    return true;
  } catch {
    return false;
  } finally {
    statusLoading.delete(row.id);
  }
}

async function deletePosition(row) {
  const confirmed = await ElMessageBox.confirm(
    `删除岗位“${row.name}”后将无法恢复，是否继续？`,
    "删除岗位",
    {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
    },
  ).catch(() => false);
  if (!confirmed) return;
  try {
    await PositionApi.deletePosition(row.id);
    ElMessage.success("岗位删除成功");
    if (rows.value.length === 1 && pagingData.pageObj.pageNum > 1)
      pagingData.pageObj.pageNum -= 1;
    await loadPositions();
  } catch {
    // request.js already surfaces the server's 409 association message.
  }
}

onMounted(loadPositions);
</script>

<template>
  <PageContainer>
    <SearchForm
      v-model="searchModel"
      :form-list="searchFields"
    />
    <el-card
      v-loading="loading"
      class="position-table-wrap"
      shadow="never"
      :body-style="{ padding: 0 }"
    >
      <Table
        :data="rows"
        :columns="columns"
        :paging-data="pagingData"
        row-key="id"
        empty-text="暂无岗位数据"
        @change-page="loadPositions"
      />
    </el-card>
    <PositionFormDialog
      v-model="dialogVisible"
      :position-id="editingId"
      @saved="loadPositions"
    />
    <PositionDetailDialog v-model="detailVisible" :position-id="detailId" />
  </PageContainer>
</template>

<style scoped lang="scss">
.position-table-wrap {
  overflow: hidden;
}
</style>
