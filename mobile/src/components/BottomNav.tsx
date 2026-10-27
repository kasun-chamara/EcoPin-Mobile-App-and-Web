import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, gradients } from '../lib/theme';
import { Icon, type IconName } from './Icon';

/** Route name -> icon + label key. Routes not listed here are hidden from the bar. */
export const NAV_ITEMS: Record<string, { icon: IconName; label: string }> = {
  home: { icon: 'map', label: 'nav.map' },
  nearby: { icon: 'nearby', label: 'nav.nearby' },
  report: { icon: 'pinPlus', label: 'nav.pin' },
  'my-pins': { icon: 'mypins', label: 'nav.mypins' },
  impact: { icon: 'profile', label: 'nav.profile' },
  jobs: { icon: 'jobs', label: 'nav.jobs' },
  history: { icon: 'history', label: 'nav.history' },
  profile: { icon: 'profile', label: 'nav.profile' },
};

/** White floating bar; the active tab is a green pill with icon + label (matches the canvas design). */
export function BottomNav({ state, navigateToTab, insets }: BottomTabBarProps) {
  const { t } = useTranslation();
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 8 }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const item = NAV_ITEMS[route.name];
          if (!item) return null;
          const active = index === state.index;
          const label = t(item.label);
          if (active) {
            return (
              <Pressable key={route.key} accessibilityRole="button" accessibilityState={{ selected: true }} accessibilityLabel={label} onPress={() => navigateToTab(route.key)}>
                <LinearGradient colors={gradients.mintGlow} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.active}>
                  <Icon name={item.icon} size={21} color={colors.white} strokeWidth={1.9} />
                  <Text style={styles.activeText}>{label}</Text>
                </LinearGradient>
              </Pressable>
            );
          }
          return (
            <Pressable key={route.key} accessibilityRole="button" accessibilityLabel={label} onPress={() => navigateToTab(route.key)} style={styles.item}>
              <Icon name={item.icon} size={21} color="#2E3E36" strokeWidth={1.7} />
              <Text style={styles.itemText} numberOfLines={1}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 18, right: 18 },
  bar: {
    height: 64, backgroundColor: colors.white, borderRadius: 32, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7,
    shadowColor: '#10231B', shadowOpacity: 0.14, shadowRadius: 20, shadowOffset: { width: 0, height: 12 }, elevation: 10,
  },
  active: { height: 46, paddingLeft: 13, paddingRight: 16, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 7 },
  activeText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  item: { width: 56, height: 54, alignItems: 'center', justifyContent: 'center', gap: 3 },
  itemText: { fontSize: 10, fontWeight: '700', color: '#5B6B63' },
});

/** Space to leave under scroll content so the floating bar doesn't cover it. */
export const NAV_SPACE = 110;
