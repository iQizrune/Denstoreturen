import { Redirect } from 'expo-router';
import { getProfile } from '@/src/state/profile';

export default function Index() {
  const p: any = getProfile();
  const hasName = p && typeof p === 'object' && p.name && String(p.name).trim().length >= 2;
  return hasName ? <Redirect href="/start" /> : <Redirect href="/profile" />;
}
