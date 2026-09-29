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
import UserApi from "@/api/system/user";
import PageContainer from "@/components/PageContainer.vue";
import SearchForm from "@/components/SearchForm.vue";
import Table from "@/components/table/index.vue";
import { useAuthStore } from "@/stores/auth";
import UserFormDialog from "./components/UserFormDialog.vue";
import UserPasswordDialog from "./components/UserPasswordDialog.vue";

const authStore = useAuthStore();
const rows = ref([]);
const searchModel = reactive({ username: "", nickname: "", status: "" });
const searchFields = [
  {
    type: "Input",
    label: "用户名",
    prop: "username",
    width: "220px",
    searchOnClear: true,
    componentAttr: { placeholder: "搜索用户名" },
  },
  {
    type: "Input",
    label: "昵称",
    prop: "nickname",
    width: "220px",
    searchOnClear: true,
    componentAttr: { placeholder: "搜索昵称" },
  },
  {
    type: "Select",
    label: "状态",
    prop: "status",
    width: "140px",
    searchOnChange: true,
    componentAttr: {
      placeholder: "全部状态",
      options: [
        { label: "启用", value: "1" },
        { label: "停用", value: "0" },
      ],
    },
  },
  {
    type: "Buttons",
    prop: "actions",
    label: "",
    componentAttr: {
      list: [
        { type: "primary", icon: Search, render: () => "查询", searchAction: true, searchOnEnter: true, on: { click: search } },
        { icon: RefreshLeft, render: () => "重置", on: { click: reset } },
        { type: "primary", plain: true, icon: Plus, loading: false, render: () => "新增用户", on: { click: openCreate } },
      ],
    },
  },
];
const loading = ref(false);
const roleLoading = ref(false);
const roleOptions = ref([]);
const dialogVisible = ref(false);
const passwordDialogVisible = ref(false);
const editingId = ref(null);
const passwordUser = ref(null);
const statusLoading = reactive(new Set());
const pagingData = reactive({
  total: 0,
  pageObj: { pageNum: 1, pageSize: 20 },
});

function currentUser(row) {
  return String(row.id) === String(authStore.userInfo?.id);
}

function protectedAdmin(row) {
  const superAdminRoleIds = new Set(
    roleOptions.value
      .filter((role) => Boolean(role.isSuperAdmin))
      .map((role) => String(role.id)),
  );
  return (
    (row.roles || []).some(
      (role) =>
        Boolean(role.isSuperAdmin) || superAdminRoleIds.has(String(role.id)),
    ) || roleIds(row).some((roleId) => superAdminRoleIds.has(String(roleId)))
  );
}

function roleIds(row) {
  return row.roleIds || (row.roles || []).map((role) => role.id);
}

const columns = [
  { prop: "id", label: "ID", width: 80, align: "center" },
  {
    prop: "username",
    label: "用户名",
    minWidth: 150,
    showOverflowTooltip: true,
  },
  {
    prop: "nickname",
    label: "昵称",
    minWidth: 150,
    showOverflowTooltip: true,
    render: ({ row }) => row.nickname || "-",
  },
  {
    prop: "roles",
    label: "角色",
    minWidth: 200,
    render: ({ row }) =>
      h(
        "div",
        { class: "role-tags" },
        (row.roles || []).map((role) =>
          h(
            ElTag,
            { key: role.id, size: "small", effect: "plain" },
            () => role.name,
          ),
        ),
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
        disabled: currentUser(row),
        inlinePrompt: true,
        activeText: "启",
        inactiveText: "停",
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
            onClick: () => openPasswordDialog(row),
          },
          () => "重置密码",
        ),
        h(
          ElButton,
          {
            link: true,
            type: "danger",
            icon: Delete,
            disabled: currentUser(row) || row.isSuperAdmin,
            onClick: () => deleteUser(row),
          },
          () => "删除",
        ),
      ]),
  },
];

