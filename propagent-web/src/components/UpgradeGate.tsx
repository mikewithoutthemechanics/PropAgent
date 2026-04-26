'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useEntitlements } from '@/hooks/useEntitlements';
import type { Entitlements } from '@/lib/entitlements';

type EntitlementKey = keyof Omit<Entitlements, 'tier' | 'maxProperties'>;

interface UpgradeGateProps {
  feature: EntitlementKey;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function UpgradeGate({ feature, children, fallback }: UpgradeGateProps) {
  const entitlements = useEntitlements();
  const hasAccess = entitlements[feature] === true;

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative rounded-2xl border-2 border-charcoal-100 bg-charcoal-50/50 p-8 text-center">
      <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
        <Lock className="w-5 h-5 text-charcoal-400" />
      </div>
      <h3 className="text-lg font-semibold text-charcoal-900">Upgrade to unlock</h3>
      <p className="mt-1 text-sm text-charcoal-500">
        This feature requires a paid plan.
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-block rounded-full bg-lime-400 px-5 py-2 text-sm font-medium text-charcoal-900 hover:bg-lime-500 transition-colors"
      >
        View plans
      </Link>
    </div>
  );
}
