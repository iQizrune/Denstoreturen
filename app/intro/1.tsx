import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
export default function Intro1() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, justifyContent: 'center', gap: 12 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '700' }}>Velkommen til Den store gåturen</Text>
      <Text style={{ color: '#ccc', fontSize: 16 }}>
        Du går Norge på langs. Underveis svarer du på spørsmål og samler meter.
      </Text>
      <Link href="/intro/2" style={{ color: '#60a5fa', fontSize: 16 }}>Neste →</Link>
      <Link href="/start" style={{ color: '#60a5fa', fontSize: 14 }}>Til start</Link>
    </View>
  );
}
