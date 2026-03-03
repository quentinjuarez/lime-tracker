<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/10 backdrop-blur-sm z-2000"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 max-h-[85dvh] rounded-t-2xl border-t border-led/20 bg-black/95 z-2001 overflow-y-auto font-mono text-led md:bottom-auto md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 md:h-auto md:max-h-[80dvh] md:w-[640px] md:rounded-2xl md:border"
      >
        <div class="p-6 space-y-4">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold uppercase tracking-widest glow-sm">
              Vehicles
              <span class="text-led/60 text-sm font-normal ml-2">
                {{ bikes.length }}
              </span>
            </h2>
            <BaseButton
              variant="ghost"
              size="sm"
              class="px-2!"
              @click="emit('close')"
            >
              ✕
            </BaseButton>
          </div>

          <!-- Header row -->
          <div
            class="grid grid-cols-[80px_1fr_60px_100px] gap-2 px-4 py-2 border-b border-led/30 text-led/80 text-[11px] uppercase tracking-widest"
          >
            <span class="glow-sm">Provider</span>
            <span class="glow-sm">Vehicle</span>
            <span class="text-right glow-sm">Batt.</span>
            <span class="text-right glow-sm">Dist.</span>
          </div>

          <!-- Rows -->
          <div
            v-for="(b, i) in bikes"
            :key="`${b.provider}-${b.bike_id}`"
            class="grid grid-cols-[80px_1fr_60px_100px] gap-2 items-center px-4 py-2 border-b border-led/30"
            :class="i % 2 === 0 ? 'bg-black' : 'bg-led/0'"
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
            <span
              class="text-right text-led text-sm font-bold tracking-wide glow"
            >
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
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Bike } from '../composables/useBikes';
import BaseButton from './BaseButton.vue';

defineProps<{
  open: boolean;
  bikes: Bike[];
}>();

const emit = defineEmits<{ close: [] }>();

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
