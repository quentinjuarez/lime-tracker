<template>
  <div class="overflow-auto max-h-[75vh] border rounded shadow">
    <table class="min-w-full bg-white">
      <thead class="bg-gray-100 sticky top-0 border-b">
        <tr>
          <th class="text-left px-3 py-2">Provider</th>
          <th class="text-left px-3 py-2">ID</th>
          <th class="text-left px-3 py-2">Distance</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="b in bikes"
          :key="`${b.provider}-${b.bike_id}`"
          class="border-b hover:bg-gray-50"
        >
          <td class="px-3 py-2 text-sm">
            <span
              class="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
              :class="providerColor(b.provider)"
            >
              {{ b.provider }}
            </span>
          </td>
          <td class="px-3 py-2 text-sm">{{ b.bike_id }}</td>
          <td class="px-3 py-2 text-sm font-semibold">
            {{ formatDistance(b.distance) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import type { Bike, Provider } from '../composables/useBikes';

defineProps<{
  bikes: Bike[];
}>();

function formatDistance(m?: number) {
  if (m == null) return '-';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}

function providerColor(provider: Provider) {
  return {
    lime: 'bg-green-500',
    voi: 'bg-pink-500',
  }[provider];
}
</script>
