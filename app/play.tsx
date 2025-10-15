import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function PlayScreen() {
  const [Panel, setPanel] = useState<any>(null);
  useEffect(() => {
    let alive = true;
    import('@/src/partials/PlayingPanels')
      .then((m: any) => { if (alive) setPanel(() => m.default || null); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  if (!Panel) return <View style={{ flex: 1 }} />;
  return <Panel />;
}
