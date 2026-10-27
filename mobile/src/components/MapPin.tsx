import React from 'react';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from 'react-native-svg';
import type { PinStatus } from '../lib/theme';

const palette: Record<string, [string, string, string]> = {
  red: ['#FF9A8A', '#E5402B', '#A3241A'],
  amber: ['#FFD58A', '#F2A33A', '#B8650E'],
  blue: ['#9CC2FF', '#2F6FDB', '#1A4AA0'],
  green: ['#3FD58A', '#0B8F4C', '#055E32'],
};

export function toneFor(status: PinStatus): keyof typeof palette {
  if (status === 'collected') return 'green';
  if (status === 'assigned' || status === 'on_the_way') return 'blue';
  return 'amber';
}

/** Glossy teardrop pin used on every map (same shape as the design). */
export function MapPin({ tone = 'amber', size = 34, done = false }: { tone?: keyof typeof palette; size?: number; done?: boolean }) {
  const [a, b, c] = palette[tone];
  const id = `g-${tone}`;
  return (
    <Svg width={size} height={size * 1.25} viewBox="-16 -26 32 40">
      <Defs>
        <RadialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <Stop offset="0" stopColor={a} />
          <Stop offset="0.55" stopColor={b} />
          <Stop offset="1" stopColor={c} />
        </RadialGradient>
      </Defs>
      <Ellipse cx="0" cy="12.5" rx="6" ry="2" fill="#0C3E2E" fillOpacity={0.3} />
      <Path d="M0 -24 C -9 -24 -14 -17 -14 -8 C -14 4 0 13 0 13 C 0 13 14 4 14 -8 C 14 -17 9 -24 0 -24 Z" fill={`url(#${id})`} stroke="#FFFFFF" strokeWidth={2.5} />
      {done ? (
        <Path d="M-5 -8 L -1.5 -4.5 L 5 -11" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <Circle cx="0" cy="-8" r="4.6" fill="#FFFFFF" />
      )}
    </Svg>
  );
}
