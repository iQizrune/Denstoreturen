export type BagSnapshotV1 = {
  version: 1;
  coats: string[];
  helps: string[];
  usedHelps?: string[];
};

export interface BagStorage {
  load(key: string): Promise<BagSnapshotV1 | null>;
  save(key: string, snapshot: BagSnapshotV1): Promise<void>;
  clear(key: string): Promise<void>;
}
