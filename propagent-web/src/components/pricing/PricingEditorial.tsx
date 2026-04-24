'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Tier = {
  name: string;
  monthly: number | 'Custom';
  yearly?: number | 'Custom';
  desc: string;
  features: string[];
  popular?: boolean;
};

const CURRENCY = 'R';

const TIERS: Tier[] = [
  {
    name: 'Starter',
    monthly: 499,
    yearly: 499 * 10, // 2 months free
    desc: 'Individual portfolios getting started',
    features: ['Up to 10 units', 'Tenant portal', 'Basic reporting', 'Email support'],
  },
  {
    name: 'Professional',
    monthly: 999,
    yearly: 999 * 10,
    desc: 'Scale operations with advanced tools',
    features: ['Up to 50 units', 'Advanced analytics', 'Priority support', 'API access', 'Custom branding'],
    popular: true,
  },
  {
    name: 'Enterprise',
    monthly: 'Custom',
    yearly: 'Custom',
    desc: 'Institutional grade deployments',
    features: ['Unlimited units', 'Dedicated manager', 'Custom integrations', 'SLA guarantee', 'On‑premise option'],
  },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

const COMPLIANCE_BADGES = [
  { label: 'PPRA Registered', icon: '🏛️' },
  { label: 'POPIA Compliant', icon: '🔒' },
  { label: 'FICA Ready', icon: '✓' },
  { label: 'NCA Aligned', icon: '📋' },
];

export default function PricingEditorial() {
  const reduced = useReducedMotion();
  const [annual, setAnnual] = useState(false);

  const formatted = useMemo(() =>
    new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }),
  []);

  return (
    <section id="pricing" className="relative pt-20 pb-28 md:pb-40 bg-charcoal-900">
      {/* Compliance trust strip */}
      <div className="border-b border-white/5 mb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-x-10 gap-y-3">
            <span className="text-[9px] tracking-[0.35em] font-bold uppercase text-white/25 shrink-0">COMPLIANCE</span>
            {COMPLIANCE_BADGES.map((b) => (
              <span key={b.label} className="flex items-center gap-2 text-[10px] tracking-[0.2em] font-semibold uppercase text-white/40 hover:text-white/70 transition-colors cursor-default">
                <span aria-hidden>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 md:mb-20">
          <div>
            <span className="text-lime-400 text-[10px] tracking-[0.2em] font-semibold uppercase mb-4 block">EDITIONS</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Pricing that grows with you</h2>
          </div>
          <div className="flex items-center gap-3 select-none" aria-label="Billing period toggle">
            <span className={`text-sm ${annual ? 'text-white/50' : 'text-white'}`}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/20"
              aria-pressed={annual}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-white/50'}`}>Annual <span className="text-lime-400">(2 mo off)</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {TIERS.map((t) => {
            const price = annual ? t.yearly : t.monthly;
            const isCustom = price === 'Custom';
            const priceStr = isCustom ? 'Custom' : `${CURRENCY}${formatted.format(price as number)}`;
            return (
              <article key={t.name} className={`relative border ${t.popular ? 'border-white' : 'border-white/10'} bg-white/5 backdrop-blur-md p-8 md:p-10`} aria-label={`${t.name} plan`}>
                {t.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-1 text-[10px] tracking-[0.12em] font-semibold bg-white text-charcoal-900">POPULAR</div>
                )}
                <h3 className="text-xl font-semibold text-white mb-2">{t.name}</h3>
                <p className="text-white/70 mb-6">{t.desc}</p>
                <div className="flex flex-col mb-8">
                  <div className="flex items-end gap-2">
                    <span className={`text-4xl md:text-5xl font-bold ${t.popular ? 'text-lime-400' : 'text-white'}`}>{priceStr}</span>
                    {!isCustom && (
                      <span className="text-sm text-white/60">/{annual ? 'yr' : 'mo'}</span>
                    )}
                  </div>
                  {annual && !isCustom && typeof t.monthly === 'number' && typeof t.yearly === 'number' && (
                    <span className="mt-1 text-xs text-lime-400 font-semibold">
                      Save {CURRENCY}{(new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 })).format(t.monthly * 12 - t.yearly)} / year
                    </span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-white/80">
                      <span className="inline-block w-1.5 h-1.5 bg-lime-400" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={t.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`inline-flex items-center justify-center w-full px-6 py-4 text-[12px] tracking-[0.12em] font-semibold transition-colors ${t.popular ? 'bg-white text-charcoal-900 hover:bg-lime-400' : 'border border-white text-white hover:bg-white hover:text-charcoal-900'}`}
                  aria-label={`Select ${t.name} plan`}
                >
                  {t.name === 'Enterprise' ? 'CONTACT SALES' : 'GET STARTED'}
                </a>
              </article>
            );
          })}
        </div>
      </div>

      {/* Removed section noise overlay for clarity */}
    </section>
  );
}
