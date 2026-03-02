<template>
  <div class="h-full w-full bg-black overflow-auto font-mono">
    <!-- Board frame -->
    <div class="mx-auto max-w-3xl p-4">
      <!-- Header row -->
      <div
        class="grid grid-cols-[80px_1fr_100px] gap-2 px-4 py-2 border-b border-amber-900/60 text-amber-500/70 text-[11px] uppercase tracking-widest"
      >
        <span>Provider</span>
        <span>Vehicle</span>
        <span class="text-right">Dist.</span>
      </div>

      <!-- Rows -->
      <div
        v-for="(b, i) in bikes"
        :key="`${b.provider}-${b.bike_id}`"
        class="grid grid-cols-[80px_1fr_100px] gap-2 items-center px-4 py-2 border-b border-amber-950/40"
        :class="i % 2 === 0 ? 'bg-black' : 'bg-amber-950/10'"
      >
        <!-- Provider pill -->
        <span
          class="text-sm font-bold uppercase tracking-wide led-glow"
          :class="b.provider === 'lime' ? 'text-lime-brand' : 'text-voi-brand'"
        >
          {{ b.provider }}
        </span>

        <!-- Vehicle ID -->
        <span
          class="text-amber-400 text-sm tracking-wider led-glow-amber truncate"
        >
          {{ b.bike_id }}
        </span>

        <!-- Distance -->
        <span
          class="text-right text-amber-300 text-sm font-bold tracking-wide led-glow-amber"
        >
          {{ formatDistance(b.distance) }}
        </span>
      </div>

      <!-- Empty state -->
      <div
        v-if="!bikes.length"
        class="text-center text-amber-600/50 text-sm py-8 tracking-widest uppercase"
      >
        No vehicles nearby
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bike } from '../composables/useBikes';

defineProps<{
  bikes: Bike[];
}>();

function formatDistance(m?: number) {
  if (m == null) return '---';
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(1)}km`;
}
</script>

<style scoped>
.led-glow {
  text-shadow:
    0 0 6px currentColor,
    0 0 12px currentColor;
}
.led-glow-amber {
  text-shadow:
    0 0 6px #f59e0b,
    0 0 12px #f59e0b44;
}
</style>
