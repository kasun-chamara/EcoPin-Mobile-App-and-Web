// Driver · 2 Route to pin (route line, time and distance)
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../../components/Icon';
import { MapPin } from '../../../components/MapPin';
import { Button } from '../../../components/ui';
import { listDriverJobs, startRoute } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { getRoute, type Route } from '../../../lib/directions';
import { getCurrentPosition } from '../../../lib/location';
import { demoDriverLocation } from '../../../lib/mock';
import { colors } from '../../../lib/theme';
import type { Assignment } from '../../../lib/types';

export default function Navigate() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const mapRef = useRef<MapView>(null);
  const [job, setJob] = useState<Assignment | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [from, setFrom] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile || !id) return;
      const jobs = await listDriverJobs(profile.id);
      const j = jobs.find((x) => x.id === id) ?? null;
      setJob(j);
      if (!j?.pin) return;
      const me = (await getCurrentPosition().catch(() => null)) ?? demoDriverLocation;
      const start = { latitude: me.lat, longitude: me.lng };
      setFrom(start);
      const r = await getRoute(start, { latitude: j.pin.lat, longitude: j.pin.lng });
      setRoute(r);
      await startRoute(j.id).catch(() => {});
      mapRef.current?.fitToCoordinates(r.coords, { edgePadding: { top: 140, bottom: 300, left: 60, right: 60 }, animated: true });
    })();
  }, [id, profile]);

  const pin = job?.pin;

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={StyleSheet.absoluteFill} showsUserLocation
        initialRegion={{ latitude: pin?.lat ?? 6.5912, longitude: pin?.lng ?? 79.9573, latitudeDelta: 0.03, longitudeDelta: 0.03 }}>
        {route ? <Polyline coordinates={route.coords} strokeColor={colors.green600} strokeWidth={6} /> : null}
        {from ? (
          <Marker coordinate={from} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.truck}><Icon name="truck" size={18} color={colors.white} strokeWidth={2.2} /></View>
          </Marker>
        ) : null}
        {pin ? (
          <Marker coordinate={{ latitude: pin.lat, longitude: pin.lng }} anchor={{ x: 0.5, y: 0.9 }}><MapPin tone="red" size={38} /></Marker>
        ) : null}
      </MapView>

      <View style={[styles.top, { top: insets.top + 12 }]}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}><Icon name="back" size={20} color={colors.ink} strokeWidth={2.4} /></Pressable>
        <View style={styles.turn}>
          <Icon name="navigate" size={22} color={colors.white} fill={colors.white} />
          <Text style={{ flex: 1, color: colors.white, fontWeight: '800', fontSize: 15 }} numberOfLines={1}>{pin?.address ?? '…'}</Text>
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: insets.bottom + 18 }]}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={styles.metric}><Text style={styles.big}>{route ? route.durationMin : '–'}<Text style={styles.unit}> min</Text></Text></View>
          <View style={styles.metric}><Text style={styles.big}>{route ? route.distanceKm.toFixed(1) : '–'}<Text style={styles.unit}> km</Text></Text></View>
        </View>
        <Text style={{ fontSize: 13, color: colors.muted, fontWeight: '600' }}>
          {pin ? `${t(`size.${pin.size}`)} · ${pin.waste_types.map((w) => t(`waste.${w}`)).join(', ')}${pin.note ? ' · ' + pin.note : ''}` : ''}
        </Text>
        <Button title={t('driver.arrive')} icon="check" onPress={() => job && router.replace(`/driver/complete/${job.id}`)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', gap: 10 },
  back: { width: 54, height: 54, borderRadius: 18, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  turn: { flex: 1, height: 54, borderRadius: 18, backgroundColor: colors.green600, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  truck: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.green800, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 18, gap: 12 },
  metric: { flex: 1, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.mintSoft },
  big: { fontSize: 30, fontWeight: '800', color: colors.green800 },
  unit: { fontSize: 15, color: colors.ink2 },
});
