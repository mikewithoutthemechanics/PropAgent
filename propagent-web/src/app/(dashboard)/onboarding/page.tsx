"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";

const steps = [
  {
    id: 1,
    title: "Welcome to PropAgent",
    description: "Let's set up your account to get started",
  },
  {
    id: 2,
    title: "Your Details",
    description: "Tell us about yourself",
  },
  {
    id: 3,
    title: "Agency Setup",
    description: "Connect or create your agency",
  },
  {
    id: 4,
    title: "Preferences",
    description: "Customize your experience",
  },
];

function OnboardingContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    agencyName: "",
    agencyCode: "",
    createAgency: false,
    role: "agent",
    specializations: [] as string[],
    city: "",
  });
  const { user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await updateProfile({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          role: formData.role,
        });
        router.push("/dashboard");
      } catch (error) {
        console.error("Error saving profile:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep > step.id
                    ? "bg-gold-500 text-white"
                    : currentStep === step.id
                    ? "bg-gold-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {currentStep > step.id ? "✓" : step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-20 h-1 mx-2 ${
                    currentStep > step.id ? "bg-gold-500" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-deep-charcoal mb-2">
          {steps[currentStep - 1].title}
        </h2>
        <p className="text-slate-600 mb-6">
          {steps[currentStep - 1].description}
        </p>

        {currentStep === 1 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🏠</div>
            <p className="text-lg text-slate-600">
              Welcome to PropAgent! Let's get your account set up in just a few
              minutes.
            </p>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="+27 82 123 4567"
              />
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="createAgency"
                checked={formData.createAgency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    createAgency: e.target.checked,
                  }))
                }
                className="w-5 h-5 text-gold-500 rounded focus:ring-gold-500"
              />
              <label htmlFor="createAgency" className="ml-2 text-slate-700">
                Create a new agency
              </label>
            </div>
            {formData.createAgency ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Agency Name
                </label>
                <input
                  type="text"
                  name="agencyName"
                  value={formData.agencyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="My Property Agency"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Agency Code
                </label>
                <input
                  type="text"
                  name="agencyCode"
                  value={formData.agencyCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                  placeholder="ABCD1234"
                />
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              >
                <option value="agent">Real Estate Agent</option>
                <option value="agency_admin">Agency Admin</option>
                <option value="property_manager">Property Manager</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City/Region
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                placeholder="Cape Town"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Residential",
                  "Commercial",
                  "Industrial",
                  "Rental",
                  "Sales",
                  "Auctions",
                ].map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleSpecializationToggle(spec)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      formData.specializations.includes(spec)
                        ? "bg-gold-500 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 text-slate-600 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="px-6 py-3 bg-gold-500 text-white rounded-lg hover:bg-gold-600 disabled:opacity-50"
          >
            {loading ? "Saving..." : currentStep === 4 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
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