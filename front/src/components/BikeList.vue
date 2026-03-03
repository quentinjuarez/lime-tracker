<template>
  <div class="h-full w-full overflow-auto font-mono">
    <!-- Board frame -->
    <div class="mx-auto max-w-3xl p-4">
      <!-- Header row -->
      <div
        class="grid grid-cols-[80px_1fr_60px_100px] gap-2 px-4 py-2 border-b border-led/30 text-led/70 text-[11px] uppercase tracking-widest glow"
      >
        <span>Provider</span>
        <span>Vehicle</span>
        <span class="text-right">Batt.</span>
        <span class="text-right">Dist.</span>
      </div>

      <!-- Rows -->
      <div
        v-for="(b, i) in bikes"
        :key="`${b.provider}-${b.bike_id}`"
        class="grid grid-cols-[80px_1fr_60px_100px] gap-2 items-center px-4 py-2 border-b border-led/15"
        :class="i % 2 === 0 ? 'bg-black' : 'bg-led/5'"
      >
        <!-- Provider pill -->
        <span
          class="text-sm font-bold uppercase tracking-wide glow"
          :class="{
            'text-lime-brand': b.provider === 'lime',
            'text-voi-brand': b.provider === 'voi',
            'text-dott-brand': b.provider === 'dott',
          }"
        >
          {{ b.provider }}
        </span>

        <!-- Vehicle ID -->
        <span class="text-led text-sm tracking-wider glow truncate">
          {{ b.bike_id }}
        </span>

        <!-- Battery -->
        <span
          class="text-right text-sm font-bold tracking-wide glow"
          :class="batteryColor(b.battery_percent)"
        >
          {{ b.battery_percent != null ? `${b.battery_percent}%` : '---' }}
        </span>

        <!-- Distance -->
        <span class="text-right text-led text-sm font-bold tracking-wide glow">
          {{ formatDistance(b.distance) }}
        </span>
      </div>

      <!-- Empty state -->
      <div
        v-if="!bikes.length"
        class="text-center text-led/50 text-sm py-8 tracking-widest uppercase"
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

function batteryColor(pct?: number): string {
  if (pct == null) return 'text-led/40';
  if (pct >= 60) return 'text-green-400';
  if (pct >= 30) return 'text-yellow-400';
  return 'text-red-400';
}
</script>