async function loadUsers() {
  loading.value = true;
  try {
    const result = await UserApi.getUserList({
      username: searchModel.username.trim() || undefined,
      nickname: searchModel.nickname.trim() || undefined,
      status:
        searchModel.status === "" ? undefined : Number(searchModel.status),
      pageNum: pagingData.pageObj.pageNum,
      pageSize: pagingData.pageObj.pageSize,
    });
    rows.value = result?.list || [];
    pagingData.total = Number(result?.total) || 0;
    pagingData.pageObj.pageNum = Number(result?.pageNum) || 1;
    pagingData.pageObj.pageSize =
      Number(result?.pageSize) || pagingData.pageObj.pageSize;
  } catch {
    rows.value = [];
    pagingData.total = 0;
  } finally {
    loading.value = false;
  }
}

async function loadRoleOptions() {
  roleLoading.value = true;
  try {
    roleOptions.value = (await RoleApi.getAllRoles()) || [];
  } catch {
    roleOptions.value = [];
  } finally {
    roleLoading.value = false;
  }
}

function search() {
  pagingData.pageObj.pageNum = 1;
  loadUsers();
}

function reset() {
  Object.assign(searchModel, { username: "", nickname: "", status: "" });
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

function openPasswordDialog(row) {
  passwordUser.value = row;
  passwordDialogVisible.value = true;
}

async function updateStatus(row) {
  if (currentUser(row)) {
    ElMessage.warning("不能停用当前登录用户");
    return false;
  }

  const nextStatus = Number(row.status) === 1 ? 0 : 1;
  statusLoading.add(row.id);
  try {
    await UserApi.updateUser(row.id, {
      username: row.username,
      nickname: row.nickname || "",
      email: row.email || "",
      phone: row.phone || "",
      status: nextStatus,
      roleIds: roleIds(row),
    });
    row.status = nextStatus;
    ElMessage.success(`用户已${nextStatus === 1 ? "启用" : "停用"}`);
    return true;
  } catch {
    return false;
  } finally {
    statusLoading.delete(row.id);
  }
}

async function deleteUser(row) {
  if (currentUser(row)) {
    ElMessage.warning("不能删除当前登录用户");
    return;
  }
  if (protectedAdmin(row)) {
    ElMessage.warning("管理员账号禁止删除");
    return;
  }

  const confirmed = await ElMessageBox.confirm(
    `删除用户“${row.username}”后将无法恢复，是否继续？`,
    "删除用户",
    {
      type: "warning",
      confirmButtonText: "确认删除",
      cancelButtonText: "取消",
    },
  ).catch(() => false);
  if (!confirmed) return;

  try {
    await UserApi.deleteUser(row.id);
    ElMessage.success("用户删除成功");
    if (rows.value.length === 1 && pagingData.pageObj.pageNum > 1)
      pagingData.pageObj.pageNum -= 1;
    await loadUsers();
  } catch {
    // request.js displays the server's protection or association error.
  }
}

onMounted(() => {
  loadUsers();
  loadRoleOptions();
});
</script>

<template>
  <PageContainer
  >
    <SearchForm
      v-model="searchModel"
      :form-list="searchFields"
    />
    <el-card
      v-loading="loading"
      class="user-table-wrap"
      shadow="never"
      :body-style="{ padding: 0 }"
    >
      <Table
        :data="rows"
        :columns="columns"
        :paging-data="pagingData"
        row-key="id"
        empty-text="暂无用户数据"
        @change-page="loadUsers"
      />
    </el-card>
    <UserFormDialog
      v-model="dialogVisible"
      :user-id="editingId"
      @saved="loadUsers"
    />
    <UserPasswordDialog
      v-model="passwordDialogVisible"
      :user="passwordUser"
      @saved="loadUsers"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.user-table-wrap {
  overflow: hidden;
}

:deep(.role-tags) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

:deep(.table-actions) {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

</style>
