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
      'rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider',
      {
        // sizes
        'text-sm px-4 py-3': size === 'md',
        'text-xs px-3 py-1.5': size === 'sm',
        // variants
        'border border-led/40 text-led hover:bg-led/10': variant === 'default',
        'text-led/50 hover:text-led': variant === 'ghost',
        'border border-red-800/50 text-red-400 hover:bg-red-900/20':
          variant === 'danger',
        'text-red-400/70 hover:text-red-400': variant === 'danger-ghost',
      },
    ]"
  >
    <slot />
  </button>
</template>
