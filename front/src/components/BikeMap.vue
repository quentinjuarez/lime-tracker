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
        :key="tileUrl"
        :url="tileUrl"
        :attribution="tileAttribution"
        layer-type="base"
      />

      <!-- User -->
      <l-circle-marker
        :lat-lng="[userLat, userLng]"
        :radius="7"
        color="#ad46ff"
        :fill="true"
        fill-color="#ad46ff"
        :fill-opacity="0.333"
      >
        <l-tooltip :options="{ permanent: false }">{{
          t('bikeMap.me')
        }}</l-tooltip>
      </l-circle-marker>

      <!-- Bikes & Stations -->
      <l-marker
        v-for="entity in bikes"
        :key="
          entity.kind === 'bike'
            ? `${entity.provider}-${entity.bike_id}`
            : `${entity.provider}-${entity.station_id}`
        "
        :lat-lng="[entity.lat, entity.lon]"
        :icon="entity.kind === 'bike' ? bikeIcon(entity) : stationIcon(entity)"
      >
        <l-tooltip
          :options="{ permanent: false, sticky: true, interactive: false }"
        >
          <!-- Free-floating bike tooltip -->
          <div v-if="entity.kind === 'bike'" class="text-xs">
            <strong class="uppercase">{{ entity.provider }}</strong>
            <br />
            {{ formatDistance(entity.distance) }}<br />
            <template v-if="entity.battery_percent != null">
              {{ entity.battery_percent }}%
            </template>
          </div>
          <!-- Vélib station tooltip -->
          <div v-else class="text-xs">
            <strong class="uppercase">Vélib</strong>
            <br />
            <span v-if="entity.name">{{ entity.name }}<br /></span>
            🚲 {{ entity.num_bikes_available }}
            <span class="opacity-70">
              (⚙ {{ entity.mechanical }} · ⚡ {{ entity.ebike }}) </span
            ><br />
            🅿 {{ entity.num_docks_available }}<br />
            {{ formatDistance(entity.distance) }}
          </div>
        </l-tooltip>
      </l-marker>
    </l-map>

    <!-- Legend overlay -->
    <div
      class="absolute bottom-4 left-4 text-xs px-3 py-2 rounded-lg z-1000 space-y-1 border"
      :class="
        theme === 'light'
          ? 'bg-white/80 text-gray-800 border-gray-200'
          : 'bg-black/70 text-white border-transparent'
      "
    >
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-purple-500 inline-block"></span>
        {{ t('bikeMap.me') }}
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full inline-block bg-lime-brand"></span>
        Lime
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full inline-block bg-voi-brand"></span>
        Voi
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full inline-block bg-dott-brand"></span>
        Dott
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full inline-block bg-velib-brand"></span>
        Vélib
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import L from 'leaflet';
import {
  LMap,
  LTileLayer,
  LCircleMarker,
  LMarker,
  LTooltip,
} from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type {
  Bike,
  VelibStation,
  MapEntity,
  Provider,
} from '../composables/useBikes';
import { useTheme } from '../composables/useTheme';

const props = defineProps<{
  bikes: MapEntity[];
  userLat: number;
  userLng: number;
}>();

const { theme } = useTheme();
const { t } = useI18n();

const TILE_DARK =
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
const tileUrl = computed(() =>
  theme.value === 'light' ? TILE_LIGHT : TILE_DARK,
);
const tileAttribution = computed(() =>
  theme.value === 'light'
    ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
    : '&copy; OpenStreetMap &copy; CARTO',
);

const ready = ref(false);

onMounted(() => {
  nextTick(() => {
    ready.value = true;
  });
});

const zoom = 17;
const center = computed<[number, number]>(() => [props.userLat, props.userLng]);

// Leaflet needs raw hex values
// --color-lime-brand: #04dd01;
// --color-voi-brand: #f26a61;
// --color-dott-brand: #00a8e8;
// --color-velib-brand: #2584fd;
const PROVIDER_HEX: Record<Provider, string> = {
  lime: '#04dd01',
  voi: '#f26a61',
  dott: '#00a8e8',
  velib: '#2584fd',
};

