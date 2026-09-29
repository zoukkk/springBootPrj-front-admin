<script setup>
import PositionApi from '@/api/positions'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  positionId: { type: [Number, String], default: null },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const formRef = ref()
const loading = ref(false)
const submitting = ref(false)

function createForm() {
  return { id: null, name: '', code: '', sort: 0, status: 1 }
}

const form = ref(createForm())
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const title = computed(() => (props.positionId ? '编辑岗位' : '新增岗位'))
const rules = {
  name: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { max: 50, message: '岗位名称不能超过 50 个字符', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9_-]*$/, message: '编码须以字母开头，只能包含字母、数字、下划线或连字符', trigger: 'blur' },
    { max: 50, message: '岗位编码不能超过 50 个字符', trigger: 'blur' },
  ],
  sort: [{ type: 'number', min: 0, max: 9999, message: '排序值须为 0-9999 的整数', trigger: 'change' }],
}

watch(
  () => props.modelValue,
  async (isVisible) => {
    if (!isVisible) return
    form.value = createForm()
    await nextTick()
    formRef.value?.clearValidate()
    if (!props.positionId) return

    loading.value = true
    try {
      form.value = { ...createForm(), ...(await PositionApi.getPositionDetail(props.positionId)) }
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
      ...(props.positionId ? { id: props.positionId } : {}),
      name: form.value.name.trim(),
      code: form.value.code.trim(),
      sort: Number(form.value.sort) || 0,
      status: form.value.status,
    }
    if (props.positionId) {
      await PositionApi.updatePosition(payload)
      ElMessage.success('岗位修改成功')
    } else {
      await PositionApi.createPosition(payload)
      ElMessage.success('岗位创建成功')
    }
    visible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog v-model="visible" :title="title" width="520px" :close-on-click-modal="false">
    <el-form ref="formRef" v-loading="loading" :model="form" :rules="rules" label-position="top">
      <el-form-item label="岗位名称" prop="name">
        <el-input v-model="form.name" maxlength="50" show-word-limit placeholder="例如：法师" />
      </el-form-item>
      <el-form-item label="岗位编码" prop="code">
        <el-input v-model="form.code" maxlength="50" show-word-limit placeholder="例如：MAGE" />
      </el-form-item>
      <div class="form-row">
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" :max="9999" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" inline-prompt active-text="启用" inactive-text="禁用" />
        </el-form-item>
      </div>
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

@media (max-width: 520px) {
  .form-row { grid-template-columns: 1fr; gap: 10px; }
}
</style>
