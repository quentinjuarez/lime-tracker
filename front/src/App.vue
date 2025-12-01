<template>
  <div class="bg-gray-50 min-h-screen">
    <div class="p-8 max-w-6xl mx-auto">
      <header class="bg-white p-6 rounded-lg shadow-md border mb-8">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-800">
            Vélos Lime près de toi
          </h1>

          <button
            @click="refresh()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Rafraîchir
          </button>
        </div>

        <p class="text-sm text-gray-600 mt-2">
          Position utilisée : <strong>{{ USER_LAT }}, {{ USER_LNG }}</strong>
        </p>
      </header>

      <div
        v-if="loading"
        class="flex items-center justify-center p-8 bg-gray-100 rounded-lg"
      >
        <svg
          class="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span class="ml-4 text-gray-600">Chargement…</span>
      </div>

      <div
        v-if="error"
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
        role="alert"
      >
        <strong class="font-bold">Erreur :</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <div
        v-if="!loading && !error"
        class="overflow-auto max-h-[75vh] border rounded shadow"
      >
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
