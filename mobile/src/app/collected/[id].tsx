// Citizen · 5 Collected notification ("We cleaned it together!")
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../components/Icon';
import { Button, IconChip } from '../../components/ui';
import { getPin } from '../../lib/api';
import { colors } from '../../lib/theme';
import type { Pin } from '../../lib/types';

export default function Collected() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pin, setPin] = useState<Pin | null>(null);
  const [stars, setStars] = useState(4);

  useEffect(() => {
    if (id) getPin(id).then(setPin).catch(() => {});
  }, [id]);

  const mins = pin ? Math.round((new Date(pin.updated_at).getTime() - new Date(pin.created_at).getTime()) / 60000) : 0;
  const took = `${Math.floor(mins / 60)} h ${mins % 60} m`;

  return (
    <View style={{ flex: 1, backgroundColor: '#0C3E2E' }}>
      <Pressable accessibilityLabel="Close" onPress={() => router.back()} style={[styles.close, { top: insets.top + 12 }]}>
        <Icon name="close" size={20} color={colors.white} strokeWidth={2.4} />
      </Pressable>
      <View style={{ alignItems: 'center', paddingTop: insets.top + 46, paddingHorizontal: 28, gap: 14 }}>
        <View style={styles.ring1}><View style={styles.ring2}><View style={styles.ring3}><Icon name="check" size={38} color="#0C3E2E" strokeWidth={3} /></View></View></View>
        <Text style={{ fontSize: 28, fontWeight: '800', color: colors.white, textAlign: 'center' }}>{t('collected.title')}</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#A9DCC3' }}>{t('collected.titleSi')}</Text>
        <Text style={{ fontSize: 14, color: '#CFE9DC', textAlign: 'center', lineHeight: 21 }}>{t('collected.body', { place: pin?.address ?? '' })}</Text>
      </View>

      <View style={[styles.panel, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.handle} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Photo label={`${t('collected.before')}`} uri={pin?.photo_urls[0]} tint="#B8A383" tag="rgba(154,78,5,0.9)" />
          <Photo label={`${t('collected.after')}`} tint="#8FD6AE" tag="rgba(14,122,85,0.92)" />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Info icon="truck" from="#7DB3FF" to="#1F5FBF" bg="#EAF1FD" color="#1F4F99" a="LK-4521" b="Kalutara UC" />
          <Info icon="clock" from="#FFC46B" to="#E08A1E" bg="#FFF4E3" color="#9A4E05" a={took} b={t('collected.timeToClean')} />
          <Info icon="leaf" from="#34C38A" to="#0E7A55" bg="#E9F7F0" color="#0A5E42" a={t('collected.points', { n: 20 })} b={t('collected.added')} />
        </View>
        <View style={styles.rate}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: colors.ink }}>{t('collected.rate')}</Text>
            <Text style={{ fontSize: 10.5, fontWeight: '600', color: '#85602F' }}>{t('collected.rateHint')}</Text>
          </View>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} accessibilityLabel={`${n} stars`} onPress={() => setStars(n)} style={{ padding: 4 }}>
              <Icon name="star" size={24} color={n <= stars ? colors.amber : '#E3D7C4'} />
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 'auto' }}>
          <Button variant="outline" title={t('collected.share')} icon="share" style={{ flex: 1 }} onPress={() => Share.share({ message: `${t('collected.title')} #EcoPin #CleanSriLanka` })} />
          <Button title={t('collected.another')} icon="pinPlus" style={{ flex: 1.5 }} onPress={() => router.replace('/report')} />
        </View>
      </View>
    </View>
  );
}

function Photo({ label, uri, tint, tag }: { label: string; uri?: string; tint: string; tag: string }) {
  return (
    <View style={{ flex: 1, height: 112, borderRadius: 18, overflow: 'hidden', backgroundColor: tint }}>
      {uri ? <Image source={{ uri }} style={StyleSheet.absoluteFill} /> : null}
      <Text style={{ position: 'absolute', left: 8, top: 8, color: colors.white, fontSize: 10.5, fontWeight: '800', backgroundColor: tag, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' }}>{label}</Text>
    </View>
  );
}

function Info({ icon, from, to, bg, color, a, b }: { icon: 'truck' | 'clock' | 'leaf'; from: string; to: string; bg: string; color: string; a: string; b: string }) {
  return (
    <View style={{ flex: 1, gap: 6, padding: 10, borderRadius: 16, backgroundColor: bg }}>
      <IconChip icon={icon} from={from} to={to} size={26} />
      <Text style={{ fontSize: 12.5, fontWeight: '800', color }}>{a}</Text>
      <Text style={{ fontSize: 10.5, fontWeight: '600', color }}>{b}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  close: { position: 'absolute', right: 16, zIndex: 2, width: 44, height: 44, borderRadius: 14, backgroundColor: '#14533E', alignItems: 'center', justifyContent: 'center' },
  ring1: { width: 132, height: 132, borderRadius: 66, borderWidth: 2, borderColor: '#1F6B51', alignItems: 'center', justifyContent: 'center' },
  ring2: { width: 104, height: 104, borderRadius: 52, backgroundColor: '#14533E', alignItems: 'center', justifyContent: 'center' },
  ring3: { width: 74, height: 74, borderRadius: 37, backgroundColor: colors.green400, alignItems: 'center', justifyContent: 'center' },
  panel: { flex: 1, marginTop: 28, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 18, paddingTop: 12, gap: 14 },
  handle: { width: 40, height: 5, borderRadius: 3, backgroundColor: '#DCE5DF', alignSelf: 'center' },
  rate: { flexDirection: 'row', alignItems: 'center', padding: 10, paddingLeft: 14, borderRadius: 18, borderWidth: 1, borderColor: '#F3E2C4', backgroundColor: '#FFFBF4' },
});
