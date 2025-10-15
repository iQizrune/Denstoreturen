import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Link } from 'expo-router';


export default function HomeScreen() {
  const [Panel, setPanel] = useState<any>(null);

  useEffect(() => {
    let alive = true;
    console.log('[phase] home: mount');
    import('@/src/features/profile/HomePhasePanel')
      .then((m: any) => { if (alive) setPanel(() => m.default || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!Panel) return <View style={{ flex: 1 }} />;

  return (
  <>
    <Panel />
    <Link href="/play">Start spill</Link>
  </>
);

}
