<template>
  <div class="pt-4 border-t border-led/20 text-center">
    <p
      class="text-[10px] text-led/60 uppercase tracking-widest font-mono space-x-2"
    >
      <RouterLink
        to="/legal"
        class="hover:text-led/80 transition-colors underline-offset-2 underline"
      >
        {{ t('footer.legal') }}
      </RouterLink>
      <span>·</span>
      <RouterLink
        to="/privacy"
        class="hover:text-led/80 transition-colors underline-offset-2 underline"
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
