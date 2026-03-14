<template>
  <RouterView />
  <InstallBanner />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { useTheme } from './composables/useTheme';
import InstallBanner from './components/InstallBanner.vue';

useTheme();
</script>
