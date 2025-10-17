import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { getProfile } from '@/src/state/profile';

export default function StartScreen() {
  const router = useRouter();
  const p: any = getProfile();
  const name = p?.name ? String(p.name).trim() : 'Spiller';

  return (
    <View style={{ flex:1, padding:24, backgroundColor:'#111', gap:16 }}>
      <Text style={{ color:'#9ca3af' }}>Hei, {name}</Text>
      <Text style={{ color:'white', fontSize:24, fontWeight:'800' }}>Etappe 1</Text>
      <Text style={{ color:'#d1d5db', fontSize:18, marginTop:4 }}>Lindesnes fyr → Mandal</Text>

      <Pressable
        onPress={() => router.push('/intro/1')}
        style={{ backgroundColor:'#374151', padding:12, borderRadius:12, marginTop:8 }}
      >
        <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>
          Info før du starter
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push('/play')}
        style={{ backgroundColor:'#10b981', padding:14, borderRadius:12, marginTop:8 }}
      >
        <Text style={{ color:'white', textAlign:'center', fontWeight:'800' }}>
          Start quiz
        </Text>
      </Pressable>

      {/* NY: Se kart */}
      <Pressable
        onPress={() => router.replace('/kart')}
        style={{ backgroundColor:'#1f2937', padding:12, borderRadius:12, marginTop:8 }}
      >
        <Text style={{ color:'white', textAlign:'center', fontWeight:'700' }}>
          Se kart
        </Text>
      </Pressable>

      <View style={{ flex:1 }} />
      <Link href="/home" style={{ color:'#60a5fa' }}>
        Til hjem
      </Link>
    </View>
  );
}
