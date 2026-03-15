<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="fixed bottom-4 inset-x-0 z-1100 p-4">
      <div
        class="max-w-sm mx-auto bg-accent-500/5 dark:bg-black/10 border border-accent-100 dark:border-accent-900 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm flex flex-col md:flex-row md:items-center gap-3"
      >
        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p
            class="text-xs font-semibold text-accent-700 dark:text-accent-300 tracking-wide truncate"
          >
            {{ t('install.title') }}
          </p>
          <p
            class="text-[10px] text-accent-400 dark:text-accent-500 leading-tight mt-0.5"
          >
            {{ t('install.subtitle') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 flex-none w-full md:w-auto">
          <BaseButton
            variant="ghost"
            size="sm"
            class="uppercase w-full md:w-auto"
            @click="onDismiss"
          >
            {{ t('install.later') }}
          </BaseButton>

          <BaseButton
            size="sm"
            class="uppercase w-full md:w-auto"
            @click="onInstall"
          >
            {{ t('install.install') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useInstallPrompt } from '../composables/useInstallPrompt';
import BaseButton from './BaseButton.vue';

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
