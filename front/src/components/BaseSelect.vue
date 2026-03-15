<template>
  <div
    class="w-full bg-accent-50 dark:bg-accent-950/40 border border-accent-200 dark:border-accent-700 text-accent-700 dark:text-accent-300 text-sm pr-2 font-mono rounded-xl focus-within:border-accent-300 dark:focus-within:border-accent-600 cursor-pointer transition-colors"
  >
    <select v-model="model" class="w-full h-full px-3 py-2">
      <slot />
    </select>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<string>();
</script>

<style scoped>
option {
  background: var(--scrollbar-bg); /* switches with theme */
  color: var(--color-accent);
}
</style>
