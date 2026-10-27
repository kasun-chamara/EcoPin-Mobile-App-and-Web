import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../lib/theme';

export default function History() {
  const { t } = useTranslation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink }}>{t('driver.history')}</Text>
      <Text style={{ color: colors.muted, marginTop: 8 }}>Collected stops for today will be listed here.</Text>
    </SafeAreaView>
  );
}
