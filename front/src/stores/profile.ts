import { defineStore } from 'pinia';
import type { Provider } from '../composables/useBikes';

export interface ProfileState {
  /** User-chosen position (null = use geolocation) */
  lat: number | null;
  lng: number | null;
  /** Active providers */
  providers: Provider[];
  /** Max vehicles to display */
  limit: number;
  /** Max distance in meters (0 = unlimited) */
  maxDistance: number;
  /** Min battery percent (0 = no filter) */
  minBattery: number;
  /** Poll interval in seconds */
  pollInterval: number;
  /** Whether geolocation is enabled */
  useGeolocation: boolean;
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileState => ({
    lat: null,
    lng: null,
    providers: ['lime', 'voi'],
    limit: 20,
    maxDistance: 0,
    minBattery: 0,
    pollInterval: 60,
    useGeolocation: true,
  }),

  getters: {
    hasPosition: (state) => state.lat !== null && state.lng !== null,
  },

  actions: {
    setPosition(lat: number, lng: number) {
      this.lat = lat;
      this.lng = lng;
    },
    toggleProvider(provider: Provider) {
      const idx = this.providers.indexOf(provider);
      if (idx === -1) {
        this.providers.push(provider);
      } else if (this.providers.length > 1) {
        // Keep at least one provider
        this.providers.splice(idx, 1);
      }
    },
    resetToDefaults() {
      this.providers = ['lime', 'voi'];
      this.limit = 20;
      this.maxDistance = 0;
      this.minBattery = 0;
      this.pollInterval = 60;
      this.useGeolocation = true;
      this.lat = null;
      this.lng = null;
    },
  },

  persist: true,
});
