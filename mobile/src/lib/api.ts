// Data access. Every function works against Supabase when keys are set, otherwise against demo data.
import { isSupabaseConfigured, supabase } from './supabase';
import { demoAssignments, demoDriverLocation, demoPins, demoStats } from './mock';
import type { Assignment, DailyStats, NewPin, Pin } from './types';

const memory = { pins: [...demoPins], assignments: [...demoAssignments] };

export async function listPins(): Promise<Pin[]> {
  if (!isSupabaseConfigured) return memory.pins;
  const { data, error } = await supabase
    .from('pins_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(300);
  if (error) throw error;
  return (data ?? []) as Pin[];
}

export async function listMyPins(userId: string): Promise<Pin[]> {
  if (!isSupabaseConfigured) return memory.pins.filter((p) => p.user_id === 'demo-citizen');
  const { data, error } = await supabase
    .from('pins_view')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Pin[];
}

export async function getPin(id: string): Promise<Pin | null> {
  if (!isSupabaseConfigured) return memory.pins.find((p) => p.id === id) ?? null;
  const { data, error } = await supabase.from('pins_view').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Pin;
}

export async function pinsNear(lat: number, lng: number, radiusM = 50): Promise<Pin[]> {
  if (!isSupabaseConfigured) return memory.pins.filter((p) => p.status !== 'collected' && distanceM(lat, lng, p.lat, p.lng) < radiusM);
  const { data, error } = await supabase.rpc('pins_near', { lat, lng, radius_m: radiusM });
  if (error) throw error;
  return (data ?? []) as Pin[];
}

export async function getDailyStats(councilId?: string | null): Promise<DailyStats> {
  if (!isSupabaseConfigured) return demoStats;
  let q = supabase.from('daily_stats').select('cleaned_today, waiting');
  if (councilId) q = q.eq('council_id', councilId);
  const { data, error } = await q;
  if (error) throw error;
  const rows = (data ?? []) as { cleaned_today: number; waiting: number }[];
  const { count } = await supabase
    .from('assignments')
    .select('driver_id', { count: 'exact', head: true })
    .is('collected_at', null);
  return {
    cleaned_today: rows.reduce((s, r) => s + Number(r.cleaned_today), 0),
    waiting: rows.reduce((s, r) => s + Number(r.waiting), 0),
    trucks_out: count ?? 0,
  };
}

async function uploadPhoto(uri: string, userId: string): Promise<string> {
  const res = await fetch(uri);
  const body = await res.arrayBuffer();
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabase.storage.from('pin-photos').upload(path, body, { contentType: 'image/jpeg' });
  if (error) throw error;
  return supabase.storage.from('pin-photos').getPublicUrl(path).data.publicUrl;
}

export async function createPin(input: NewPin, userId: string): Promise<Pin> {
  if (!isSupabaseConfigured) {
    const pin: Pin = {
      id: `p${Date.now()}`,
      code: `EP-${Math.floor(Math.random() * 9000 + 1000)}`,
      user_id: 'demo-citizen',
      lat: input.lat,
      lng: input.lng,
      address: input.address,
      photo_urls: input.photoUris,
      waste_types: input.wasteTypes,
      size: input.size,
      note: input.note || null,
      status: 'reported',
      council_id: 'c1',
      votes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    memory.pins = [pin, ...memory.pins];
    return pin;
  }
  const photo_urls = await Promise.all(input.photoUris.map((u) => uploadPhoto(u, userId)));
  const { data, error } = await supabase
    .from('pins')
    .insert({
      user_id: userId,
      anonymous: input.anonymous,
      location: `SRID=4326;POINT(${input.lng} ${input.lat})`,
      address: input.address,
      photo_urls,
      waste_types: input.wasteTypes,
      size: input.size,
      note: input.note || null,
    })
    .select('id')
    .single();
  if (error) throw error;
  return (await getPin(data.id)) as Pin;
}

export async function voteMeToo(pinId: string, userId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    memory.pins = memory.pins.map((p) => (p.id === pinId ? { ...p, votes: p.votes + 1 } : p));
    return;
  }
  const { error } = await supabase.from('pin_votes').insert({ pin_id: pinId, user_id: userId });
  if (error && error.code !== '23505') throw error; // ignore duplicate vote
}

// ---------- Driver ----------
export async function listDriverJobs(driverId: string): Promise<Assignment[]> {
  if (!isSupabaseConfigured) {
    return memory.assignments
      .filter((a) => !a.collected_at)
      .map((a) => ({ ...a, pin: memory.pins.find((p) => p.id === a.pin_id) }));
  }
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('driver_id', driverId)
    .is('collected_at', null)
    .order('stop_order', { ascending: true });
  if (error) throw error;
  const list = (data ?? []) as Assignment[];
  const pins = await Promise.all(list.map((a) => getPin(a.pin_id)));
  return list.map((a, i) => ({ ...a, pin: pins[i] ?? undefined }));
}

export async function countCollectedToday(driverId: string): Promise<number> {
  if (!isSupabaseConfigured) return memory.assignments.filter((a) => a.collected_at).length + 9;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('assignments')
    .select('id', { count: 'exact', head: true })
    .eq('driver_id', driverId)
    .gte('collected_at', start.toISOString());
  return count ?? 0;
}

export async function startRoute(assignmentId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { data } = await supabase
    .from('assignments')
    .update({ started_at: new Date().toISOString() })
    .eq('id', assignmentId)
    .select('pin_id')
    .single();
  if (data) await supabase.from('pins').update({ status: 'on_the_way' }).eq('id', data.pin_id);
}

export async function markCollected(assignmentId: string, afterPhotoUri: string | null, driverId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    memory.assignments = memory.assignments.map((a) => (a.id === assignmentId ? { ...a, collected_at: new Date().toISOString() } : a));
    const a = memory.assignments.find((x) => x.id === assignmentId);
    if (a) memory.pins = memory.pins.map((p) => (p.id === a.pin_id ? { ...p, status: 'collected' } : p));
    return;
  }
  const after_photo_url = afterPhotoUri ? await uploadPhoto(afterPhotoUri, driverId) : null;
  // The database trigger marks the pin collected, notifies the reporter and adds points.
  const { error } = await supabase
    .from('assignments')
    .update({ collected_at: new Date().toISOString(), after_photo_url })
    .eq('id', assignmentId);
  if (error) throw error;
}

export async function getDriverLocation(pinId: string): Promise<{ lat: number; lng: number } | null> {
  if (!isSupabaseConfigured) return demoDriverLocation;
  const { data: a } = await supabase.from('assignments').select('driver_id').eq('pin_id', pinId).maybeSingle();
  if (!a) return null;
  const { data } = await supabase.rpc('driver_latlng', { p_driver: a.driver_id });
  return (data as { lat: number; lng: number } | null) ?? null;
}

export async function saveDriverLocation(driverId: string, lat: number, lng: number, heading?: number | null) {
  if (!isSupabaseConfigured) return;
  await supabase.from('driver_locations').upsert({
    driver_id: driverId,
    location: `SRID=4326;POINT(${lng} ${lat})`,
    heading: heading ?? null,
    updated_at: new Date().toISOString(),
  });
}

// ---------- helpers ----------
export function distanceM(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function timeAgo(isoDate: string): string {
  const mins = Math.max(1, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h`;
  return `${Math.round(h / 24)} d`;
}
