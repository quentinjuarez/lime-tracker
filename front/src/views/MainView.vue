<template>
  <div class="relative w-dvw h-dvh overflow-hidden bg-black">
    <!-- Onboarding: no position yet (and geo is loading) -->
    <OnboardingScreen v-if="!store.hasPosition && !geoLoading" />

    <!-- Map (show behind loading spinner if geo is in progress on first load) -->
    <template v-if="store.hasPosition || geoLoading">
      <Transition name="fade">
        <div
          v-if="loading"
          class="fixed inset-0 z-900 bg-black/0 backdrop-blur-sm flex items-center justify-center pointer-events-none"
        >
          <SpinnerIcon size="lg" />
        </div>
      </Transition>

      <BikeMap
        v-if="store.hasPosition"
        :bikes="bikes"
        :user-lat="store.lat!"
        :user-lng="store.lng!"
      />

      <!-- Initial geo loading screen -->
      <div
        v-if="geoLoading && !store.hasPosition"
        class="flex items-center justify-center h-full gap-3 text-led font-mono text-sm"
      >
        <SpinnerIcon size="lg" />
        <span>{{ t('main.gettingLocation') }}</span>
      </div>

      <!-- Geo error on first load (no position yet) -->
      <div
        v-if="geoError && !store.hasPosition"
        class="flex flex-col items-center justify-center h-full gap-4 text-led font-mono px-6"
      >
        <p class="text-red-400 text-sm text-center">{{ geoError }}</p>
        <OnboardingScreen />
      </div>
    </template>

    <!-- HUD -->
    <template v-if="store.hasPosition">
      <div class="top-4 right-4 fixed z-1000 flex items-center gap-2 flex-none">
        <BaseButton @click="showList = true" variant="ghost" size="sm">
          {{ t('main.list') }}
        </BaseButton>
        <BaseButton @click="showSettings = true" variant="ghost" size="sm">
          {{ t('main.settings') }}
        </BaseButton>
        <div
          class="min-w-16 flex justify-center items-center backdrop-blur-sm bg-black/10 text-led text-xs font-mono px-3 py-1.5 rounded-lg border border-led/80"
        >
          <SpinnerIcon v-if="loading" size="sm" />
          <span v-if="!loading" class="flex-none">{{
            t('main.nextRefresh', { n: nextRefresh })
          }}</span>
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
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../stores/profile';
import { useBikes } from '../composables/useBikes';
import { useGeolocation } from '../composables/useGeolocation';
import { ALL_PROVIDERS, FILTER_BOUNDS, UNSET } from '../types';
import { applyQueryParams } from '../composables/useQueryParams';
import OnboardingScreen from '../components/OnboardingScreen.vue';
import BikeMap from '../components/BikeMap.vue';
import BikeList from '../components/BikeList.vue';
import SpinnerIcon from '../components/SpinnerIcon.vue';
import SettingsPanel from '../components/SettingsPanel.vue';
import BaseButton from '../components/BaseButton.vue';

const store = useProfileStore();
const { t } = useI18n();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();

const showList = ref(false);
const showSettings = ref(false);

onMounted(() => {
  // Query params take priority (shared link / embed-like usage on main view)
  const hadQueryParams = applyQueryParams(window.location.search);

  // Auto-refresh geo only if the user has already set a position in geo mode
  // (i.e. they did onboarding before). Don't trigger on first visit.
  if (!hadQueryParams && store.locationMode === 'geo' && store.hasPosition) {
    locate();
  }
});

// Keep URL in sync with the store
watch(
  () =>
    store.hasPosition
      ? {
          lat: store.lat,
          lng: store.lng,
          providers: store.providers.join(','),
          limit: store.limit,
          maxDistance: store.maxDistance,
          minBattery: store.minBattery,
        }
      : null,
  (state) => {
    if (!state) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }
    const params = new URLSearchParams();
    params.set('lat', state.lat!.toString());
    params.set('lng', state.lng!.toString());
    if (state.providers !== ALL_PROVIDERS.join(','))
      params.set('providers', state.providers);
    if (state.limit !== FILTER_BOUNDS.limit.default)
      params.set('limit', state.limit.toString());
    if (state.maxDistance !== FILTER_BOUNDS.maxDistance.default)
      params.set(
        'maxDist',
        (state.maxDistance === UNSET ? 0 : state.maxDistance).toString(),
      );
    if (state.minBattery !== FILTER_BOUNDS.minBattery.default)
      params.set(
        'minBat',
        (state.minBattery === UNSET ? 0 : state.minBattery).toString(),
      );
    window.history.replaceState(
      {},
      '',
      `${window.location.pathname}?${params.toString()}`,
    );
  },
);

const { bikes, loading, error, nextRefresh } = useBikes({
  proxyBase: import.meta.env.VITE_BACK_URL || 'http://localhost:13001',
});
</script>
