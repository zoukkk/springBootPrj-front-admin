<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import UserApi from '@/api/system/user'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  user: { type: Object, default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const formRef = ref()
const submitting = ref(false)
const form = ref({ password: '', confirmPassword: '' })
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function validateConfirm(rule, value, callback) {
  if (!value) return callback(new Error('请再次输入新密码'))
  callback(value === form.value.password ? undefined : new Error('两次输入的密码不一致'))
}

const rules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度须为 6 到 32 位', trigger: 'blur' },
  ],
  confirmPassword: [{ validator: validateConfirm, trigger: 'blur' }],
}

watch(
  () => props.modelValue,
  async (isVisible) => {
    if (!isVisible) return
    form.value = { password: '', confirmPassword: '' }
    await nextTick()
    formRef.value?.clearValidate()
  },
)

async function submit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.user?.id) return

  submitting.value = true
  try {
    await UserApi.resetUserPassword(props.user.id, { password: form.value.password })
    ElMessage.success(`用户“${props.user.username}”密码重置成功`)
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" title="重置密码" width="460px" :close-on-click-modal="false">
    <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
      <el-form-item label="新密码" prop="password">
        <el-input v-model="form.password" type="password" show-password autocomplete="new-password" placeholder="6 到 32 位" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="form.confirmPassword" type="password" show-password autocomplete="new-password" placeholder="再次输入新密码" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">重置密码</el-button>
    </template>
  </el-dialog>
</template>
