<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <div class="p-8 max-w-6xl mx-auto w-full flex flex-col flex-1">
      <header class="bg-white p-6 rounded-lg shadow-md border mb-6">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-800">
            Vélos &amp; trottinettes près de toi
          </h1>

          <div class="text-right">
            <p class="text-sm text-gray-600">
              Prochaine mise à jour dans :
              <strong class="font-mono">{{ nextRefresh }}s</strong>
            </p>
          </div>
        </div>

        <p class="text-sm text-gray-600 mt-2">
          Position utilisée : <strong>{{ USER_LAT }}, {{ USER_LNG }}</strong>
        </p>

        <!-- Tabs -->
        <div class="flex gap-2 mt-4">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            :class="
              activeTab === tab.key
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
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

      <!-- MAP VIEW -->
      <div
        v-if="!loading && !error && activeTab === 'map'"
        class="flex-1 min-h-[75vh] border rounded shadow overflow-hidden"
      >
        <BikeMap :bikes="bikes" :user-lat="USER_LAT" :user-lng="USER_LNG" />
      </div>

      <!-- LIST VIEW -->
      <BikeList
        v-if="!loading && !error && activeTab === 'list'"
        :bikes="bikes"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useBikes } from './composables/useBikes';
import BikeMap from './components/BikeMap.vue';
import BikeList from './components/BikeList.vue';

const USER_LAT = 48.894444;
const USER_LNG = 2.375194;

type Tab = 'list' | 'map';
const tabs: { key: Tab; label: string }[] = [
  { key: 'map', label: 'Carte' },
  { key: 'list', label: 'Liste' },
];
const activeTab = ref<Tab>('map');

const { bikes, loading, error, nextRefresh } = useBikes({
  providers: ['lime', 'voi'],
  pollInterval: 60000,
  proxyBase: import.meta.env.VITE_BACK_URL || 'http://localhost:13001',
  limit: 20,
});
</script>
