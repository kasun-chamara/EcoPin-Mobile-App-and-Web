// Citizen · 2 Home map
import { useFocusEffect, router } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { MapPin, toneFor } from '../../components/MapPin';
import { IconChip } from '../../components/ui';
import { distanceM, getDailyStats, listPins, timeAgo, voteMeToo } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { getCurrentPosition } from '../../lib/location';
import { colors } from '../../lib/theme';
import type { DailyStats, Pin } from '../../lib/types';

const KALUTARA = { latitude: 6.5912, longitude: 79.9573 };
type Filter = 'waiting' | 'truck' | 'cleaned';

export default function Home() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [pins, setPins] = useState<Pin[]>([]);
  const [stats, setStats] = useState<DailyStats>({ cleaned_today: 0, waiting: 0, trucks_out: 0 });
  const [me, setMe] = useState<{ lat: number; lng: number; accuracy: number | null } | null>(null);
  const [filters, setFilters] = useState<Record<Filter, boolean>>({ waiting: true, truck: true, cleaned: true });

  useFocusEffect(
    useCallback(() => {
      listPins().then(setPins).catch(() => {});
      getDailyStats(profile?.council_id).then(setStats).catch(() => {});
      getCurrentPosition().then((p) => p && setMe(p)).catch(() => {});
    }, [profile?.council_id]),
  );

  const visible = pins.filter((p) => {
    if (p.status === 'collected') return filters.cleaned;
    if (p.status === 'assigned' || p.status === 'on_the_way') return filters.truck;
    return filters.waiting;
  });

  const center = me ? { latitude: me.lat, longitude: me.lng } : KALUTARA;
  const nearby = useMemo(() => {
    if (!me) return pins.find((p) => p.status !== 'collected') ?? null;
    return pins
      .filter((p) => p.status !== 'collected')
      .map((p) => ({ p, d: distanceM(me.lat, me.lng, p.lat, p.lng) }))
      .sort((a, b) => a.d - b.d)[0]?.p ?? null;
  }, [pins, me]);
  const nearbyM = nearby && me ? Math.round(distanceM(me.lat, me.lng, nearby.lat, nearby.lng)) : 30;

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} provider={PROVIDER_DEFAULT} showsUserLocation
        initialRegion={{ ...center, latitudeDelta: 0.03, longitudeDelta: 0.03 }}>
        {visible.map((p) => (
          <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lng }} title={p.address ?? p.code}
            description={t(`status.${p.status}`)} anchor={{ x: 0.5, y: 0.9 }}
            onCalloutPress={() => (p.status === 'collected' ? router.push(`/collected/${p.id}`) : undefined)}>
            <MapPin tone={toneFor(p.status)} done={p.status === 'collected'} size={30} />
          </Marker>
        ))}
      </MapView>

      {/* top bar */}
      <View style={[styles.top, { top: insets.top + 12 }]}>
        <View style={styles.nameCard}>
          <View style={styles.avatar}><Text style={{ fontWeight: '800', color: '#0C3E2E', fontSize: 16 }}>{(profile?.full_name ?? 'E')[0]}</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>{t('home.greeting', { name: profile?.full_name ?? '' })}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icon name="pin" size={12} color={colors.green600} strokeWidth={2.4} />
              <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>Kalutara North</Text>
            </View>
          </View>
        </View>
        <Pressable accessibilityLabel="Notifications" style={styles.bell}>
          <Icon name="bell" size={22} color={colors.ink} strokeWidth={2} />
          <View style={styles.bellBadge}><Text style={{ color: colors.white, fontSize: 10, fontWeight: '800' }}>2</Text></View>
        </Pressable>
      </View>

      {/* filters */}
      <View style={[styles.filters, { top: insets.top + 78 }]}>
        {([
          ['waiting', colors.amber, 'filters.waiting'],
          ['truck', colors.blue, 'filters.truck'],
          ['cleaned', colors.green600, 'filters.cleaned'],
        ] as const).map(([k, c, label]) => (
          <Pressable key={k} onPress={() => setFilters((f) => ({ ...f, [k]: !f[k] }))} accessibilityRole="checkbox" accessibilityState={{ checked: filters[k] }}
            style={[styles.chip, !filters[k] && { opacity: 0.5 }]}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.ink }}>{t(label)}</Text>
          </Pressable>
        ))}
      </View>

      {/* locate */}
      <Pressable accessibilityLabel="Center on my location" style={styles.locate}
        onPress={() => mapRef.current?.animateToRegion({ ...center, latitudeDelta: 0.01, longitudeDelta: 0.01 })}>
        <Icon name="locate" size={22} color={colors.green600} strokeWidth={2.2} />
      </Pressable>

      {/* pin here callout */}
      <View style={styles.callout}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.white, fontWeight: '800', fontSize: 13 }}>{t('home.here')}</Text>
          <Text style={{ color: '#A9DCC3', fontSize: 11, fontWeight: '600' }}>{t('home.gps', { m: Math.round(me?.accuracy ?? 5) })}</Text>
        </View>
        <Pressable onPress={() => router.navigate('/report')} style={styles.pinHere}>
          <Icon name="plus" size={15} color="#0C3E2E" strokeWidth={2.6} />
          <Text style={{ fontWeight: '800', fontSize: 12, color: '#0C3E2E' }}>{t('home.pinHere')}</Text>
        </Pressable>
      </View>

      {/* bottom sheet */}
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{t('home.today', { area: 'Kalutara' })}</Text>
          <Text onPress={() => router.navigate('/impact')} style={{ fontSize: 12, fontWeight: '800', color: colors.green600 }}>{t('home.seeImpact')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Stat value={stats.cleaned_today} label={t('home.cleaned')} bg="#E9F7F0" color="#0A5E42" icon="check" from="#34C38A" to="#0E7A55" />
          <Stat value={stats.waiting} label={t('home.waiting')} bg="#FFF4E3" color="#9A4E05" icon="clock" from="#FFC46B" to="#E08A1E" />
          <Stat value={stats.trucks_out} label={t('home.trucks')} bg="#EAF1FD" color="#1F4F99" icon="truck" from="#7DB3FF" to="#1F5FBF" />
        </View>
        {nearby ? (
          <View style={styles.boost}>
            <View style={styles.boostIcon}><Icon name="bag" size={22} color="#B8650E" strokeWidth={2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: colors.ink }}>{t('home.already', { m: nearbyM })}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#6B5A45' }}>{t('home.alreadySub', { n: nearby.votes, ago: timeAgo(nearby.created_at) })}</Text>
            </View>
            <Pressable onPress={async () => { await voteMeToo(nearby.id, profile?.id ?? ''); setPins(await listPins()); }} style={styles.meToo}>
              <Text style={{ fontWeight: '800', fontSize: 12, color: '#3D2000' }}>{t('home.meToo')}</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function Stat({ value, label, bg, color, icon, from, to }: { value: number; label: string; bg: string; color: string; icon: 'check' | 'clock' | 'truck'; from: string; to: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 16, padding: 10, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color }}>{value}</Text>
        <IconChip icon={icon} from={from} to={to} size={28} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: '700', color }}>{label}</Text>
    </View>
  );
}

