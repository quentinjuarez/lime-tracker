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
      'bg-black border border-led/30 text-led font-mono rounded-lg focus:border-led/60 focus:outline-none placeholder:text-led/30',
      {
        'text-sm px-4 py-2.5': size === 'md',
        'text-xs px-3 py-1.5': size === 'sm',
      },
    ]"
  />
</template>
