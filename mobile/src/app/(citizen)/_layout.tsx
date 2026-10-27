import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import React from 'react';
import { BottomNav } from '../../components/BottomNav';
import { useAuth } from '../../lib/auth';

export default function CitizenTabs() {
  const { profile, loading } = useAuth();
  if (!loading && !profile) return <Redirect href="/" />;
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomNav {...props} />}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="nearby" />
      <Tabs.Screen name="report" />
      <Tabs.Screen name="my-pins" />
      <Tabs.Screen name="impact" />
    </Tabs>
  );
}