const shadow = { shadowColor: '#10231B', shadowOpacity: 0.14, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 };
const styles = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 10 },
  nameCard: { flex: 1, height: 54, backgroundColor: colors.white, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 7, paddingRight: 14, ...shadow },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#5BD9A0', alignItems: 'center', justifyContent: 'center' },
  bell: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  bellBadge: { position: 'absolute', top: -2, right: -2, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white },
  filters: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, paddingLeft: 9, paddingRight: 12, borderRadius: 999, backgroundColor: colors.white, ...shadow },
  locate: { position: 'absolute', right: 16, bottom: 470, width: 48, height: 48, borderRadius: 16, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', ...shadow },
  callout: { position: 'absolute', left: 70, right: 70, bottom: 420, backgroundColor: '#10231B', borderRadius: 18, padding: 7, paddingLeft: 13, flexDirection: 'row', alignItems: 'center', gap: 10, ...shadow },
  pinHere: { height: 38, paddingHorizontal: 13, borderRadius: 999, backgroundColor: colors.green400, flexDirection: 'row', alignItems: 'center', gap: 5 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 344, backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingTop: 10, gap: 12, shadowColor: '#10231B', shadowOpacity: 0.12, shadowRadius: 24, shadowOffset: { width: 0, height: -10 }, elevation: 12 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#DCE5DF', alignSelf: 'center' },
  boost: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: '#EEE3D2', backgroundColor: '#FFFCF7' },
  boostIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: '#FDEBD0', alignItems: 'center', justifyContent: 'center' },
  meToo: { height: 40, paddingHorizontal: 13, borderRadius: 999, backgroundColor: colors.amber, alignItems: 'center', justifyContent: 'center' },
});
