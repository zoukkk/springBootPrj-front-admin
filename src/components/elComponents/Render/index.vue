<template>
  <component :is="content" v-if="type === 'object'" />
  <template v-else>
    <span v-html="content"></span>
  </template>
</template>

<script setup>
import { computed } from 'vue'

defineOptions({
  name: "Render",
  inheritAttrs: false,
});

const props = defineProps({
  content: {
    type: [Number, String, Object],
    required: true,
  },
});
const type = computed(() => {
  return typeof props.content;
});
</script>
