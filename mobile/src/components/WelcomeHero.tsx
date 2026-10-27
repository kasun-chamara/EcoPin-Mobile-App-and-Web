import React from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { SRI_LANKA_PATH } from './sriLankaPath';

const PIN = 'M0 -18 C -7 -18 -11 -13 -11 -6 C -11 3 0 11 0 11 C 0 11 11 3 11 -6 C 11 -13 7 -18 0 -18 Z';
const ROUTE = 'M290 250 L 278 251 Q 271 252 269 258 L 265 267 Q 262 273 255 273 L 242 272 Q 235 272 233 278 L 229 286 Q 227 291 220 291 L 209 292';

/** The welcome illustration: glass Sri Lanka map with pins, sun and hills (scaled to the given width). */
export function WelcomeHero({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 390 460" preserveAspectRatio="xMidYMid slice">
      <Defs>
        <LinearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#054A32" />
          <Stop offset="0.55" stopColor="#0B7350" />
          <Stop offset="1" stopColor="#139463" />
        </LinearGradient>
        <RadialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFD54A" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#FFD54A" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="sunDisk" cx="0.38" cy="0.34" r="0.7">
          <Stop offset="0" stopColor="#FFF4B8" />
          <Stop offset="0.55" stopColor="#FFD54A" />
          <Stop offset="1" stopColor="#FFB020" />
        </RadialGradient>
        <LinearGradient id="island" x1="0.15" y1="0" x2="0.85" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.5} />
          <Stop offset="0.5" stopColor="#E9FFF4" stopOpacity={0.3} />
          <Stop offset="1" stopColor="#C8F5DD" stopOpacity={0.22} />
        </LinearGradient>
        <RadialGradient id="red" cx="0.35" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#FF9A8A" />
          <Stop offset="0.55" stopColor="#E5402B" />
          <Stop offset="1" stopColor="#A3241A" />
        </RadialGradient>
        <RadialGradient id="green" cx="0.35" cy="0.3" r="0.8">
          <Stop offset="0" stopColor="#3FD58A" />
          <Stop offset="0.6" stopColor="#0B8F4C" />
          <Stop offset="1" stopColor="#055E32" />
        </RadialGradient>
      </Defs>

      <Rect width="390" height="460" fill="url(#sky)" />
      <Circle cx="322" cy="128" r="70" fill="url(#sun)" />
      <Circle cx="322" cy="128" r="26" fill="url(#sunDisk)" />

      {/* hills + palms */}
      <G transform="translate(0 38)">
        <Path d="M0 330 C 70 296, 140 306, 200 290 C 260 276, 320 296, 390 280 V 440 H 0 Z" fill="#1C9A68" fillOpacity={0.55} />
        <Path d="M0 360 C 60 326, 110 334, 160 318 C 210 304, 260 324, 300 312 C 340 300, 370 314, 390 306 V 440 H 0 Z" fill="#159063" />
        <Path d="M0 380 C 80 358, 150 368, 230 352 C 300 340, 350 354, 390 346 V 440 H 0 Z" fill="#1FA472" />
      </G>

      {/* glass island */}
      <G transform="translate(-1.2 58) scale(0.9)">
        <Path d={SRI_LANKA_PATH} fill="url(#island)" />
        <Path d={SRI_LANKA_PATH} fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeOpacity={0.95} strokeLinejoin="round" />
        <Path d={ROUTE} stroke="#C9EEDA" strokeWidth={8} fill="none" strokeLinecap="round" />
        <Path d={ROUTE} stroke="#0B8F4C" strokeWidth={3.6} strokeDasharray="6 5" fill="none" strokeLinecap="round" />
        {[
          [188, 204],
          [290, 250],
          [142, 317],
        ].map(([x, y]) => (
          <G key={`${x}`} transform={`translate(${x} ${y - 7.15}) scale(0.65)`}>
            <Path d={PIN} fill="url(#green)" stroke="#FFFFFF" strokeWidth={2} />
            <Path d="M-4 -6 L -1 -3 L 4.5 -9" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </G>
        ))}
        <G transform="translate(256 172.85) scale(0.65)">
          <Path d={PIN} fill="url(#red)" stroke="#FFFFFF" strokeWidth={2} />
          <Circle cx="0" cy="-6" r="3.8" fill="#FFFFFF" />
        </G>
        <G transform="translate(206 284.4) scale(0.6)">
          <Path d="M0 -26 C -10 -26 -16 -19 -16 -9 C -16 4 0 16 0 16 C 0 16 16 4 16 -9 C 16 -19 10 -26 0 -26 Z" fill="url(#red)" stroke="#FFFFFF" strokeWidth={2.5} />
          <Circle cx="0" cy="-9" r="5.5" fill="#FFFFFF" />
        </G>
      </G>
    </Svg>
  );
}
