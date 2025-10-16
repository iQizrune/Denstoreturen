import React from 'react';
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
export default function Intro2() {
  return (
    <View style={{ flex: 1, backgroundColor: '#111', padding: 24, justifyContent: 'center', gap: 12 }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700' }}>Slik fungerer det</Text>
      <Text style={{ color: '#ccc', fontSize: 16 }}>
        Svar riktig for å gå lenger. Ved stoppesteder får du egne oppgaver.
      </Text>
      <Link href="/play?cat=general" style={{ color: '#60a5fa', fontSize: 16 }}>Start spill →</Link>
      <Link href="/start" style={{ color: '#60a5fa', fontSize: 14 }}>Til start</Link>
    </View>
  );
}
