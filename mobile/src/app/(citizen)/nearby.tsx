// Nearby spots list
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NAV_SPACE } from '../../components/BottomNav';
import { MapPin, toneFor } from '../../components/MapPin';
import { Pill } from '../../components/ui';
import { distanceM, listPins } from '../../lib/api';
import { getCurrentPosition } from '../../lib/location';
import { colors } from '../../lib/theme';
import type { Pin } from '../../lib/types';

export default function Nearby() {
  const { t } = useTranslation();
  const [items, setItems] = useState<(Pin & { d: number })[]>([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [pins, me] = await Promise.all([listPins(), getCurrentPosition().catch(() => null)]);
        const here = me ?? { lat: 6.5912, lng: 79.9573 };
        setItems(pins.map((p) => ({ ...p, d: distanceM(here.lat, here.lng, p.lat, p.lng) })).sort((a, b) => a.d - b.d));
      })().catch(() => {});
    }, []),
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={items}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: NAV_SPACE }}
        ListHeaderComponent={<Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink, marginBottom: 6 }}>{t('nearby.title')}</Text>}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.white, borderRadius: 18 }}>
            <MapPin tone={toneFor(item.status)} done={item.status === 'collected'} size={28} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>{item.address ?? item.code}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{t('nearby.away', { m: Math.round(item.d) })}</Text>
            </View>
            <Pill label={t(`status.${item.status}`)} color={colors.ink2} bg="#F1F5F2" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
