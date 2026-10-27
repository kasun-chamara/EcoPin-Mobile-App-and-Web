import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Without keys the portal shows sample data (demo mode). */
export const isConfigured = url.length > 0 && key.length > 0;
export const supabase = createClient(url || 'https://demo.supabase.co', key || 'demo-key');

export type PortalPin = {
  id: string;
  code: string;
  address: string | null;
  status: string;
  size: string;
  waste_types: string[];
  votes: number;
  created_at: string;
};
export type Driver = { id: string; full_name: string | null; truck_no: string | null };

export const demoPins: PortalPin[] = [
  { id: 'p1', code: 'EP-2417', address: 'Old Galle Road, Kalutara North', status: 'reported', size: 'pile', waste_types: ['household', 'plastic'], votes: 3, created_at: new Date(Date.now() - 8.4e6).toISOString() },
  { id: 'p2', code: 'EP-2402', address: 'Station Road junction', status: 'verified', size: 'few_bags', waste_types: ['plastic'], votes: 1, created_at: new Date(Date.now() - 3.6e6).toISOString() },
  { id: 'p3', code: 'EP-2388', address: 'Kalido Beach entrance', status: 'assigned', size: 'pile', waste_types: ['household'], votes: 5, created_at: new Date(Date.now() - 1.2e7).toISOString() },
  { id: 'p4', code: 'EP-2301', address: 'Temple Road', status: 'collected', size: 'truckload', waste_types: ['garden'], votes: 0, created_at: new Date(Date.now() - 1.8e7).toISOString() },
];
export const demoDrivers: Driver[] = [
  { id: 'd1', full_name: 'Ruwan Perera', truck_no: 'WP LK-4521' },
  { id: 'd2', full_name: 'Kamal Silva', truck_no: 'WP LB-1180' },
];
