import React, { useEffect, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { getStops } from '@/src/state/route';
import { getMetersSnapshot, publishMeters, subscribeMeters } from '@/src/lib/progressBus';

type Stop = { id: string; name: string; at: number };

function findNextStopLocal(total: number, stops: Stop[]) {
  for (let i = 0; i < stops.length; i++) {
    if (total < stops[i].at) return stops[i];
  }
  return null;
}

export default function PlayScreen() {
  const [Panel, setPanel] = useState<any>(null);
  const [meters, setMeters] = useState<number>(getMetersSnapshot());
  const [next, setNext] = useState<Stop | null>(null);

  useEffect(() => {
    let alive = true;
    import('@/src/partials/PlayingPanels')
      .then((m: any) => { if (alive) setPanel(() => m.default || null); })
      .catch(() => {});
    const unsub = subscribeMeters(({ meters: m }) => {
      setMeters(m);
      const s = getStops() as Stop[];
      setNext(findNextStopLocal(m, s));
    });
    // første kalkulasjon:
    const s = getStops() as Stop[];
    setNext(findNextStopLocal(getMetersSnapshot(), s));

    return () => { alive = false; unsub?.(); };
  }, []);

  const devJump = () => {
    const total = getMetersSnapshot();
    const s = getStops() as Stop[];
    const nxt = findNextStopLocal(total, s);
    if (!nxt) return;
    const target = Math.max(0, nxt.at - 100);
    if (total < target) {
      console.log('[dev] jump to', target);
      publishMeters(target);
    }
  };

  if (!Panel) return <View style={{ flex:1, backgroundColor:'#111' }} />;

  const remaining = next ? Math.max(0, next.at - meters) : 0;

  return (
    <View style={{ flex:1, backgroundColor:'#111' }}>
      {/* HUD */}
      <View
        style={{
          position:'absolute',
          top:40,
          left:16,
          right:16,
          zIndex: 9999,
          elevation: 50,
          backgroundColor:'rgba(17,17,17,0.8)',
          borderRadius:12,
          padding:10,
          borderWidth:1,
          borderColor:'#333'
        }}
        pointerEvents="none"
      >
        <Text style={{ color:'#fff', fontWeight:'800', textAlign:'center' }}>
          {meters} m {next ? `• ${next.name} om ${remaining} m` : ''}
        </Text>
      </View>

      {/* Spørspanel under */}
      <View style={{ flex:1 }}>
        <Panel />
      </View>

      {/* Dev-knapp på topp av z-stack */}
      <Pressable
        onPress={devJump}
        accessibilityRole="button"
        hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
        style={{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 96,          // løftet litt ekstra
          backgroundColor: '#374151',
          padding: 16,
          borderRadius: 14,
          zIndex: 10000,
          elevation: 60
        }}
      >
        <Text style={{ color:'white', fontWeight:'800', textAlign:'center' }}>
          Dev: hopp til 100 m før neste stopp
        </Text>
      </Pressable>
    </View>
  );
}
