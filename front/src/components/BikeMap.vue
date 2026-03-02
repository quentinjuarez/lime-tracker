<template>
  <div class="w-full h-full relative">
    <l-map
      ref="map"
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
      class="w-full h-full rounded-lg z-0"
    >
      <l-tile-layer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
        layer-type="base"
      />

      <!-- User position (blue) -->
      <l-circle-marker
        :lat-lng="[userLat, userLng]"
        :radius="10"
        color="#3b82f6"
        :fill="true"
        fill-color="#3b82f6"
        :fill-opacity="0.9"
      >
        <l-tooltip :options="{ permanent: false }">Ma position</l-tooltip>
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
        <l-tooltip>
          <div class="text-xs">
            <strong class="uppercase">{{ bike.provider }}</strong
            ><br />
            {{ bike.bike_id }}<br />
            {{ formatDistance(bike.distance) }}
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
        Ma position
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full inline-block"
          style="background: #00de00"
        ></span>
        Lime
      </div>
      <div class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-full inline-block"
          style="background: #f44336"
        ></span>
        Voi
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
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

const zoom = 15;
const center = computed<[number, number]>(() => [props.userLat, props.userLng]);

function markerColor(provider: Provider): string {
  return provider === 'lime' ? '#00de00' : '#f44336';
}

function formatDistance(m?: number) {
  if (m == null) return '-';
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}
</script>
