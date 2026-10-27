import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'map' | 'nearby' | 'pin' | 'pinPlus' | 'mypins' | 'profile' | 'jobs' | 'go' | 'history'
  | 'bell' | 'back' | 'close' | 'arrow' | 'check' | 'clock' | 'truck' | 'leaf' | 'camera'
  | 'retake' | 'plus' | 'share' | 'star' | 'flame' | 'lock' | 'home' | 'bottle' | 'bricks'
  | 'phone' | 'warning' | 'building' | 'eyeOff' | 'bag' | 'pile' | 'locate' | 'navigate';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number; fill?: string };

export function Icon({ name, size = 22, color = '#10231B', strokeWidth = 1.8, fill = 'none' }: Props) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill };
  const body = (() => {
    switch (name) {
      case 'map': return (<><Path {...p} d="M9 4 3.5 6.2v13.6L9 17.6l6 2.4 5.5-2.2V4.2L15 6.4z" /><Path {...p} d="M9 4v13.6M15 6.4V20" /></>);
      case 'nearby': return (<><Circle {...p} cx="12" cy="12" r="8.5" /><Circle {...p} cx="12" cy="12" r="4" /><Circle cx="12" cy="12" r="1" fill={color} /></>);
      case 'pin': return (<><Path {...p} d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><Circle {...p} cx="12" cy="9" r="2.5" /></>);
      case 'pinPlus': return (<><Path {...p} d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><Path {...p} d="M12 6.5v5M9.5 9h5" /></>);
      case 'mypins': return (<><Rect {...p} x="4" y="5" width="16" height="15" rx="3" /><Path {...p} d="M8 3v4M16 3v4M4 10h16" /><Path {...p} d="M9 14.5l2 2 4-4" /></>);
      case 'profile': return (<><Circle {...p} cx="12" cy="8" r="4" /><Path {...p} d="M4.5 20.5a7.5 7.5 0 0 1 15 0" /></>);
      case 'jobs': return (<><Rect {...p} x="5" y="4.5" width="14" height="16.5" rx="3" /><Path {...p} d="M9 3h6v3H9z" /><Path {...p} d="M8.5 13.5l2.5 2.5 4.5-5" /></>);
      case 'go': case 'navigate': return <Path {...p} d="M12 3l7.5 17.5L12 17l-7.5 3.5z" />;
      case 'history': case 'clock': return (<><Circle {...p} cx="12" cy="12" r="8.5" /><Path {...p} d="M12 7.5V12l3 2" /></>);
      case 'bell': return (<><Path {...p} d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><Path {...p} d="M10.3 21a1.9 1.9 0 0 0 3.4 0" /></>);
      case 'back': return <Path {...p} d="M15 6l-6 6 6 6" />;
      case 'close': return <Path {...p} d="M6 6l12 12M18 6L6 18" />;
      case 'arrow': return (<><Path {...p} d="M5 12h14" /><Path {...p} d="M13 6l6 6-6 6" /></>);
      case 'check': return <Path {...p} d="M5 12.5l4.5 4.5L19 7.5" />;
      case 'truck': return (<><Path {...p} d="M3 7h11v9H3z" /><Path {...p} d="M14 10h4l3 3v3h-7" /><Circle {...p} cx="7" cy="17.5" r="1.8" /><Circle {...p} cx="17" cy="17.5" r="1.8" /></>);
      case 'leaf': return (<><Path {...p} d="M5 20c0-8 5-14 15-15-1 10-7 15-15 15z" /><Path {...p} d="M5 20l7-7" /></>);
      case 'camera': return (<><Path {...p} d="M3 8a2 2 0 0 1 2-2h2l2-2h6l2 2h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><Circle {...p} cx="12" cy="13" r="3.5" /></>);
      case 'retake': return (<><Path {...p} d="M3 12a9 9 0 1 0 3-6.7" /><Path {...p} d="M3 4v5h5" /></>);
      case 'plus': return <Path {...p} d="M12 5v14M5 12h14" />;
      case 'share': return (<><Circle {...p} cx="18" cy="5" r="2.5" /><Circle {...p} cx="6" cy="12" r="2.5" /><Circle {...p} cx="18" cy="19" r="2.5" /><Path {...p} d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" /></>);
      case 'star': return <Path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill={color} />;
      case 'flame': return <Path d="M12 3c2 3 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-8z" fill={color} />;
      case 'lock': return (<><Rect {...p} x="5" y="11" width="14" height="10" rx="2" /><Path {...p} d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
      case 'home': return (<><Path {...p} d="M3 11l9-7 9 7" /><Path {...p} d="M5 10v10h14V10" /></>);
      case 'bottle': return <Path {...p} d="M10 2h4v3l2 3v13a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V8l2-3z" />;
      case 'bricks': return (<><Rect {...p} x="3" y="12" width="7" height="8" rx="1" /><Rect {...p} x="14" y="12" width="7" height="8" rx="1" /><Rect {...p} x="8.5" y="4" width="7" height="8" rx="1" /></>);
      case 'phone': return (<><Rect {...p} x="6" y="2" width="12" height="20" rx="2" /><Path {...p} d="M11 18h2" /></>);
      case 'warning': return (<><Path {...p} d="M12 9v4M12 17h.01" /><Path {...p} d="M10.3 3.9L2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>);
      case 'building': return <Path {...p} d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" />;
      case 'eyeOff': return (<><Circle {...p} cx="12" cy="8" r="4" /><Path {...p} d="M4 21a8 8 0 0 1 16 0" /><Path {...p} d="M3 3l18 18" /></>);
      case 'bag': return (<><Path {...p} d="M7 8h10l-1 12H8z" /><Path {...p} d="M9 8c0-2 1.3-4 3-4s3 2 3 4" /></>);
      case 'pile': return <Path {...p} d="M3 19h18L15 7l-3 4-2-2z" />;
      case 'locate': return (<><Circle {...p} cx="12" cy="12" r="4" /><Path {...p} d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>);
    }
  })();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {body}
    </Svg>
  );
}
