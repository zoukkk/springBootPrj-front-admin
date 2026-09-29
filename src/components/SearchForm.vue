<script setup>
import { computed, ref, watch } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import Form from '@/components/form/index.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: { type: Object, default: () => ({}) },
  formList: { type: Array, default: () => [] },
  labelWidth: { type: [String, Number], default: 0 },
})

const emit = defineEmits(['update:modelValue'])
const visibleKeys = ref([])
const draftVisibleKeys = ref([])
let initialized = false
let knownKeys = new Set()

const conditionFields = computed(() => props.formList.filter((field) => field.type !== 'Buttons'))
const buttonFields = computed(() => props.formList.filter((field) => field.type === 'Buttons'))

function getFieldKey(field) {
  return field.key || field.prop || field.label
}

function getFieldLabel(field) {
  return field.label || field.prop || '未命名条件'
}

function getInitialKeys(fields) {
  return fields.filter((field) => field.visible !== false).map(getFieldKey)
}

function runButtonAction(actionKey) {
  for (const field of buttonFields.value) {
    const button = field.componentAttr?.list?.find((item) => item[actionKey])
    if (button) return button.on?.click?.()
  }
}

function handleSearch() {
  return runButtonAction('searchAction')
}

function handleEnter() {
  return runButtonAction('searchOnEnter')
}

watch(
  () => props.formList,
  (fields) => {
    const conditions = fields.filter((field) => field.type !== 'Buttons')
    const keys = conditions.map(getFieldKey)
    if (!initialized) {
      visibleKeys.value = getInitialKeys(conditions)
      knownKeys = new Set(keys)
      initialized = true
      return
    }

    visibleKeys.value = visibleKeys.value.filter((key) => keys.includes(key))
    conditions.forEach((field) => {
      const key = getFieldKey(field)
      if (!knownKeys.has(key) && field.visible !== false) visibleKeys.value.push(key)
    })
    knownKeys = new Set(keys)
  },
  { immediate: true, deep: true },
)

const visibleFormList = computed(() => {
  const visible = new Set(visibleKeys.value)
  return props.formList
    .filter((field) => field.type === 'Buttons' || visible.has(getFieldKey(field)))
    .map((field) => {
      const componentAttr = { ...(field.componentAttr || {}) }
      if (field.width && !componentAttr.style?.width) {
        componentAttr.style = { ...(componentAttr.style || {}), width: field.width }
      }
      if (field.searchOnClear) componentAttr.onClear = handleSearch
      if (field.searchOnChange) componentAttr.onChange = handleSearch
      return { ...field, componentAttr }
    })
})

function openSettings() {
  draftVisibleKeys.value = [...visibleKeys.value]
}

function confirmSettings() {
  const availableKeys = conditionFields.value.map(getFieldKey)
  visibleKeys.value = draftVisibleKeys.value.filter((key) => availableKeys.includes(key))
}

function cancelSettings() {
  draftVisibleKeys.value = [...visibleKeys.value]
}

function handleSettingsConfirm(confirm) {
  confirmSettings()
  confirm()
}

function handleSettingsCancel(cancel) {
  cancelSettings()
  cancel()
}
</script>

<template>
  <el-card class="search-form" shadow="never">
    <div class="search-form__body">
      <Form
        class="search-form__instance"
        :model-value="modelValue"
        :form-list="visibleFormList"
        :is-col="false"
        :search-form="true"
        :label-width="labelWidth"
        @update:model-value="emit('update:modelValue', $event)"
        @keyup.enter="handleEnter"
      />
      <el-popconfirm width="280" title="选择显示的查询条件">
        <template #actions="{ confirm, cancel }">
          <div class="search-form__settings">
            <el-checkbox-group v-model="draftVisibleKeys" class="search-form__settings-list">
              <el-checkbox v-for="field in conditionFields" :key="getFieldKey(field)" :value="getFieldKey(field)">
                {{ getFieldLabel(field) }}
              </el-checkbox>
            </el-checkbox-group>
            <div class="search-form__settings-actions">
              <el-button text size="small" @click="handleSettingsCancel(cancel)">取消</el-button>
              <el-button type="primary" size="small" @click="handleSettingsConfirm(confirm)">确定</el-button>
            </div>
          </div>
        </template>
        <template #reference>
          <el-button text circle :icon="Setting" aria-label="设置查询条件" @click="openSettings" />
        </template>
      </el-popconfirm>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.search-form {
  margin-bottom: 10px;
}

.search-form :deep(.el-card__body) {
  padding: 12px;
  overflow: visible;
}

.search-form__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.search-form :deep(.flex.w-full) {
  display: contents;
}

.search-form :deep(.el-form) {
  width: auto !important;
  display: flex !important;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  overflow: visible !important;
}

.search-form :deep(.el-form-item) {
  margin: 0;
}

.search-form :deep(.el-form-item__label) {
  display: none;
}

.search-form__settings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 240px;
  overflow-y: auto;
}

.search-form__settings-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.search-form__settings-list :deep(.el-checkbox) {
  margin-right: 0;
}

@media (max-width: 900px) {
  .search-form__body {
    align-items: flex-start;
  }
}
</style>
