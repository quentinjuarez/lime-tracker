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
            <h2 class="text-lg font-bold uppercase tracking-widest led-glow">
              Settings
            </h2>
            <button
              class="text-led/50 hover:text-led transition-colors text-xl"
              @click="$emit('close')"
            >
              ✕
            </button>
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
              <input
                v-model.trim="newProfileName"
                type="text"
                placeholder="New profile…"
                maxlength="30"
                class="flex-1 bg-black border border-led/30 text-led text-xs font-mono px-3 py-1.5 rounded-lg focus:border-led/60 focus:outline-none placeholder:text-led/30"
                @keydown.enter="addProfile"
              />
              <button
                :disabled="!newProfileName"
                class="text-xs px-3 py-1.5 rounded-lg border border-led/40 text-led hover:bg-led/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                @click="addProfile"
              >
                +
              </button>
            </div>

            <!-- Delete current -->
            <button
              v-if="store.profiles.length > 1 && store.activeProfile"
              class="text-[11px] text-red-400/70 hover:text-red-400 transition-colors"
              @click="store.deleteProfile(store.activeProfile!.id)"
            >
              Delete "{{ store.activeProfile.name }}"
            </button>
          </section>

          <template v-if="store.activeProfile">
            <!-- ── Location ─────────────────────────────────────────── -->
            <section class="space-y-2">
              <h3 class="text-xs uppercase tracking-widest text-led/60">
                Location
              </h3>
              <button
                :disabled="geoLoading"
                class="text-xs px-3 py-1.5 rounded-lg border border-led/40 text-led hover:bg-led/10 transition-colors disabled:opacity-30"
                @click="relocate"
              >
                📍 {{ geoLoading ? 'Locating…' : 'Update GPS position' }}
              </button>
              <div v-if="geoError" class="text-red-400 text-xs">
                {{ geoError }}
              </div>
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
            <button
              class="w-full py-2 px-4 rounded-md text-xs uppercase tracking-wider border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-colors"
              @click="store.resetActiveProfile()"
            >
              Reset profile to defaults
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useProfileStore } from '../stores/profile';
import { useGeolocation } from '../composables/useGeolocation';
import { type Provider, FILTER_BOUNDS, UNSET } from '../types';

defineProps<{
  open: boolean;
}>();

defineEmits<{
  close: [];
}>();

const store = useProfileStore();
const { error: geoError, loading: geoLoading, locate } = useGeolocation();

const newProfileName = ref('');

const allProviders: { id: Provider; colorClass: string }[] = [
  { id: 'lime', colorClass: 'text-lime-brand' },
  { id: 'voi', colorClass: 'text-voi-brand' },
];

function addProfile() {
  if (!newProfileName.value) return;
  store.createProfile(newProfileName.value);
  newProfileName.value = '';
}

function relocate() {
  locate();
}
</script>

<style scoped>
.led-glow {
  text-shadow:
    0 0 6px currentColor,
    0 0 12px currentColor;
}

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
