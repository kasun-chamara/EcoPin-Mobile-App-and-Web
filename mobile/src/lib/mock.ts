// Sample data used in demo mode (no Supabase keys) so every screen can be tried right away.
import type { Assignment, DailyStats, Pin } from './types';

const now = Date.now();
const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

export const demoPins: Pin[] = [
  { id: 'p1', code: 'EP-2417', user_id: 'demo-citizen', lat: 6.5912, lng: 79.9573, address: 'Old Galle Road, Kalutara North', photo_urls: [], waste_types: ['household', 'plastic'], size: 'pile', note: 'Near the bus halt', status: 'on_the_way', council_id: 'c1', votes: 3, created_at: iso(140), updated_at: iso(20) },
  { id: 'p2', code: 'EP-2402', user_id: 'other', lat: 6.5951, lng: 79.9612, address: 'Station Road junction', photo_urls: [], waste_types: ['plastic'], size: 'few_bags', note: null, status: 'reported', council_id: 'c1', votes: 1, created_at: iso(60), updated_at: iso(60) },
  { id: 'p3', code: 'EP-2388', user_id: 'other', lat: 6.5866, lng: 79.9545, address: 'Kalido Beach entrance', photo_urls: [], waste_types: ['household'], size: 'pile', note: null, status: 'assigned', council_id: 'c1', votes: 5, created_at: iso(200), updated_at: iso(50) },
  { id: 'p4', code: 'EP-2301', user_id: 'demo-citizen', lat: 6.5980, lng: 79.9520, address: 'Station Road, Kalutara', photo_urls: [], waste_types: ['household'], size: 'pile', note: null, status: 'collected', council_id: 'c1', votes: 2, created_at: iso(60 * 24 * 5), updated_at: iso(60 * 24 * 5 - 190) },
  { id: 'p5', code: 'EP-2255', user_id: 'other', lat: 6.5830, lng: 79.9600, address: 'Temple Road', photo_urls: [], waste_types: ['garden'], size: 'truckload', note: null, status: 'collected', council_id: 'c1', votes: 0, created_at: iso(300), updated_at: iso(30) },
];

export const demoStats: DailyStats = { cleaned_today: 142, waiting: 38, trucks_out: 6 };

export const demoAssignments: Assignment[] = [
  { id: 'a1', pin_id: 'p1', driver_id: 'demo-driver', stop_order: 10, assigned_at: iso(90), started_at: null, collected_at: null, after_photo_url: null },
  { id: 'a2', pin_id: 'p2', driver_id: 'demo-driver', stop_order: 11, assigned_at: iso(80), started_at: null, collected_at: null, after_photo_url: null },
  { id: 'a3', pin_id: 'p3', driver_id: 'demo-driver', stop_order: 12, assigned_at: iso(70), started_at: null, collected_at: null, after_photo_url: null },
];

export const demoDriverLocation = { lat: 6.6010, lng: 79.9650 };

export const demoLeaderboard = [
  { name: 'Nimal R.', initials: 'NR', points: 142 },
  { name: 'You', initials: 'D', points: 120, me: true },
  { name: 'Shifana F.', initials: 'SF', points: 98 },
];
