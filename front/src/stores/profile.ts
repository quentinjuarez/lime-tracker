import { defineStore } from 'pinia';
import {
  type ProfileData,
  type ProfileMode,
  type Provider,
  createDefaultProfile,
  FILTER_BOUNDS,
  UNSET,
} from '../types';

export interface ProfileStoreState {
  profiles: ProfileData[];
  activeProfileId: string | null;
}

export const useProfileStore = defineStore('profile', {
  state: (): ProfileStoreState => ({
    profiles: [],
    activeProfileId: null,
  }),

  getters: {
    activeProfile(): ProfileData | null {
      if (!this.activeProfileId) return null;
      return this.profiles.find((p) => p.id === this.activeProfileId) ?? null;
    },
    geoProfile(): ProfileData | null {
      return this.profiles.find((p) => p.mode === 'geolocation') ?? null;
    },
    customProfile(): ProfileData | null {
      return this.profiles.find((p) => p.mode === 'custom') ?? null;
    },
    hasActiveProfile(): boolean {
      return this.activeProfile !== null;
    },
    hasPosition(): boolean {
      return this.activeProfile?.lat != null && this.activeProfile?.lng != null;
    },
  },

  actions: {
    // ── Profile management ───────────────────────────────────────────

    /** Create (or reuse) the profile for the given mode and activate it. */
    ensureProfile(mode: ProfileMode): ProfileData {
      const existing = this.profiles.find((p) => p.mode === mode);
      if (existing) {
        this.activeProfileId = existing.id;
        return existing;
      }
      const name = mode === 'geolocation' ? 'GPS' : 'Custom';
      const profile = createDefaultProfile(name, mode);
      this.profiles.push(profile);
      this.activeProfileId = profile.id;
      return profile;
    },

    selectProfile(id?: string) {
      if (!id) return;
      if (this.profiles.some((p) => p.id === id)) {
        this.activeProfileId = id;
      }
    },

    // ── Active profile mutations ─────────────────────────────────────

    setPosition(lat: number, lng: number) {
      const p = this.activeProfile;
      if (!p) return;
      p.lat = lat;
      p.lng = lng;
    },

    toggleProvider(provider: Provider) {
      const p = this.activeProfile;
      if (!p) return;
      const idx = p.providers.indexOf(provider);
      if (idx === -1) {
        p.providers.push(provider);
      } else if (p.providers.length > 1) {
        p.providers.splice(idx, 1);
      }
    },

    setLimit(value: number) {
      const p = this.activeProfile;
      if (!p) return;
      const b = FILTER_BOUNDS.limit;
      p.limit = Math.max(b.min, Math.min(b.max, value));
    },

    setMaxDistance(value: number) {
      const p = this.activeProfile;
      if (!p) return;
      const b = FILTER_BOUNDS.maxDistance;
      p.maxDistance =
        value === UNSET ? UNSET : Math.max(0, Math.min(b.max, value));
    },

    setMinBattery(value: number) {
      const p = this.activeProfile;
      if (!p) return;
      const b = FILTER_BOUNDS.minBattery;
      p.minBattery =
        value === UNSET ? UNSET : Math.max(0, Math.min(b.max, value));
    },

    setPollInterval(value: number) {
      const p = this.activeProfile;
      if (!p) return;
      const b = FILTER_BOUNDS.pollInterval;
      p.pollInterval = Math.max(b.min, Math.min(b.max, value));
    },

    resetActiveProfile() {
      const p = this.activeProfile;
      if (!p) return;
      const defaults = createDefaultProfile(p.name, p.mode);
      Object.assign(p, { ...defaults, id: p.id });
    },
  },

  persist: true,
});
