'use client';

import { Check, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for individual property managers',
    price: 'Free',
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
  },
  {
    name: 'Professional',
    description: 'For growing property management businesses',
    price: 'R299',
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
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large property management companies',
    price: 'R899',
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
    cta: 'Contact Sales',
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-semibold text-gray-900">Simple, transparent pricing</h1>
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Choose the plan that fits your property management needs. All plans include a 14-day free trial.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative bg-white rounded-xl border ${
              plan.popular ? 'border-blue-500 shadow-lg' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white text-sm font-medium px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-600 text-sm">{plan.description}</p>
              
              <div className="mt-6">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-gray-500">{plan.period}</span>}
              </div>

              <Link
                href="/register"
                className={`mt-6 block w-full py-3 px-4 rounded-lg font-medium text-center transition-colors cursor-pointer ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                {plan.cta}
              </Link>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature.name} className="flex items-center gap-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                      {feature.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-gray-50 rounded-xl p-8">
        <h3 className="text-xl font-semibold text-gray-900">Frequently asked questions</h3>
        <div className="mt-6 grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900">Can I change plans anytime?</h4>
            <p className="mt-2 text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Is there a free trial?</h4>
            <p className="mt-2 text-gray-600">Yes, all paid plans include a 14-day free trial. No credit card required.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">What payment methods do you accept?</h4>
            <p className="mt-2 text-gray-600">We accept all major credit cards, EFT, and bank transfers for annual plans.</p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Can I get a refund?</h4>
            <p className="mt-2 text-gray-600">Yes, we offer a 30-day money-back guarantee on all plans.</p>
          </div>
        </div>
      </div>
    </div>
  );
}