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

export default function PricingEditorial() {
  const reduced = useReducedMotion();
  const [annual, setAnnual] = useState(true);

  const formatted = useMemo(() =>
    new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }),
  []);

  return (
    <section id="pricing" className="relative py-28 md:py-40 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 md:mb-20">
          <div>
            <span className="text-lime-500 text-[10px] tracking-[0.4em] font-bold uppercase mb-4 block">EDITIONS</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-charcoal-900">Pricing that grows with you</h2>
          </div>
          <div className="flex items-center gap-3 select-none" aria-label="Billing period toggle">
            <span className={`text-sm ${annual ? 'text-charcoal-400' : 'text-charcoal-900'}`}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-charcoal-900"
              aria-pressed={annual}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${annual ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-charcoal-900' : 'text-charcoal-400'}`}>Annual <span className="text-lime-500">(2 mo off)</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {TIERS.map((t) => {
            const price = annual ? t.yearly : t.monthly;
            const isCustom = price === 'Custom';
            const priceStr = isCustom ? 'Custom' : `${CURRENCY}${formatted.format(price as number)}`;
            return (
              <article key={t.name} className={`relative border ${t.popular ? 'border-charcoal-900' : 'border-charcoal-100'} bg-white p-8 md:p-10`} aria-label={`${t.name} plan`}>
                {t.popular && (
                  <div className="absolute -top-3 left-6 px-3 py-1 text-[10px] tracking-[0.3em] font-bold bg-charcoal-900 text-white">POPULAR</div>
                )}
                <h3 className="text-xl font-bold text-charcoal-900 mb-2">{t.name}</h3>
                <p className="text-charcoal-500 mb-6">{t.desc}</p>
                <div className="flex items-end gap-2 mb-8">
                  <span className={`text-4xl md:text-5xl font-bold ${t.popular ? 'text-lime-500' : 'text-charcoal-900'}`}>{priceStr}</span>
                  {!isCustom && (
                    <span className="text-sm text-charcoal-400">/{annual ? 'yr' : 'mo'}</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-charcoal-700">
                      <span className="inline-block w-1.5 h-1.5 bg-lime-500" aria-hidden="true" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={t.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`inline-flex items-center justify-center w-full px-6 py-4 text-[10px] tracking-[0.3em] font-bold transition-colors ${t.popular ? 'bg-charcoal-900 text-white hover:bg-lime-500 hover:text-charcoal-900' : 'border border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white'}`}
                  aria-label={`Select ${t.name} plan`}
                >
                  {t.name === 'Enterprise' ? 'CONTACT SALES' : 'GET STARTED'}
                </a>
              </article>
            );
          })}
        </div>
      </div>

      {!reduced && (
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] mix-blend-multiply" aria-hidden="true" style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E')",
          backgroundSize: 'cover'
        }} />
      )}
    </section>
  );
}
