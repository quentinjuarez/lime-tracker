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

          <!-- Location -->
          <section class="space-y-2">
            <h3 class="text-xs uppercase tracking-widest text-led/60">
              Location
            </h3>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                :checked="store.useGeolocation"
                class="accent-led"
                @change="store.useGeolocation = !store.useGeolocation"
              />
              <span class="text-sm">Use GPS location</span>
            </label>
            <div v-if="geoError" class="text-red-400 text-xs">
              {{ geoError }}
            </div>
            <div v-if="store.hasPosition" class="text-xs text-led/40 font-mono">
              {{ store.lat?.toFixed(5) }}, {{ store.lng?.toFixed(5) }}
            </div>
            <div v-else class="text-xs text-led/40">Waiting for location…</div>
          </section>

          <!-- Providers -->
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
                :checked="store.providers.includes(p.id)"
                class="accent-led"
                @change="store.toggleProvider(p.id)"
              />
              <span class="text-sm font-bold uppercase" :class="p.colorClass">
                {{ p.id }}
              </span>
            </label>
          </section>

          <!-- Filters -->
          <section class="space-y-4">
            <h3 class="text-xs uppercase tracking-widest text-led/60">
              Filters
            </h3>

            <!-- Max vehicles -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span>Max vehicles</span>
                <span class="text-led/70">{{ store.limit }}</span>
              </div>
              <input
                type="range"
                :value="store.limit"
                min="5"
                max="100"
                step="5"
                class="w-full slider"
                @input="
                  store.limit = Number(
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
            </div>

            <!-- Max distance -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span>Max distance</span>
                <span class="text-led/70">
                  {{
                    store.maxDistance === 0
                      ? 'Unlimited'
                      : `${store.maxDistance}m`
                  }}
                </span>
              </div>
              <input
                type="range"
                :value="store.maxDistance"
                min="0"
                max="5000"
                step="100"
                class="w-full slider"
                @input="
                  store.maxDistance = Number(
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
            </div>

            <!-- Min battery -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span>Min battery</span>
                <span class="text-led/70">
                  {{ store.minBattery === 0 ? 'Any' : `${store.minBattery}%` }}
                </span>
              </div>
              <input
                type="range"
                :value="store.minBattery"
                min="0"
                max="100"
                step="5"
                class="w-full slider"
                @input="
                  store.minBattery = Number(
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
            </div>

            <!-- Poll interval -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs">
                <span>Refresh interval</span>
                <span class="text-led/70">{{ store.pollInterval }}s</span>
              </div>
              <input
                type="range"
                :value="store.pollInterval"
                min="15"
                max="300"
                step="15"
                class="w-full slider"
                @input="
                  store.pollInterval = Number(
                    ($event.target as HTMLInputElement).value,
                  )
                "
              />
            </div>
          </section>

          <!-- Reset -->
          <button
            class="w-full py-2 px-4 rounded-md text-xs uppercase tracking-wider border border-red-800/50 text-red-400 hover:bg-red-900/20 transition-colors"
            @click="store.resetToDefaults()"
          >
            Reset to defaults
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { useProfileStore } from '../stores/profile';
import type { Provider } from '../composables/useBikes';

defineProps<{
  open: boolean;
  geoError?: string | null;
}>();

defineEmits<{
  close: [];
}>();

const store = useProfileStore();

const allProviders: { id: Provider; colorClass: string }[] = [
  { id: 'lime', colorClass: 'text-lime-brand' },
  { id: 'voi', colorClass: 'text-voi-brand' },
];
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
