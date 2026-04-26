// Feature-gating by subscription tier. Enforces plan limits so free users
// don't get paid features.

import type { PlanId } from '@/lib/plans';

export interface Entitlements {
  tier: PlanId;
  maxProperties: number;
  aiMatching: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

const ENTITLEMENT_MAP: Record<PlanId, Entitlements> = {
  starter: {
    tier: 'starter',
    maxProperties: 5,
    aiMatching: false,
    advancedAnalytics: false,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: false,
  },
  professional: {
    tier: 'professional',
    maxProperties: 50,
    aiMatching: true,
    advancedAnalytics: true,
    apiAccess: false,
    whiteLabel: false,
    prioritySupport: true,
  },
  enterprise: {
    tier: 'enterprise',
    maxProperties: Infinity,
    aiMatching: true,
    advancedAnalytics: true,
    apiAccess: true,
    whiteLabel: true,
    prioritySupport: true,
  },
};

export function getEntitlements(tier: string | undefined | null): Entitlements {
  const key = (tier ?? 'starter') as PlanId;
  return ENTITLEMENT_MAP[key] ?? ENTITLEMENT_MAP.starter;
}
