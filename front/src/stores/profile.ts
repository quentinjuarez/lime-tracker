import { defineStore } from 'pinia';
import {
  type ProfileData,
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
    hasActiveProfile(): boolean {
      return this.activeProfile !== null;
    },
    hasPosition(): boolean {
      return this.activeProfile?.lat != null && this.activeProfile?.lng != null;
    },
  },

  actions: {
    // ── Profile CRUD ─────────────────────────────────────────────────

    createProfile(name: string): ProfileData {
      const profile = createDefaultProfile(name);
      this.profiles.push(profile);
      this.activeProfileId = profile.id;
      return profile;
    },

    deleteProfile(id: string) {
      const idx = this.profiles.findIndex((p) => p.id === id);
      if (idx === -1) return;
      this.profiles.splice(idx, 1);
      if (this.activeProfileId === id) {
        this.activeProfileId = this.profiles[0]?.id ?? null;
      }
    },

    selectProfile(id: string) {
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
      const defaults = createDefaultProfile(p.name);
      Object.assign(p, { ...defaults, id: p.id });
    },
  },

  persist: true,
});
