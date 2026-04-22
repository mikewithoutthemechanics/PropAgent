"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check, Sparkles, Database, Upload, ShieldCheck, FileCheck, AlertCircle } from "lucide-react";
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
    title: "Welcome to Agent Loop",
    description: "Let's get your account set up — takes about 2 minutes.",
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
    title: "Connect your data",
    description: "Link your existing databases and integrations.",
  },
  {
    id: 5,
    title: "FFC Certificate & PPRA Verification",
    description: "Upload your Fidelity Fund Certificate for PPRA cross-referencing.",
  },
  {
    id: 6,
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

const INTEGRATION_TYPES = [
  {
    id: "postgres",
    label: "PostgreSQL Database",
    description: "Connect directly to your existing Postgres database",
    icon: "🐘",
  },
  {
    id: "mcp",
    label: "MCP Server",
    description: "Connect via Model Context Protocol for AI-powered data access",
    icon: "🤖",
  },
  {
    id: "api",
    label: "REST API",
    description: "Connect to any system via REST API endpoints",
    icon: "🔌",
  },
  {
    id: "csv",
    label: "CSV / Spreadsheet",
    description: "Import data from CSV files or Google Sheets",
    icon: "📊",
  },
  {
    id: "propdata",
    label: "PropData / Lightstone",
    description: "South African property data providers",
    icon: "🏠",
  },
  {
    id: "supabase",
    label: "Supabase",
    description: "Already connected — your Agent Loop database",
    icon: "⚡",
    connected: true,
  },
];

interface IntegrationConfig {
  type: string;
  connectionString?: string;
  apiUrl?: string;
  apiKey?: string;
  mcpEndpoint?: string;
}

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
  integrations: IntegrationConfig[];
  ffcCertFile: File | null;
  ffcNumber: string;
  ppraVerified: boolean;
  ppraStatus: "idle" | "verifying" | "verified" | "failed";
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
    integrations: [],
    ffcCertFile: null,
    ffcNumber: "",
    ppraVerified: false,
    ppraStatus: "idle",
  });
  const [selectedIntegrations, setSelectedIntegrations] = useState<Set<string>>(
    new Set(["supabase"])
  );
  const [integrationDetails, setIntegrationDetails] = useState<
    Record<string, IntegrationConfig>
  >({});
  const { profile, updateProfile } = useAuth();
  const router = useRouter();

  // Sync profile fields into local form state once profile loads.
  // We track a key so that the initial state factory in useState runs
  // fresh when the profile identity changes (avoids calling setState
  // inside an effect, which React 19 strict mode disallows).
  const profileKey = profile?.id ?? "";
  const [syncedProfileKey, setSyncedProfileKey] = useState("");

  if (profileKey && profileKey !== syncedProfileKey) {
    setSyncedProfileKey(profileKey);
    const fn = profile?.first_name || "";
    const ln = profile?.last_name || "";
    const ph = profile?.phone || "";
    if (fn !== formData.firstName || ln !== formData.lastName || ph !== formData.phone) {
      setFormData((prev) => ({ ...prev, firstName: fn, lastName: ln, phone: ph }));
    }
  }

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

  const toggleIntegration = (id: string) => {
    if (id === "supabase") return;
    setSelectedIntegrations((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleIntegrationDetail = (
    type: string,
    field: string,
    value: string
  ) => {
    setIntegrationDetails((prev) => ({
      ...prev,
      [type]: { ...prev[type], type, [field]: value },
    }));
  };

  const handleFFCUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, ffcCertFile: file }));
  };

  const verifyPPRA = async () => {
    setFormData((prev) => ({ ...prev, ppraStatus: "verifying" }));
    // Simulate PPRA cross-reference verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (formData.ffcNumber.trim().length >= 6) {
      setFormData((prev) => ({
        ...prev,
        ppraStatus: "verified",
        ppraVerified: true,
      }));
    } else {
      setFormData((prev) => ({ ...prev, ppraStatus: "failed" }));
    }
  };

  const finish = async (startTour: boolean) => {
    setLoading(true);
    setSaveError(null);
    const { error } = await updateProfile({
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      role: formData.role,
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
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  currentStep > step.id
                    ? "bg-lime-400 text-charcoal-900"
                    : currentStep === step.id
                    ? "bg-charcoal-900 text-white ring-4 ring-lime-200"
                    : "bg-charcoal-100 text-charcoal-500"
                }`}
              >
                {currentStep > step.id ? <Check className="w-3.5 h-3.5" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors ${
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

        {/* Step 1: Welcome */}
        {currentStep === 1 && (
          <div className="text-center py-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-lime-400 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-charcoal-900" />
            </div>
            <p className="text-lg text-charcoal-700 max-w-md mx-auto">
              We&apos;ll ask a few quick questions, connect your data sources,
              verify your credentials, then take you on a tour of the platform.
            </p>
            <ul className="mt-6 space-y-2 text-left max-w-sm mx-auto text-sm text-charcoal-600">
              {[
                "Personalize your workspace",
                "Connect your databases & integrations",
                "Upload FFC & verify with PPRA",
                "AI matches your stock to agents with buyers",
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

        {/* Step 2: Your Details */}
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

        {/* Step 3: Your Agency */}
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

        {/* Step 4: Integrations */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-charcoal-600 mb-2">
              Select the data sources you want to connect. You can add more later from Settings → Integrations.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTEGRATION_TYPES.map((integration) => {
                const isSelected = selectedIntegrations.has(integration.id);
                const isConnected = "connected" in integration && integration.connected;
                return (
                  <button
                    key={integration.id}
                    type="button"
                    onClick={() => toggleIntegration(integration.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-lime-400 bg-lime-50"
                        : "border-charcoal-100 hover:border-charcoal-200"
                    } ${isConnected ? "opacity-80" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-charcoal-900 text-sm">
                            {integration.label}
                          </p>
                          {isConnected && (
                            <span className="text-xs bg-lime-100 text-lime-700 px-2 py-0.5 rounded-full">
                              Connected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          {integration.description}
                        </p>
                      </div>
                      {isSelected && !isConnected && (
                        <Check className="w-5 h-5 text-lime-600 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Show config fields for selected integrations */}
            {Array.from(selectedIntegrations)
              .filter((id) => id !== "supabase")
              .map((id) => {
                const integration = INTEGRATION_TYPES.find((i) => i.id === id);
                if (!integration) return null;
                return (
                  <div
                    key={id}
                    className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-100 space-y-3"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-charcoal-500" />
                      <span className="text-sm font-medium text-charcoal-700">
                        {integration.label} Configuration
                      </span>
                    </div>
                    {id === "postgres" && (
                      <input
                        type="text"
                        placeholder="postgresql://user:password@host:5432/dbname"
                        value={integrationDetails[id]?.connectionString || ""}
                        onChange={(e) =>
                          handleIntegrationDetail(id, "connectionString", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none text-sm"
                      />
                    )}
                    {id === "mcp" && (
                      <input
                        type="text"
                        placeholder="https://your-mcp-server.example.com/v1"
                        value={integrationDetails[id]?.mcpEndpoint || ""}
                        onChange={(e) =>
                          handleIntegrationDetail(id, "mcpEndpoint", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none text-sm"
                      />
                    )}
                    {id === "api" && (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="https://api.example.com/v1"
                          value={integrationDetails[id]?.apiUrl || ""}
                          onChange={(e) =>
                            handleIntegrationDetail(id, "apiUrl", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none text-sm"
                        />
                        <input
                          type="password"
                          placeholder="API Key (optional)"
                          value={integrationDetails[id]?.apiKey || ""}
                          onChange={(e) =>
                            handleIntegrationDetail(id, "apiKey", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none text-sm"
                        />
                      </div>
                    )}
                    {(id === "csv" || id === "propdata") && (
                      <p className="text-xs text-charcoal-500">
                        You&apos;ll be able to upload files and configure this integration from your dashboard after onboarding.
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* Step 5: FFC Certificate & PPRA Verification */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-sky-900">
                    Why we need this
                  </p>
                  <p className="text-xs text-sky-700 mt-1">
                    The Property Practitioners Regulatory Authority (PPRA) requires
                    all agents to hold a valid Fidelity Fund Certificate (FFC).
                    We cross-reference your certificate to ensure compliance and
                    build trust with other agents on the platform.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-1">
                FFC Number
              </label>
              <input
                type="text"
                name="ffcNumber"
                value={formData.ffcNumber}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-charcoal-200 rounded-lg focus:ring-2 focus:ring-lime-400 focus:border-transparent outline-none"
                placeholder="e.g. FFC-2026-123456"
              />
              <p className="text-xs text-charcoal-500 mt-1">
                Found on your Fidelity Fund Certificate issued by the PPRA.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal-700 mb-2">
                Upload FFC Certificate
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFFCUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-charcoal-200 rounded-xl p-6 text-center hover:border-lime-400 transition-colors">
                  {formData.ffcCertFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileCheck className="w-5 h-5 text-lime-600" />
                      <span className="text-sm font-medium text-charcoal-900">
                        {formData.ffcCertFile.name}
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-charcoal-300 mx-auto mb-2" />
                      <p className="text-sm text-charcoal-500">
                        Drop your FFC certificate here or click to browse
                      </p>
                      <p className="text-xs text-charcoal-400 mt-1">
                        PDF, JPG or PNG — max 10 MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* PPRA Verification */}
            <div className="border-t border-charcoal-100 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-700">
                    PPRA Cross-Reference
                  </p>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Verify your FFC against the PPRA registry
                  </p>
                </div>
                <button
                  type="button"
                  onClick={verifyPPRA}
                  disabled={
                    !formData.ffcNumber.trim() ||
                    formData.ppraStatus === "verifying"
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-900 text-white rounded-lg text-sm font-medium hover:bg-charcoal-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  {formData.ppraStatus === "verifying" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify
                    </>
                  )}
                </button>
              </div>

              {formData.ppraStatus === "verified" && (
                <div className="mt-3 p-3 bg-lime-50 border border-lime-200 rounded-lg flex items-center gap-2">
                  <Check className="w-5 h-5 text-lime-600" />
                  <span className="text-sm text-lime-800 font-medium">
                    FFC verified with PPRA — you&apos;re compliant
                  </span>
                </div>
              )}

              {formData.ppraStatus === "failed" && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-sm text-red-700">
                    Could not verify FFC number. Please check and try again, or continue and verify later.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 6: Your Focus */}
        {currentStep === 6 && (
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
                Pick as many as apply — we&apos;ll tune AI matching recommendations to your focus areas.
              </p>
            </div>

            <div className="bg-lime-50 border border-lime-200 rounded-xl p-4 mt-4">
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-lime-600 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-lime-900">
                    Your profile will be created
                  </p>
                  <p className="text-xs text-lime-700 mt-1">
                    Once you complete this step, your stock and listings will be
                    matched with other agents who have buyers looking for
                    properties like yours — powered by AI.
                  </p>
                </div>
              </div>
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
              ? "Create profile & start tour"
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
