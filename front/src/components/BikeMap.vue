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

      <l-marker
        :lat-lng="[props.userLat, props.userLng]"
        :icon="
          createCircularIcon({
            color: 'var(--color-led)',
            isDark: theme === 'dark',
            size: 26,
            radius: 10,
            strokeWidth: 3,
            percent: 100,
            innerCircleRadius: 5.5,
          })
        "
      >
        <l-tooltip
          :options="{ permanent: false, sticky: true, interactive: false }"
        >
          {{ t('bikeMap.me') }}
        </l-tooltip>
      </l-marker>

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
          <div v-if="entity.kind === 'bike'" class="text-xs">
            <strong class="uppercase">{{ entity.provider }}</strong>
            <br />
            {{ formatDistance(entity.distance) }}<br />
            <template v-if="entity.battery_percent != null">
              {{ entity.battery_percent }}%
            </template>
          </div>
          <div v-else class="text-xs">
            <strong class="uppercase">Vélib</strong>
            <br />
            <span>
              {{
                $t('bikeMap.num_bikes_available', entity.num_bikes_available)
              }}
            </span>
            <br />
            <span>
              {{ $t('bikeMap.mechanical', entity.mechanical) }}
            </span>
            <br />
            <span>
              {{ $t('bikeMap.ebike', entity.ebike) }}
            </span>
            <br />
            {{ formatDistance(entity.distance) }}
          </div>
        </l-tooltip>
      </l-marker>
    </l-map>

    <div
      class="absolute bottom-4 left-4 text-xs px-3 py-2 rounded-lg z-1000 space-y-1 border"
      :class="
        theme === 'light'
          ? 'bg-white/80 text-gray-800 border-gray-200'
          : 'bg-black/70 text-white border-transparent'
      "
    >
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-led inline-block"></span>
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
import { LMap, LTileLayer, LMarker, LTooltip } from '@vue-leaflet/vue-leaflet';
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

const PROVIDER_HEX: Record<Provider, string> = {
  lime: 'var(--color-lime-brand)',
  voi: 'var(--color-voi-brand)',
  dott: 'var(--color-dott-brand)',
  velib: 'var(--color-velib-brand)',
};

function markerColor(provider: Provider): string {
  return PROVIDER_HEX[provider];
}

function createCircularIcon(options: {
  color: string;
  isDark: boolean;
  size: number;
  radius: number;
  strokeWidth: number;
  percent: number | null;
  text?: string;
  innerCircleRadius?: number;
  opacity?: number;
}): L.Icon {
  const {
    color,
    isDark,
    size,
    radius: R,
    strokeWidth: SW,
    percent,
    text,
    innerCircleRadius,
    opacity = 1,
  } = options;

  const CX = size / 2;
  const C = 2 * Math.PI * R;

  const bgFill = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.85)';
  const trackStroke = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';

  let arcSvg = '';
  if (percent != null) {
    const dash = percent * C;
    arcSvg = `
      <circle cx="${CX}" cy="${CX}" r="${R}" fill="none"
        stroke="${trackStroke}" stroke-width="${SW}"/>
      <circle cx="${CX}" cy="${CX}" r="${R}" fill="none"
        stroke="${color}" stroke-width="${SW}"
        stroke-dasharray="${dash} ${C}"
        stroke-linecap="round"
        transform="rotate(-90 ${CX} ${CX})"/>`;
  } else {
    arcSvg = `<circle cx="${CX}" cy="${CX}" r="${R}" fill="none"
      stroke="${color}" stroke-width="${SW}" opacity="0.5"/>`;
  }

  let centerElement = '';

  if (innerCircleRadius !== undefined) {
    centerElement += `<circle cx="${CX}" cy="${CX}" r="${innerCircleRadius}" fill="${color}"/>`;
  }

  if (text !== undefined) {
    const fontSize = text.length > 2 ? 10 : 12;
    const yOffset = CX + fontSize * 0.35;
    centerElement += `<text x="${CX}" y="${yOffset}" text-anchor="middle"
      font-size="${fontSize}" font-weight="700" fill="#ffffff"
      font-family="SF Mono, Fira Code, Menlo, monospace">${text}</text>`;
  }

  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" opacity="${opacity}">
    <circle cx="${CX}" cy="${CX}" r="${R + SW / 2}" fill="${bgFill}"/>
    ${arcSvg}
    ${centerElement}
  </svg>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [size, size],
    iconAnchor: [CX, CX],
  }) as unknown as L.Icon;
}

function bikeIcon(bike: Bike): L.Icon {
  return createCircularIcon({
    color: markerColor(bike.provider),
    isDark: theme.value === 'dark',
    size: 26,
    radius: 10,
    strokeWidth: 3,
    percent: bike.battery_percent != null ? bike.battery_percent / 100 : null,
    innerCircleRadius: 5.5,
  });
}

function stationIcon(station: VelibStation): L.Icon {
  const count = station.num_bikes_available;
  const eBikes = station.ebike || 0;
  const mechBikes = station.mechanical || 0;
  const totalCalculated = eBikes + mechBikes;

  const percent = totalCalculated > 0 ? eBikes / totalCalculated : 0;

  const opacity = station.is_renting === 0 || count === 0 ? 0.45 : 1;

  return createCircularIcon({
    color: markerColor('velib'),
    isDark: theme.value === 'dark',
    size: 34,
    radius: 14,
    strokeWidth: 3.5,
    percent: percent,
    text: count.toString(),
    innerCircleRadius: 9.5,
    opacity: opacity,
  });
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
