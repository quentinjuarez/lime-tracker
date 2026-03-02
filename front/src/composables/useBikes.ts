import { ref, onMounted, onUnmounted } from 'vue';

export type Provider = 'lime' | 'voi';
export type FormFactor = 'scooter' | 'bicycle';

export interface Bike {
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved?: boolean;
  is_disabled?: boolean;
  vehicle_type_id?: string;
  form_factor?: FormFactor;
  current_range_meters?: number;
  max_range_meters?: number;
  battery_percent?: number;
  distance?: number; // meters
  provider: Provider;
}

// ── Max range lookup per vehicle_type_id ────────────────────────────

const MAX_RANGE: Record<
  string,
  { max_range_meters?: number; form_factor: FormFactor }
> = {
  // Lime
  '1': { form_factor: 'scooter', max_range_meters: 24140 },
  '2': { form_factor: 'scooter', max_range_meters: 40233 },
  '3': { form_factor: 'bicycle', max_range_meters: 85000 },
  '4': { form_factor: 'bicycle' },
  // Voi
  voi_scooter: { form_factor: 'scooter', max_range_meters: 80000 },
  voi_bike: { form_factor: 'bicycle', max_range_meters: 80000 },
};

const USER_LAT = 48.894444;
const USER_LNG = 2.375194;

function haversineDistance(
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

export function useBikes(opts?: {
  providers?: Provider[];
  pollInterval?: number;
  proxyBase?: string;
  limit?: number;
}) {
  const bikes = ref<Bike[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const nextRefresh = ref(0);

  const providers = opts?.providers ?? ['lime', 'voi'];
  const pollInterval = opts?.pollInterval ?? 60000;
  const proxyBase = opts?.proxyBase ?? '';
  const limit = opts?.limit ?? 10;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let countdownTimer: ReturnType<typeof setInterval> | null = null;
  let stopped = false;

  async function fetchProvider(provider: Provider): Promise<Bike[]> {
    const res = await fetch(`${proxyBase}/${provider}/free_bike_status`);
    if (!res.ok) throw new Error(`${provider} fetch failed: ${res.status}`);
    const json = await res.json();

    return (json.data?.bikes || []).map((b: any) => {
      const lat = Number(b.lat);
      const lon = Number(b.lon);
      const distance = haversineDistance(USER_LAT, USER_LNG, lat, lon);
      const vtId = b.vehicle_type_id as string | undefined;
      const vtInfo = vtId ? MAX_RANGE[vtId] : undefined;
      const max_range_meters = vtInfo?.max_range_meters;
      const current_range_meters =
        b.current_range_meters != null
          ? Number(b.current_range_meters)
          : undefined;
      const battery_percent =
        current_range_meters != null && max_range_meters
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
    loading.value = true;
    error.value = null;
    try {
      const results = await Promise.allSettled(
        providers.map((p) => fetchProvider(p)),
      );

      const all: Bike[] = [];
      const errors: string[] = [];

      for (const [i, result] of results.entries()) {
        if (result.status === 'fulfilled') {
          all.push(...result.value);
        } else {
          errors.push(
            `${providers[i]}: ${result.reason?.message ?? result.reason}`,
          );
        }
      }

      if (errors.length && !all.length) {
        throw new Error(errors.join('; '));
      }

      bikes.value = all
        .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
        .slice(0, limit);
    } catch (err: any) {
      console.error(err);
      error.value = err?.message ?? String(err);
    } finally {
      loading.value = false;
    }
  }

  function scheduleNext() {
    if (stopped) return;
    nextRefresh.value = pollInterval / 1000;
    timer = setTimeout(async () => {
      await fetchOnce();
      scheduleNext();
    }, pollInterval);
  }

  onMounted(async () => {
    stopped = false;
    await fetchOnce();
    scheduleNext();

    countdownTimer = setInterval(() => {
      if (nextRefresh.value > 0) {
        nextRefresh.value -= 1;
      }
    }, 1000);
  });

  onUnmounted(() => {
    stopped = true;
    if (timer) clearTimeout(timer);
    if (countdownTimer) clearInterval(countdownTimer);
  });

  return { bikes, loading, error, nextRefresh };
}
