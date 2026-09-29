<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import RoleApi from '@/api/system/role'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  roleId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

function createForm() {
  return { id: null, name: '', code: '', sort: 0, status: 1, isSuperAdmin: false, description: '' }
}

const form = ref(createForm())
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const title = computed(() => (props.roleId ? '编辑角色' : '新增角色'))
const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { max: 50, message: '角色名称不能超过 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9_-]*$/, message: '编码须以字母开头，只能包含字母、数字、下划线或连字符', trigger: 'blur' },
    { max: 50, message: '角色编码不能超过 50 个字符', trigger: 'blur' },
  ],
  sort: [{ type: 'number', min: 0, max: 9999, message: '排序值须为 0-9999 的整数', trigger: 'change' }],
  description: [{ max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }],
}

watch(
  () => props.modelValue,
  async (isVisible) => {
    if (!isVisible) return
    form.value = createForm()
    await nextTick()
    formRef.value?.clearValidate()
    if (!props.roleId) return

    loading.value = true
    try {
      const detail = await RoleApi.getRoleDetail(props.roleId)
      form.value = {
        ...createForm(),
        ...(detail || {}),
        sort: Number(detail?.sort) || 0,
        status: Number(detail?.status) === 0 ? 0 : 1,
        isSuperAdmin: Boolean(detail?.isSuperAdmin),
      }
    } finally {
      loading.value = false
    }
  },
)

async function submit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      ...(props.roleId ? { id: props.roleId } : {}),
      name: form.value.name.trim(),
      code: form.value.code.trim(),
      sort: Number(form.value.sort) || 0,
      status: Number(form.value.status) === 0 ? 0 : 1,
      isSuperAdmin: Boolean(form.value.isSuperAdmin),
      description: form.value.description?.trim() || '',
    }

    if (props.roleId) {
      await RoleApi.updateRole(payload)
      ElMessage.success('角色修改成功')
    } else {
      await RoleApi.createRole(payload)
      ElMessage.success('角色创建成功')
    }
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="560px" :close-on-click-modal="false">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-position="top">
      <div class="form-row">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="例如：运营人员" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" maxlength="50" show-word-limit placeholder="例如：operator" />
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" inline-prompt active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </div>
      <el-form-item label="超级管理员" prop="isSuperAdmin">
        <el-switch v-model="form.isSuperAdmin" inline-prompt active-text="是" inactive-text="否" />
        <div class="field-help">超级管理员角色拥有全部有效菜单权限，和角色编码无关。</div>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="200" show-word-limit placeholder="请输入角色职责或使用范围" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.field-help {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 18px;
}

@media (max-width: 560px) {
  .form-row { grid-template-columns: 1fr; gap: 10px; }
}
</style>
