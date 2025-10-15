import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { onMeters } from './lib/progressBus';
import { publishMeters } from './lib/progressBus';






export default function PlayScreen() {
  const [Panel, setPanel] = useState<any>(null);
  const router = useRouter();
  const [meters, setMeters] = useState(0);
useEffect(() => {
  const off = onMeters(({ meters }) => setMeters(meters));
  return off;
}, []);

  useEffect(() => {
    let alive = true;
    console.log('[phase] play: mount');
    import('@/src/partials/PlayingPanels')
      .then((m: any) => { if (alive) setPanel(() => m.default || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!Panel) return <View style={{ flex: 1 }} />;
  return (
  <>
    <Panel />

    <Text>Meter: {meters}</Text>
    <Pressable onPress={() => publishMeters(meters + 10)} style={{ marginTop: 8 }}>
      <Text>+10 meter</Text>
    </Pressable>

    <Pressable onPress={() => router.replace(`/results?score=${meters}`)} style={{ marginTop: 12 }}>
      <Text>Fullfør spill →</Text>
    </Pressable>

    <Link href="/home">Til hjem</Link>
  </>
);

}
