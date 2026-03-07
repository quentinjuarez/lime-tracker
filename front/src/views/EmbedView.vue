<template>
  <div class="relative w-full h-full overflow-hidden bg-black">
    <!-- Missing params error -->
    <div
      v-if="missingParams"
      class="flex items-center justify-center h-full text-led/80 font-mono text-sm"
    >
      Missing required query params:
      <code class="ml-2 text-led">?lat=…&lng=…</code>
    </div>

    <template v-else>
      <!-- Loading overlay -->
      <!-- <Transition name="fade">
        <div
          v-if="loading"
          class="fixed inset-0 z-900 bg-black/0 backdrop-blur-sm flex items-center justify-center pointer-events-none"
        >
          <SpinnerIcon size="lg" />
        </div>
      </Transition> -->

      <BikeMap :bikes="bikes" :user-lat="store.lat!" :user-lng="store.lng!" />

      <!-- Minimal error toast -->
      <div
        v-if="error"
        class="fixed bottom-4 left-1/2 -translate-x-1/2 z-1000 bg-red-900 text-red-400 text-xs font-mono px-3 py-2 rounded-lg shadow-lg border border-red-800"
      >
        {{ error }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useProfileStore } from '../stores/profile';
import { useBikes } from '../composables/useBikes';
import { applyQueryParams } from '../composables/useQueryParams';
import BikeMap from '../components/BikeMap.vue';
// import SpinnerIcon from '../components/SpinnerIcon.vue';

const store = useProfileStore();
const missingParams = ref(false);

onMounted(() => {
  // vue-router puts query params in route.fullPath; use window.location.search
  // to read the raw query string (works with both history and hash modes)
  const ok = applyQueryParams(window.location.search);
  if (!ok) missingParams.value = true;
});

// loading,
const { bikes, error } = useBikes({
  proxyBase: import.meta.env.VITE_BACK_URL || 'http://localhost:13001',
});
</script>
