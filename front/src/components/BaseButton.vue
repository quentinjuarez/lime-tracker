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

<template>
  <button
    type="button"
    :class="[
      'rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider',
      {
        // sizes
        'text-sm px-4 py-2.5': size === 'md',
        'text-xs px-3 py-1.5': size === 'sm',
        // variants
        'bg-led text-black hover:bg-led/80': variant === 'default',
        'border border-led/80 text-led hover:bg-led/20': variant === 'ghost',
        'border border-red-800/80 text-red-400 hover:bg-red-900/20':
          variant === 'danger',
        'text-red-400/70 hover:text-red-400': variant === 'danger-ghost',
      },
    ]"
  >
    <slot />
  </button>
</template>
