// OTP verification after "Send OTP"
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components/Icon';
import { Button } from '../components/ui';
import { homeFor, toE164, useAuth } from '../lib/auth';
import { registerForPush } from '../lib/notifications';
import { colors } from '../lib/theme';

export default function Verify() {
  const { t } = useTranslation();
  const { phone = '' } = useLocalSearchParams<{ phone: string }>();
  const { verifyOtp, sendOtp } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onVerify = async () => {
    setBusy(true);
    setError(null);
    try {
      const profile = await verifyOtp(phone, code);
      registerForPush(profile.id).catch(() => {});
      router.replace(homeFor(profile.role));
    } catch {
      setError(t('otp.wrong'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={{ padding: 22, gap: 18 }}>
        <Pressable accessibilityLabel="Back" onPress={() => router.back()} style={styles.back}>
          <Icon name="back" size={20} color={colors.ink} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.h1}>{t('otp.title')}</Text>
        <Text style={{ fontSize: 14, color: colors.muted }}>{t('otp.sent', { phone: toE164(phone) })}</Text>
        <TextInput value={code} onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoFocus
          textContentType="oneTimeCode" autoComplete="sms-otp" placeholder="••••••" maxLength={6} style={styles.code} accessibilityLabel={t('otp.title')} />
        {error ? <Text style={{ color: colors.red, fontWeight: '700' }}>{error}</Text> : null}
        <Button title={t('otp.verify')} onPress={onVerify} loading={busy} disabled={code.length < 6} />
        <Text style={{ textAlign: 'center', color: colors.green600, fontWeight: '800' }} onPress={() => sendOtp(phone)}>{t('otp.resend')}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F1F5F2', alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 26, fontWeight: '800', color: colors.green800 },
  code: { height: 64, borderRadius: 18, borderWidth: 1.5, borderColor: colors.green600, textAlign: 'center', fontSize: 28, fontWeight: '800', letterSpacing: 12, color: colors.ink },
});
