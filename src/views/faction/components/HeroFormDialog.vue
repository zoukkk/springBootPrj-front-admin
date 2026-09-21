<script setup>
import { h } from 'vue'
import { ElRadioButton, ElRadioGroup } from 'element-plus'
import FactionApi from '@/api/depts/faction'
import HeroApi from '@/api/depts/hero'
import FormPro from '@/components/form/index.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  heroId: { type: Number, default: null },
  selectedFaction: { type: Object, default: null },
  factions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:modelValue', 'saved'])
const formProRef = ref()
const loading = ref(false)
const submitting = ref(false)
const originalHero = ref(null)
const colAttr = { xs: 24, sm: 24, md: 12, lg: 12, xl: 12 }

const createDefaultForm = () => ({
  id: null,
  avatarUrl: '',
  name: '',
  nickname: '',
  role: '阵营成员',
  factionId: props.selectedFaction?.id || null,
  gender: 0,
  introduction: '',
  status: 1,
})

const formModel = ref(createDefaultForm())
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const dialogTitle = computed(() => (props.heroId ? '编辑人物' : '新增人物'))
const formList = computed(() => [
  {
    type: 'Input',
    label: '人物姓名',
    prop: 'name',
    rule: [
      { required: true, message: '请输入人物姓名', trigger: 'blur' },
      { max: 50, message: '人物姓名不能超过 50 个字符', trigger: 'blur' },
    ],
    componentAttr: { maxlength: 50, placeholder: '例如：赵信' },
  },
  {
    type: 'Input',
    label: '人物称号',
    prop: 'nickname',
    rule: { max: 50, message: '人物称号不能超过 50 个字符', trigger: 'blur' },
    componentAttr: { maxlength: 50, placeholder: '例如：德邦总管' },
  },
  {
    type: 'Select',
    label: '所属阵营',
    prop: 'factionId',
    rule: { required: true, message: '请选择所属阵营', trigger: 'change' },
    componentAttr: {
      filterable: true,
      clearable: false,
      options: props.factions.map((item) => ({ label: item.name, value: item.id })),
    },
  },
  {
    type: 'Select',
    label: '阵营身份',
    prop: 'role',
    componentAttr: {
      clearable: false,
      options: [
        { label: '阵营成员', value: '阵营成员' },
        { label: '阵营领袖', value: '阵营领袖' },
      ],
    },
  },
  {
    type: 'Select',
    label: '性别',
    prop: 'gender',
    componentAttr: {
      clearable: false,
      options: [
        { label: '未知', value: 0 },
        { label: '男', value: 1 },
        { label: '女', value: 2 },
      ],
    },
  },
  {
    label: '状态',
    prop: 'status',
    render: () =>
      h(
        ElRadioGroup,
        {
          modelValue: formModel.value.status,
          'onUpdate:modelValue': (value) => (formModel.value.status = value),
        },
        () => [
          h(ElRadioButton, { value: 1 }, () => '启用'),
          h(ElRadioButton, { value: 0 }, () => '停用'),
        ],
      ),
  },
  {
    type: 'Input',
    label: '头像地址',
    prop: 'avatarUrl',
    colAttr: { span: 24 },
    rule: { max: 255, message: '头像地址不能超过 255 个字符', trigger: 'blur' },
    componentAttr: { maxlength: 255, placeholder: '请输入 Data Dragon 头像地址' },
  },
  {
    type: 'Input',
    label: '人物简介',
    prop: 'introduction',
    colAttr: { span: 24 },
    rule: { max: 2000, message: '人物简介不能超过 2000 个字符', trigger: 'blur' },
    componentAttr: { type: 'textarea', rows: 5, maxlength: 2000, showWordLimit: true },
  },
])

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible) return
    originalHero.value = null
    formModel.value = createDefaultForm()
    await nextTick()
    formProRef.value?.formRef?.clearValidate?.()
    if (!props.heroId) return

    loading.value = true
    try {
      const result = await HeroApi.getHeroDetail(props.heroId)
      originalHero.value = result
      const faction = props.factions.find((item) => item.id === result.factionId)
      formModel.value = {
        ...createDefaultForm(),
        ...result,
        role: faction?.leaderHeroId === result.id ? '阵营领袖' : '阵营成员',
      }
    } finally {
      loading.value = false
    }
  },
)

function buildPayload() {
  return {
    avatarUrl: formModel.value.avatarUrl?.trim() || '',
    name: formModel.value.name.trim(),
    nickname: formModel.value.nickname?.trim() || '',
    role: formModel.value.role?.trim() || '',
    factionId: formModel.value.factionId,
    gender: formModel.value.gender,
    introduction: formModel.value.introduction?.trim() || '',
    status: formModel.value.status,
  }
}

function buildFactionPayload(faction, leaderHeroId) {
  return {
    parentId: faction.parentId || 0,
    name: faction.name,
    code: faction.code,
    iconUrl: faction.iconUrl || '',
    themeColor: faction.themeColor || '',
    leaderHeroId,
    description: faction.description || '',
    sort: faction.sort || 0,
    status: faction.status,
  }
}

async function updateFactionLeader(factionId, leaderHeroId) {
  const faction = await FactionApi.getFactionDetail(factionId)
  await FactionApi.updateFaction(factionId, buildFactionPayload(faction, leaderHeroId))
  return faction
}

async function demotePreviousLeader(heroId) {
  if (!heroId || heroId === formModel.value.id) return
  const hero = await HeroApi.getHeroDetail(heroId)
  await HeroApi.updateHero(heroId, {
    avatarUrl: hero.avatarUrl || '',
    name: hero.name,
    nickname: hero.nickname || '',
    role: '阵营成员',
    factionId: hero.factionId,
    gender: hero.gender,
    introduction: hero.introduction || '',
    status: hero.status,
  })
}

async function submitForm() {
  const valid = await formProRef.value.validate().then(() => true).catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const oldFaction = props.factions.find((item) => item.id === originalHero.value?.factionId)
    const wasLeader = oldFaction?.leaderHeroId === props.heroId
    const changesFaction = originalHero.value?.factionId !== formModel.value.factionId

    if (wasLeader && changesFaction) {
      await updateFactionLeader(oldFaction.id, null)
    }

    let savedHero
    if (props.heroId) {
      savedHero = await HeroApi.updateHero(props.heroId, buildPayload())
    } else {
      savedHero = await HeroApi.createHero(buildPayload())
    }

    const targetFaction = props.factions.find((item) => item.id === formModel.value.factionId)
    if (formModel.value.role === '阵营领袖') {
      const previousLeaderId = targetFaction?.leaderHeroId
      await updateFactionLeader(formModel.value.factionId, savedHero.id)
      await demotePreviousLeader(previousLeaderId)
    } else if (wasLeader && !changesFaction) {
      await updateFactionLeader(oldFaction.id, null)
    }

    ElMessage.success(props.heroId ? '人物修改成功' : '人物创建成功')
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
    width="680px"
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
