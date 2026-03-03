<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/10 backdrop-blur-sm z-2000"
        @click="emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed top-0 right-0 h-full w-80 bg-black/95 border-l border-led/50 z-2001 overflow-y-auto font-mono text-led"
      >
        <div class="p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold uppercase tracking-widest glow-sm">
              Settings
            </h2>
            <BaseButton
              variant="ghost"
              size="sm"
              class="px-2!"
              @click="emit('close')"
            >
              ✕
            </BaseButton>
          </div>

          <!-- ── Profile selector ─────────────────────────────────── -->
          <section class="space-y-3">
            <h3 class="text-xs uppercase tracking-widest text-led/80">
              Profile
            </h3>

            <!-- Active profile select -->
            <select
              v-if="store.profiles.length"
              :value="store.activeProfileId"
              class="w-full bg-black border border-led/80 text-led text-sm font-mono px-3 py-2 rounded-lg focus:border-led focus:outline-none"
              @change="
                store.selectProfile(($event.target as HTMLSelectElement).value)
              "
            >
              <option
                v-for="p in store.profiles"
                :key="p.id"
                :value="p.id"
                class="bg-black text-led"
              >
                {{ p.name }}
              </option>
            </select>
          </section>

          <template v-if="store.activeProfile">
            <!-- ── Location ─────────────────────────────────────────── -->
            <section class="space-y-2">
              <h3 class="text-xs uppercase tracking-widest text-led/80">
                Location
              </h3>

              <!-- GPS profile → relocate button -->
              <template v-if="store.activeProfile.mode === 'geolocation'">
                <BaseButton size="sm" :disabled="geoLoading" @click="relocate">
                  📍 {{ geoLoading ? 'Locating…' : 'Update GPS position' }}
                </BaseButton>
                <div v-if="geoError" class="text-red-400 text-xs">
                  {{ geoError }}
                </div>
              </template>

              <!-- Custom profile → location parser input -->
              <template v-else>
                <BaseInput
                  v-model="locationRaw"
                  type="text"
                  placeholder="Paste coordinates or link…"
                  size="sm"
                  class="w-full"
                  @keydown.enter="applyCustomLocation"
                />
                <div
                  v-if="locationRaw && parsedLoc"
                  class="text-xs text-green-400"
                >
                  ✓ {{ parsedLoc.lat.toFixed(5) }},
                  {{ parsedLoc.lng.toFixed(5) }}
                </div>
                <div
                  v-else-if="locationRaw && !parsedLoc"
                  class="text-xs text-red-400"
                >
                  Could not parse
                </div>
                <BaseButton
                  size="sm"
                  class="w-full text-center"
                  :disabled="!parsedLoc"
                  @click="applyCustomLocation"
                >
                  Apply
                </BaseButton>
              </template>

              <div
                v-if="store.hasPosition"
                class="text-xs text-led/60 font-mono"
              >
                {{ store.activeProfile.lat?.toFixed(5) }},
                {{ store.activeProfile.lng?.toFixed(5) }}
              </div>
              <div v-else class="text-xs text-led/40">No position set</div>
            </section>

            <!-- ── Providers ────────────────────────────────────────── -->
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

            <!-- ── Filters ──────────────────────────────────────────── -->
            <section class="space-y-4">
              <h3 class="text-xs uppercase tracking-widest text-led/80">
                Filters
              </h3>

              <!-- Max vehicles -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Max vehicles</span>
                  <span class="text-led/80">{{ draft.limit }}</span>
                </div>
                <input
                  type="range"
                  :value="draft.limit"
                  :min="FILTER_BOUNDS.limit.min"
                  :max="FILTER_BOUNDS.limit.max"
                  :step="FILTER_BOUNDS.limit.step"
                  class="w-full slider"
                  @input="
                    draft.limit = Number(
                      ($event.target as HTMLInputElement).value,
                    )
                  "
                />
              </div>

              <!-- Max distance -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Max distance</span>
                  <span class="text-led/80">{{
                    draft.maxDistance === UNSET
                      ? 'Unlimited'
                      : `${draft.maxDistance}m`
                  }}</span>
                </div>
                <input
                  type="range"
                  :value="draft.maxDistance === UNSET ? 0 : draft.maxDistance"
                  min="0"
                  :max="FILTER_BOUNDS.maxDistance.max"
                  :step="FILTER_BOUNDS.maxDistance.step"
                  class="w-full slider"
                  @input="
                    draft.maxDistance =
                      Number(($event.target as HTMLInputElement).value) === 0
                        ? UNSET
                        : Number(($event.target as HTMLInputElement).value)
                  "
                />
              </div>

              <!-- Min battery -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Min battery</span>
                  <span class="text-led/80">{{
                    draft.minBattery === UNSET ? 'Any' : `${draft.minBattery}%`
                  }}</span>
                </div>
                <input
                  type="range"
                  :value="draft.minBattery === UNSET ? 0 : draft.minBattery"
                  min="0"
                  :max="FILTER_BOUNDS.minBattery.max"
                  :step="FILTER_BOUNDS.minBattery.step"
                  class="w-full slider"
                  @input="
                    draft.minBattery =
                      Number(($event.target as HTMLInputElement).value) === 0
                        ? UNSET
                        : Number(($event.target as HTMLInputElement).value)
                  "
                />
              </div>
            </section>

            <!-- Save + Reset -->
            <div class="space-y-2">
              <BaseButton class="w-full" @click="save">
                Save &amp; close
              </BaseButton>
              <BaseButton
                variant="danger-ghost"
                size="sm"
                class="w-full"
                @click="resetDraft"
              >
                Reset to defaults
              </BaseButton>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';
