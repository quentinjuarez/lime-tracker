<template>
  <div
    class="flex flex-col items-center justify-center h-full gap-8 text-led font-mono px-6"
  >
    <h1 class="text-2xl font-bold uppercase tracking-widest led-glow">
      Bike Tracker
    </h1>
    <p class="text-led/60 text-sm text-center max-w-sm">
      Find Lime &amp; Voi e-scooters and e-bikes near you.<br />
      Create a profile to get started.
    </p>

    <!-- Profile name input -->
    <div class="w-full max-w-xs space-y-4">
      <input
        v-model.trim="profileName"
        type="text"
        placeholder="Profile name"
        maxlength="30"
        class="w-full bg-black border border-led/30 text-led text-sm font-mono px-4 py-2 rounded-lg focus:border-led/60 focus:outline-none placeholder:text-led/30"
        @keydown.enter="createWithGeolocation"
      />

      <!-- Location options -->
      <div class="space-y-3">
        <button
          :disabled="!profileName || geoLoading"
          class="w-full py-3 px-4 rounded-lg text-sm uppercase tracking-wider border border-led/40 text-led hover:bg-led/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          @click="createWithGeolocation"
        >
          <svg
            v-if="geoLoading"
            class="animate-spin h-4 w-4"
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
          📍 Use my location
        </button>

        <div
          class="text-led/40 text-[11px] text-center uppercase tracking-widest"
        >
          or enter coordinates
        </div>

        <div class="flex gap-2">
          <input
            v-model="manualLat"
            type="number"
            step="any"
            placeholder="Latitude"
            class="flex-1 bg-black border border-led/30 text-led text-sm font-mono px-3 py-2 rounded-lg focus:border-led/60 focus:outline-none placeholder:text-led/30"
          />
          <input
            v-model="manualLng"
            type="number"
            step="any"
            placeholder="Longitude"
            class="flex-1 bg-black border border-led/30 text-led text-sm font-mono px-3 py-2 rounded-lg focus:border-led/60 focus:outline-none placeholder:text-led/30"
          />
        </div>

        <button
          :disabled="!profileName || !isValidCoords"
          class="w-full py-3 px-4 rounded-lg text-sm uppercase tracking-wider border border-led/40 text-led hover:bg-led/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="createWithCoords"
        >
          🗺️ Use coordinates
        </button>
      </div>

      <!-- Errors -->
      <div v-if="geoError" class="text-red-400 text-xs text-center">
        {{ geoError }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';

const store = useProfileStore();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();

const profileName = ref('');
const manualLat = ref<number | null>(null);
const manualLng = ref<number | null>(null);

const isValidCoords = computed(() => {
  if (manualLat.value == null || manualLng.value == null) return false;
  const lat = Number(manualLat.value);
  const lng = Number(manualLng.value);
  return (
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
});

function createWithGeolocation() {
  if (!profileName.value) return;
  store.createProfile(profileName.value);
  locate();
}

function createWithCoords() {
  if (!profileName.value || !isValidCoords.value) return;
  store.createProfile(profileName.value);
  store.setPosition(Number(manualLat.value), Number(manualLng.value));
}
</script>

<style scoped>
.led-glow {
  text-shadow:
    0 0 6px currentColor,
    0 0 12px currentColor;
}

/* Remove number input arrows */
input[type='number']::-webkit-inner-spin-button,
input[type='number']::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
