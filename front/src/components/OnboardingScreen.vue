<template>
  <div
    class="flex flex-col items-center justify-center h-full gap-6 text-led font-mono px-6"
  >
    <h1 class="text-2xl font-bold uppercase tracking-widest glow-sm">
      Bike Tracker
    </h1>
    <p class="text-led text-sm text-center max-w-sm">
      Find Lime &amp; Voi vehicles near you.
    </p>

    <!-- ── Step 1: choose mode ──────────────────────────────────────── -->
    <template v-if="!chosenMode">
      <div class="w-full max-w-xs space-y-3">
        <BaseButton
          class="w-full flex items-center justify-center gap-2"
          @click="chooseGeo"
        >
          Use my GPS location
        </BaseButton>

        <div class="text-led text-[11px] text-center uppercase tracking-widest">
          or
        </div>

        <BaseButton
          class="w-full flex items-center justify-center gap-2"
          @click="chosenMode = 'custom'"
        >
          Enter a location
        </BaseButton>
      </div>
    </template>

    <!-- ── Step 2a: GPS loading ─────────────────────────────────────── -->
    <template v-else-if="chosenMode === 'geolocation'">
      <div class="flex flex-col items-center gap-4 w-full max-w-xs">
        <SpinnerIcon v-if="geoLoading" />
        <span v-if="geoLoading" class="text-sm tracking-wider uppercase">
          Locating...
        </span>

        <div v-if="geoError" class="text-red-400 text-xs text-center">
          {{ geoError }}
        </div>

        <BaseButton size="sm" @click="chosenMode = null">← Back</BaseButton>
      </div>
    </template>

    <!-- custom input -->
    <template v-else-if="chosenMode === 'custom'">
      <div class="w-full max-w-sm space-y-4">
        <!-- GPS option -->
        <BaseButton
          class="w-full flex items-center justify-center gap-2"
          :disabled="geoLoading"
          @click="useGpsForCustom"
        >
          <SpinnerIcon v-if="geoLoading" size="sm" />
          📍 {{ geoLoading ? 'Locating…' : 'Use my GPS location' }}
        </BaseButton>
        <div v-if="geoError" class="text-xs text-red-400">{{ geoError }}</div>

        <div
          class="text-led/60 text-[11px] text-center uppercase tracking-widest"
        >
          or enter manually
        </div>
        <BaseInput
          v-model="locationRaw"
          type="text"
          placeholder="Paste coordinates or Google Maps link…"
          class="w-full"
          @keydown.enter="submitCustom"
        />

        <div v-if="locationRaw && parsed" class="text-xs text-green-400">
          ✓ {{ parsed.lat.toFixed(5) }}, {{ parsed.lng.toFixed(5) }}
        </div>
        <div v-else-if="locationRaw && !parsed" class="text-xs text-red-400">
          Could not parse location
        </div>

        <BaseButton class="w-full" :disabled="!parsed" @click="submitCustom">
          Confirm location
        </BaseButton>

        <details class="text-led/80 text-[11px]">
          <summary
            class="cursor-pointer hover:text-led transition-colors tracking-widest"
          >
            Supported formats
          </summary>
          <ul class="mt-2 space-y-1 text-led/80 font-mono">
            <li v-for="f in LOCATION_FORMATS" :key="f">{{ f }}</li>
          </ul>
        </details>

        <BaseButton
          variant="ghost"
          size="sm"
          class="p-0 text-[11px]"
          @click="
            chosenMode = null;
            locationRaw = '';
          "
        >
          ← Back
        </BaseButton>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import SpinnerIcon from './SpinnerIcon.vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';
import { parseLocation, LOCATION_FORMATS } from '../utils/parseLocation';
import type { ProfileMode } from '../types';

const store = useProfileStore();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();

const chosenMode = ref<ProfileMode | null>(null);
const locationRaw = ref('');

const parsed = computed(() => parseLocation(locationRaw.value));

function chooseGeo() {
  chosenMode.value = 'geolocation';
  store.ensureProfile('geolocation');
  locate();
}

function useGpsForCustom() {
  store.ensureProfile('custom');
  locate();
}

function submitCustom() {
  if (!parsed.value) return;
  store.ensureProfile('custom');
  store.setPosition(parsed.value.lat, parsed.value.lng);
}
</script>
