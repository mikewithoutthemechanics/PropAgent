"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { setOnboardingDone, setTourDone } from "@/lib/onboarding";

interface StepMeta {
  id: number;
  title: string;
  description: string;
}

const steps: StepMeta[] = [
  {
    id: 1,
    title: "Welcome to AgentPing",
    description: "Let's get your account set up — takes about 60 seconds.",
  },
  {
    id: 2,
    title: "Your details",
    description: "A little about you so we can personalize your workspace.",
  },
  {
    id: 3,
    title: "Your agency",
    description: "Join an existing agency or spin up a new one.",
  },
  {
    id: 4,
    title: "Your focus",
    description: "Tell us what you work on so we surface the right tools.",
  },
];

const SPECIALIZATIONS = [
  "Residential",
  "Commercial",
  "Industrial",
  "Rental",
  "Sales",
  "Auctions",
];

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  agencyName: string;
  agencyCode: string;
  createAgency: boolean;
  role: string;
  specializations: string[];
  city: string;
}

function OnboardingContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    agencyName: "",
    agencyCode: "",
    createAgency: false,
    role: "agent",
    specializations: [],
    city: "",
  });
  const { profile, updateProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || "",
      }));
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSpecializationToggle = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter((s) => s !== spec)
        : [...prev.specializations, spec],
    }));
  };

  const finish = async (startTour: boolean) => {
    setLoading(true);
    setSaveError(null);
    const { error } = await updateProfile({
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      role: formData.role,
      // Server-authoritative onboarding flag — see the
      // 20260421063000_add_profile_onboarded_at migration. This persists
      // across devices so a second-browser login doesn't re-trigger the
      // flow. localStorage below is a fast-path fallback for envs
      // without Supabase configured.
      onboarded_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving profile:", error);
      setSaveError(
        "We couldn't save your details. Check your connection and try again.",
      );
      setLoading(false);
      return;
    }

    setOnboardingDone(true);
    if (!startTour) {
      setTourDone(true);
    }
    setLoading(false);
    router.push(startTour ? "/dashboard?tour=1" : "/dashboard");
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    } else {
      void finish(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const skip = async () => {
    setLoading(true);
    setSaveError(null);
    // Persist skip on the server so it survives across devices. Only mark
    // the local flags + navigate on success — otherwise the user lands on
    // the dashboard thinking their choice stuck while the server still
    // treats them as unonboarded (and redirects them right back on the
    // next login).
    const { error } = await updateProfile({
      onboarded_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving onboarding skip:", error);
      setSaveError(
        "We couldn't save your preferences. Check your connection and try again.",
      );
      setLoading(false);
      return;
    }

    setOnboardingDone(true);
    setTourDone(true);
    setLoading(false);
    router.push("/dashboard");
  };

  const active = steps[currentStep - 1];
  const progressPct = (currentStep / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-charcoal-500 text-sm">
          <Sparkles className="w-4 h-4 text-lime-500" />
          <span>Getting started</span>
        </div>
        <button
          type="button"
          onClick={skip}
          className="text-sm text-charcoal-500 hover:text-charcoal-800 underline-offset-2 hover:underline cursor-pointer"
        >
          Skip for now
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-charcoal-500">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-xs font-medium text-charcoal-500">
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-charcoal-100 overflow-hidden">
          <div
            className="h-full bg-lime-400 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  currentStep > step.id
                    ? "bg-lime-400 text-charcoal-900"
                    : currentStep === step.id
                    ? "bg-charcoal-900 text-white ring-4 ring-lime-200"
                    : "bg-charcoal-100 text-charcoal-500"
                }`}
              >
                {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    currentStep > step.id ? "bg-lime-400" : "bg-charcoal-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-charcoal-900 mb-1 font-serif">
          {active.title}
        </h2>
        <p className="text-charcoal-500 mb-6">{active.description}</p>

        {currentStep === 1 && (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-charcoal-900" />
            </div>
            <p className="text-lg text-charcoal-700 max-w-md mx-auto">
              We&apos;ll ask a few quick questions, then take you on a 60-second
              tour of the platform so you know where everything lives.
            </p>
            <ul className="mt-6 space-y-2 text-left max-w-sm mx-auto text-sm text-charcoal-600">
              {[
                "Personalize your workspace",
                "Connect your agency",
                "Guided tour of the key tools",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-lime-100 text-lime-700">
                    <Check className="w-3 h-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  placeholder="Jane"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Last name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                placeholder="+27 82 123 4567"
              />
              <p className="text-xs text-charcoal-500 mt-1">
                Used for urgent tenant & maintenance alerts. You can change this
                later in Settings.
              </p>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, createAgency: false }))
                }
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  !formData.createAgency
                    ? "border-lime-400 bg-lime-50"
                    : "border-charcoal-100 hover:border-charcoal-200"
                }`}
              >
                <p className="font-medium text-charcoal-900">
                  Join an agency
                </p>
                <p className="text-xs text-charcoal-500 mt-1">
                  I have an invite code from my agency
                </p>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, createAgency: true }))
                }
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                  formData.createAgency
                    ? "border-lime-400 bg-lime-50"
                    : "border-charcoal-100 hover:border-charcoal-200"
                }`}
              >
                <p className="font-medium text-charcoal-900">Create one</p>
                <p className="text-xs text-charcoal-500 mt-1">
                  I&apos;m setting up my own agency
                </p>
              </button>
            </div>
            {formData.createAgency ? (
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Agency name
                </label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                  placeholder="My Property Agency"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1">
                  Agency code
                </label>
                <input
                  type="text"
                  name="agencyCode"
                  value={formData.agencyCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none uppercase tracking-wider"
                  placeholder="ABCD1234"
                />
                <p className="text-xs text-charcoal-500 mt-1">
                  Ask your agency admin for the invite code.
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                Your role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none bg-white"
              >
                <option value="agent">Real Estate Agent</option>
                <option value="agency_admin">Agency Admin</option>
                <option value="property_manager">Property Manager</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                City / region
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                placeholder="Cape Town"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                What do you work on?
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecializationToggle(spec)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      formData.specializations.includes(spec)
                        ? "bg-lime-400 text-charcoal-900"
                        : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
              <p className="text-xs text-charcoal-500 mt-2">
                Pick as many as apply — we&apos;ll tune recommendations to match.
              </p>
            </div>
          </div>
        )}

        {saveError && (
          <div
            role="alert"
            className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700"
          >
            {saveError}
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-charcoal-100">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm text-charcoal-600 hover:bg-charcoal-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="inline-flex items-center gap-1 px-5 py-2.5 bg-charcoal-900 text-white rounded-full text-sm font-semibold hover:bg-charcoal-800 disabled:opacity-50 cursor-pointer transition-colors"
          >
            {loading
              ? "Saving..."
              : currentStep === steps.length
              ? "Start tour"
              : "Next"}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-charcoal-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-charcoal-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-64 bg-charcoal-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OnboardingContent />
    </Suspense>
  );
}
