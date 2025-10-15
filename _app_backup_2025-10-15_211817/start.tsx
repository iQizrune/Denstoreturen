import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function StartScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, gap: 12 }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Start</Text>

      <Link href="/play?cat=general" style={{ color: '#60a5fa' }}>Spill (general)</Link>
      <Link href="/play?cat=kunst" style={{ color: '#60a5fa' }}>Spill (kunst)</Link>
      <Link href="/kart" style={{ color: '#60a5fa' }}>Se kart (test)</Link>
    </View>
  );
}
