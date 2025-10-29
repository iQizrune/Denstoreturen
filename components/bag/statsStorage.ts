import type { StatsSnapshotV1 } from "./statsTypes";

export interface StatsStorage {
  load(key: string): Promise<StatsSnapshotV1 | null>;
  save(key: string, snapshot: StatsSnapshotV1): Promise<void>;
  clear(key: string): Promise<void>;
}
