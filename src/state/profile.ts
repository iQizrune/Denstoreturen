export type AgeGroup = 'barn' | 'ung' | 'voksen';
export type Profile = { name: string; ageGroup: AgeGroup; avatar: string };

let profile: Profile = { name: '', ageGroup: 'voksen', avatar: '🚶' };

export function getProfile(): Profile { return profile; }
export function setProfile(p: Profile) { profile = { ...p }; }
export function updateProfile(p: Partial<Profile>) { profile = { ...profile, ...p }; }
