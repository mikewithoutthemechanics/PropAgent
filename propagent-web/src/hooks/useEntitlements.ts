'use client';

import { useAuth } from '@/lib/auth';
import { getEntitlements, type Entitlements } from '@/lib/entitlements';

export function useEntitlements(): Entitlements {
  const { profile } = useAuth();
  return getEntitlements(profile?.subscription_tier);
}
