import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useProfileStore } from '../stores/profile';

export function useGeolocation() {
  const store = useProfileStore();
  const error = ref<string | null>(null);
  const loading = ref(false);
  let watchId: number | null = null;

  function start() {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by your browser';
      return;
    }

    loading.value = true;

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        loading.value = false;
        error.value = null;
        if (store.useGeolocation) {
          store.setPosition(pos.coords.latitude, pos.coords.longitude);
        }
      },
      (err) => {
        loading.value = false;
        switch (err.code) {
          case err.PERMISSION_DENIED:
            error.value =
              'Location access denied. Please enable it in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            error.value = 'Location unavailable';
            break;
          case err.TIMEOUT:
            error.value = 'Location request timed out';
            break;
          default:
            error.value = 'Unknown geolocation error';
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    );
  }

  function stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  }

  // Auto-start/stop when useGeolocation changes
  watch(
    () => store.useGeolocation,
    (enabled) => {
      if (enabled) start();
      else stop();
    },
  );

  onMounted(() => {
    if (store.useGeolocation) start();
  });

  onUnmounted(() => {
    stop();
  });

  return { error, loading };
}