import { parseLocation } from '../utils/parseLocation';
import { type Provider, FILTER_BOUNDS, UNSET } from '../types';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useProfileStore();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();

const locationRaw = ref('');
const parsedLoc = computed(() => parseLocation(locationRaw.value));

const allProviders: { id: Provider; colorClass: string }[] = [
  { id: 'lime', colorClass: 'text-lime-brand' },
  { id: 'voi', colorClass: 'text-voi-brand' },
];

// ── Draft state (buffered until Save) ───────────────────────────────
interface Draft {
  providers: Provider[];
  limit: number;
  maxDistance: number;
  minBattery: number;
}

function draftFromProfile(): Draft {
  const p = store.activeProfile;
  return {
    providers: p ? [...p.providers] : ['lime', 'voi'],
    limit: p?.limit ?? FILTER_BOUNDS.limit.default,
    maxDistance: p?.maxDistance ?? FILTER_BOUNDS.maxDistance.default,
    minBattery: p?.minBattery ?? FILTER_BOUNDS.minBattery.default,
  };
}

const draft = reactive<Draft>(draftFromProfile());

// Reset draft when panel opens or active profile changes
watch(
  () => [props.open, store.activeProfileId] as const,
  ([open]) => {
    if (open) Object.assign(draft, draftFromProfile());
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
  draft.providers = store.activeProfile
    ? [...store.activeProfile.providers]
    : ['lime', 'voi'];
  draft.limit = FILTER_BOUNDS.limit.default;
  draft.maxDistance = FILTER_BOUNDS.maxDistance.default;
  draft.minBattery = FILTER_BOUNDS.minBattery.default;
}

function save() {
  const p = store.activeProfile;
  if (!p) return;
  // Write all at once — Vue batches these into a single reactivity flush
  // so useBikes only restarts once instead of once per slider drag
  p.providers = [...draft.providers];
  store.setLimit(draft.limit);
  store.setMaxDistance(draft.maxDistance);
  store.setMinBattery(draft.minBattery);
  emit('close');
}

function relocate() {
  locate();
}

function applyCustomLocation() {
  if (!parsedLoc.value) return;
  store.setPosition(parsedLoc.value.lat, parsedLoc.value.lng);
  locationRaw.value = '';
}
</script>

<style scoped>
/* Slider styling */
.slider {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: color-mix(in srgb, var(--color-led) 20%, transparent);
  border-radius: 2px;
  outline: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-led);
  cursor: pointer;
  box-shadow: 0 0 6px var(--color-led);
}
.slider::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--color-led);
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px var(--color-led);
}

/* Select styling */
select option {
  background: #000;
  color: var(--color-led);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.25s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
