<script setup>
import { h, onMounted, reactive, ref } from "vue";
import {
  Delete,
  Edit,
  Key,
  Plus,
  RefreshLeft,
  Search,
} from "@element-plus/icons-vue";
import {
  ElButton,
  ElMessage,
  ElMessageBox,
  ElSwitch,
  ElTag,
} from "element-plus";
import RoleApi from "@/api/system/role";
import PageContainer from "@/components/PageContainer.vue";
import SearchForm from "@/components/SearchForm.vue";
import Table from "@/components/table/index.vue";
import RoleFormDialog from "./components/RoleFormDialog.vue";
import RoleMenuDialog from "./components/RoleMenuDialog.vue";

const rows = ref([]);
const searchModel = reactive({ keyword: "" });
const searchFields = [
  {
    type: "Input",
    label: "角色关键词",
    prop: "keyword",
    width: "300px",
    searchOnClear: true,
    componentAttr: { placeholder: "搜索角色名称或编码" },
  },
  {
    type: "Buttons",
    prop: "actions",
    label: "",
    componentAttr: {
      list: [
        { type: "primary", icon: Search, render: () => "查询", searchAction: true, searchOnEnter: true, on: { click: search } },
        { icon: RefreshLeft, render: () => "重置", on: { click: reset } },
        { type: "primary", plain: true, icon: Plus, render: () => "新增角色", on: { click: openCreate } },
      ],
    },
  },
];
const loading = ref(false);
const dialogVisible = ref(false);
const menuDialogVisible = ref(false);
const editingId = ref(null);
const permissionRole = ref(null);
const statusLoading = reactive(new Set());
const pagingData = reactive({
  total: 0,
  pageObj: { pageNum: 1, pageSize: 20 },
});

const columns = [
  { prop: "id", label: "ID", width: 90, align: "center" },
  { prop: "name", label: "角色名称", minWidth: 180, showOverflowTooltip: true },
  { prop: "code", label: "角色编码", minWidth: 190, showOverflowTooltip: true },
  { prop: "sort", label: "排序", width: 100, align: "center" },
  {
    prop: "isSuperAdmin",
    label: "超级管理员",
    width: 130,
    align: "center",
    render: ({ row }) =>
      h(
        ElTag,
        {
          size: "small",
          type: row.isSuperAdmin ? "warning" : "info",
          effect: "plain",
        },
        () => (row.isSuperAdmin ? "是" : "否"),
      ),
  },
  {
    prop: "status",
    label: "状态",
    width: 100,
    align: "center",
    render: ({ row }) =>
      h(ElSwitch, {
        modelValue: Number(row.status) === 1,
        loading: statusLoading.has(row.id),
        inlinePrompt: true,
        activeText: "启",
        inactiveText: "禁",
        beforeChange: () => updateStatus(row),
      }),
  },
  {
    prop: "createTime",
    label: "创建时间",
    minWidth: 180,
    showOverflowTooltip: true,
    render: ({ row }) => row.createTime || "-",
  },
  {
    label: "操作",
    width: 250,
    align: "center",
    fixed: "right",
    render: ({ row }) =>
      h("div", { class: "table-actions" }, [
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
            type: "primary",
            icon: Key,
            onClick: () => openPermission(row),
          },
          () => "分配权限",
        ),
        h(
          ElButton,
          {
            link: true,
            type: "danger",
            icon: Delete,
            disabled: row.isSuperAdmin,
            onClick: () => deleteRole(row),
          },
          () => "删除",
        ),
      ]),
  },
];

async function loadRoles() {
  loading.value = true;
  try {
    const result = await RoleApi.getRoleList({
      keyword: searchModel.keyword.trim() || undefined,
      pageNum: pagingData.pageObj.pageNum,
      pageSize: pagingData.pageObj.pageSize,
    });
    rows.value = result?.list || [];
    pagingData.total = result?.total || 0;
    pagingData.pageObj.pageNum = result?.pageNum || 1;
    pagingData.pageObj.pageSize =
      result?.pageSize || pagingData.pageObj.pageSize;
  } finally {
    loading.value = false;
  }
}

function search() {
  pagingData.pageObj.pageNum = 1;
  loadRoles();
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

function openPermission(row) {
  permissionRole.value = row;
  menuDialogVisible.value = true;
}

async function updateStatus(row) {
  const nextStatus = Number(row.status) === 1 ? 0 : 1;
  statusLoading.add(row.id);
  try {
    await RoleApi.updateRole({
      id: row.id,
      name: row.name,
      code: row.code,
      sort: Number(row.sort) || 0,
      status: nextStatus,
      isSuperAdmin: Boolean(row.isSuperAdmin),
      ...(Object.prototype.hasOwnProperty.call(row, "description")
        ? { description: row.description || "" }
        : {}),
    });
    row.status = nextStatus;
    ElMessage.success(`角色已${nextStatus === 1 ? "启用" : "禁用"}`);
    return true;
  } catch {
    return false;
  } finally {
    statusLoading.delete(row.id);
  }
}

async function deleteRole(row) {
  if (row.isSuperAdmin) {
    ElMessage.warning("超级管理员角色禁止删除");
    return;
  }
  const confirmed = await ElMessageBox.confirm(
    `删除角色“${row.name}”后将无法恢复，是否继续？`,
    "删除角色",
    {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
    },
  ).catch(() => false);
  if (!confirmed) return;
  try {
    await RoleApi.deleteRole(row.id);
    ElMessage.success("角色删除成功");
    if (rows.value.length === 1 && pagingData.pageObj.pageNum > 1)
      pagingData.pageObj.pageNum -= 1;
    await loadRoles();
  } catch {
    // request.js surfaces the server's user-association conflict message.
  }
}

onMounted(loadRoles);
</script>

<template>
  <PageContainer >
    <SearchForm
      v-model="searchModel"
      :form-list="searchFields"
    />
    <el-card
      v-loading="loading"
      class="role-table-wrap"
      shadow="never"
      :body-style="{ padding: 0 }"
    >
      <Table
        :data="rows"
        :columns="columns"
        :paging-data="pagingData"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        default-expand-all
        empty-text="暂无角色数据"
        @change-page="loadRoles"
      />
    </el-card>
    <RoleFormDialog
      v-model="dialogVisible"
      :role-id="editingId"
      @saved="loadRoles"
    />
    <RoleMenuDialog
      v-model="menuDialogVisible"
      :role-id="permissionRole?.id"
      :role-name="permissionRole?.name"
      @saved="loadRoles"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.role-table-wrap {
  overflow: hidden;
}

:deep(.table-actions) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

</style>
