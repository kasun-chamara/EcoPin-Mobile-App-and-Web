// Driver · 3 Mark collected (after photo -> citizen gets "We cleaned it together")
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../../components/Icon';
import { Button } from '../../../components/ui';
import { markCollected } from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import { colors } from '../../../lib/theme';

export default function Complete() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profile } = useAuth();
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const take = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!res.canceled && res.assets[0]) setPhoto(res.assets[0].uri);
  };

  const done = async () => {
    if (!id || !profile) return;
    setBusy(true);
    try {
      await markCollected(id, photo, profile.id);
      router.replace('/jobs');
    } catch (e) {
      Alert.alert((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16, gap: 16, flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}><Icon name="back" size={20} color={colors.ink} strokeWidth={2.4} /></Pressable>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.ink }}>{t('driver.completeTitle')}</Text>
        </View>
        <Pressable onPress={take} style={styles.photo} accessibilityLabel={t('driver.afterPhoto')}>
          {photo ? <Image source={{ uri: photo }} style={StyleSheet.absoluteFill} /> : (
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={styles.cam}><Icon name="camera" size={32} color={colors.white} strokeWidth={2} /></View>
              <Text style={{ fontWeight: '800', color: colors.green800 }}>{t('driver.afterPhoto')}</Text>
            </View>
          )}
        </Pressable>
        <View style={{ marginTop: 'auto' }}>
          <Button title={t('driver.done')} icon="check" onPress={done} loading={busy} disabled={!photo} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  photo: { height: 320, borderRadius: 24, backgroundColor: '#DDEFE5', overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.white },
  cam: { width: 68, height: 68, borderRadius: 34, backgroundColor: colors.green600, alignItems: 'center', justifyContent: 'center' },
});
