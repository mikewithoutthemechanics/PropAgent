// Shared plan catalog. Keep this file free of any server-only imports so
// both the `/pricing` client component and the PayFast API routes can use
// the same definitions.

export type PlanId = 'starter' | 'professional' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceZar: number; // 0 for the free tier
  priceLabel: string; // "Free" or "R299"
  period: string; // "" or "/month"
  features: { name: string; included: boolean }[];
  cta: string;
  popular: boolean;
  // When true this plan is paid and should route through PayFast.
  paid: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for individual property managers',
    priceZar: 0,
    priceLabel: 'Free',
    period: '',
    features: [
      { name: 'Up to 5 properties', included: true },
      { name: 'Tenant management', included: true },
      { name: 'Basic maintenance tracking', included: true },
      { name: 'Simple financial reports', included: true },
      { name: 'Email support', included: true },
      { name: 'AI property matching', included: false },
      { name: 'Advanced analytics', included: false },
      { name: 'API access', included: false },
      { name: 'White-label', included: false },
    ],
    cta: 'Get Started',
    popular: false,
    paid: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'For growing property management businesses',
    priceZar: 299,
    priceLabel: 'R299',
    period: '/month',
    features: [
      { name: 'Up to 50 properties', included: true },
      { name: 'Tenant management', included: true },
      { name: 'Advanced maintenance tracking', included: true },
      { name: 'Detailed financial reports', included: true },
      { name: 'Priority support', included: true },
      { name: 'AI property matching', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: false },
      { name: 'White-label', included: false },
    ],
    cta: 'Upgrade to Professional',
    popular: true,
    paid: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large property management companies',
    priceZar: 899,
    priceLabel: 'R899',
    period: '/month',
    features: [
      { name: 'Unlimited properties', included: true },
      { name: 'Tenant management', included: true },
      { name: 'Advanced maintenance tracking', included: true },
      { name: 'Detailed financial reports', included: true },
      { name: '24/7 Dedicated support', included: true },
      { name: 'AI property matching', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'API access', included: true },
      { name: 'White-label', included: true },
    ],
    cta: 'Upgrade to Enterprise',
    popular: false,
    paid: true,
  },
];

export function getPlan(id: string): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
