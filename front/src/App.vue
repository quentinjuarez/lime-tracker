<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">
    <!-- Waiting for position -->
    <div
      v-if="!store.hasPosition"
      class="flex flex-col items-center justify-center h-full gap-4 text-led font-mono"
    >
      <svg
        class="animate-spin h-8 w-8 text-led"
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
      <span class="text-sm tracking-wider uppercase">Locating you…</span>
      <span v-if="geoError" class="text-red-400 text-xs max-w-xs text-center">
        {{ geoError }}
      </span>
    </div>

    <template v-else>
      <BikeMap
        v-show="activeTab === 'map'"
        :bikes="bikes"
        :user-lat="store.lat!"
        :user-lng="store.lng!"
      />

      <div
        v-if="activeTab === 'list'"
        class="w-full h-full overflow-auto bg-black pt-16 px-6 pb-6"
      >
        <BikeList :bikes="bikes" />
      </div>
    </template>

    <!-- Tabs – top left -->
    <div class="fixed top-4 left-16 z-1000 flex gap-2">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="px-4 py-2 rounded-md text-xs font-mono uppercase tracking-wider shadow-lg backdrop-blur transition-colors border"
        :class="
          activeTab === tab.key
            ? 'bg-led/20 text-led border-led/50'
            : 'bg-black/70 text-led/60 border-led/20 hover:bg-led/10 hover:text-led'
        "
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Settings button -->
    <button
      class="fixed top-4 right-44 z-1000 bg-black/80 backdrop-blur text-led text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-led/20 hover:bg-led/10 transition-colors"
      @click="showSettings = true"
    >
      ⚙ Settings
    </button>

    <!-- Refresh badge – top right -->
    <div
      class="fixed top-4 right-8 z-1000 flex items-center gap-2 bg-black/80 backdrop-blur text-led text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-led/20"
    >
      <svg
        v-if="loading"
        class="animate-spin h-4 w-4 text-led"
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
      <span v-if="loading">Loading…</span>
      <span v-else>↻ {{ nextRefresh }}s</span>
    </div>

    <!-- Error toast -->
    <div
      v-if="error"
      class="fixed top-16 right-8 z-1000 bg-red-900/80 backdrop-blur text-red-400 text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-red-800/50 max-w-xs"
    >
      {{ error }}
    </div>

    <!-- Settings panel -->
    <SettingsPanel
      :open="showSettings"
      :geo-error="geoError"
      @close="showSettings = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProfileStore } from './stores/profile';
import { useGeolocation } from './composables/useGeolocation';
import { useBikes } from './composables/useBikes';
import BikeMap from './components/BikeMap.vue';
import BikeList from './components/BikeList.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const store = useProfileStore();
const { error: geoError } = useGeolocation();

type Tab = 'list' | 'map';
const tabs: { key: Tab; label: string }[] = [
  { key: 'map', label: 'Map' },
  { key: 'list', label: 'Info' },
];
const activeTab = ref<Tab>('map');
const showSettings = ref(false);

const { bikes, loading, error, nextRefresh } = useBikes({
  proxyBase: import.meta.env.VITE_BACK_URL || 'http://localhost:13001',
});
</script>
