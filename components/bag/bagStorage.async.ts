import AsyncStorage from "@react-native-async-storage/async-storage";
import type { BagSnapshotV1, BagStorage } from "./bagStorage";

const parse = (s: string | null): BagSnapshotV1 | null => {
  if (!s) return null;
  try {
    const obj = JSON.parse(s);
    if (obj && obj.version === 1 && Array.isArray(obj.coats) && Array.isArray(obj.helps)) {
      return obj as BagSnapshotV1;
    }
    return null;
  } catch {
    return null;
  }
};

export const bagStorageAsync: BagStorage = {
  async load(key: string): Promise<BagSnapshotV1 | null> {
    const raw = await AsyncStorage.getItem(key);
    return parse(raw);
  },
  async save(key: string, snapshot: BagSnapshotV1): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(snapshot));
  },
  async clear(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
