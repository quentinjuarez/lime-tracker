<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">
    <OnboardingScreen v-if="!store.hasActiveProfile || !store.hasPosition" />

    <template v-else>
      <BikeMap
        v-show="activeTab === 'map'"
        :bikes="bikes"
        :user-lat="store.activeProfile!.lat!"
        :user-lng="store.activeProfile!.lng!"
      />

      <div
        v-if="activeTab === 'list'"
        class="w-full h-full overflow-auto bg-black pt-16 px-6 pb-6"
      >
        <BikeList :bikes="bikes" />
      </div>
    </template>

    <!-- HUD -->
    <template v-if="store.hasActiveProfile && store.hasPosition">
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

      <!-- Refresh badge – top right -->
      <div
        class="fixed top-4 right-4 z-1000 flex items-center gap-2 bg-black/80 backdrop-blur text-led text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-led/20"
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
        <span v-if="loading">...</span>
        <span v-else>↻ {{ nextRefresh }}s</span>
      </div>

      <!-- Error toast -->
      <div
        v-if="error"
        class="fixed top-16 right-8 z-1000 bg-red-400/80 backdrop-blur text-red-400 text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-red-400/60 max-w-xs"
      >
        {{ error }}
      </div>
    </template>

    <!-- Settings button (always visible once a profile exists) -->
    <button
      v-if="store.hasActiveProfile"
      class="fixed top-4 right-22 z-1000 bg-black/80 backdrop-blur text-led text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-led/20 hover:bg-led/10 transition-colors"
      @click="showSettings = true"
    >
      Settings
    </button>

    <SettingsPanel :open="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProfileStore } from './stores/profile';
import { useBikes } from './composables/useBikes';
import OnboardingScreen from './components/OnboardingScreen.vue';
import BikeMap from './components/BikeMap.vue';
import BikeList from './components/BikeList.vue';
import SettingsPanel from './components/SettingsPanel.vue';

const store = useProfileStore();

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
