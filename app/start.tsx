import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Link } from 'expo-router';

export default function StartScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'flex-end', padding: 16, gap: 12, backgroundColor: '#111' }}>
      <Link href="/play?cat=general" asChild>
        <Pressable style={{ backgroundColor: '#60a5fa', padding: 16, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Start: General</Text>
        </Pressable>
      </Link>
      <Link href="/play?cat=kunst" asChild>
        <Pressable style={{ backgroundColor: '#34d399', padding: 16, borderRadius: 12, alignItems: 'center' }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Start: Kunst</Text>
        </Pressable>
      </Link>
    </View>
  );
}
