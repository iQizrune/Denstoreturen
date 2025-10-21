import React, { useEffect, useMemo, useState } from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import type { StopQ } from '@/src/banks/stopQuizAdapter';

type Props = {
  visible: boolean;
  stopName: string;
  getStopQuiz: (name: string) => StopQ[];
  onAwardByvapen?: (city: string) => void;
  onOpenMap?: () => void;
  onNextEtappe?: () => void;
  onComplete?: (r: { stopName: string; correct: number; total: number }) => void;
  onExit?: () => void;
};

export default function StopModule({
  visible,
  stopName,
  getStopQuiz,
  onAwardByvapen,
  onOpenMap,
  onNextEtappe,
  onComplete,
  onExit,
}: Props) {
  const quiz = useMemo(() => getStopQuiz(stopName) ?? [], [stopName, getStopQuiz]);
  const total = quiz.length || 0;
  const [i, setI] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<'poster' | 'quiz' | 'done'>(total ? 'poster' : 'done');

  useEffect(() => { setI(0); setCorrect(0); setPhase(total ? 'poster' : 'done'); }, [stopName, total]);

  const startQuiz = () => setPhase('quiz');

  const pick = (optId: string) => {
    const q = quiz[i];
    if (!q) return;
    {
      const chosen = q.options?.find(o => o.id === optId);
      if (chosen?.isCorrect) setCorrect(c => c + 1);
    }
    const nxt = i + 1;
    if (nxt < total) setI(nxt);
    else setPhase('done');
  };

  useEffect(() => {
    if (phase === 'done') {
      onComplete?.({ stopName, correct, total });
      if (total > 0 && correct === total) onAwardByvapen?.(stopName);
    }
  }, [phase]);

  if (!visible) return null;

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={{ flex:1, backgroundColor:'rgba(0,0,0,0.85)', alignItems:'center', justifyContent:'center', padding:16 }}>
        <View style={{ width:'94%', maxWidth:520, backgroundColor:'#111827', borderColor:'#374151', borderWidth:1, borderRadius:20, padding:18 }}>
          {phase === 'poster' && (
            <View style={{ gap:12 }}>
              <Text style={{ color:'#9ca3af', fontWeight:'700' }}>Ankommet</Text>
              <Text style={{ color:'white', fontWeight:'900', fontSize:22 }}>{stopName}</Text>
              <Pressable onPress={startQuiz} style={{ backgroundColor:'#2563eb', borderRadius:12, padding:12, marginTop:8 }}>
                <Text style={{ color:'white', textAlign:'center', fontWeight:'800' }}>Start stopp-oppdrag</Text>
              </Pressable>
              <View style={{ flexDirection:'row', gap:8 }}>
                {onOpenMap && (
                  <Pressable onPress={onOpenMap} style={{ backgroundColor:'#1f2937', borderColor:'#374151', borderWidth:1, borderRadius:10, paddingVertical:10, paddingHorizontal:14 }}>
                    <Text style={{ color:'white', fontWeight:'700' }}>Se kart</Text>
                  </Pressable>
                )}
                {onNextEtappe && (
                  <Pressable onPress={onNextEtappe} style={{ backgroundColor:'#1f2937', borderColor:'#374151', borderWidth:1, borderRadius:10, paddingVertical:10, paddingHorizontal:14 }}>
                    <Text style={{ color:'white', fontWeight:'700' }}>Neste etappe</Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}

          {phase === 'quiz' && (
            <View style={{ gap:12 }}>
              <Text style={{ color:'#9ca3af', fontWeight:'700' }}>{i+1} / {total}</Text>
              <Text style={{ color:'white', fontSize:18, fontWeight:'800' }}>{quiz[i]?.text}</Text>
              <View style={{ gap:8 }}>
                {quiz[i]?.options?.map((o: any) => (
                  <Pressable key={o.id} onPress={() => pick(o.id)} style={{ backgroundColor:'#e5e7eb', borderRadius:12, padding:14 }}>
                    <Text>{o.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {phase === 'done' && (
            <View style={{ gap:12 }}>
              <Text style={{ color:'#9ca3af', fontWeight:'700' }}>Ferdig</Text>
              <Text style={{ color:'white', fontSize:18, fontWeight:'800' }}>{correct} / {total} riktige</Text>
              <Pressable onPress={onExit} style={{ backgroundColor:'#10b981', borderRadius:12, padding:12, marginTop:8 }}>
                <Text style={{ color:'white', textAlign:'center', fontWeight:'800' }}>Fortsett ruten</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
