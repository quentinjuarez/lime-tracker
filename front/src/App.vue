<template>
  <div class="relative w-screen h-screen overflow-hidden">
    <BikeMap
      v-show="activeTab === 'map'"
      :bikes="bikes"
      :user-lat="USER_LAT"
      :user-lng="USER_LNG"
    />

    <div
      v-if="activeTab === 'list'"
      class="w-full h-full overflow-auto bg-gray-50 pt-16 px-6 pb-6"
    >
      <BikeList :bikes="bikes" />
    </div>

    <!-- Tabs – top left -->
    <div class="fixed top-4 left-16 z-1000 flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 rounded-md text-sm font-medium shadow-lg backdrop-blur transition-colors"
        :class="
          activeTab === tab.key
            ? 'bg-gray-900 text-white'
            : 'bg-white/80 text-gray-700 hover:bg-white'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Refresh badge – top right -->
    <div
      class="fixed top-4 right-8 z-1000 flex items-center gap-2 bg-black/70 backdrop-blur text-white text-xs font-mono px-3 py-2 rounded-lg shadow-lg"
    >
      <svg
        v-if="loading"
        class="animate-spin h-4 w-4 text-blue-400"
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
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span v-if="loading">Chargement…</span>
      <span v-else>↻ {{ nextRefresh }}s</span>
    </div>

    <!-- Error toast -->
    <div
      v-if="error"
      class="fixed top-16 right-8 z-1000 bg-red-600/90 backdrop-blur text-white text-xs px-3 py-2 rounded-lg shadow-lg max-w-xs"
    >
      {{ error }}
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
