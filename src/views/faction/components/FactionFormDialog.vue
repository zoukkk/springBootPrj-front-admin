<script setup>
import { h } from 'vue'
import {
  ElColorPicker,
  ElInput,
  ElInputNumber,
} from 'element-plus'
import FactionApi from '@/api/depts/faction'
import FormPro from '@/components/form/index.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  editId: { type: Number, default: null },
  parentId: { type: Number, default: 0 },
  factionTree: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const formProRef = ref()
const loading = ref(false)
const submitting = ref(false)
const colAttr = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }

const createDefaultForm = () => ({
  id: null,
  parentId: props.parentId || 0,
  name: '',
  code: '',
  iconUrl: '',
  themeColor: '#C89B3C',
  leaderHeroId: null,
  description: '',
  sort: 0,
  status: 1,
})

const formModel = ref(createDefaultForm())
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const dialogTitle = computed(() => {
  if (props.editId) return '编辑阵营'
  return props.parentId ? '新增子阵营' : '新增顶级阵营'
})

function flattenTree(items) {
  return items.flatMap((item) => [item, ...flattenTree(item.children || [])])
}

function collectDescendantIds(item) {
  return flattenTree(item?.children || []).map((child) => child.id)
}

const parentOptions = computed(() => {
  const editingNode = flattenTree(props.factionTree).find((item) => item.id === props.editId)
  const blockedIds = new Set([
    ...(props.editId ? [props.editId] : []),
    ...collectDescendantIds(editingNode),
  ])
  return flattenTree(props.factionTree).filter((item) => !blockedIds.has(item.id))
})

const formList = computed(() => [
  {
    type: 'Select',
    label: '上级阵营',
    prop: 'parentId',
    componentAttr: {
      filterable: true,
      clearable: false,
      options: [
        { label: '无（顶级阵营）', value: 0 },
        ...parentOptions.value.map((item) => ({
          label: `${'　'.repeat(item.level)}${item.name}`,
          value: item.id,
        })),
      ],
    },
  },
  {
    type: 'Input',
    label: '阵营名称',
    prop: 'name',
    rule: [
      { required: true, message: '请输入阵营名称', trigger: 'blur' },
      { max: 50, message: '阵营名称不能超过 50 个字符', trigger: 'blur' },
    ],
    componentAttr: { maxlength: 50, placeholder: '例如：德玛西亚' },
  },
  {
    type: 'Input',
    label: '阵营编码',
    prop: 'code',
    rule: [
      { required: true, message: '请输入阵营编码', trigger: 'blur' },
      { max: 50, message: '阵营编码不能超过 50 个字符', trigger: 'blur' },
    ],
    componentAttr: { maxlength: 50, placeholder: '例如：demacia' },
  },
  {
    label: '排序',
    prop: 'sort',
    component: ElInputNumber,
    componentAttr: { min: 0, max: 9999, controlsPosition: 'right' },
  },
  {
    label: '主题色',
    prop: 'themeColor',
    rule: { max: 20, message: '主题色不能超过 20 个字符', trigger: 'blur' },
    render: () =>
      h('div', { class: 'color-field' }, [
        h(ElColorPicker, {
          modelValue: formModel.value.themeColor,
          'onUpdate:modelValue': (value) => (formModel.value.themeColor = value || ''),
        }),
        h(ElInput, {
          modelValue: formModel.value.themeColor,
          maxlength: 20,
          'onUpdate:modelValue': (value) => (formModel.value.themeColor = value),
        }),
      ]),
  },
  {
    type: 'Input',
    label: '徽章地址',
    prop: 'iconUrl',
    colAttr: { span: 24 },
    rule: { max: 255, message: '图标地址不能超过 255 个字符', trigger: 'blur' },
    componentAttr: { maxlength: 255, placeholder: '请输入阵营徽章地址' },
  },
  {
    type: 'Input',
    label: '阵营描述',
    prop: 'description',
    colAttr: { span: 24 },
    componentAttr: { type: 'textarea', rows: 4, maxlength: 1000, showWordLimit: true },
  },
])

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return
    formModel.value = createDefaultForm()
    await nextTick()
    formProRef.value?.formRef?.clearValidate?.()
    if (!props.editId) return

    loading.value = true
    try {
      const result = await FactionApi.getFactionDetail(props.editId)
      formModel.value = { ...createDefaultForm(), ...result }
    } finally {
      loading.value = false
    }
  },
)

function buildPayload() {
  return {
    parentId: formModel.value.parentId || 0,
    name: formModel.value.name.trim(),
    code: formModel.value.code.trim(),
    iconUrl: formModel.value.iconUrl?.trim() || '',
    themeColor: formModel.value.themeColor || '',
    leaderHeroId: formModel.value.leaderHeroId,
    description: formModel.value.description?.trim() || '',
    sort: Number(formModel.value.sort) || 0,
    status: formModel.value.status,
  }
}

async function submitForm() {
  const valid = await formProRef.value.validate().then(() => true).catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (props.editId) {
      await FactionApi.updateFaction(props.editId, buildPayload())
      ElMessage.success('阵营修改成功')
    } else {
      await FactionApi.createFaction(buildPayload())
      ElMessage.success('阵营创建成功')
    }
    dialogVisible.value = false
    emit('saved')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="640px"
    :close-on-click-modal="false"
  >
    <div v-loading="loading">
      <FormPro
        ref="formProRef"
        v-model="formModel"
        :col-attr="colAttr"
        :form-list="formList"
        label-position="top"
      />
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submitForm">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.color-field {
  display: flex;
  width: 100%;
  gap: 8px;
}

.color-field .el-input {
  flex: 1;
}
</style>
