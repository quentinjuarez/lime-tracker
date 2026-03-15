<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md';
  }>(),
  {
    size: 'md',
  },
);

const model = defineModel<string>();
</script>

<template>
  <input
    v-model="model"
    :class="[
      'bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-700 text-accent-700 dark:text-accent-300 font-mono rounded-xl focus:border-accent-300 dark:focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-100 dark:focus:ring-accent-900 placeholder:text-accent-300 dark:placeholder:text-accent-600 transition-colors',
      {
        'text-sm px-4 py-2.5': size === 'md',
        'text-xs px-3 py-1.5': size === 'sm',
      },
    ]"
  />
</template>
