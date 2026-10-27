// Citizen · 1 Welcome & sign-in
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Button, FlagStripe, IconChip } from '../components/ui';
import { WelcomeHero } from '../components/WelcomeHero';
import { getDailyStats } from '../lib/api';
import { homeFor, useAuth } from '../lib/auth';
import i18n from '../lib/i18n';
import { colors } from '../lib/theme';
import type { Lang } from '../lib/types';

const LANGS: { id: Lang; short: string; long: string }[] = [
  { id: 'si', short: 'සිං', long: 'සිංහල' },
  { id: 'en', short: 'EN', long: 'English' },
  { id: 'ta', short: 'த', long: 'தமிழ்' },
];

export default function Welcome() {
  const { t } = useTranslation();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { profile, loading, sendOtp, demoSignIn } = useAuth();
  const [sheet, setSheet] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cleaned, setCleaned] = useState(1248);
  const [lang, setLang] = useState<Lang>((i18n.language as Lang) ?? 'si');

  useEffect(() => {
    if (!loading && profile) router.replace(homeFor(profile.role));
  }, [loading, profile]);

  useEffect(() => {
    getDailyStats().then((s) => setCleaned(s.cleaned_today)).catch(() => {});
  }, []);

  const changeLang = (l: Lang) => {
    setLang(l);
    i18n.changeLanguage(l);
  };

  const onSendOtp = async () => {
    setError(null);
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Enter your 9-digit mobile number');
      return;
    }
    setBusy(true);
    try {
      await sendOtp(phone);
      setSheet(false);
      router.push({ pathname: '/verify', params: { phone } });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const heroH = Math.min(470, height * 0.56);

  return (
    <View style={{ flex: 1, backgroundColor: '#0C3E2E' }}>
      <View style={{ height: heroH }}>
        <WelcomeHero width={width} height={heroH} />
        <View style={[StyleSheet.absoluteFill, { paddingTop: insets.top }]}>
          <FlagStripe />
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={styles.logo}>
                <Icon name="pin" size={20} color="#0C3E2E" strokeWidth={2.4} />
              </View>
              <Text style={styles.brand}>{t('brand')}</Text>
            </View>
            <View style={styles.langToggle} accessibilityRole="radiogroup" accessibilityLabel="Language">
              {LANGS.map((l) => (
                <Pressable key={l.id} onPress={() => changeLang(l.id)} accessibilityRole="radio" accessibilityState={{ selected: lang === l.id }}
                  style={[styles.langBtn, lang === l.id && { backgroundColor: colors.white }]}>
                  <Text style={{ fontSize: 12, fontWeight: '800', color: lang === l.id ? colors.green800 : '#E3F6EC' }}>{l.short}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={{ color: '#FFD978', fontSize: 12, fontWeight: '800' }}>✿ {t('cleanSL')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.panel}>
        <View style={styles.countPill}>
          <View style={{ flexDirection: 'row' }}>
            {['#E5402B', '#2F6FDB', '#0E7A55'].map((c, i) => (
              <View key={c} style={[styles.avatar, { backgroundColor: c, marginLeft: i ? -8 : 0 }]} />
            ))}
          </View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#4F6158' }}>
            <Text style={{ fontWeight: '800', color: colors.green800 }}>{t('welcome.spots', { count: cleaned })}</Text> {t('welcome.cleanedToday')}
          </Text>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.green400 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 30, gap: 12, paddingBottom: insets.bottom + 20 }}>
          <Text style={styles.h1}>
            {t('welcome.h1a')}
            {'\n'}
            <Text style={{ color: colors.green500 }}>{t('welcome.h1b')}</Text>
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>{t('welcome.sub')}</Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[
              { i: 'pinPlus' as const, a: '#FF8A75', b: '#E5402B', bd: '#F6BDB2', t1: 'welcome.c1t', t2: 'welcome.c1d', n: '01' },
              { i: 'truck' as const, a: '#7DB3FF', b: '#1F5FBF', bd: '#B9D1F4', t1: 'welcome.c2t', t2: 'welcome.c2d', n: '02' },
              { i: 'check' as const, a: '#34C38A', b: '#0E7A55', bd: '#AEE0C6', t1: 'welcome.c3t', t2: 'welcome.c3d', n: '03' },
            ].map((c) => (
              <View key={c.n} style={[styles.feature, { borderColor: c.bd }]}>
                <Text style={[styles.featureNum, { color: c.b }]}>{c.n}</Text>
                <IconChip icon={c.i} from={c.a} to={c.b} size={32} />
                <Text style={styles.featureTitle}>{t(c.t1)}</Text>
                <Text style={styles.featureDesc}>{t(c.t2)}</Text>
              </View>
            ))}
          </View>

          <Button title={t('welcome.start')} onPress={() => setSheet(true)} style={{ marginTop: 6 }} />
          <Text style={{ textAlign: 'center', fontSize: 12, color: '#6B7C73', fontWeight: '600' }}>
            {t('welcome.foot1')}
            <Text style={{ color: colors.green600, fontWeight: '800' }} onPress={() => { demoSignIn('citizen'); router.replace('/report'); }}>
              {t('welcome.foot2')}
            </Text>
          </Text>
        </ScrollView>
      </View>

      <Modal visible={sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Pressable style={styles.backdrop} accessibilityLabel="Close sign-in" onPress={() => setSheet(false)}>
            <View style={{ alignItems: 'center', marginTop: insets.top + 50, gap: 12 }}>
              <View style={[styles.logo, { width: 78, height: 78, borderRadius: 24 }]}>
                <Icon name="pin" size={40} color="#0C3E2E" strokeWidth={2.2} />
              </View>
              <Text style={{ color: colors.white, fontSize: 32, fontWeight: '800' }}>{t('brand')}</Text>
            </View>
          </Pressable>
          <View style={[styles.sheet, { paddingBottom: insets.bottom + 24 }]}>
            <View style={styles.handle} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.eyebrow}>● {t('signin.eyebrow')}</Text>
                <Text style={styles.h2}>
                  {t('signin.h2a')}
                  {'\n'}
                  <Text style={{ color: colors.green500 }}>{t('signin.h2b')}</Text>
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted }}>{t('signin.h2sub')}</Text>
              </View>
              <Pressable accessibilityLabel="Close" onPress={() => setSheet(false)} style={styles.closeBtn}>
                <Icon name="close" size={18} color={colors.ink2} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.seg}>
              {LANGS.map((l) => (
                <Pressable key={l.id} onPress={() => changeLang(l.id)} style={[styles.segBtn, lang === l.id && styles.segOn]}>
                  <Text style={{ fontWeight: lang === l.id ? '700' : '600', color: lang === l.id ? colors.green800 : '#4F6158' }}>{l.long}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>{t('signin.label')}</Text>
            <View style={styles.phoneBox}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: colors.green800 }}>+94</Text>
              <View style={{ width: 1, height: 22, backgroundColor: '#D5DFD8' }} />
              <TextInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="7X XXX XXXX" maxLength={12}
                style={{ flex: 1, fontSize: 16, fontWeight: '600', color: colors.ink }} accessibilityLabel={t('signin.label')} />
            </View>
            <Text style={{ fontSize: 11, color: '#5B6B63' }}>{error ?? t('signin.hint')}</Text>

            <Button title={t('signin.otp')} icon="arrow" onPress={onSendOtp} loading={busy} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E6ECE7' }} />
              <Text style={{ fontSize: 12, color: '#6A7B72' }}>{t('signin.or')}</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: '#E6ECE7' }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button variant="outline" title={t('signin.demoCitizen')} style={{ flex: 1, height: 48 }} onPress={() => { setSheet(false); demoSignIn('citizen'); router.replace('/home'); }} />
              <Button variant="outline" title={t('signin.demoDriver')} style={{ flex: 1, height: 48 }} onPress={() => { setSheet(false); demoSignIn('driver'); router.replace('/jobs'); }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingTop: 18 },
  logo: { width: 36, height: 36, borderRadius: 11, backgroundColor: '#5BD9A0', alignItems: 'center', justifyContent: 'center' },
  brand: { fontSize: 21, fontWeight: '800', color: colors.white },
  langToggle: { flexDirection: 'row', gap: 2, padding: 3, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)' },
  langBtn: { minWidth: 36, height: 28, paddingHorizontal: 8, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  badge: { marginLeft: 22, marginTop: 12, alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,190,41,0.12)', borderWidth: 1, borderColor: 'rgba(255,190,41,0.45)' },
  panel: { flex: 1, backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30 },
  countPill: {
    position: 'absolute', top: -24, alignSelf: 'center', zIndex: 2, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, paddingLeft: 8, paddingRight: 12,
    borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: '#E3F1EA',
    shadowColor: '#03281A', shadowOpacity: 0.28, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 8,
  },
  avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.white },
  h1: { fontSize: 26, lineHeight: 30, fontWeight: '800', color: colors.green800, letterSpacing: -0.5 },
  feature: { flex: 1, backgroundColor: colors.white, borderRadius: 20, borderWidth: 1.5, padding: 10, gap: 6 },
  featureNum: { position: 'absolute', top: 9, right: 10, fontSize: 10, fontWeight: '800', opacity: 0.6 },
  featureTitle: { fontSize: 12.5, fontWeight: '800', color: colors.ink },
  featureDesc: { fontSize: 10.5, color: '#5B6B63', lineHeight: 14 },
  backdrop: { flex: 1, backgroundColor: 'rgba(4,26,18,0.65)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingTop: 12, gap: 12 },
  handle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#D5DFD8', alignSelf: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 0.8, color: colors.green600, textTransform: 'uppercase' },
  h2: { fontSize: 23, lineHeight: 27, fontWeight: '800', color: colors.green800 },
  closeBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F2', alignItems: 'center', justifyContent: 'center' },
  seg: { flexDirection: 'row', gap: 6, padding: 4, backgroundColor: '#F1F5F2', borderRadius: 14 },
  segBtn: { flex: 1, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: colors.white, shadowColor: '#10231B', shadowOpacity: 0.12, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink2 },
  phoneBox: { flexDirection: 'row', alignItems: 'center', height: 54, borderWidth: 1.5, borderColor: colors.green600, borderRadius: 16, paddingHorizontal: 14, gap: 10 },
});
