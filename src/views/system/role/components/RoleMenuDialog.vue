<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { CircleCheck, CircleClose } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import RoleApi from '@/api/system/role'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  roleId: { type: [Number, String], default: null },
  roleName: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const authStore = useAuthStore()
const { menus } = storeToRefs(authStore)
const treeRef = ref()
const loading = ref(false)
const submitting = ref(false)
const treeData = computed(() => menus.value || [])
const allMenuIds = computed(() => flattenMenuIds(treeData.value))
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const treeProps = { label: 'name', children: 'children' }

function flattenMenuIds(items = []) {
  return items.flatMap((item) => [item.id, ...flattenMenuIds(item.children || [])])
}

function normalizeMenuIds(value) {
  const ids = Array.isArray(value) ? value : value?.menuIds || value?.ids || value?.data || []
  return ids.map((id) => (typeof id === 'string' && /^\d+$/.test(id) ? Number(id) : id))
}

watch(
  () => props.modelValue,
  async (isVisible) => {
    if (!isVisible || !props.roleId) return
    loading.value = true
    try {
      const roleMenus = await RoleApi.getRoleMenuIds(props.roleId)
      await nextTick()
      treeRef.value?.setCheckedKeys(normalizeMenuIds(roleMenus), false)
    } finally {
      loading.value = false
    }
  },
)

async function save() {
  if (!props.roleId) return
  submitting.value = true
  try {
    const checkedKeys = treeRef.value?.getCheckedKeys(false) || []
    const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() || []
    const menuIds = [...new Set([...checkedKeys, ...halfCheckedKeys])]
    await RoleApi.saveRoleMenus({ roleId: props.roleId, menuIds })
    ElMessage.success('角色菜单权限保存成功')
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}

function selectAll() {
  treeRef.value?.setCheckedKeys(allMenuIds.value, false)
}

function clearAll() {
  treeRef.value?.setCheckedKeys([], false)
}
</script>

<template>
  <el-dialog v-model="visible" title="分配菜单权限" width="560px" :close-on-click-modal="false">
    <div v-loading="loading" class="menu-dialog-body">
      <div class="menu-dialog-heading">
        <div class="menu-dialog-role">
          <span>当前角色</span>
          <strong>{{ roleName || `角色 #${roleId}` }}</strong>
        </div>
        <div class="menu-dialog-actions">
          <el-button text type="primary" :icon="CircleCheck" @click="selectAll">全选</el-button>
          <el-button text :icon="CircleClose" @click="clearAll">取消全选</el-button>
        </div>
      </div>
      <el-empty v-if="!loading && !treeData.length" description="暂无可分配菜单" :image-size="80" />
      <el-tree
        v-else
        ref="treeRef"
        class="menu-tree"
        :data="treeData"
        :props="treeProps"
        node-key="id"
        show-checkbox
        default-expand-all
        highlight-current
      />
    </div>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="save">保存权限</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.menu-dialog-body {
  min-height: 260px;
  max-height: min(60vh, 520px);
  overflow: auto;
}

.menu-dialog-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 13px;

  strong { color: var(--text); font-size: 15px; }
}

.menu-dialog-role {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.menu-dialog-actions {
  display: inline-flex;
  gap: 10px;
}

.menu-tree {
  padding: 6px 4px;
  background: var(--surface-subtle);
  border: 1px solid var(--border);
  border-radius: 6px;
}
</style>
