<template>
  <div
    class="pt-4 border-t border-accent-100 dark:border-accent-900 text-center"
  >
    <p
      class="text-[10px] text-accent-400 dark:text-accent-500 uppercase tracking-widest space-x-2"
    >
      <RouterLink
        to="/legal"
        class="hover:text-accent-700 dark:hover:text-accent-300 transition-colors underline-offset-2 underline"
      >
        {{ t('footer.legal') }}
      </RouterLink>
      <span>·</span>
      <RouterLink
        to="/privacy"
        class="hover:text-accent-700 dark:hover:text-accent-300 transition-colors underline-offset-2 underline"
      >
        {{ t('footer.privacy') }}
      </RouterLink>
    </p>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
