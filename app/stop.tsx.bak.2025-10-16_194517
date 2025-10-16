import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import StopModule from '../StopModule';
import { enterStop, exitStop } from '@/src/engine/conductor';
import { markStopSeen, advanceAfterStop, getCurrentStop } from '@/src/state/route';
import { getStopQuiz } from '@/src/banks/stopQuizAdapter';

export default function Stop() {
  const router = useRouter();
  useEffect(() => { enterStop(); }, []);

  const stop = getCurrentStop();
  const stopName = (stop?.id ?? stop?.name ?? 'lillehammer').toString();

  const quizGetter = useMemo(() => (name: string) => getStopQuiz(name), []);
  const onAwardByvapen = (city: string) => {};
  const onOpenMap = () => { router.replace('/kart'); };
  const onNextEtappe = () => {};
  const onComplete = (_r: { stopName: string; correct: number; total: number }) => {};

  const onExit = () => {
    markStopSeen();
    advanceAfterStop();
    exitStop();
    router.replace('/play?cat=general');
  };

  return (
    <View style={{ flex: 1 }}>
      <StopModule
        visible={true}
        stopName={stopName}
        getStopQuiz={quizGetter}
        onAwardByvapen={onAwardByvapen}
        onOpenMap={onOpenMap}
        onNextEtappe={onNextEtappe}
        onComplete={onComplete}
        onExit={onExit}
      />
    </View>
  );
}
