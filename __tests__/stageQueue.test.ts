import * as sq from '@/src/lib/stageQueue';

const drainQueue = () => {
  while (sq.takePendingStageStart()) { /* tøm */ }
};

describe('stageQueue', () => {
  it('queues and takes a single payload', () => {
    drainQueue();
    const payload = { fromName: 'A', toName: 'B', meters: 123 };
    sq.queueStageStart(payload);
    const taken = sq.takePendingStageStart();
    expect(taken).toEqual(payload);
    const again = sq.takePendingStageStart();
    expect(again === undefined || again === null).toBe(true);
  });
});
