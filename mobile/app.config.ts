import type { ExpoConfig } from 'expo/config';

// Keys come from .env (see .env.example). Never commit real keys.
const googleMapsKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY ?? '';

const config: ExpoConfig = {
  name: 'EcoPin',
  slug: 'ecopin',
  scheme: 'ecopin',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    bundleIdentifier: 'lk.ecopin.app',
    supportsTablet: false,
    config: { googleMapsApiKey: googleMapsKey },
    infoPlist: {
      UIBackgroundModes: ['location'],
      NSLocationWhenInUseUsageDescription: 'EcoPin uses your location to pin garbage spots and show trucks near you.',
      NSLocationAlwaysAndWhenInUseUsageDescription: 'Drivers share their truck location while on duty so citizens can see it arrive.',
      NSCameraUsageDescription: 'Take a photo of the garbage spot you are reporting.',
    },
  },
  android: {
    package: 'lk.ecopin.app',
    adaptiveIcon: {
      backgroundColor: '#0E7A55',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    config: { googleMaps: { apiKey: googleMapsKey } },
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION', 'FOREGROUND_SERVICE', 'FOREGROUND_SERVICE_LOCATION', 'CAMERA'],
  },
  web: { favicon: './assets/favicon.png' },
  plugins: [
    'expo-router',
    'expo-localization',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission: 'Drivers share their truck location while on duty so citizens can see it arrive.',
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
    ['expo-image-picker', { cameraPermission: 'Take a photo of the garbage spot you are reporting.' }],
    'expo-notifications',
  ],
  experiments: { typedRoutes: true },
  extra: {
    // after `eas init` this holds your project id (needed for push notifications)
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
};

export default config;
