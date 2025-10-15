import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';

export default function KartIOS() {
  const oslo = { latitude: 59.9139, longitude: 10.7522 };
  const lillehammer = { latitude: 61.1153, longitude: 10.4662 };
  const route = [oslo, { latitude: 60.3920, longitude: 10.5020 }, lillehammer];
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      mapRef.current?.fitToCoordinates(route, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView ref={mapRef} style={{ flex: 1 }} provider={PROVIDER_DEFAULT}
        initialRegion={{ latitude: 60.4, longitude: 10.7, latitudeDelta: 2.2, longitudeDelta: 2.2 }}>
        <Marker coordinate={oslo} title="Start" description="Oslo" />
        <Marker coordinate={lillehammer} title="Sjekkpunkt" description="Lillehammer" />
        <Polyline coordinates={route} />
      </MapView>
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
        <Link href="/start" style={{ backgroundColor: '#60a5fa', color: 'white', padding: 14, borderRadius: 12, textAlign: 'center' }}>Til start</Link>
      </View>
    </View>
  );
}
