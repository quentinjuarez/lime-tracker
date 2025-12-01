import { ref, onMounted, onUnmounted } from 'vue';

export interface LimeBike {
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved?: number;
  is_disabled?: number;
  vehicle_type_id?: string;
  distance?: number; // meters
}

const USER_LAT = 48.8811315;
const USER_LNG = 2.3886633;

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
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

export function useLimeBikes(opts?: {
  pollInterval?: number;
  proxyBase?: string;
}) {
  const bikes = ref<LimeBike[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const pollInterval = opts?.pollInterval ?? 60000; // 60s default
  const proxyBase = opts?.proxyBase ?? '';

  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  async function fetchOnce() {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`${proxyBase}/lime/free_bike_status`);
      if (!res.ok) throw new Error('fetch failed: ' + res.status);
      const json = await res.json();

      const list = (json.data?.bikes || []).map((b: any) => {
        const lat = Number(b.lat);
        const lon = Number(b.lon);
        const distance = haversineDistance(USER_LAT, USER_LNG, lat, lon);
        const bike: LimeBike = {
          bike_id: b.bike_id,
          lat,
          lon,
          is_reserved: b.is_reserved,
          is_disabled: b.is_disabled,
          vehicle_type_id: b.vehicle_type_id,
          distance,
        };
        return bike;
      });

      bikes.value = list
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, 10);
    } catch (err: any) {
      console.error(err);
      error.value = err?.message ?? String(err);
    } finally {
      loading.value = false;
    }
  }

  function scheduleNext() {
    if (stopped) return;
    timer = setTimeout(async () => {
      await fetchOnce();
      scheduleNext();
    }, pollInterval);
  }

  onMounted(async () => {
    stopped = false;
    await fetchOnce();
    scheduleNext();
  });

  onUnmounted(() => {
    stopped = true;
    if (timer) clearTimeout(timer);
  });

  return { bikes, loading, error, refresh: fetchOnce };
}
