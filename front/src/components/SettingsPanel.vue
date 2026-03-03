<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-2000"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Panel -->
    <Transition name="slide">
      <div
        v-if="open"
        class="fixed top-0 right-0 h-full w-80 bg-black/95 border-l border-led/20 z-2001 overflow-y-auto font-mono text-led"
      >
        <div class="p-6 space-y-6">
          <!-- Header -->
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold uppercase tracking-widest glow">
              Settings
            </h2>
            <BaseButton
              variant="ghost"
              class="p-0 text-xl"
              @click="$emit('close')"
            >
              ✕
            </BaseButton>
          </div>

          <!-- ── Profile selector ─────────────────────────────────── -->
          <section class="space-y-3">
            <h3 class="text-xs uppercase tracking-widest text-led/60">
              Profile
            </h3>

            <!-- Active profile select -->
            <select
              v-if="store.profiles.length"
              :value="store.activeProfileId"
              class="w-full bg-black border border-led/30 text-led text-sm font-mono px-3 py-2 rounded-lg focus:border-led/60 focus:outline-none"
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

            <!-- New profile -->
            <div class="flex gap-2">
              <BaseInput
                v-model.trim="newProfileName"
                type="text"
                placeholder="New profile…"
                maxlength="30"
                size="sm"
                class="flex-1"
                @keydown.enter="addProfile"
              />
              <BaseButton
                size="sm"
                :disabled="!newProfileName"
                @click="addProfile"
              >
                +
              </BaseButton>
            </div>

            <!-- Delete current -->
            <BaseButton
              v-if="store.profiles.length > 1 && store.activeProfile"
              variant="danger-ghost"
              size="sm"
              class="p-0 text-[11px]"
              @click="store.deleteProfile(store.activeProfile!.id)"
            >
              Delete "{{ store.activeProfile.name }}"
            </BaseButton>
          </section>

          <template v-if="store.activeProfile">
            <!-- ── Location ─────────────────────────────────────────── -->
            <section class="space-y-2">
              <h3 class="text-xs uppercase tracking-widest text-led/60">
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
                  :disabled="!parsedLoc"
                  @click="applyCustomLocation"
                >
                  Apply
                </BaseButton>
              </template>

              <div
                v-if="store.hasPosition"
                class="text-xs text-led/40 font-mono"
              >
                {{ store.activeProfile.lat?.toFixed(5) }},
                {{ store.activeProfile.lng?.toFixed(5) }}
              </div>
              <div v-else class="text-xs text-led/40">No position set</div>
            </section>

            <!-- ── Providers ────────────────────────────────────────── -->
            <section class="space-y-2">
              <h3 class="text-xs uppercase tracking-widest text-led/60">
                Providers
              </h3>
              <label
                v-for="p in allProviders"
                :key="p.id"
                class="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  :checked="store.activeProfile!.providers.includes(p.id)"
                  class="accent-led"
                  @change="store.toggleProvider(p.id)"
                />
                <span class="text-sm font-bold uppercase" :class="p.colorClass">
                  {{ p.id }}
                </span>
              </label>
            </section>

            <!-- ── Filters ──────────────────────────────────────────── -->
            <section class="space-y-4">
              <h3 class="text-xs uppercase tracking-widest text-led/60">
                Filters
              </h3>

              <!-- Max vehicles -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Max vehicles</span>
                  <span class="text-led/70">{{
                    store.activeProfile!.limit
                  }}</span>
                </div>
                <input
                  type="range"
                  :value="store.activeProfile!.limit"
                  :min="FILTER_BOUNDS.limit.min"
                  :max="FILTER_BOUNDS.limit.max"
                  :step="FILTER_BOUNDS.limit.step"
                  class="w-full slider"
                  @input="
                    store.setLimit(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>

              <!-- Max distance -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Max distance</span>
                  <span class="text-led/70">{{
                    store.activeProfile!.maxDistance === UNSET
                      ? 'Unlimited'
                      : `${store.activeProfile!.maxDistance}m`
                  }}</span>
                </div>
                <input
                  type="range"
                  :value="
                    store.activeProfile!.maxDistance === UNSET
                      ? 0
                      : store.activeProfile!.maxDistance
                  "
                  min="0"
                  :max="FILTER_BOUNDS.maxDistance.max"
                  :step="FILTER_BOUNDS.maxDistance.step"
                  class="w-full slider"
                  @input="
                    store.setMaxDistance(
                      Number(($event.target as HTMLInputElement).value) === 0
                        ? UNSET
                        : Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>

              <!-- Min battery -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Min battery</span>
                  <span class="text-led/70">{{
                    store.activeProfile!.minBattery === UNSET
                      ? 'Any'
                      : `${store.activeProfile!.minBattery}%`
                  }}</span>
                </div>
                <input
                  type="range"
                  :value="
                    store.activeProfile!.minBattery === UNSET
                      ? 0
                      : store.activeProfile!.minBattery
                  "
                  min="0"
                  :max="FILTER_BOUNDS.minBattery.max"
                  :step="FILTER_BOUNDS.minBattery.step"
                  class="w-full slider"
                  @input="
                    store.setMinBattery(
                      Number(($event.target as HTMLInputElement).value) === 0
                        ? UNSET
                        : Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>

              <!-- Poll interval -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs">
                  <span>Refresh interval</span>
                  <span class="text-led/70"
                    >{{ store.activeProfile!.pollInterval }}s</span
                  >
                </div>
                <input
                  type="range"
                  :value="store.activeProfile!.pollInterval"
                  :min="FILTER_BOUNDS.pollInterval.min"
                  :max="FILTER_BOUNDS.pollInterval.max"
                  :step="FILTER_BOUNDS.pollInterval.step"
                  class="w-full slider"
                  @input="
                    store.setPollInterval(
                      Number(($event.target as HTMLInputElement).value),
                    )
                  "
                />
              </div>
            </section>

            <!-- Reset -->
            <BaseButton
              variant="danger"
              size="sm"
              class="w-full"
              @click="store.resetActiveProfile()"
            >
              Reset profile to defaults
            </BaseButton>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseButton from './BaseButton.vue';
import BaseInput from './BaseInput.vue';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';
import { parseLocation } from '../utils/parseLocation';
import { type Provider, FILTER_BOUNDS, UNSET } from '../types';

defineProps<{
  open: boolean;
}>();

defineEmits<{
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
