import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';


export default function PlayScreen() {
  const [Panel, setPanel] = useState<any>(null);
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
    <Link href="/home">Til hjem</Link>
  </>
);
}
