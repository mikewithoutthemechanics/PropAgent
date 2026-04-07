'use client';

import { useState } from 'react';
import { Check, X, Plus, X as XIcon } from 'lucide-react';
import Link from 'next/link';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  description: string;
  price: string;
  period: string;
  features: PlanFeature[];
  cta: string;
  popular: boolean;
}

const initialPlans: Plan[] = [
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

function AddPlanModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plan: Plan) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    period: '/month',
    description: '',
    features: '',
    cta: 'Get Started',
    popular: false,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featuresList = formData.features
      .split('\n')
      .filter((f) => f.trim())
      .map((name) => ({ name: name.trim(), included: true }));

    onSubmit({
      name: formData.name,
      price: formData.price,
      period: formData.period,
      description: formData.description,
      features: featuresList,
      cta: formData.cta,
      popular: formData.popular,
    });
    onClose();
  };

  const inputClasses =
    "w-full px-4 py-2.5 bg-slate-100 border border-gray-700 rounded-lg text-slate-900 placeholder-gray-400 text-sm focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-colors";

  const labelClasses = "block text-sm font-medium text-slate-400 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Add New Pricing Plan</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="planName" className={labelClasses}>
              Plan Name
            </label>
            <input
              id="planName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputClasses}
              placeholder="e.g., Professional"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className={labelClasses}>
                Price
              </label>
              <input
                id="price"
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={inputClasses}
                placeholder="e.g., R299 or Free"
                required
              />
            </div>
            <div>
              <label htmlFor="period" className={labelClasses}>
                Period
              </label>
              <input
                id="period"
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className={inputClasses}
                placeholder="/month"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClasses}>
              Description
            </label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClasses}
              placeholder="Short description of the plan"
              required
            />
          </div>

          <div>
            <label htmlFor="features" className={labelClasses}>
              Features (one per line)
            </label>
            <textarea
              id="features"
              value={formData.features}
              onChange={(e) => setFormData({ ...formData, features: e.target.value })}
              className={`${inputClasses} min-h-[120px] resize-none`}
              placeholder="e.g., Up to 50 properties&#10;Tenant management&#10;Priority support"
              required
            />
          </div>

          <div>
            <label htmlFor="cta" className={labelClasses}>
              CTA Button Text
            </label>
            <input
              id="cta"
              type="text"
              value={formData.cta}
              onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
              className={inputClasses}
              placeholder="Get Started"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="popular"
              type="checkbox"
              checked={formData.popular}
              onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              className="w-4 h-4 rounded border-gray-700 bg-slate-100 text-gold-500 focus:ring-gold-500 focus:ring-offset-gray-900"
            />
            <label htmlFor="popular" className="text-sm text-slate-400">
              Mark as Most Popular
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-700 text-slate-400 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 text-gray-900 font-medium rounded-lg transition-colors"
            >
              Add Plan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddPlan = (plan: Plan) => {
    setPlans([...plans, plan]);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <div className="flex items-center justify-between mb-8">
          <div />
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500 hover:bg-gold-600 text-gray-900 font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Plan
          </button>
        </div>
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
              plan.popular ? 'border-gold-500 shadow-lg shadow-gold-500/20' : 'border-gray-200'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gold-500 text-gray-900 text-sm font-medium px-3 py-1 rounded-full">
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
                    ? 'bg-gold-500 hover:bg-gold-600 text-gray-900'
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
                      <X className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                    <span className={feature.included ? 'text-gray-700' : 'text-slate-500'}>
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

      <AddPlanModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPlan}
      />
    </div>
  );
}