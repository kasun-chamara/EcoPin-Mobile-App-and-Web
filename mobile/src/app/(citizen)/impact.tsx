// Citizen · 6 Impact, badges & ranks
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NAV_SPACE } from '../../components/BottomNav';
import { Icon, type IconName } from '../../components/Icon';
import { Card, IconChip, SectionTitle } from '../../components/ui';
import { listMyPins } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { demoLeaderboard } from '../../lib/mock';
import { colors } from '../../lib/theme';

const BADGES: { name: string; icon: IconName; from: string; to: string; earned: boolean }[] = [
  { name: 'First pin', icon: 'pin', from: '#7FE3B5', to: '#0A5E42', earned: true },
  { name: 'Beach saver', icon: 'nearby', from: '#9CC8FF', to: '#1A4AA0', earned: true },
  { name: '4-day streak', icon: 'flame', from: '#FFD58A', to: '#B8650E', earned: true },
  { name: '10 cleaned', icon: 'lock', from: '#F1F5F2', to: '#F1F5F2', earned: false },
];
const MEDAL = ['#F5C542', '#C9D2D9', '#D68A4A'];

export default function Impact() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { profile, signOut } = useAuth();
  const [counts, setCounts] = useState({ pinned: 0, cleaned: 0 });

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      listMyPins(profile.id).then((p) => setCounts({ pinned: p.length, cleaned: p.filter((x) => x.status === 'collected').length })).catch(() => {});
    }, [profile]),
  );

  const points = profile?.points ?? 0;
  const goal = 200;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: NAV_SPACE }}>
      <LinearGradient colors={['#0C3E2E', '#14533E']} style={[styles.hero, { paddingTop: insets.top + 14 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: colors.white }}>{t('impact.title')}</Text>
          <Pressable accessibilityLabel={t('impact.signOut')} onPress={async () => { await signOut(); router.replace('/'); }} style={styles.heroBtn}>
            <Text style={{ color: colors.white, fontWeight: '700', fontSize: 12 }}>{t('impact.signOut')}</Text>
          </Pressable>
        </View>
        <View style={{ alignItems: 'center', marginTop: 24, gap: 4 }}>
          <IconChip icon="leaf" from="#34C38A" to="#0E7A55" size={96} />
          <Text style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: '#A9DCC3', marginTop: 8 }}>{t('impact.level', { n: 3 })}</Text>
          <Text style={{ fontSize: 24, fontWeight: '800', color: colors.white }}>{t('impact.levelName')}</Text>
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 16, marginTop: -26, gap: 16 }}>
        <Card style={{ gap: 11 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text><Text style={{ fontSize: 22, fontWeight: '800', color: colors.green800 }}>{points}</Text><Text style={{ fontSize: 12, fontWeight: '700', color: colors.muted }}> {t('impact.points', { n: goal })}</Text></Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color: colors.amberDark, backgroundColor: colors.amberSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' }}>{t('impact.next', { name: 'Eco Guardian' })}</Text>
          </View>
          <View style={{ height: 10, borderRadius: 5, backgroundColor: '#E9F1EC', overflow: 'hidden' }}>
            <LinearGradient colors={['#8DFFCB', '#34C38A', '#0E7A55']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.min(100, (points / goal) * 100)}%`, height: '100%', borderRadius: 5 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <MiniStat icon="pin" from="#FF8A75" to="#E5402B" bg="#FDF0EE" color="#A3241A" value={String(counts.pinned)} label={t('impact.pinned')} />
            <MiniStat icon="check" from="#34C38A" to="#0E7A55" bg="#E9F7F0" color="#0A5E42" value={String(counts.cleaned)} label={t('impact.cleaned')} />
            <MiniStat icon="flame" from="#FFC46B" to="#E08A1E" bg="#FFF4E3" color="#9A4E05" value={t('impact.days', { n: 4 })} label={t('impact.streak')} />
          </View>
        </Card>

        <View style={{ gap: 10 }}>
          <SectionTitle title={t('impact.badges')} action={t('impact.seeAll', { a: 3, b: 12 })} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {BADGES.map((b) => (
              <View key={b.name} style={{ alignItems: 'center', gap: 6, width: 78 }}>
                {b.earned ? (
                  <View style={styles.medalRing}><IconChip icon={b.icon} from={b.from} to={b.to} size={52} /></View>
                ) : (
                  <View style={styles.locked}><Icon name="lock" size={22} color="#8A9A92" strokeWidth={2.2} /></View>
                )}
                <Text style={{ fontSize: 11, fontWeight: '800', color: b.earned ? colors.ink : colors.muted, textAlign: 'center' }}>{b.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <SectionTitle title={t('impact.board', { area: 'Kalutara North' })} />
          <View style={{ backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.border, padding: 4, gap: 2 }}>
            {demoLeaderboard.map((r, i) => (
              <View key={r.name} style={[styles.rank, r.me && styles.rankMe]}>
                <View style={[styles.medal, { backgroundColor: MEDAL[i] }]}><Text style={{ fontSize: 12, fontWeight: '800', color: '#2E2A20' }}>{i + 1}</Text></View>
                <View style={styles.av}><Text style={{ fontSize: 12, fontWeight: '800', color: colors.green800 }}>{r.initials}</Text></View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: r.me ? '800' : '700', color: r.me ? colors.green800 : colors.ink }}>{r.name}</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: colors.ink }}>{r.points} pts</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function MiniStat({ icon, from, to, bg, color, value, label }: { icon: IconName; from: string; to: string; bg: string; color: string; value: string; label: string }) {
  return (
    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, borderRadius: 14, backgroundColor: bg }}>
      <IconChip icon={icon} from={from} to={to} size={28} />
      <View>
        <Text style={{ fontSize: 15, fontWeight: '800', color }}>{value}</Text>
        <Text style={{ fontSize: 10, fontWeight: '700', color }}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { height: 284, borderBottomLeftRadius: 34, borderBottomRightRadius: 34 },
  heroBtn: { height: 36, paddingHorizontal: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  medalRing: { padding: 3, borderRadius: 32, backgroundColor: colors.white, shadowColor: '#0E7A55', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 4 },
  locked: { width: 58, height: 58, borderRadius: 29, borderWidth: 1.5, borderStyle: 'dashed', borderColor: '#B7C5BC', backgroundColor: '#F1F5F2', alignItems: 'center', justifyContent: 'center' },
  rank: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 10, borderRadius: 16 },
  rankMe: { backgroundColor: '#E3F6EC', borderWidth: 1, borderColor: '#A9E2C4' },
  medal: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.white },
  av: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.mintSoft, alignItems: 'center', justifyContent: 'center' },
});
