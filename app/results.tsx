import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Results() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, gap: 12, justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Results (stub)</Text>
      <Link href="/start" style={{ color: '#60a5fa' }}>Til start</Link>
      <Link href="/play" style={{ color: '#60a5fa' }}>Til play</Link>
    </View>
  );
}
