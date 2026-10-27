import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Web placeholder for react-native-maps (native-only).
const MapView = React.forwardRef<View, any>(function MapView({ style, children }, ref) {
  return (
    <View ref={ref} style={[styles.map, style]}>
      <Text style={styles.text}>Map preview is available on the mobile app</Text>
      {children}
    </View>
  );
});

export const Marker = (_props: any) => null;
export const Polyline = (_props: any) => null;
export const PROVIDER_DEFAULT = null;
export const PROVIDER_GOOGLE = 'google';

export default MapView;

const styles = StyleSheet.create({
  map: { backgroundColor: '#dfe9e1', alignItems: 'center', justifyContent: 'center', minHeight: 160 },
  text: { color: '#4a5d50' },
});
