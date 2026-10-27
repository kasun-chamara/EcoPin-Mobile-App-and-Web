import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { BottomNav } from '../../components/BottomNav';
import { useAuth } from '../../lib/auth';

export default function DriverTabs() {
  const { profile, loading } = useAuth();
  if (!loading && !profile) return <Redirect href="/" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="jobs" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
