// EcoPin design tokens — taken from the Claude Design canvas.
export const colors = {
  green900: '#054A32',
  green800: '#0A4D37',
  green700: '#0A5E42',
  green600: '#0E7A55',
  green500: '#15A274',
  green400: '#34C38A',
  mint: '#8DFFCB',
  mintSoft: '#E3F6EC',
  mintBg: '#E9F7F0',
  bg: '#F2F7F4',
  white: '#FFFFFF',
  ink: '#10231B',
  ink2: '#34463D',
  muted: '#56685F',
  border: '#E1ECE5',

  red: '#E5402B',
  redSoft: '#FDF0EE',
  amber: '#F2A33A',
  amberDark: '#9A4E05',
  amberSoft: '#FFF4E3',
  blue: '#2F6FDB',
  blueDark: '#1F4F99',
  blueSoft: '#EAF1FD',
  gold: '#FFBE29',

  // Sri Lanka flag stripe
  flag: ['#EB7400', '#00534E', '#8D153A', '#FFBE29'],
} as const;

export const gradients = {
  primary: ['#15A274', '#0E7A55', '#0A5E42'] as const,
  header: ['#0B7350', '#0A5E42', '#054A32'] as const,
  mintGlow: ['#34C38A', '#0E7A55'] as const,
};

export const radius = { sm: 12, md: 16, lg: 22, xl: 30, pill: 999 };

export const shadow = {
  card: {
    shadowColor: '#10231B',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  button: {
    shadowColor: '#0E7A55',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
};

export const font = {
  // Add Plus Jakarta Sans / Noto Sans Sinhala / Noto Sans Tamil with expo-font if you want the exact design fonts.
  regular: undefined as string | undefined,
};

export type PinStatus = 'reported' | 'verified' | 'assigned' | 'on_the_way' | 'collected' | 'rejected';

export const statusColor: Record<PinStatus, string> = {
  reported: colors.amber,
  verified: colors.amber,
  assigned: colors.blue,
  on_the_way: colors.blue,
  collected: colors.green600,
  rejected: colors.muted,
};
