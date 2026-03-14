<template>
  <div class="min-h-dvh bg-black text-led font-mono overflow-y-auto">
    <div class="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <!-- Nav back -->
      <RouterLink
        to="/"
        class="inline-flex items-center gap-2 text-xs text-led/50 hover:text-led transition-colors uppercase tracking-widest"
      >
        ← {{ t('legal.back') }}
      </RouterLink>

      <!-- Language toggle -->
      <div class="flex gap-3">
        <button
          v-for="loc in SUPPORTED_LOCALES"
          :key="loc"
          class="text-xs uppercase tracking-widest px-3 py-1 rounded border transition-colors"
          :class="
            locale === loc
              ? 'border-led/60 text-led bg-led/10'
              : 'border-led/20 text-led/40 hover:text-led/60'
          "
          @click="switchLocale(loc)"
        >
          {{ loc }}
        </button>
      </div>

      <h1 class="text-2xl font-bold uppercase tracking-widest glow-sm">
        {{ t('legalNotice.title') }}
      </h1>
      <p class="text-xs text-led/40">
        {{ t('legalNotice.updatedAt', { date: lastUpdated }) }}
      </p>

      <!-- 1. Publisher -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s1.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s1.publishedBy') }}<br />
          <span class="text-led/40">{{ t('legalNotice.s1.nameLabel') }}</span>
          {{ ownerName }}<br />
          <span class="text-led/40">{{ t('legalNotice.s1.emailLabel') }}</span>
          {{ ownerEmail }}
        </p>
      </section>

      <!-- 2. Hosting -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s2.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s2.hostedBy') }}<br />
          {{ hostingName }}<br />
          {{ hostingAddress }}
        </p>
      </section>

      <!-- 3. Purpose -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s3.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s3.content') }}
        </p>
      </section>

      <!-- 4. As Is -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s4.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          <I18nT keypath="legalNotice.s4.intro" tag="span">
            <template #asIs>
              <strong>{{ t('legalNotice.s4.asIs') }}</strong>
            </template>
          </I18nT>
        </p>
        <p
          v-if="t('legalNotice.s4.bullets')"
          class="text-sm text-led/70 leading-relaxed whitespace-pre-line"
        >
          {{ t('legalNotice.s4.bullets') }}
        </p>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s4.closing') }}
        </p>
      </section>

      <!-- 5. Third-party data -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s5.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          <I18nT keypath="legalNotice.s5.intro" tag="span">
            <template #thirdParty>
              <strong>{{ t('legalNotice.s5.thirdParty') }}</strong>
            </template>
          </I18nT>
        </p>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s5.content') }}
        </p>
      </section>

      <!-- 6. Non-commercial -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s6.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          <I18nT keypath="legalNotice.s6.intro" tag="span">
            <template #strictlyPersonal>
              <strong>{{ t('legalNotice.s6.strictlyPersonal') }}</strong>
            </template>
          </I18nT>
        </p>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s6.content') }}
        </p>
      </section>

      <!-- 7. Intellectual property -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s7.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s7.content') }}
        </p>
      </section>

      <!-- 8. Law -->
      <section class="space-y-2">
        <h2 class="text-sm font-bold uppercase tracking-widest text-led/80">
          {{ t('legalNotice.s8.title') }}
        </h2>
        <p class="text-sm text-led/70 leading-relaxed">
          {{ t('legalNotice.s8.content') }}
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useI18n, I18nT } from 'vue-i18n';
import { setLocale, SUPPORTED_LOCALES, type Locale } from '../i18n';

const { t, locale } = useI18n();

function switchLocale(loc: string) {
  setLocale(loc as Locale);
}

const ownerName = '[PRÉNOM NOM]';
const ownerEmail = '[EMAIL]';
const hostingName = '[NOM HÉBERGEUR]';
const hostingAddress = '[ADRESSE HÉBERGEUR]';

const lastUpdated = computed(() =>
  new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date('2026-03-14')),
);
</script>
