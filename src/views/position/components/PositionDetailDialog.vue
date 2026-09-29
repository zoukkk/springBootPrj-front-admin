<script setup>
import PositionApi from '@/api/positions'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  positionId: { type: [Number, String], default: null },
})
const emit = defineEmits(['update:modelValue'])
const loading = ref(false)
const position = ref(null)
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

watch(
  () => props.modelValue,
  async (isVisible) => {
    if (!isVisible || !props.positionId) return
    loading.value = true
    position.value = null
    try {
      position.value = await PositionApi.getPositionDetail(props.positionId)
    } finally {
      loading.value = false
    }
  },
)
</script>

<template>
  <el-dialog v-model="visible" title="岗位详情" width="600px">
    <div v-loading="loading" class="position-detail">
      <template v-if="position">
        <div class="position-heading">
          <div class="position-mark">{{ position.code?.slice(0, 1) || 'P' }}</div>
          <div>
            <el-text type="info">{{ position.code }}</el-text>
            <h2>{{ position.name }}</h2>
          </div>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="岗位 ID">{{ position.id }}</el-descriptions-item>
          <el-descriptions-item label="岗位编码">{{ position.code }}</el-descriptions-item>
          <el-descriptions-item label="排序">{{ position.sort }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ position.status === 1 ? '启用' : '禁用' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ position.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ position.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.position-detail { min-height: 220px; }
.position-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 22px; }
.position-mark { display: grid; width: 52px; height: 52px; place-items: center; color: #fff; background: var(--primary); border-radius: 12px; font-size: 22px; font-weight: 700; }
.position-heading h2 { margin: 4px 0 0; color: var(--text); }
</style>
