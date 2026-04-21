'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PLANS, type Plan } from '@/lib/plans';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (plan: Plan) => {
    setError(null);

    // Free tier — just send new visitors to register, existing users back to
    // the dashboard.
    if (!plan.paid) {
      router.push(user ? '/dashboard' : '/register');
      return;
    }

    if (!user) {
      router.push(`/register?plan=${plan.id}`);
      return;
    }

    setBusyPlan(plan.id);
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError('Your session expired. Please sign in again.');
        setBusyPlan(null);
        return;
      }
      const res = await fetch('/api/payfast/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId: plan.id }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(body.error || `Failed to start checkout (${res.status})`);
        setBusyPlan(null);
        return;
      }
      const body = (await res.json()) as { url: string };
      window.location.href = body.url;
    } catch (err) {
      setError((err as Error).message);
      setBusyPlan(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-charcoal-900">
          Simple, transparent pricing
        </h1>
        <p className="mt-4 text-charcoal-500 max-w-2xl mx-auto">
          Choose the plan that fits your property management needs. All plans
          include a 14-day free trial. Payments are processed securely by
          PayFast.
        </p>
      </div>

      {error && (
        <div className="max-w-xl mx-auto mb-8 rounded-xl border-2 border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 transition-all duration-300 ${
              plan.popular
                ? 'border-lime-400 shadow-lg shadow-lime-400/20'
                : 'border-charcoal-100 hover:border-lime-400/30 hover:shadow-lg hover:shadow-lime-400/10'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-lime-400 text-charcoal-900 text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div className="p-6">
              <h3 className="text-xl font-semibold text-charcoal-900">
                {plan.name}
              </h3>
              <p className="mt-2 text-charcoal-500 text-sm">
                {plan.description}
              </p>

              <div className="mt-6">
                <span className="text-4xl font-bold text-charcoal-900">
                  {plan.priceLabel}
                </span>
                {plan.period && (
                  <span className="text-charcoal-500">{plan.period}</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleSelect(plan)}
                disabled={busyPlan !== null}
                className={`mt-6 block w-full py-3 px-4 rounded-full font-medium text-center transition-all duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                  plan.popular
                    ? 'bg-lime-400 hover:bg-lime-500 text-charcoal-900'
                    : 'bg-white border-2 border-charcoal-100 hover:bg-charcoal-100 text-charcoal-900'
                }`}
              >
                {busyPlan === plan.id ? 'Redirecting…' : plan.cta}
              </button>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature.name}
                    className="flex items-center gap-3"
                  >
                    {feature.included ? (
                      <Check className="w-5 h-5 text-lime-500 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-charcoal-400 flex-shrink-0" />
                    )}
                    <span
                      className={
                        feature.included
                          ? 'text-charcoal-700'
                          : 'text-charcoal-500'
                      }
                    >
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-white border-2 border-charcoal-100 rounded-2xl p-8">
        <h3 className="text-xl font-semibold text-charcoal-900">
          Frequently asked questions
        </h3>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-charcoal-900">
              Can I change plans anytime?
            </h4>
            <p className="mt-2 text-charcoal-500">
              Yes, you can upgrade or downgrade your plan at any time. Changes
              take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-charcoal-900">
              Is there a free trial?
            </h4>
            <p className="mt-2 text-charcoal-500">
              Yes, all paid plans include a 14-day free trial. No credit card
              required.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-charcoal-900">
              What payment methods do you accept?
            </h4>
            <p className="mt-2 text-charcoal-500">
              All major South African debit and credit cards, Instant EFT,
              Masterpass, Zapper, SnapScan and more, processed securely
              through PayFast.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-charcoal-900">
              Can I get a refund?
            </h4>
            <p className="mt-2 text-charcoal-500">
              Yes, we offer a 30-day money-back guarantee on all plans.
            </p>
          </div>
        </div>
        <p className="mt-6 text-xs text-charcoal-400">
          Questions? <Link href="/settings" className="underline">Contact support</Link>.
        </p>
      </div>
    </div>
  );
}