function markerColor(provider: Provider): string {
  return PROVIDER_HEX[provider];
}

function bikeIcon(bike: Bike): L.Icon {
  const color = markerColor(bike.provider);
  const isDark = theme.value === 'dark';
  const SIZE = 26;
  const CX = SIZE / 2;
  const R = 10;
  const SW = 3; // stroke-width of the progress arc
  const C = 2 * Math.PI * R; // circumference ≈ 62.83

  const bgFill = isDark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)';
  const trackStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';

  let arcSvg = '';
  if (bike.battery_percent != null) {
    const dash = (bike.battery_percent / 100) * C;
    arcSvg = `
      <circle cx="${CX}" cy="${CX}" r="${R}" fill="none"
        stroke="${trackStroke}" stroke-width="${SW}"/>
      <circle cx="${CX}" cy="${CX}" r="${R}" fill="none"
        stroke="${color}" stroke-width="${SW}"
        stroke-dasharray="${dash} ${C}"
        stroke-linecap="round"
        transform="rotate(-90 ${CX} ${CX})"/>`;
  } else {
    // No battery info: full colored ring
    arcSvg = `<circle cx="${CX}" cy="${CX}" r="${R}" fill="none"
      stroke="${color}" stroke-width="${SW}" opacity="0.5"/>`;
  }

  const svg = `<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${CX}" cy="${CX}" r="${R + 1}" fill="${bgFill}"/>
    ${arcSvg}
    <circle cx="${CX}" cy="${CX}" r="5.5" fill="${color}"/>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [SIZE, SIZE],
    iconAnchor: [CX, CX],
  }) as unknown as L.Icon;
}

function stationIcon(station: VelibStation): L.Icon {
  const count = station.num_bikes_available;
  const color = PROVIDER_HEX.velib;
  const isDark = theme.value === 'dark';
  const bgFill = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)';
  const W = 34;
  const H = 26;
  const r = 4; // corner radius

  // Opacity reduced if station is not renting / no bikes
  const opacity = station.is_renting === 0 || count === 0 ? '0.45' : '1';

  const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
    <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="${r}" fill="${bgFill}" stroke="${color}" stroke-width="2"/>
    <text x="${W / 2}" y="${H / 2 + 4.5}" text-anchor="middle"
      font-size="12" font-weight="700" fill="${color}"
      font-family="SF Mono, Fira Code, Menlo, monospace">${count}</text>
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [W, H],
    iconAnchor: [W / 2, H / 2],
  }) as unknown as L.Icon;
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

:deep(.leaflet-control-attribution a) {
  display: none !important;
}

:deep(.leaflet-control-attribution span) {
  display: none !important;
}

:deep(.leaflet-control-attribution a:hover) {
  color: var(--color-led) !important;
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

<style>
/* ── Light mode overrides for Leaflet controls ─────────────────── */
html.light .leaflet-control-zoom a {
  background: rgba(255, 255, 255, 0.9) !important;
  color: #1a1a1a !important;
  border-color: rgba(0, 0, 0, 0.15) !important;
}
html.light .leaflet-control-zoom a:hover {
  background: rgba(0, 0, 0, 0.06) !important;
}
html.light .leaflet-control-zoom a.leaflet-disabled {
  background: rgba(255, 255, 255, 0.6) !important;
  color: rgba(0, 0, 0, 0.3) !important;
}
html.light .leaflet-control-attribution {
  background: rgba(255, 255, 255, 0.8) !important;
  color: rgba(0, 0, 0, 0.5) !important;
}
html.light .leaflet-tooltip {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 0, 0, 0.12) !important;
  color: #1a1a1a !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
}
html.light .leaflet-tooltip-top::before {
  border-top-color: rgba(255, 255, 255, 0.95) !important;
}
html.light .leaflet-tooltip-bottom::before {
  border-bottom-color: rgba(255, 255, 255, 0.95) !important;
}
html.light .leaflet-tooltip-left::before {
  border-left-color: rgba(255, 255, 255, 0.95) !important;
}
html.light .leaflet-tooltip-right::before {
  border-right-color: rgba(255, 255, 255, 0.95) !important;
}
</style>
