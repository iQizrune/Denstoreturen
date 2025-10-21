import React, { useMemo } from 'react';
import { View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getTotalMeters } from '@/src/state/run';
import { getCurrentLegTargetMeters } from '@/src/state/route';
import { Link } from 'expo-router';

const oslo = { latitude: 59.9139, longitude: 10.7522 };
const lillehammer = { latitude: 61.1153, longitude: 10.4662 };

function clamp01(x: number) { return Math.max(0, Math.min(1, x)); }

export default function KartScreen() {
  const total = getTotalMeters();
  const target = getCurrentLegTargetMeters();
  const f = useMemo(() => clamp01(target > 0 ? total / target : 0), [total, target]);

  const you = useMemo(() => ({
    latitude: oslo.latitude + (lillehammer.latitude - oslo.latitude) * f,
    longitude: oslo.longitude + (lillehammer.longitude - oslo.longitude) * f,
  }), [f]);

  const initialRegion = useMemo(() => ({
    latitude: (oslo.latitude + lillehammer.latitude) / 2,
    longitude: (oslo.longitude + lillehammer.longitude) / 2,
    latitudeDelta: Math.abs(lillehammer.latitude - oslo.latitude) * 2,
    longitudeDelta: Math.abs(lillehammer.longitude - oslo.longitude) * 2,
  }), []);

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} initialRegion={initialRegion}>
        <Marker coordinate={oslo} title="Start" description="Oslo" />
        <Marker coordinate={lillehammer} title="Stopp 1" description="Lillehammer" />
        <Polyline coordinates={[oslo, lillehammer]} />
        <Marker coordinate={you} title="Du er her" />
      </MapView>
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <Link href="/start" style={{ backgroundColor: '#60a5fa', color: 'white', padding: 14, borderRadius: 12, textAlign: 'center' }}>
          Til start
        </Link>
      </View>
    </View>
  );
}
