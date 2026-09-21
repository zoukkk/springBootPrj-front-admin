<script setup>
import HeroApi from '@/api/depts/hero'
import RiotApi from '@/api/depts/riot'
import { getChampionPosition } from '@/utils/riot'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  heroId: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])
const loading = ref(false)
const hero = ref(null)
const riotDetail = ref(null)
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
const position = computed(() => getChampionPosition(riotDetail.value?.tags))

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible || !props.heroId) return
    loading.value = true
    hero.value = null
    riotDetail.value = null
    try {
      hero.value = await HeroApi.getHeroDetail(props.heroId)
      riotDetail.value = await RiotApi.getChampionDetail(
        hero.value.dataVersion,
        hero.value.riotChampionId,
      )
    } finally {
      loading.value = false
    }
  },
)
</script>

<template>
  <el-dialog v-model="dialogVisible" title="人物档案" width="760px">
    <div v-loading="loading" class="hero-detail">
      <template v-if="hero">
        <el-space alignment="center" :size="16">
          <el-avatar :size="72" shape="square" :src="hero.avatarUrl" />
          <div>
            <el-text type="info">{{ hero.riotChampionId || 'CUSTOM HERO' }}</el-text>
            <h2>{{ hero.nickname ? `${hero.nickname}-${hero.name}` : hero.name }}</h2>
            <el-space wrap>
              <el-tag v-for="tag in riotDetail?.tags || []" :key="tag" effect="plain">
                {{ getChampionPosition([tag]) }}
              </el-tag>
              <el-tag v-if="hero.role" type="warning" effect="plain">{{ hero.role }}</el-tag>
            </el-space>
          </div>
        </el-space>

        <el-divider />
        <el-descriptions :column="2" border>
          <el-descriptions-item label="档案 ID">{{ hero.id }}</el-descriptions-item>
          <el-descriptions-item label="数据版本">{{ hero.dataVersion || '-' }}</el-descriptions-item>
          <el-descriptions-item label="定位">{{ position }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ ['未知', '男', '女'][hero.gender] || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="状态">{{ hero.status === 1 ? '启用' : '停用' }}</el-descriptions-item>
          <el-descriptions-item label="资源类型">{{ riotDetail?.partype || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ hero.createTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ hero.updateTime || '-' }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">人物背景</el-divider>
        <el-text>{{ riotDetail?.lore || hero.introduction || '暂无人物背景资料' }}</el-text>

        <template v-if="riotDetail?.passive || riotDetail?.spells?.length">
          <el-divider content-position="left">技能资料</el-divider>
          <el-descriptions :column="1" border>
            <el-descriptions-item v-if="riotDetail.passive" :label="`被动 · ${riotDetail.passive.name}`">
              {{ riotDetail.passive.description }}
            </el-descriptions-item>
            <el-descriptions-item
              v-for="(spell, index) in riotDetail.spells || []"
              :key="spell.id"
              :label="`${['Q', 'W', 'E', 'R'][index]} · ${spell.name}`"
            >
              {{ spell.description }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </template>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.hero-detail {
  min-height: 260px;
}

.hero-detail h2 {
  margin: 4px 0 10px;
  color: var(--text);
}

.hero-detail > .el-text {
  line-height: 1.8;
}
</style>
