import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { isSupabaseConfigured, supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Asks for permission, gets the Expo push token and saves it on the user's profile. */
export async function registerForPush(userId: string): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'EcoPin',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  let granted = current.granted;
  if (!granted) granted = (await Notifications.requestPermissionsAsync()).granted;
  if (!granted) return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  const token = (await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)).data;

  if (isSupabaseConfigured) {
    await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
  }
  return token;
}
