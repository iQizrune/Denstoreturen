// src/storage/profile.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const AVATAR_KEY = 'app:avatar';
const PROFILE_KEY = 'app:profile';

export type Profile = {
  avatarKey?: string;
  username?: string;
  ageGroup?: string;
};

// Avatar (brukes av app/avatar.tsx)
export async function getAvatar(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(AVATAR_KEY);
  } catch {
    return null;
  }
}

export async function setAvatar(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(AVATAR_KEY, key);
  } catch {}
}

// Valgfritt: enkel profil-fasade (fint å ha videre)
export async function getProfile(): Promise<Profile> {
  try {
    const v = await AsyncStorage.getItem(PROFILE_KEY);
    return v ? JSON.parse(v) : {};
  } catch {
    return {};
  }
}

export async function updateProfile(patch: Partial<Profile>): Promise<Profile> {
  const cur = await getProfile();
  const next = { ...cur, ...patch };
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
  } catch {}
  return next;
}
