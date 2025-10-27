import { takePendingStageStart } from '@/src/lib/stageQueue';

let timer: any;

export function startStageQueueWatchdog() {
  if (!__DEV__) return;
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    const p = takePendingStageStart();
    if (p) {
      console.warn('[watchdog] StageStart stuck in queue:', p);
    }
  }, 2000);
}

export function stopStageQueueWatchdog() {
  if (timer) clearInterval(timer);
  timer = null;
}
