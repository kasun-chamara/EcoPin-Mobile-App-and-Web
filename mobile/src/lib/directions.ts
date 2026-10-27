// Route, distance and time from the driver to a pin.
// With EXPO_PUBLIC_GOOGLE_MAPS_KEY set it uses the Google Directions API; otherwise it estimates.
import { distanceM } from './api';

export type LatLng = { latitude: number; longitude: number };
export type Route = { coords: LatLng[]; distanceKm: number; durationMin: number };

const key = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

export async function getRoute(from: LatLng, to: LatLng): Promise<Route> {
  if (key) {
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json?origin=${from.latitude},${from.longitude}` +
        `&destination=${to.latitude},${to.longitude}&mode=driving&key=${key}`;
      const res = await fetch(url);
      const json = await res.json();
      const r = json.routes?.[0];
      if (r) {
        const leg = r.legs[0];
        return {
          coords: decodePolyline(r.overview_polyline.points),
          distanceKm: leg.distance.value / 1000,
          durationMin: Math.round(leg.duration.value / 60),
        };
      }
    } catch {
      // fall through to the estimate
    }
  }
  const straight = distanceM(from.latitude, from.longitude, to.latitude, to.longitude) / 1000;
  const roadKm = straight * 1.3; // roads are longer than a straight line
  return { coords: [from, to], distanceKm: roadKm, durationMin: Math.max(1, Math.round((roadKm / 22) * 60)) };
}

/** Google encoded polyline -> coordinates. */
export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}
