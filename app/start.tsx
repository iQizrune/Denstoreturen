import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Start() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, gap: 12, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Start</Text>
      <Link href="/play" style={{ color: '#60a5fa' }}>Spill (stub)</Link>
      <Link href="/results" style={{ color: '#60a5fa' }}>Resultater (stub)</Link>
      <Link href="/kart" style={{ color: '#60a5fa' }}>Se kart</Link>
    </View>
  );
}
