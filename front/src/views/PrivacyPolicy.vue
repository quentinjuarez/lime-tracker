<template>
  <div class="min-h-dvh bg-black text-led font-mono overflow-y-auto">
    <div class="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-xs text-led/50 hover:text-led transition-colors uppercase tracking-widest"
      >
        {{ t('legal.back') }}
      </RouterLink>

      <LanguageSwitcher />

      <h1 class="text-2xl font-bold uppercase tracking-widest">
        {{ t('privacy.title') }}
      </h1>
      <p class="text-xs text-led/55">
        {{ t('privacy.updatedAt', { date: lastUpdated }) }}
      </p>

      <!-- 1. General principle -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s1.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          {{ t('privacy.s1.content') }}
        </p>
      </section>

      <!-- 2. Geolocation -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s2.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          <I18nT keypath="privacy.s2.intro" tag="span">
            <template #solelyToCentre>
              <strong>{{ t('privacy.s2.solelyToCentre') }}</strong>
            </template>
          </I18nT>
        </p>
        <p class="text-sm text-led/80 leading-relaxed">
          <I18nT keypath="privacy.s2.p2" tag="span">
            <template #locally>
              <strong>{{ t('privacy.s2.locally') }}</strong>
            </template>
            <template #neverSent>
              <strong>{{ t('privacy.s2.neverSent') }}</strong>
            </template>
          </I18nT>
        </p>
      </section>

      <!-- 3. Local storage -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s3.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          <I18nT keypath="privacy.s3.intro" tag="span">
            <template #localStorage>
              <strong>{{ t('privacy.s3.localStorage') }}</strong>
            </template>
          </I18nT>
        </p>
        <p class="text-sm text-led/80 leading-relaxed">
          {{ t('privacy.s3.content') }}
        </p>
      </section>

      <!-- 4. Cookies -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s4.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          <I18nT keypath="privacy.s4.intro" tag="span">
            <template #noCookies>
              <strong>{{ t('privacy.s4.noCookies') }}</strong>
            </template>
          </I18nT>
        </p>
      </section>

      <!-- 5. Third-party APIs -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s5.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          <strong>{{ t('privacy.s5.gbfsLabel') }}</strong>
          {{ t('privacy.s5.gbfsContent') }}
        </p>
        <p class="text-sm text-led/80 leading-relaxed">
          <strong>{{ t('privacy.s5.mapLabel') }}</strong>
          {{ t('privacy.s5.mapContent') }}
        </p>
      </section>

      <!-- 6. Security -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s6.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          {{ t('privacy.s6.content') }}
        </p>
      </section>

      <!-- 7. GDPR -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/90">
          {{ t('privacy.s7.title') }}
        </h2>
        <p class="text-sm text-led/80 leading-relaxed">
          {{ t('privacy.s7.content', { email: ownerEmail }) }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n, I18nT } from 'vue-i18n';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t, locale } = useI18n();

const ownerEmail = 'contact@quentinjuarez.dev';

const lastUpdated = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date('2026-03-14')),
);
</script>
