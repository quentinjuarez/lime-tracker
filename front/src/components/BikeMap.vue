<template>
  <div class="w-full relative" style="height: 100vh">
    <l-map
      v-if="ready"
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      style="width: 100%; height: 100%"
    >
      <l-tile-layer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
        layer-type="base"
      />

      <!-- User -->
      <l-circle-marker
        :lat-lng="[userLat, userLng]"
        :radius="10"
        color="#3b82f6"
        :fill="true"
        fill-color="#3b82f6"
        :fill-opacity="0.9"
      >
        <l-tooltip :options="{ permanent: false }">Me</l-tooltip>
      </l-circle-marker>

      <!-- Bikes -->
      <l-circle-marker
        v-for="bike in bikes"
        :key="`${bike.provider}-${bike.bike_id}`"
        :lat-lng="[bike.lat, bike.lon]"
        :radius="7"
        :color="markerColor(bike.provider)"
        :fill="true"
        :fill-color="markerColor(bike.provider)"
        :fill-opacity="0.85"
      >
        <l-tooltip
          :options="{ permanent: false, sticky: true, interactive: false }"
        >
          <div class="text-xs">
            <strong class="uppercase">{{ bike.provider }}</strong>
            <br />
            {{ bike.bike_id }}<br />
            {{ formatDistance(bike.distance) }}
            <template v-if="bike.battery_percent != null">
              {{ bike.battery_percent }}%
            </template>
          </div>
        </l-tooltip>
      </l-circle-marker>
    </l-map>

    <!-- Legend overlay -->
    <div
      class="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-2 rounded-lg z-1000 space-y-1"
    >
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
        Me
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full inline-block bg-lime-brand"></span>
        Lime
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full inline-block bg-voi-brand"></span>
        Voi
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LTooltip,
} from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Bike, Provider } from '../composables/useBikes';

const props = defineProps<{
  bikes: Bike[];
  userLat: number;
  userLng: number;
}>();

const ready = ref(false);

onMounted(() => {
  nextTick(() => {
    ready.value = true;
  });
});

const zoom = 17;
const center = computed<[number, number]>(() => [props.userLat, props.userLng]);

// Leaflet needs raw hex values
const PROVIDER_HEX: Record<Provider, string> = {
  lime: '#00de00',
  voi: '#f44336',
};

function markerColor(provider: Provider): string {
  return PROVIDER_HEX[provider];
}

function formatDistance(m?: number) {
  if (m == null) return '-';
  if (m < 1000) return `${Math.round(m)}m`;
  return `${(m / 1000).toFixed(2)}km`;
}
</script>

<style scoped>
/* Leaflet zoom controls */
:deep(.leaflet-control-zoom) {
  border: 1px solid color-mix(in srgb, var(--color-led) 30%, transparent) !important;
  border-radius: 8px !important;
  overflow: hidden;
  background: transparent !important;
}

:deep(.leaflet-control-zoom a) {
  background: rgba(0, 0, 0, 0.8) !important;
  color: var(--color-led) !important;
  border-color: color-mix(
    in srgb,
    var(--color-led) 20%,
    transparent
  ) !important;
  font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace !important;
  font-size: 16px !important;
  width: 32px !important;
  height: 32px !important;
  line-height: 32px !important;
  backdrop-filter: blur(8px);
  transition:
    background 0.15s,
    color 0.15s;
}

:deep(.leaflet-control-zoom a:hover) {
  background: color-mix(in srgb, var(--color-led) 15%, transparent) !important;
  color: color-mix(in srgb, var(--color-led) 85%, white) !important;
}

:deep(.leaflet-control-zoom a.leaflet-disabled) {
  background: rgba(0, 0, 0, 0.6) !important;
  color: color-mix(in srgb, var(--color-led) 30%, transparent) !important;
}

/* Attribution */
:deep(.leaflet-control-attribution) {
  background: rgba(0, 0, 0, 0.7) !important;
  color: color-mix(in srgb, var(--color-led) 50%, transparent) !important;
  font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace !important;
  font-size: 9px !important;
  padding: 2px 8px !important;
  border-radius: 4px 0 0 0 !important;
  backdrop-filter: blur(8px);
}

:deep(.leaflet-control-attribution a) {
  display: none !important;
}

:deep(.leaflet-control-attribution span) {
  display: none !important;
}

:deep(.leaflet-control-attribution a:hover) {
  color: var(--color-led) !important;
}

/* Tooltip */
:deep(.leaflet-tooltip) {
  background: rgba(0, 0, 0, 0.85) !important;
  border: 1px solid color-mix(in srgb, var(--color-led) 30%, transparent) !important;
  color: var(--color-led) !important;
  font-family: 'SF Mono', 'Fira Code', 'Menlo', monospace !important;
  font-size: 11px !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
}

:deep(.leaflet-tooltip-top::before) {
  border-top-color: rgba(0, 0, 0, 0.85) !important;
}
:deep(.leaflet-tooltip-bottom::before) {
  border-bottom-color: rgba(0, 0, 0, 0.85) !important;
}
:deep(.leaflet-tooltip-left::before) {
  border-left-color: rgba(0, 0, 0, 0.85) !important;
}
:deep(.leaflet-tooltip-right::before) {
  border-right-color: rgba(0, 0, 0, 0.85) !important;
}
</style>
