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
    <section id="pricing" className="relative pt-24 pb-32 md:pb-44 bg-charcoal-900">
      {/* Compliance trust strip — refined */}
      <div className="border-b border-white/6 mb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <span className="text-[9px] tracking-[0.4em] font-bold uppercase text-white/20 shrink-0">COMPLIANCE</span>
            {COMPLIANCE_BADGES.map((b) => (
              <span key={b.label} className="flex items-center gap-2.5 text-[10px] tracking-[0.25em] font-semibold uppercase text-white/40 hover:text-white/80 transition-colors cursor-default group">
                <span className="group-hover:scale-110 transition-transform duration-300" aria-hidden>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-16 md:mb-24">
          <div>
            <span className="text-[#00d4ff] text-[10px] tracking-[0.3em] font-bold uppercase mb-4 block drop-shadow-[0_0_10px_rgba(0,212,255,0.4)]">
              EDITIONS
            </span>
            <h2 className="text-display-3xl md:text-display-5xl font-bold tracking-tight text-white">
              Pricing that grows<br />with you
            </h2>
          </div>
          <div className="flex items-center gap-4 select-none" aria-label="Billing period toggle">
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-white/50' : 'text-white'}`}>Monthly</span>
            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-8 w-14 items-center rounded-full bg-white/10 border border-white/5 transition-all duration-300 hover:bg-white/15 hover:border-[#00d4ff]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff] focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal-900"
              aria-pressed={annual}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-gradient-to-r from-[#00d4ff] to-[#0090c2] transition-all duration-300 ${annual ? 'translate-x-7' : 'translate-x-1'}`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors ${annual ? 'text-[#00d4ff]' : 'text-white/50'}`}>
              Annual <span className="text-[#00d4ff]">(2 mo off)</span>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {TIERS.map((t) => {
            const price = annual ? t.yearly : t.monthly;
            const isCustom = price === 'Custom';
            const priceStr = isCustom ? 'Custom' : `${CURRENCY}${formatted.format(price as number)}`;
            return (
              <article
                key={t.name}
                className={`relative border rounded-2xl p-8 md:p-10 transition-all duration-500 hover:shadow-card-hover ${
                  t.popular
                    ? 'border-[#00d4ff]/40 bg-[radial-gradient(ellipse_at_top,rgba(0,212,255,0.06)_0%,transparent_50%)]'
                    : 'border-white/5 bg-white/3 hover:border-white/10'
                }`}
                aria-label={`${t.name} plan`}
              >
                {t.popular && (
                  <div className="absolute -top-3 left-6 px-4 py-1.5 text-[10px] tracking-[0.15em] font-bold bg-gradient-to-r from-[#00d4ff] to-[#0090c2] text-[#060810] rounded-sm shadow-accent">
                    POPULAR
                  </div>
                )}
                <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{t.name}</h3>
                <p className="text-white/60 mb-8 leading-relaxed">{t.desc}</p>
                <div className="flex flex-col mb-8">
                  <div className="flex items-end gap-2">
                    <span className={`text-5xl font-extrabold tracking-tight ${t.popular ? 'text-[#00d4ff]' : 'text-white'}`}>
                      {priceStr}
                    </span>
                    {!isCustom && (
                      <span className="text-sm text-white/40 mb-1">/{annual ? 'yr' : 'mo'}</span>
                    )}
                  </div>
                  {annual && !isCustom && typeof t.monthly === 'number' && typeof t.yearly === 'number' && (
                    <span className="mt-2 text-xs text-[#00d4ff] font-semibold">
                      Save {CURRENCY}{(new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 })).format(t.monthly * 12 - t.yearly)} / year
                    </span>
                  )}
                </div>
                <ul className="space-y-3.5 mb-10">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-white/70">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.6)]" aria-hidden="true" />
                      <span className="text-sm font-light">{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={t.name === 'Enterprise' ? '/contact' : '/register'}
                  className={`inline-flex items-center justify-center w-full px-6 py-4 text-[12px] tracking-[0.15em] font-bold transition-all duration-300 rounded-sm ${
                    t.popular
                      ? 'bg-gradient-to-r from-[#00d4ff] to-[#0090c2] text-[#060810] hover:from-[#33ddff] hover:to-[#00d4ff] shadow-button hover:shadow-button-hover'
                      : 'border border-white/30 text-white hover:bg-white hover:text-[#060810] hover:border-white'
                  }`}
                  aria-label={`Select ${t.name} plan`}
                >
                  {t.name === 'Enterprise' ? 'CONTACT SALES' : 'GET STARTED'}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
