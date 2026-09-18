<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <section class="page-container">
    <header class="page-container__header">
      <div>
        <h1>{{ title }}</h1>
        <p v-if="description">{{ description }}</p>
      </div>
      <div v-if="$slots.actions" class="page-container__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100%;
  padding: 22px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
}

.page-container__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;

  h1 {
    margin: 0;
    color: var(--text);
    font-size: 20px;
    line-height: 28px;
  }

  p {
    margin: 5px 0 0;
    color: var(--text-secondary);
    font-size: 13px;
    line-height: 20px;
  }
}

.page-container__actions {
  flex: 0 0 auto;
}

@media (max-width: 640px) {
  .page-container {
    padding: 16px;
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  .page-container__header {
    flex-direction: column;
  }
}
</style>
