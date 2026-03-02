// ── Generic provider types ──────────────────────────────────────────

export type Provider = 'lime' | 'voi';

export interface GbfsResponse {
  last_updated: number;
  ttl: number;
  version: string;
  data: { bikes: GbfsBike[] };
}

export interface GbfsBike {
  bike_id: string;
  lat: number;
  lon: number;
  is_reserved: boolean;
  is_disabled: boolean;
  current_range_meters?: number;
  vehicle_type_id?: string;
  last_reported?: number;
}

// ── Lime-specific ──────────────────────────────────────────────────

export interface LimeBike extends GbfsBike {
  vehicle_type: 'e-bike';
}

// ── Voi-specific ───────────────────────────────────────────────────

export interface VoiBike extends GbfsBike {
  rental_uris?: {
    android: string;
    ios: string;
  };
  pricing_plan_id?: string;
}

// ── Vehicle types ───────────────────────────────────────────────────

export type FormFactor = 'scooter' | 'bicycle';
export type PropulsionType = 'electric' | 'electric_assist' | 'human';

export interface VehicleType {
  vehicle_type_id: string;
  form_factor: FormFactor;
  propulsion_type: PropulsionType;
  max_range_meters?: number;
  rider_capacity?: number;
  name?: string;
}

export interface VehicleTypesResponse {
  last_updated: number;
  ttl: number;
  version: string;
  data: { vehicle_types: VehicleType[] };
}
