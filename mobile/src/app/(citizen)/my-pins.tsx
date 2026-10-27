// Citizen · 4 My pins & tracking
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NAV_SPACE } from '../../components/BottomNav';
import { Icon } from '../../components/Icon';
import { Card, Pill } from '../../components/ui';
import { distanceM, getDriverLocation, listMyPins } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { colors, type PinStatus } from '../../lib/theme';
import type { Pin } from '../../lib/types';

const STEPS: PinStatus[] = ['reported', 'verified', 'on_the_way', 'collected'];
type Tab = 'all' | 'active' | 'cleaned';

export default function MyPins() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [pins, setPins] = useState<Pin[]>([]);
  const [tab, setTab] = useState<Tab>('active');
  const [truck, setTruck] = useState<{ km: number; min: number } | null>(null);

  const load = useCallback(() => {
    if (profile) listMyPins(profile.id).then(setPins).catch(() => {});
  }, [profile]);
  useFocusEffect(load);

  const active = pins.find((p) => p.status !== 'collected' && p.status !== 'rejected');

  // live truck distance for the active pin
  useEffect(() => {
    if (!active) return;
    const update = async () => {
      const d = await getDriverLocation(active.id).catch(() => null);
      if (!d) return setTruck(null);
      const km = distanceM(d.lat, d.lng, active.lat, active.lng) / 1000;
      setTruck({ km: Math.round(km * 10) / 10, min: Math.max(1, Math.round((km / 22) * 60)) });
    };
    update();
    if (!isSupabaseConfigured) return;
    const ch = supabase
      .channel(`pin-${active.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_locations' }, update)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pins', filter: `id=eq.${active.id}` }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [active?.id, load]);

  const cleaned = pins.filter((p) => p.status === 'collected');
  const shown = tab === 'all' ? pins : tab === 'active' ? pins.filter((p) => p.status !== 'collected') : cleaned;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: NAV_SPACE }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: colors.ink }}>{t('mypins.title')}</Text>
          <Pill label={t('mypins.cleanedOf', { a: cleaned.length, b: pins.length })} color={colors.green800} bg={colors.mintSoft} />
        </View>

        <View style={styles.seg}>
          {(['all', 'active', 'cleaned'] as Tab[]).map((k) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[styles.segBtn, tab === k && styles.segOn]} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
              <Text style={{ fontWeight: tab === k ? '800' : '600', color: tab === k ? colors.ink : '#4F6158', fontSize: 13 }}>{t(`mypins.${k}`)}</Text>
            </Pressable>
          ))}
        </View>

        {active && tab !== 'cleaned' ? (
          <Card style={{ padding: 0, overflow: 'hidden' }}>
            <View style={{ height: 96, backgroundColor: '#EEF6F1', justifyContent: 'flex-end', padding: 12 }}>
              {truck ? <Pill label={t('mypins.truck', truck)} color={colors.white} bg="#1F5FBF" dot={colors.white} /> : null}
            </View>
            <View style={{ padding: 16, gap: 14 }}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: '800', color: colors.ink }}>{active.address ?? active.code}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>#{active.code} · {t(`size.${active.size}`)} · {active.waste_types.map((w) => t(`waste.${w}`)).join(', ')}</Text>
              </View>
              {STEPS.map((s, i) => {
                const reached = STEPS.indexOf(active.status === 'assigned' ? 'verified' : active.status) >= i;
                const current = STEPS[STEPS.indexOf(active.status === 'assigned' ? 'verified' : active.status)] === s;
                return (
                  <View key={s} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                    <View style={[styles.dot, reached && { backgroundColor: current ? colors.white : colors.green600, borderColor: current ? colors.blue : colors.green600, borderWidth: current ? 6 : 0 }]}>
                      {reached && !current ? <Icon name="check" size={12} color={colors.white} strokeWidth={3.5} /> : null}
                    </View>
                    <Text style={{ flex: 1, fontSize: 13, fontWeight: current ? '800' : '700', color: current ? '#1F5FBF' : reached ? colors.ink : '#6A7B72' }}>{t(`status.${s}`)}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : null}

        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>{t('mypins.earlier')}</Text>
        {shown.length === 0 ? <Text style={{ color: colors.muted }}>{t('mypins.empty')}</Text> : null}
        {shown.filter((p) => p.id !== active?.id || tab === 'cleaned').map((p) => (
          <Pressable key={p.id} onPress={() => p.status === 'collected' && router.push(`/collected/${p.id}`)} style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: p.status === 'collected' ? colors.mintBg : colors.amberSoft }]}>
              <Icon name={p.status === 'collected' ? 'check' : 'clock'} size={20} color={p.status === 'collected' ? colors.green600 : colors.amberDark} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: colors.ink }}>{p.address ?? p.code}</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{new Date(p.created_at).toLocaleDateString()}</Text>
            </View>
            <Pill label={t(`status.${p.status}`)} color={p.status === 'collected' ? colors.green800 : colors.amberDark} bg={p.status === 'collected' ? colors.mintSoft : colors.amberSoft} />
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  seg: { flexDirection: 'row', gap: 6, padding: 4, backgroundColor: '#E6ECE7', borderRadius: 14 },
  segBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.white },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C5D1C9', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, backgroundColor: colors.white, borderRadius: 16 },
  rowIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
