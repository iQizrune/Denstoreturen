// src/state/storageKeys.ts
// Felles navnerom for alle AsyncStorage-nøkler i appen.

export const STORAGE_KEYS = {
  profile: "app:profile",
  avatar: "app:avatar",
  meters: "app:meters",
  routeState: "app:routeState",
  bag: "app:bag",
  coats: "app:coats",
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;
export type StorageKeyValue = (typeof STORAGE_KEYS)[StorageKey];
