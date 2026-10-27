import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, gradients, radius, shadow } from '../lib/theme';
import { Icon, type IconName } from './Icon';

export function FlagStripe() {
  return (
    <View style={{ flexDirection: 'row', height: 4 }}>
      {colors.flag.map((c) => (
        <View key={c} style={{ flex: 1, backgroundColor: c }} />
      ))}
    </View>
  );
}

type BtnProps = {
  title: string;
  onPress?: () => void;
  icon?: IconName;
  variant?: 'primary' | 'outline' | 'white' | 'amber';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, icon, variant = 'primary', loading, disabled, style }: BtnProps) {
  const isPrimary = variant === 'primary';
  const textColor = variant === 'outline' ? colors.green800 : variant === 'white' ? colors.green800 : variant === 'amber' ? '#3D2000' : colors.white;
  const content = (
    <View style={styles.btnInner}>
      {loading ? <ActivityIndicator color={textColor} /> : null}
      {!loading && icon ? <Icon name={icon} size={18} color={textColor} strokeWidth={2.4} /> : null}
      <Text style={[styles.btnText, { color: textColor }]}>{title}</Text>
    </View>
  );
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        isPrimary && shadow.button,
        variant === 'outline' && styles.btnOutline,
        variant === 'white' && styles.btnWhite,
        variant === 'amber' && { backgroundColor: colors.amber },
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {isPrimary ? (
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: radius.pill }]} />
      ) : null}
      {content}
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function IconChip({ icon, from, to, size = 28 }: { icon: IconName; from: string; to: string; size?: number }) {
  return (
    <LinearGradient colors={[from, to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: size, height: size, borderRadius: size * 0.36, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={size * 0.52} color={colors.white} strokeWidth={2.4} />
    </LinearGradient>
  );
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text style={{ fontSize: 15, fontWeight: '800', color: colors.ink }}>{title}</Text>
      {action ? (
        <Text onPress={onAction} style={{ fontSize: 12, fontWeight: '800', color: colors.green600 }}>
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export function Pill({ label, color, bg, dot }: { label: string; color: string; bg: string; dot?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: bg, alignSelf: 'flex-start' }}>
      {dot ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot }} /> : null}
      <Text style={{ fontSize: 11, fontWeight: '800', color }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { height: 56, borderRadius: radius.pill, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText: { fontSize: 16, fontWeight: '800' },
  btnOutline: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: '#CFE3D7' },
  btnWhite: { backgroundColor: colors.white },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 14, ...shadow.card },
});
