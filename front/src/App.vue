<template>
  <div class="relative w-screen h-screen overflow-hidden bg-black">
    <OnboardingScreen v-if="!store.hasActiveProfile || !store.hasPosition" />

    <template v-else>
      <BikeMap
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
      <div class="fixed top-4 left-14 z-1000 flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-3 py-2 rounded-md text-xs font-mono tracking-wider shadow-lg backdrop-blur transition-colors border"
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
        class="w-16 fixed top-4 right-4 z-1000 flex justify-center items-center gap-2 bg-black/80 backdrop-blur text-led text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-led/20"
      >
        <SpinnerIcon v-if="loading" size="sm" />
        <span v-if="!loading">↻ {{ nextRefresh }}s</span>
      </div>

      <!-- Error toast -->
      <div
        v-if="error"
        class="fixed top-16 right-4 z-1000 bg-red-900 backdrop-blur text-red-400 text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-red-800 max-w-xs"
      >
        {{ error }}
      </div>
    </template>

    <!-- Backdrop loader -->
    <Transition name="fade">
      <div
        v-if="loading"
        class="fixed inset-0 z-900 bg-black/50 backdrop-blur-sm flex items-center justify-center pointer-events-none"
      >
        <div class="flex flex-col items-center gap-3">
          <SpinnerIcon size="lg" />
          <span
            class="text-led text-xs font-mono uppercase tracking-widest glow-sm"
            >Loading…</span
          >
        </div>
      </div>
    </Transition>

    <!-- Settings -->
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
import SpinnerIcon from './components/SpinnerIcon.vue';
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

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
