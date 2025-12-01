<template>
  <div class="p-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Vélos Lime près de toi</h1>

      <button
        @click="refresh()"
        class="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
      >
        Rafraîchir
      </button>
    </div>

    <p class="text-sm text-gray-600 mb-4">
      Position utilisée : <strong>{{ USER_LAT }}, {{ USER_LNG }}</strong>
    </p>

    <div v-if="loading" class="text-gray-500 mb-3">Chargement…</div>

    <div v-if="error" class="text-red-600 mb-3">Erreur : {{ error }}</div>

    <div class="overflow-auto max-h-[75vh] border rounded shadow">
      <table class="min-w-full bg-white">
        <thead class="bg-gray-100 sticky top-0 border-b">
          <tr>
            <th class="text-left px-3 py-2">ID</th>
            <th class="text-left px-3 py-2">Lat</th>
            <th class="text-left px-3 py-2">Lon</th>
            <th class="text-left px-3 py-2">Distance</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="b in bikes"
            :key="b.bike_id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-3 py-2 text-sm">{{ b.bike_id }}</td>
            <td class="px-3 py-2 text-sm">{{ b.lat.toFixed(6) }}</td>
            <td class="px-3 py-2 text-sm">{{ b.lon.toFixed(6) }}</td>
            <td class="px-3 py-2 text-sm font-semibold">
              {{ formatDistance(b.distance) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLimeBikes } from './composables/useLimeBikes';

const USER_LAT = 48.8811315;
const USER_LNG = 2.3886633;

const { bikes, loading, error, refresh } = useLimeBikes({
  pollInterval: 15000,
  proxyBase: 'http://localhost:13001',
});

function formatDistance(m?: number) {
  if (m == null) return '-';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}
</script>
