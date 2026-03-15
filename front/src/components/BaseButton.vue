<template>
  <button
    type="button"
    class="flex items-center justify-center gap-1"
    :class="[
      'rounded-xl transition-all duration-150 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed tracking-wide font-medium',
      {
        // sizes
        'text-sm px-4 py-2.5': size === 'md',
        'text-xs px-3 py-1.5': size === 'sm',
        // variants
        'bg-accent-600 dark:bg-accent-500 text-white hover:bg-accent-700 dark:hover:bg-accent-400 shadow-sm':
          variant === 'default',
        'border border-accent-200 dark:border-accent-700 text-accent-600 dark:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-950 bg-transparent':
          variant === 'ghost',
        'bg-red-500 text-white hover:bg-red-600 shadow-sm':
          variant === 'danger',
        'border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950':
          variant === 'danger-ghost',
      },
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'default' | 'ghost' | 'danger' | 'danger-ghost';
    size?: 'sm' | 'md';
  }>(),
  {
    variant: 'default',
    size: 'md',
  },
);
</script>
