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
        <!-- Mobile drag handle -->
        <div class="flex justify-center pt-3 pb-1 md:hidden" v-if="false">
          <div class="w-10 h-1 rounded-full bg-led/30" />
        </div>
        <div class="p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold uppercase tracking-widest glow-sm">
              Settings
            </h2>
            <BaseButton variant="ghost" size="sm" class="px-2!" @click="save">
              ✕
            </BaseButton>
          </div>

          <template v-if="store.activeProfile">
            <!-- ── Location ─────────────────────────────────────────── -->
            <section class="space-y-3">
              <h3 class="text-xs uppercase tracking-widest text-led/80">
                Location
              </h3>

              <!-- GPS profile: direct update button -->
              <template v-if="store.activeProfile.mode === 'geolocation'">
                <div
                  v-if="store.hasPosition"
                  class="text-xs text-led/60 font-mono"
                >
                  {{ store.activeProfile.lat?.toFixed(5) }},
                  {{ store.activeProfile.lng?.toFixed(5) }}
                </div>
                <div v-else class="text-xs text-led/40">No position set</div>
                <BaseButton
                  size="sm"
                  class="w-full"
                  :disabled="geoLoading"
                  @click="locate"
                >
                  <SpinnerIcon v-if="geoLoading" size="sm" class="mr-1" />
                  📍 {{ geoLoading ? 'Locating…' : 'Update GPS position' }}
                </BaseButton>
                <div v-if="geoError" class="text-red-400 text-xs">
                  {{ geoError }}
                </div>
              </template>

              <!-- Custom profile: picker to change via GPS or manual input -->
              <template v-else>
                <template v-if="!showLocationPicker">
                  <div
                    v-if="store.hasPosition"
                    class="text-xs text-led/60 font-mono"
                  >
                    {{ store.activeProfile.lat?.toFixed(5) }},
                    {{ store.activeProfile.lng?.toFixed(5) }}
                  </div>
                  <div v-else class="text-xs text-led/40">No position set</div>
                  <BaseButton
                    size="sm"
                    class="w-full"
                    @click="openLocationPicker"
                  >
                    📍 Modifier la localisation
                  </BaseButton>
                </template>
                <template v-else>
                  <LocationPicker
                    ref="locationPickerRef"
                    @done="onLocationDone"
                  />
                  <BaseButton
                    variant="ghost"
                    size="sm"
                    class="p-0 text-[11px]"
                    @click="showLocationPicker = false"
                  >
                    ← Annuler
                  </BaseButton>
                </template>
              </template>
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
              <BaseSlider
                label="Max vehicles"
                :display-value="String(draft.limit)"
                :model-value="draft.limit"
                :min="FILTER_BOUNDS.limit.min"
                :max="FILTER_BOUNDS.limit.max"
                :step="FILTER_BOUNDS.limit.step"
                @update:model-value="draft.limit = $event"
              />

              <!-- Max distance -->
              <BaseSlider
                label="Max distance"
                :display-value="
                  draft.maxDistance === UNSET
                    ? 'Unlimited'
                    : `${draft.maxDistance}m`
                "
                :model-value="
                  draft.maxDistance === UNSET ? 0 : draft.maxDistance
                "
                :min="0"
                :max="FILTER_BOUNDS.maxDistance.max"
                :step="FILTER_BOUNDS.maxDistance.step"
                @update:model-value="
                  draft.maxDistance = $event === 0 ? UNSET : $event
                "
              />

              <!-- Min battery -->
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
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseSlider from './BaseSlider.vue';
import LocationPicker from './LocationPicker.vue';
import SpinnerIcon from './SpinnerIcon.vue';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';
import { type Provider, FILTER_BOUNDS, UNSET } from '../types';

const props = defineProps<{
  open: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const store = useProfileStore();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();

const showLocationPicker = ref(false);
const locationPickerRef = ref<InstanceType<typeof LocationPicker> | null>(null);

function openLocationPicker() {
  showLocationPicker.value = true;
  locationPickerRef.value?.reset();
}

function onLocationDone() {
  showLocationPicker.value = false;
}

const allProviders: { id: Provider; colorClass: string }[] = [
  { id: 'lime', colorClass: 'text-lime-brand' },
  { id: 'voi', colorClass: 'text-voi-brand' },
  { id: 'dott', colorClass: 'text-dott-brand' },
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
    if (open) {
      Object.assign(draft, draftFromProfile());
      showLocationPicker.value = false;
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
</script>
