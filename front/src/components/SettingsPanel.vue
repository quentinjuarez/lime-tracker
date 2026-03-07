<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/10 backdrop-blur-sm z-2000"
        @click="save"
      />
    </Transition>
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed bottom-0 left-0 right-0 max-h-[85dvh] rounded-t-2xl border-t border-led/20 bg-black/95 z-2001 overflow-y-auto font-mono text-led md:top-0 md:bottom-auto md:left-auto md:right-0 md:h-full md:max-h-none md:w-xl md:rounded-none md:border-t-0 md:border-l"
      >
        <div class="p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold uppercase tracking-widest glow-sm">
              Settings
            </h2>
            <div class="flex items-center gap-2">
              <BaseButton
                variant="ghost"
                size="sm"
                class="px-2!"
                :title="
                  theme === 'dark'
                    ? 'Switch to light mode'
                    : 'Switch to dark mode'
                "
                @click="toggleTheme"
              >
                {{ theme === 'dark' ? '☀️' : '🌙' }}
              </BaseButton>
              <BaseButton variant="ghost" size="sm" class="px-2!" @click="save">
                ✕
              </BaseButton>
            </div>
          </div>

          <!-- ── Location ──────────────────────────────────────────── -->
          <section class="space-y-3">
            <h3 class="text-xs uppercase tracking-widest text-led/80">
              Location
            </h3>

            <!-- Current coords -->
            <div v-if="store.hasPosition" class="text-xs text-led/60 font-mono">
              {{ store.lat?.toFixed(5) }}, {{ store.lng?.toFixed(5) }}
              <span class="ml-2 text-led/40">
                {{ store.locationMode === 'geo' ? '(GPS)' : '(manual)' }}
              </span>
            </div>
            <div v-else class="text-xs text-led/40">No position set</div>

            <!-- GPS refresh button -->
            <BaseButton
              size="sm"
              class="w-full"
              :disabled="geoLoading"
              @click="locate"
            >
              <SpinnerIcon v-if="geoLoading" size="sm" class="mr-1" />
              {{
                geoLoading
                  ? 'Locating…'
                  : store.hasPosition
                    ? ' Refresh GPS'
                    : ' Get GPS location'
              }}
            </BaseButton>
            <div v-if="geoError" class="text-red-400 text-xs">
              {{ geoError }}
            </div>

            <!-- Manual input (toggle) -->
            <button
              class="text-[11px] text-led/50 hover:text-led/80 transition-colors uppercase tracking-widest underline-offset-2 hover:underline"
              @click="showManualInput = !showManualInput"
            >
              {{ showManualInput ? 'Cancel' : 'Enter location manually' }}
            </button>

            <template v-if="showManualInput">
              <BaseInput
                v-model="locationRaw"
                type="text"
                placeholder="Coordinates or Google Maps link…"
                class="w-full"
                @keydown.enter="submitManual"
              />
              <div v-if="locationRaw && parsed" class="text-xs text-green-400">
                ✓ {{ parsed.lat.toFixed(5) }}, {{ parsed.lng.toFixed(5) }}
              </div>
              <div
                v-else-if="locationRaw && !parsed"
                class="text-xs text-red-400"
              >
                Could not parse location
              </div>
              <BaseButton
                size="sm"
                class="w-full"
                :disabled="!parsed"
                @click="submitManual"
              >
                Confirm location
              </BaseButton>
            </template>
          </section>

          <!-- ── Providers ─────────────────────────────────────────── -->
          <section class="space-y-2">
            <h3 class="text-xs uppercase tracking-widest text-led/80">
              Providers
            </h3>
            <label
              v-for="p in allProviders"
              :key="p.id"
              class="flex items-center gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                :checked="draft.providers.includes(p.id)"
                class="accent-led"
                @change="toggleDraftProvider(p.id)"
              />
              <span class="text-sm font-bold uppercase" :class="p.colorClass">
                {{ p.id }}
              </span>
            </label>
          </section>

          <!-- ── Filters ───────────────────────────────────────────── -->
          <section class="space-y-4">
            <h3 class="text-xs uppercase tracking-widest text-led/80">
              Filters
            </h3>

            <BaseSlider
              label="Max distance"
              :display-value="
                draft.maxDistance === UNSET
                  ? 'No limit'
                  : walkMinutesLabel(metersToWalkMinutes(draft.maxDistance))
              "
              :model-value="
                draft.maxDistance === UNSET
                  ? 0
                  : metersToWalkMinutes(draft.maxDistance)
              "
              :min="0"
              :max="20"
              :step="1"
              @update:model-value="
                draft.maxDistance =
                  $event === 0 ? UNSET : walkMinutesToMeters($event)
              "
            />

            <BaseSlider
              label="Min battery"
              :display-value="
                draft.minBattery === UNSET ? 'Any' : `${draft.minBattery}%`
              "
              :model-value="draft.minBattery === UNSET ? 0 : draft.minBattery"
              :min="0"
              :max="FILTER_BOUNDS.minBattery.max"
              :step="FILTER_BOUNDS.minBattery.step"
              @update:model-value="
                draft.minBattery = $event === 0 ? UNSET : $event
              "
            />
          </section>

          <!-- Reset -->
          <BaseButton
            variant="danger-ghost"
            size="sm"
            class="w-full"
            @click="resetDraft"
          >
            Reset to defaults
          </BaseButton>

          <!-- Copy link -->
          <BaseButton
            variant="ghost"
            size="sm"
            class="w-full"
            @click="copyLink"
          >
            {{ linkCopied ? '✓ Link copied!' : '🔗 Copy settings as link' }}
          </BaseButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import BaseSlider from './BaseSlider.vue';
