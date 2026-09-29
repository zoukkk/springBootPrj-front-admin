<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import RoleApi from '@/api/system/role'
import UserApi from '@/api/system/user'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  userId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const formRef = ref()
const loading = ref(false)
const submitting = ref(false)
const rolesLoading = ref(false)
const roles = ref([])
const checkingUsername = ref(false)
let usernameCheckSequence = 0

function createForm() {
  return {
    username: '',
    password: '',
    nickname: '',
    email: '',
    phone: '',
    status: 1,
    roleIds: [],
  }
}

const form = ref(createForm())
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const title = computed(() => (props.userId ? '编辑用户' : '新增用户'))

async function validateUsername(rule, value, callback) {
  const username = value?.trim()
  if (!username || props.userId) return callback()

  const sequence = ++usernameCheckSequence
  checkingUsername.value = true
  try {
    const result = await UserApi.getUserList({ username, pageNum: 1, pageSize: 100 })
    if (sequence !== usernameCheckSequence) return callback()
    const duplicate = (result?.list || []).some(
      (user) => String(user.username || '').toLowerCase() === username.toLowerCase(),
    )
    callback(duplicate ? new Error('用户名已存在') : undefined)
  } catch {
    callback(new Error('用户名暂时无法校验，请稍后重试'))
  } finally {
    if (sequence === usernameCheckSequence) checkingUsername.value = false
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^\S{2,18}$/, message: '用户名须为 2 到 18 位非空白字符', trigger: 'blur' },
    { validator: validateUsername, trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度须为 6 到 32 位', trigger: 'blur' },
  ],
  nickname: [{ max: 50, message: '昵称不能超过 50 个字符', trigger: 'blur' }],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' },
    { max: 100, message: '邮箱不能超过 100 个字符', trigger: 'blur' },
  ],
  phone: [{ max: 30, message: '手机号不能超过 30 个字符', trigger: 'blur' }],
  roleIds: [{ type: 'array', required: true, min: 1, message: '请至少分配一个角色', trigger: 'change' }],
}

async function loadRoles(detail) {
  rolesLoading.value = true
  try {
    const availableRoles = await RoleApi.getAllRoles()
    const assignedRoles = detail?.roles || []
    const roleMap = new Map((availableRoles || []).map((role) => [String(role.id), role]))
    assignedRoles.forEach((role) => {
      if (!roleMap.has(String(role.id))) roleMap.set(String(role.id), role)
    })
    roles.value = [...roleMap.values()]
  } finally {
    rolesLoading.value = false
  }
}

watch(
  () => props.modelValue,
  async (isVisible) => {
    if (!isVisible) return
    form.value = createForm()
    roles.value = []
    await nextTick()
    formRef.value?.clearValidate()
    loading.value = Boolean(props.userId)
    try {
      const detail = props.userId ? await UserApi.getUserDetail(props.userId) : null
      if (detail) {
        form.value = {
          ...createForm(),
          username: detail.username || '',
          nickname: detail.nickname || '',
          email: detail.email || '',
          phone: detail.phone || '',
          status: Number(detail.status) === 0 ? 0 : 1,
          roleIds: detail.roleIds || (detail.roles || []).map((role) => role.id),
        }
      }
      await loadRoles(detail)
    } finally {
      loading.value = false
    }
  },
)

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const payload = {
      ...(props.userId ? {} : { username: form.value.username.trim(), password: form.value.password }),
      nickname: form.value.nickname.trim(),
      email: form.value.email.trim(),
      phone: form.value.phone.trim(),
      status: Number(form.value.status) === 0 ? 0 : 1,
      roleIds: form.value.roleIds,
    }

    if (props.userId) {
      await UserApi.updateUser(props.userId, payload)
      ElMessage.success('用户修改成功')
    } else {
      await UserApi.createUser(payload)
      ElMessage.success('用户创建成功')
    }
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="600px" :close-on-click-modal="false">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-position="top">
      <div class="form-row">
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            :readonly="Boolean(userId)"
            :validate-event="false"
            maxlength="18"
            autocomplete="username"
            placeholder="2 到 18 位非空白字符"
            @blur="formRef?.validateField('username')"
          >
            <template v-if="checkingUsername" #suffix><el-icon class="is-loading"><Loading /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item v-if="!userId" label="初始密码" prop="password">
          <el-input v-model="form.password" type="password" show-password autocomplete="new-password" placeholder="6 到 32 位" />
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" maxlength="50" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" maxlength="100" placeholder="请输入邮箱" />
        </el-form-item>
      </div>
      <div class="form-row">
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" maxlength="30" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" inline-prompt active-text="启用" inactive-text="停用" />
        </el-form-item>
      </div>
      <el-form-item label="分配角色" prop="roleIds">
        <el-select v-model="form.roleIds" v-loading="rolesLoading" multiple filterable clearable class="role-select" placeholder="请选择角色">
          <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
        </el-select>
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

.role-select { width: 100%; }

@media (max-width: 560px) {
  .form-row { grid-template-columns: 1fr; gap: 10px; }
}
</style>
