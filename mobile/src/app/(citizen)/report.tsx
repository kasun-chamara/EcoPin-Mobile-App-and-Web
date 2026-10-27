// Citizen · 3 Pin a spot (photo + place on the screen, details in a bottom-sheet popup)
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_SPACE } from '../../components/BottomNav';
import { Icon, type IconName } from '../../components/Icon';
import { MapPin } from '../../components/MapPin';
import { Button, FlagStripe } from '../../components/ui';
import { createPin, pinsNear } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { getCurrentPosition, reverseGeocode } from '../../lib/location';
import { colors, gradients } from '../../lib/theme';
import type { PinSize } from '../../lib/types';

const WASTE: { id: string; icon: IconName }[] = [
  { id: 'household', icon: 'home' }, { id: 'plastic', icon: 'bottle' }, { id: 'construction', icon: 'bricks' },
  { id: 'garden', icon: 'leaf' }, { id: 'ewaste', icon: 'phone' }, { id: 'hazardous', icon: 'warning' },
];
const SIZES: { id: PinSize; icon: IconName }[] = [{ id: 'few_bags', icon: 'bag' }, { id: 'pile', icon: 'pile' }, { id: 'truckload', icon: 'truck' }];

export default function Report() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [photos, setPhotos] = useState<string[]>([]);
  const [loc, setLoc] = useState<{ lat: number; lng: number; accuracy: number | null } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [details, setDetails] = useState(false);
  const [waste, setWaste] = useState<string[]>(['household']);
  const [size, setSize] = useState<PinSize>('pile');
  const [note, setNote] = useState('');
  const [hideName, setHideName] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getCurrentPosition().then(async (p) => {
        if (!p) return;
        setLoc(p);
        setAddress(await reverseGeocode(p.lat, p.lng));
      });
    }, []),
  );

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled && res.assets[0]) setPhotos((p) => [...p, res.assets[0].uri].slice(0, 3));
  };

  const next = async () => {
    if (!photos.length) return Alert.alert(t('report.needPhoto'));
    if (loc) {
      const near = await pinsNear(loc.lat, loc.lng, 30).catch(() => []);
      if (near.length) {
        return Alert.alert(t('home.already', { m: 30 }), near[0].address ?? near[0].code, [
          { text: t('home.meToo'), onPress: () => router.navigate('/home') },
          { text: t('report.next'), onPress: () => setDetails(true) },
        ]);
      }
    }
    setDetails(true);
  };

  const submit = async () => {
    if (!loc) return;
    setBusy(true);
    try {
      await createPin({ lat: loc.lat, lng: loc.lng, address, photoUris: photos, wasteTypes: waste, size, note, anonymous: hideName }, profile?.id ?? '');
      setDetails(false);
      setPhotos([]);
      setNote('');
      Alert.alert(t('report.thanks'));
      router.navigate('/my-pins');
    } catch (e) {
      Alert.alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={gradients.header} style={[styles.header, { paddingTop: insets.top }]}>
        <FlagStripe />
        <View style={styles.headRow}>
          <Pressable accessibilityLabel="Back to map" onPress={() => router.navigate('/home')} style={styles.glassBtn}>
            <Icon name="back" size={20} color={colors.white} strokeWidth={2.4} />
          </Pressable>
          <View>
            <Text style={{ fontSize: 19, fontWeight: '800', color: colors.white }}>{t('report.title')}</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#BFEBD5' }}>{t('report.subtitle')}</Text>
          </View>
        </View>
        <View style={styles.steps}>
          {(['report.step1', 'report.step2', 'report.step3'] as const).map((s, i) => {
            const done = i === 0 ? photos.length > 0 : i === 1 ? !!loc : details;
            return (
              <View key={s} style={{ flex: 1, gap: 6 }}>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: done ? colors.mint : 'rgba(255,255,255,0.25)' }} />
                <Text style={{ fontSize: 11, fontWeight: '800', color: done ? colors.white : '#A9DCC3' }}>{t(s)}</Text>
              </View>
            );
          })}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 14, paddingBottom: NAV_SPACE + 80 }} style={{ marginTop: -60 }}>
        <Pressable onPress={takePhoto} style={styles.photo} accessibilityLabel={t('report.takePhoto')}>
          {photos[0] ? (
            <Image source={{ uri: photos[photos.length - 1] }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={styles.camCircle}><Icon name="camera" size={32} color={colors.white} strokeWidth={2} /></View>
              <Text style={{ fontWeight: '800', color: colors.green800 }}>{t('report.takePhoto')}</Text>
            </View>
          )}
          {photos[0] ? (
            <View style={styles.retake}><Icon name="retake" size={15} color={colors.green800} strokeWidth={2.4} /><Text style={{ fontWeight: '800', color: colors.green800 }}>{t('report.retake')}</Text></View>
          ) : null}
        </Pressable>

        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          {photos.map((u) => <Image key={u} source={{ uri: u }} style={styles.thumb} />)}
          {photos.length < 3 ? (
            <Pressable onPress={takePhoto} style={[styles.thumb, styles.addThumb]} accessibilityLabel={t('report.addPhoto')}>
              <Icon name="plus" size={22} color={colors.green600} strokeWidth={2.4} />
            </Pressable>
          ) : null}
          <Text style={{ flex: 1, fontSize: 11, fontWeight: '600', color: colors.muted }}>{t('report.photoNote')}</Text>
        </View>

        <View style={styles.locCard}>
          <View style={{ height: 112 }}>
            {loc ? (
              <MapView style={StyleSheet.absoluteFill} pointerEvents="none"
                region={{ latitude: loc.lat, longitude: loc.lng, latitudeDelta: 0.004, longitudeDelta: 0.004 }}>
                <Marker coordinate={{ latitude: loc.lat, longitude: loc.lng }} anchor={{ x: 0.5, y: 0.9 }}><MapPin tone="amber" /></Marker>
              </MapView>
            ) : (
              <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF6F1' }]}>
                <Text style={{ color: colors.muted, fontWeight: '700' }}>{t('report.locating')}</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13 }}>
            <View style={styles.locIcon}><Icon name="pin" size={18} color="#B8650E" strokeWidth={2.2} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '800', color: colors.ink }}>{address ?? '—'}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: colors.muted }}>
                {loc ? `${loc.lat.toFixed(4)}° N, ${loc.lng.toFixed(4)}° E · GPS ±${Math.round(loc.accuracy ?? 6)} m` : ''}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Button title={t('report.next')} icon="arrow" onPress={next} style={{ position: 'absolute', left: 16, right: 16, bottom: NAV_SPACE - 10 }} />

      <Modal visible={details} transparent animationType="slide" onRequestClose={() => setDetails(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(4,26,18,0.55)' }} onPress={() => setDetails(false)} accessibilityLabel="Close details" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 22 }]}>
          <View style={styles.handle} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {photos[0] ? <Image source={{ uri: photos[0] }} style={{ width: 40, height: 40, borderRadius: 13 }} /> : null}
              <View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: colors.ink }}>{t('report.detailsTitle')}</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.muted }}>{(address ?? '') + ' · ' + t('report.photoAdded')}</Text>
              </View>
            </View>
            <Pressable accessibilityLabel="Close" onPress={() => setDetails(false)} style={styles.closeBtn}>
              <Icon name="close" size={18} color={colors.ink2} strokeWidth={2.4} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ gap: 14 }} style={{ maxHeight: 520 }}>
            <Text style={styles.q}>{t('report.wasteQ')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {WASTE.map((w) => {
                const on = waste.includes(w.id);
                return (
                  <Pressable key={w.id} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
                    onPress={() => setWaste((v) => (on ? v.filter((x) => x !== w.id) : [...v, w.id]))}
                    style={[styles.chip, on && styles.chipOn]}>
                    <Icon name={w.icon} size={16} color={on ? colors.green800 : colors.ink2} strokeWidth={2.2} />
                    <Text style={{ fontWeight: on ? '800' : '700', color: on ? colors.green800 : colors.ink2, fontSize: 13 }}>{t(`waste.${w.id}`)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.q}>{t('report.sizeQ')}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {SIZES.map((s) => {
                const on = size === s.id;
                return (
                  <Pressable key={s.id} onPress={() => setSize(s.id)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[styles.size, on && styles.chipOn]}>
                    <View style={[styles.sizeIcon, on && { backgroundColor: colors.green600 }]}>
                      <Icon name={s.icon} size={20} color={on ? colors.white : colors.ink2} strokeWidth={2} />
                    </View>
                    <Text style={{ fontSize: 12, fontWeight: on ? '800' : '700', color: on ? colors.green800 : colors.ink2 }}>{t(`size.${s.id}`)}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.q}>{t('report.note')} <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>{t('report.optional')}</Text></Text>
            <TextInput value={note} onChangeText={setNote} placeholder={t('report.notePh')} multiline style={styles.note} />

            <LinearGradient colors={['#0B7350', '#0A5038']} style={styles.council}>
              <Icon name="building" size={21} color={colors.mint} strokeWidth={2} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#A9DCC3' }}>{t('report.goesTo')}</Text>
                <Text style={{ fontSize: 14, fontWeight: '800', color: colors.white }}>{t('report.council')}</Text>
              </View>
            </LinearGradient>

            <View style={styles.toggle}>
              <Icon name="eyeOff" size={20} color={colors.green600} strokeWidth={2} />
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: colors.ink2 }}>{t('report.hideName')}</Text>
              <Switch value={hideName} onValueChange={setHideName} trackColor={{ true: colors.green400, false: '#D5DFD8' }} />
            </View>
          </ScrollView>

          <Button title={t('report.submit')} icon="pin" onPress={submit} loading={busy} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { height: 196, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, paddingHorizontal: 16 },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 16 },
  glassBtn: { width: 44, height: 44, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', alignItems: 'center', justifyContent: 'center' },
  steps: { flexDirection: 'row', gap: 6, marginTop: 18 },
  photo: { height: 212, borderRadius: 24, borderWidth: 3, borderColor: colors.white, backgroundColor: '#DDEFE5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', shadowColor: '#05281A', shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 16 }, elevation: 8 },
  camCircle: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.green600, alignItems: 'center', justifyContent: 'center' },
  retake: { position: 'absolute', right: 12, bottom: 12, height: 38, paddingHorizontal: 14, borderRadius: 999, backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 6 },
  thumb: { width: 60, height: 60, borderRadius: 16 },
  addThumb: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#8FC5AA', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  locCard: { backgroundColor: colors.white, borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  locIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#FFF1DC', alignItems: 'center', justifyContent: 'center' },
  sheet: { backgroundColor: '#F7FBF9', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 16, paddingTop: 10, gap: 14 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D5DFD8', alignSelf: 'center' },
  closeBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#E9F1EC', alignItems: 'center', justifyContent: 'center' },
  q: { fontSize: 15, fontWeight: '800', color: colors.ink },
  chip: { height: 40, paddingLeft: 10, paddingRight: 14, borderRadius: 999, borderWidth: 1.5, borderColor: '#DCE6E0', backgroundColor: colors.white, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipOn: { borderColor: colors.green400, backgroundColor: colors.mintSoft },
  size: { flex: 1, height: 84, borderRadius: 18, borderWidth: 1.5, borderColor: '#DCE6E0', backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center', gap: 7 },
  sizeIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F2', alignItems: 'center', justifyContent: 'center' },
  note: { minHeight: 60, borderWidth: 1.5, borderColor: '#DCE6E0', borderRadius: 16, padding: 12, backgroundColor: colors.white, fontSize: 14, textAlignVertical: 'top' },
  council: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 20 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 18, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
});
