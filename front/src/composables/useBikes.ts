import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useProfileStore } from '../stores/profile';
import { type Bike, type Provider, VEHICLE_TYPES, UNSET } from '../types';

// Re-export for convenience
export type { Bike, Provider } from '../types';

export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371e3;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useBikes(opts?: { proxyBase?: string }) {
  const store = useProfileStore();
  const bikes = ref<Bike[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const nextRefresh = ref(0);
  const active = ref(false);

  const proxyBase = opts?.proxyBase ?? '';

  let timer: ReturnType<typeof setTimeout> | null = null;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  async function fetchProvider(
    provider: Provider,
    userLat: number,
    userLng: number,
  ): Promise<Bike[]> {
    const res = await fetch(`${proxyBase}/${provider}/free_bike_status`);
    if (!res.ok) throw new Error(`${provider} fetch failed: ${res.status}`);
    const json = await res.json();

    return (json.data?.bikes || []).map((b: any) => {
      const lat = Number(b.lat);
      const lon = Number(b.lon);
      const distance = haversineDistance(userLat, userLng, lat, lon);
      const vtId = b.vehicle_type_id as string | undefined;
      const vtInfo = vtId ? VEHICLE_TYPES[vtId] : undefined;
      const max_range_meters = vtInfo?.max_range_meters;
      const current_range_meters =
        b.current_range_meters != null
          ? Number(b.current_range_meters)
          : undefined;
      const battery_percent =
        b.current_fuel_percent != null
          ? Math.min(100, Math.round(Number(b.current_fuel_percent) * 100))
          : current_range_meters != null && max_range_meters
            ? Math.min(
                100,
                Math.round((current_range_meters / max_range_meters) * 100),
              )
            : undefined;
      return {
        bike_id: b.bike_id,
        lat,
        lon,
        is_reserved: b.is_reserved,
        is_disabled: b.is_disabled,
        vehicle_type_id: vtId,
        form_factor: vtInfo?.form_factor,
        current_range_meters,
        max_range_meters,
        battery_percent,
        distance,
        provider,
      } satisfies Bike;
    });
  }

  async function fetchOnce() {
    if (!store.hasPosition) {
      bikes.value = [];
      return;
    }

    const userLat = store.lat!;
    const userLng = store.lng!;

    loading.value = true;
    error.value = null;
    try {
      const results = await Promise.allSettled(
        store.providers.map((p) => fetchProvider(p, userLat, userLng)),
      );

      const all: Bike[] = [];
      const errors: string[] = [];

      for (const [i, result] of results.entries()) {
        if (result.status === 'fulfilled') {
          all.push(...result.value);
        } else {
          errors.push(
            `${store.providers[i]}: ${result.reason?.message ?? result.reason}`,
          );
        }
      }

      if (errors.length && !all.length) {
        throw new Error(errors.join('; '));
      }

      let filtered = all;

      // Max distance filter (-1 = unlimited)
      if (store.maxDistance !== UNSET && store.maxDistance > 0) {
        filtered = filtered.filter(
          (b) => b.distance != null && b.distance <= store.maxDistance,
        );
      }

      // Min battery filter (-1 = any)
      if (store.minBattery !== UNSET && store.minBattery > 0) {
        filtered = filtered.filter(
          (b) =>
            b.battery_percent != null && b.battery_percent >= store.minBattery,
        );
      }

      bikes.value = filtered
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, store.limit);
    } catch (err: any) {
      console.error(err);
      error.value = err?.message ?? String(err);
    } finally {
      loading.value = false;
    }
  }

  function clearTimers() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function scheduleNext() {
    if (stopped || !active.value) return;
    if (!store.hasPosition) return;
    const intervalMs = store.pollInterval * 1000;
    nextRefresh.value = store.pollInterval;
    timer = setTimeout(async () => {
      await fetchOnce();
      scheduleNext();
    }, intervalMs);
  }

  function startPolling() {
    if (active.value) return;
    active.value = true;
    stopped = false;
    fetchOnce().then(() => scheduleNext());

    countdownTimer = setInterval(() => {
      if (nextRefresh.value > 0) {
        nextRefresh.value -= 1;
      }
    }, 1000);
  }

  function stopPolling() {
    active.value = false;
    stopped = true;
    clearTimers();
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    bikes.value = [];
    nextRefresh.value = 0;
  }

  // Watch for store changes → restart if ready
  watch(
    () =>
      store.hasPosition
        ? [
            store.lat,
            store.lng,
            store.providers,
            store.limit,
            store.maxDistance,
            store.minBattery,
            store.pollInterval,
          ]
        : null,
    (val) => {
      if (!val) {
        stopPolling();
        return;
      }
      // Restart
      stopPolling();
      startPolling();
    },
    { deep: true },
  );

  onMounted(() => {
    if (store.hasPosition) {
      startPolling();
    }
  });

  onUnmounted(() => {
    stopPolling();
  });

  return { bikes, loading, error, nextRefresh, active };
}
