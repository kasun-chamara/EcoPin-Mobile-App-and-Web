// Driver · 1 Today's jobs
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_SPACE } from '../../components/BottomNav';
import { Icon } from '../../components/Icon';
import { Card, Pill } from '../../components/ui';
import { countCollectedToday, distanceM, listDriverJobs, timeAgo } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { getCurrentPosition, startDriverTracking, stopDriverTracking } from '../../lib/location';
import { colors } from '../../lib/theme';
import type { Assignment } from '../../lib/types';

export default function Jobs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Assignment[]>([]);
  const [done, setDone] = useState(0);
  const [onDuty, setOnDuty] = useState(false);
  const [me, setMe] = useState<{ lat: number; lng: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      listDriverJobs(profile.id).then(setJobs).catch(() => {});
      countCollectedToday(profile.id).then(setDone).catch(() => {});
      getCurrentPosition().then((p) => p && setMe(p)).catch(() => {});
    }, [profile]),
  );

  const toggleDuty = async (v: boolean) => {
    setOnDuty(v);
    if (!profile) return;
    if (v) setOnDuty(await startDriverTracking(profile.id));
    else await stopDriverTracking();
  };

  const total = done + jobs.length;
  const next = jobs[0];
  const dist = (a: Assignment) => (me && a.pin ? distanceM(me.lat, me.lng, a.pin.lat, a.pin.lng) / 1000 : 2.4);

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: NAV_SPACE }}>
      <LinearGradient colors={['#0E7A55', '#0A5E42']} style={[styles.hero, { paddingTop: insets.top + 14 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20 }}>
          <View style={styles.av}><Text style={{ color: colors.green600, fontWeight: '800', fontSize: 16 }}>{(profile?.full_name ?? 'D').split(' ').map((s) => s[0]).join('').slice(0, 2)}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.white, fontWeight: '800', fontSize: 16 }}>{profile?.full_name}</Text>
            <Text style={{ color: '#D6F2E4', fontWeight: '600', fontSize: 12 }}>{profile?.truck_no} · Kalutara UC</Text>
          </View>
          <View style={styles.duty}>
            <Switch value={onDuty} onValueChange={toggleDuty} trackColor={{ true: colors.green600, false: '#C5D1C9' }} />
            <Text style={{ color: colors.green800, fontWeight: '800', fontSize: 13 }}>{t('driver.onDuty')}</Text>
          </View>
        </View>
        <View style={{ paddingHorizontal: 20, marginTop: 22, gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            <Text style={{ fontSize: 56, fontWeight: '800', color: colors.white }}>{done}<Text style={{ color: '#9FDDBE' }}>/{total}</Text></Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#D6F2E4' }}>{t('driver.collectedToday')}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {Array.from({ length: total }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < done ? colors.white : i === done ? colors.gold : '#3E9B76' }} />
            ))}
          </View>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, marginTop: -40, gap: 14 }}>
        {next?.pin ? (
          <Card style={{ padding: 18, gap: 14, borderRadius: 26 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: colors.green600 }}>{t('driver.next', { n: next.stop_order ?? 1 })}</Text>
              <Pill label={t('driver.waitingFor', { t: timeAgo(next.pin.created_at) })} color={colors.amberDark} bg={colors.amberSoft} />
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>{next.pin.address ?? next.pin.code}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.muted }}>{t(`size.${next.pin.size}`)} · {next.pin.waste_types.map((w) => t(`waste.${w}`)).join(', ')}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={styles.metric}><Text style={styles.metricBig}>{dist(next).toFixed(1)}<Text style={styles.metricUnit}> km</Text></Text></View>
              <View style={styles.metric}><Text style={styles.metricBig}>{Math.max(1, Math.round((dist(next) / 22) * 60))}<Text style={styles.metricUnit}> min</Text></Text></View>
            </View>
            <Pressable onPress={() => router.push(`/driver/navigate/${next.id}`)} style={styles.start}>
              <Text style={{ color: colors.white, fontSize: 19, fontWeight: '800' }}>{t('driver.start')}</Text>
              <View style={styles.startIcon}><Icon name="go" size={26} color={colors.green600} fill={colors.green600} /></View>
            </Pressable>
          </Card>
        ) : (
          <Card><Text style={{ color: colors.muted }}>{t('driver.noJobs')}</Text></Card>
        )}

        {jobs.length > 1 ? <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink, paddingHorizontal: 4 }}>{t('driver.upNext')}</Text> : null}
        {jobs.slice(1).map((j) => (
          <Pressable key={j.id} onPress={() => router.push(`/driver/navigate/${j.id}`)} style={styles.row}>
            <View style={styles.stop}><Text style={{ color: colors.green800, fontWeight: '800' }}>{j.stop_order ?? '–'}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: colors.ink }}>{j.pin?.address ?? j.pin?.code}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.muted }}>{j.pin ? t(`size.${j.pin.size}`) : ''}</Text>
            </View>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink2 }}>{dist(j).toFixed(1)} km</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { height: 290, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  av: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  duty: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 12, borderRadius: 999, backgroundColor: colors.white },
  metric: { flex: 1, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.mintSoft },
  metricBig: { fontSize: 28, fontWeight: '800', color: colors.green800 },
  metricUnit: { fontSize: 15, color: colors.ink2 },
  start: { height: 76, borderRadius: 22, backgroundColor: colors.green600, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 24, paddingRight: 10 },
  startIcon: { width: 56, height: 56, borderRadius: 17, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, backgroundColor: colors.white, borderRadius: 18 },
  stop: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.mintSoft, alignItems: 'center', justifyContent: 'center' },
});
