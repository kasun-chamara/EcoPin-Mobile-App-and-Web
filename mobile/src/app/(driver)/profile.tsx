import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { stopDriverTracking } from '../../lib/location';
import { colors } from '../../lib/theme';

export default function DriverProfile() {
  const { t } = useTranslation();
  const { profile, signOut } = useAuth();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, gap: 14 }}>
        <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink }}>{t('driver.profile')}</Text>
        <Card style={{ gap: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{profile?.full_name}</Text>
          <Text style={{ color: colors.muted }}>{profile?.truck_no} · {profile?.phone}</Text>
        </Card>
        <Button variant="outline" title={t('impact.signOut')} onPress={async () => { await stopDriverTracking(); await signOut(); router.replace('/'); }} />
      </View>
    </SafeAreaView>
  );
}
