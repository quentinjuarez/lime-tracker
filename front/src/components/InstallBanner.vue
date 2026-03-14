<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="fixed bottom-4 inset-x-0 z-1100 p-4">
      <div
        class="max-w-sm mx-auto bg-black border border-led/30 rounded-xl px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-sm flex flex-col md:flex-row md:items-center gap-3"
      >
        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p
            class="text-xs font-mono font-bold text-led uppercase tracking-widest truncate"
          >
            {{ t('install.title') }}
          </p>
          <p class="text-[10px] font-mono text-led/60 leading-tight mt-0.5">
            {{ t('install.subtitle') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
          <button
            type="button"
            class="text-[10px] font-mono text-led/40 hover:text-led/70 transition-colors uppercase tracking-wider"
            @click="onDismiss"
          >
            {{ t('install.later') }}
          </button>
          <button
            type="button"
            class="text-xs font-mono font-bold text-black bg-led hover:bg-led/80 transition-colors uppercase tracking-wider rounded-lg px-3 py-1.5"
            @click="onInstall"
          >
            {{ t('install.install') }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useInstallPrompt } from '../composables/useInstallPrompt';

const { t } = useI18n();
const { showBanner, triggerInstall, dismiss } = useInstallPrompt();

function onInstall() {
  triggerInstall();
}

function onDismiss() {
  showBanner.value = false;
  dismiss();
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.35s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(120%);
  opacity: 0;
}
</style>