import SpinnerIcon from './SpinnerIcon.vue';
import { useTheme } from '../composables/useTheme';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';
import { parseLocation } from '../utils/parseLocation';
import {
  metersToWalkMinutes,
  walkMinutesToMeters,
  walkMinutesLabel,
} from '../utils/walking';
import { type Provider, ALL_PROVIDERS, FILTER_BOUNDS, UNSET } from '../types';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const store = useProfileStore();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();
const { theme, toggleTheme } = useTheme();

// ── Manual location input ────────────────────────────────────────────
const showManualInput = ref(false);
const locationRaw = ref('');
const parsed = computed(() => parseLocation(locationRaw.value));

function submitManual() {
  if (!parsed.value) return;
  store.setPosition(parsed.value.lat, parsed.value.lng, 'manual');
  locationRaw.value = '';
  showManualInput.value = false;
}

// ── Providers list ───────────────────────────────────────────────────
const allProviders: { id: Provider; colorClass: string }[] = [
  { id: 'lime', colorClass: 'text-lime-brand' },
  { id: 'voi', colorClass: 'text-voi-brand' },
  { id: 'dott', colorClass: 'text-dott-brand' },
];

// ── Draft (buffered until Save) ──────────────────────────────────────
interface Draft {
  providers: Provider[];
  limit: number;
  maxDistance: number;
  minBattery: number;
}

function draftFromStore(): Draft {
  return {
    providers: [...store.providers],
    limit: store.limit,
    maxDistance: store.maxDistance,
    minBattery: store.minBattery,
  };
}

const draft = reactive<Draft>(draftFromStore());

watch(
  () => props.open,
  (open) => {
    if (open) {
      Object.assign(draft, draftFromStore());
      showManualInput.value = false;
      locationRaw.value = '';
    }
  },
);

function toggleDraftProvider(id: Provider) {
  const idx = draft.providers.indexOf(id);
  if (idx === -1) {
    draft.providers.push(id);
  } else if (draft.providers.length > 1) {
    draft.providers.splice(idx, 1);
  }
}

function resetDraft() {
  draft.providers = [...ALL_PROVIDERS];
  draft.limit = FILTER_BOUNDS.limit.default;
  draft.maxDistance = FILTER_BOUNDS.maxDistance.default;
  draft.minBattery = FILTER_BOUNDS.minBattery.default;
}

function save() {
  store.providers = [...draft.providers];
  store.setLimit(draft.limit);
  store.setMaxDistance(draft.maxDistance);
  store.setMinBattery(draft.minBattery);
  emit('close');
}

// ── Copy link ────────────────────────────────────────────────────────
const linkCopied = ref(false);

function copyLink() {
  if (!store.hasPosition) return;

  const params = new URLSearchParams();
  params.set('lat', store.lat!.toString());
  params.set('lng', store.lng!.toString());
  if (draft.providers.join(',') !== ALL_PROVIDERS.join(','))
    params.set('providers', draft.providers.join(','));
  if (draft.limit !== FILTER_BOUNDS.limit.default)
    params.set('limit', draft.limit.toString());
  if (draft.maxDistance !== FILTER_BOUNDS.maxDistance.default)
    params.set(
      'maxDist',
      (draft.maxDistance === UNSET ? 0 : draft.maxDistance).toString(),
    );
  if (draft.minBattery !== FILTER_BOUNDS.minBattery.default)
    params.set(
      'minBat',
      (draft.minBattery === UNSET ? 0 : draft.minBattery).toString(),
    );

  const qs = params.toString();
  const url = `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ''}`;
  navigator.clipboard.writeText(url).then(() => {
    linkCopied.value = true;
    setTimeout(() => (linkCopied.value = false), 2000);
  });
}
</script>
