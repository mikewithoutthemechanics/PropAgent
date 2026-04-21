'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

function BillingSuccessInner() {
  const params = useSearchParams();
  const ref = params.get('ref');

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white border-2 border-charcoal-100 rounded-2xl p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-lime-100 flex items-center justify-center">
        <CheckCircle2 className="w-7 h-7 text-lime-600" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-charcoal-900">
        Payment confirmed
      </h1>
      <p className="mt-3 text-charcoal-500">
        Thanks — your subscription is being activated. It usually takes a few
        seconds for PayFast to confirm with us. You&apos;ll see your new plan
        reflected in Settings shortly.
      </p>
      {ref && (
        <p className="mt-4 text-xs text-charcoal-400">
          Reference: <span className="font-mono">{ref}</span>
        </p>
      )}
      <div className="mt-6 flex gap-3 justify-center">
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-medium"
        >
          Go to dashboard
        </Link>
        <Link
          href="/settings"
          className="px-4 py-2 rounded-full border-2 border-charcoal-100 text-charcoal-900"
        >
          View billing
        </Link>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BillingSuccessInner />
    </Suspense>
  );
}
