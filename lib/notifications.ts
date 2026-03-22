import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications work only on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  try {
    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'f57101c9-eb2a-4ef9-a606-3135388f1218',
    })).data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    return token;
  } catch (e) {
    console.log('Error getting push token:', e);
    return null;
  }
}

export async function savePushToken(token: string) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('users').update({ push_token: token }).eq('id', user.id);
    console.log('Push token saved ✓');
  } catch (e) {
    console.log('Error saving push token:', e);
  }
}

// שלח התראה למשתמש לפי user_id דרך Edge Function
export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    await supabase.functions.invoke('send-notification', {
      body: { user_id: userId, title, body, data: data || {} },
    });
  } catch (e) {
    console.log('notifyUser error:', e);
  }
}

export async function sendPushNotification(expoPushToken: string, title: string, body: string, data?: any) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    }),
  });
}

// bs-simple.com | בועז סעדה - פתרונות יצירתיים
