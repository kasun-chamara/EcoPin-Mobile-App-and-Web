import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { saveDriverLocation } from './api';

export const DRIVER_LOCATION_TASK = 'ecopin-driver-location';

let currentDriverId: string | null = null;

// Must be defined at module scope (imported from the root layout) so it exists when the OS wakes the app.
TaskManager.defineTask<{ locations: Location.LocationObject[] }>(DRIVER_LOCATION_TASK, async ({ data, error }) => {
  if (error || !data || !currentDriverId) return;
  const last = data.locations[data.locations.length - 1];
  if (last) await saveDriverLocation(currentDriverId, last.coords.latitude, last.coords.longitude, last.coords.heading);
});

export async function getCurrentPosition(): Promise<{ lat: number; lng: number; accuracy: number | null } | null> {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  if (!granted) return null;
  const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
  return { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const [a] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    if (!a) return null;
    return [a.street ?? a.name, a.city ?? a.district ?? a.subregion].filter(Boolean).join(', ') || null;
  } catch {
    return null;
  }
}

/** Starts sharing the driver's location in the background while on duty. */
export async function startDriverTracking(driverId: string): Promise<boolean> {
  currentDriverId = driverId;
  const fg = await Location.requestForegroundPermissionsAsync();
  if (!fg.granted) return false;
  const bg = await Location.requestBackgroundPermissionsAsync();
  if (!bg.granted) return false;
  if (await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK)) return true;
  await Location.startLocationUpdatesAsync(DRIVER_LOCATION_TASK, {
    accuracy: Location.Accuracy.Balanced,
    timeInterval: 15_000,
    distanceInterval: 30,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'EcoPin · On duty',
      notificationBody: 'Sharing your truck location with citizens',
    },
  });
  return true;
}

export async function stopDriverTracking() {
  currentDriverId = null;
  if (await Location.hasStartedLocationUpdatesAsync(DRIVER_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(DRIVER_LOCATION_TASK);
  }
}
