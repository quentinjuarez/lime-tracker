<template>
  <div class="relative w-dvw h-dvh overflow-hidden bg-black">
    <OnboardingScreen v-if="!store.hasActiveProfile || !store.hasPosition" />

    <template v-else>
      <Transition name="fade">
        <div
          v-if="loading"
          class="fixed inset-0 z-900 bg-black/0 backdrop-blur-sm flex items-center justify-center pointer-events-none"
        >
          <SpinnerIcon size="lg" />
        </div>
      </Transition>

      <BikeMap
        :bikes="bikes"
        :user-lat="store.activeProfile!.lat!"
        :user-lng="store.activeProfile!.lng!"
      />
    </template>

    <!-- HUD -->
    <template v-if="store.hasActiveProfile && store.hasPosition">
      <div class="top-4 right-4 fixed z-1000 flex items-center gap-2 flex-none">
        <BaseButton @click="showList = true" variant="ghost" size="sm">
          List
        </BaseButton>

        <BaseButton @click="showSettings = true" variant="ghost" size="sm">
          Settings
        </BaseButton>

        <!-- Refresh badge – top right -->
        <div
          class="w-16 flex justify-center items-center bg-black/10 text-led text-xs font-mono px-3 py-1.5 rounded-lg border border-led/80"
        >
          <SpinnerIcon v-if="loading" size="sm" />
          <span v-if="!loading">↻ {{ nextRefresh }}s</span>
        </div>
      </div>

      <!-- Error toast -->
      <div
        v-if="error"
        class="fixed top-16 right-4 z-1000 bg-red-900 text-red-400 text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-red-800 max-w-xs"
      >
        {{ error }}
      </div>
    </template>

    <!-- Settings -->
    <SettingsPanel :open="showSettings" @close="showSettings = false" />
    <!-- Bike list -->
    <BikeList :open="showList" :bikes="bikes" @close="showList = false" />
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
import BaseButton from './components/BaseButton.vue';

const store = useProfileStore();

const showList = ref(false);
const showSettings = ref(false);

const { bikes, loading, error, nextRefresh } = useBikes({
  proxyBase: import.meta.env.VITE_BACK_URL || 'http://localhost:13001',
});
</script>
