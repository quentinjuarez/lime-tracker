<template>
  <div
    class="flex flex-col items-center justify-center h-full gap-6 text-led font-mono px-6"
  >
    <h1 class="text-2xl font-bold uppercase tracking-widest glow-sm">
      Bike Tracker
    </h1>
    <p class="text-led text-sm text-center max-w-sm">
      Find Lime, Voi or Dott vehicles near you.
    </p>

    <div class="w-full max-w-sm">
      <LocationPicker :is-onboarding="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import LocationPicker from './LocationPicker.vue';
</script>
