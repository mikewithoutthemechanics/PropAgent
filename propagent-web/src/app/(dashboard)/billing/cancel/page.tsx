'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';

export default function BillingCancelPage() {
  return (
    <div className="max-w-xl mx-auto mt-12 bg-white border-2 border-charcoal-100 rounded-2xl p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
        <XCircle className="w-7 h-7 text-charcoal-600" />
      </div>
      <h1 className="mt-4 text-2xl font-semibold text-charcoal-900">
        Payment cancelled
      </h1>
      <p className="mt-3 text-charcoal-500">
        No charge was made. You can try again whenever you&apos;re ready.
      </p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link
          href="/pricing"
          className="px-4 py-2 rounded-full bg-lime-400 hover:bg-lime-500 text-charcoal-900 font-medium"
        >
          Back to pricing
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-full border-2 border-charcoal-100 text-charcoal-900"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
