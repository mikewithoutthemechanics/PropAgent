"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Building2, Mail, Lock, User, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const { supabase } = await import("@/lib/auth");
      const client = supabase;

      if (!client) {
        setError("Supabase not configured");
        setLoading(false);
        return;
      }

      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Google sign-in not configured");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/onboarding?registered=true");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-charcoal-950 via-charcoal-900 to-charcoal-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-charcoal-900/20 via-charcoal-900/10 to-transparent" />
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-lime-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-lime-500 to-lime-600 rounded-lg flex items-center justify-center shadow-lg shadow-lime-500/20 group-hover:shadow-lime-500/40 transition-all duration-300">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-serif font-semibold text-white">PropAgent</span>
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-white">Create account</h1>
              <p className="text-sm text-charcoal-400 mt-1">Join PropAgent and start managing properties</p>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-medium rounded-md transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mb-4"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.96 20.53 7.7 23 12 23z"></path>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.96 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
              </svg>
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-charcoal-500">or</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                    First name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-charcoal-500 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500/50 transition-all duration-300"
                      placeholder="John"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                    Last name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-charcoal-500 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500/50 transition-all duration-300"
                      placeholder="Doe"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-charcoal-500 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500/50 transition-all duration-300"
                      placeholder="you@company.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-charcoal-500 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500/50 transition-all duration-300"
                      placeholder="Min 8 characters"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-300 mb-1.5">
                  Confirm password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-md text-white placeholder:text-charcoal-500 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500/50 transition-all duration-300"
                      placeholder="Confirm password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-medium rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-sm text-charcoal-400">
                Already have an account?{" "}
                <Link href="/login" className="text-lime-400 hover:text-lime-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-charcoal-500 hover:text-lime-400 transition-all duration-300">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
