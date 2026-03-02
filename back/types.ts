// ── Generic provider types ──────────────────────────────────────────

export type Provider = 'lime' | 'voi';

export type FormFactor = 'scooter' | 'bicycle';
export type PropulsionType = 'electric' | 'electric_assist' | 'human';

export interface VehicleType {
  vehicle_type_id: string;
  form_factor: FormFactor;
  propulsion_type: PropulsionType;
  name?: string;
  rider_capacity?: number;
  max_range_meters?: number;
}

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

export type LimeVehicleTypeId = '1' | '2' | '3' | '4';

export interface LimeBike extends GbfsBike {
  vehicle_type_id: LimeVehicleTypeId;
  vehicle_type: 'e-bike';
}

// ── Voi-specific ───────────────────────────────────────────────────

export type VoiVehicleTypeId = 'voi_scooter' | 'voi_bike';

export interface VoiBike extends GbfsBike {
  vehicle_type_id: VoiVehicleTypeId;
  rental_uris?: {
    android: string;
    ios: string;
  };
  pricing_plan_id?: string;
}

// ── Vehicle type registries ─────────────────────────────────────────

export const LIME_VEHICLE_TYPES: Record<LimeVehicleTypeId, VehicleType> = {
  '1': {
    vehicle_type_id: '1',
    form_factor: 'scooter',
    propulsion_type: 'electric',
    max_range_meters: 24140,
  },
  '2': {
    vehicle_type_id: '2',
    form_factor: 'scooter',
    propulsion_type: 'electric',
    max_range_meters: 40233,
  },
  '3': {
    vehicle_type_id: '3',
    form_factor: 'bicycle',
    propulsion_type: 'electric_assist',
    max_range_meters: 85000,
  },
  '4': {
    vehicle_type_id: '4',
    form_factor: 'bicycle',
    propulsion_type: 'human',
  },
};

export const VOI_VEHICLE_TYPES: Record<VoiVehicleTypeId, VehicleType> = {
  voi_scooter: {
    vehicle_type_id: 'voi_scooter',
    form_factor: 'scooter',
    propulsion_type: 'electric',
    name: 'scooter',
    rider_capacity: 1,
    max_range_meters: 80000,
  },
  voi_bike: {
    vehicle_type_id: 'voi_bike',
    form_factor: 'bicycle',
    propulsion_type: 'electric_assist',
    name: 'bicycle',
    rider_capacity: 1,
    max_range_meters: 80000,
  },
};
