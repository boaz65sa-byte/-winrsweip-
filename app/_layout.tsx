import { StripeProvider } from '@stripe/stripe-react-native';
import * as Notifications from 'expo-notifications';
import { Tabs, useRouter } from "expo-router";
import { createContext, useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { registerForPushNotifications, savePushToken } from '../lib/notifications';
import { supabase } from "../lib/supabase";

export const ThemeContext = createContext({
  dark: true,
  toggle: () => {},
  bg: '#0D0D0D',
  card: '#1A1A1A',
  text: '#FFFFFF',
  sub: '#666666',
  border: '#2A2A2A',
  input: '#111111',
  user: null as any,
  isAdmin: false,
});

const ADMIN_EMAIL = 'boaz65sa@gmail.com';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready || !user) return;

    registerForPushNotifications().then(token => {
      if (token) savePushToken(token);
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('התראה:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.screen) router.push(data.screen);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [ready, user]);

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace('/login');
  }, [ready, user]);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const theme = {
    dark,
    toggle: () => setDark(d => !d),
    bg: dark ? '#0D0D0D' : '#F5F0EB',
    card: dark ? '#1A1A1A' : '#FFFFFF',
    text: dark ? '#FFFFFF' : '#1A1A1A',
    sub: dark ? '#666666' : '#888888',
    border: dark ? '#2A2A2A' : '#E8E8E8',
    input: dark ? '#111111' : '#F0EDE8',
    user,
    isAdmin,
  };

  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''}>
    <ThemeContext.Provider value={theme}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: dark ? '#111' : '#FFFFFF',
            borderTopColor: dark ? '#1E1E1E' : '#EEEEEE',
            borderTopWidth: 1,
            paddingBottom: 12,
            paddingTop: 8,
            height: 72,
          },
          tabBarActiveTintColor: '#FF4D1C',
          tabBarInactiveTintColor: dark ? '#444' : '#BBBBBB',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'מכרזים',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚡</Text>,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'חיפוש',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🔍</Text>,
          }}
        />
        <Tabs.Screen
          name="sell"
          options={{
            title: 'פרסם',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>＋</Text>,
          }}
        />
        <Tabs.Screen
          name="won"
          options={{
            title: 'זכיות',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🏆</Text>,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'פרופיל',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>👤</Text>,
          }}
        />
        <Tabs.Screen name="listing" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="chat" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="terms" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="privacy" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="seller" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="admin" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="users" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen name="payment" options={{ href: null, tabBarItemStyle: { display: 'none' } }} />
        <Tabs.Screen
          name="login"
          options={{
            href: null,
            tabBarStyle: { display: 'none' },
            tabBarItemStyle: { display: 'none' },
          }}
        />
      </Tabs>
      </ThemeContext.Provider>
      </StripeProvider>
  );
}