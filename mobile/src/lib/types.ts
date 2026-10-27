import type { PinStatus } from './theme';

export type Role = 'citizen' | 'driver' | 'officer' | 'admin';
export type Lang = 'si' | 'en' | 'ta';
export type PinSize = 'few_bags' | 'pile' | 'truckload';

export type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  council_id: string | null;
  language: Lang;
  truck_no: string | null;
  points: number;
};

export type Pin = {
  id: string;
  code: string;
  user_id: string | null;
  lat: number;
  lng: number;
  address: string | null;
  photo_urls: string[];
  waste_types: string[];
  size: PinSize;
  note: string | null;
  status: PinStatus;
  council_id: string | null;
  votes: number;
  created_at: string;
  updated_at: string;
};

export type Assignment = {
  id: string;
  pin_id: string;
  driver_id: string;
  stop_order: number | null;
  assigned_at: string;
  started_at: string | null;
  collected_at: string | null;
  after_photo_url: string | null;
  pin?: Pin;
};

export type DailyStats = { cleaned_today: number; waiting: number; trucks_out: number };

export type NewPin = {
  lat: number;
  lng: number;
  address: string | null;
  photoUris: string[];
  wasteTypes: string[];
  size: PinSize;
  note: string;
  anonymous: boolean;
};
