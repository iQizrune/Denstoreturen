import AsyncStorage from "@react-native-async-storage/async-storage";
import type { StatsStorage } from "./statsStorage";
import type { StatsSnapshotV1 } from "./statsTypes";

const parse = (raw: string | null): StatsSnapshotV1 | null => {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && obj.version === 1) {
      return obj as StatsSnapshotV1;
    }
  } catch {}
  return null;
};

export const statsStorageAsync: StatsStorage = {
  async load(key: string): Promise<StatsSnapshotV1 | null> {
    return parse(await AsyncStorage.getItem(key));
  },
  async save(key: string, snapshot: StatsSnapshotV1): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(snapshot));
  },
  async clear(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
