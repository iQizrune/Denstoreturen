import AsyncStorage from "@react-native-async-storage/async-storage";

export type AgeGroup = "barn" | "ungdom" | "voksen" | "senior" | "ukjent";

export type Profile = {
  username: string;
  ageGroup: AgeGroup;
  avatarKey: string | null;
  createdAt: number;
  updatedAt: number;
};

const KEY = "app:profile";

async function read(): Promise<Profile | null> {
  try {
    const s = await AsyncStorage.getItem(KEY);
    return s ? (JSON.parse(s) as Profile) : null;
  } catch {
    return null;
  }
}

async function write(p: Profile) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
}

/** Hent profil (lager default hvis mangler) */
export async function getProfile(): Promise<Profile> {
  const existing = await read();
  if (existing) return existing;
  const def: Profile = {
    username: "Spiller",
    ageGroup: "ukjent",
    avatarKey: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await write(def);
  return def;
}

/** Delvis oppdatering: kun feltene du sender inn endres */
export async function updateProfile(partial: Partial<Profile>): Promise<Profile> {
  const prev = await getProfile();
  const next: Profile = { ...prev, ...partial, updatedAt: Date.now() };
  await write(next);
  return next;
}
