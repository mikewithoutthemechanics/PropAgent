'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  Building2, 
  Home, 
  Users, 
  Wrench, 
  DollarSign, 
  CheckCircle2,
  ArrowRight,
  Star,
  Shield,
  Clock,
  Sparkles,
  TrendingUp,
  Calculator,
  FileCheck,
  UserCheck,
  MapPin,
  Search,
  ChevronRight,
  Play
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading && (user || isDemoMode)) {
      router.push('/dashboard');
    }
  }, [user, loading, router, isDemoMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <Home className="w-5 h-5 text-slate-900" />
              </div>
              <span className="text-xl font-semibold tracking-tight">PropAgent</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'About'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-5 py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 text-sm font-semibold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/20 cursor-pointer">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 px-6 lg:px-8 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full text-sm text-gold-400 mb-8">
                <Sparkles className="w-4 h-4" />
                <span>South Africa's #1 Property Platform</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-semibold leading-tight">
                Property management{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-300">
                  reimagined
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-slate-400 max-w-lg leading-relaxed">
                Streamline your rental business with PropAgent. Track tenants, handle maintenance, 
                and manage finances — all in one powerful platform.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link href="/register" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-xl shadow-gold-500/20 cursor-pointer">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="#features" className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-slate-700 hover:border-slate-600 text-white font-semibold rounded-xl transition-all cursor-pointer">
                  <Play className="w-5 h-5" />
                  See Features
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-8">
                {[
                  { value: '500+', label: 'Properties' },
                  { value: '2,000+', label: 'Tenants' },
                  { value: 'R50M+', label: 'Managed' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl font-semibold text-gold-400">{stat.value}</p>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image/UI Mockup */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700 p-4 shadow-2xl">
                <div className="bg-slate-900 rounded-xl overflow-hidden">
                  <div className="h-8 bg-slate-800 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 w-2/3 bg-slate-700 rounded animate-pulse" />
                    <div className="grid grid-cols-4 gap-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="aspect-video bg-slate-800 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Revenue</p>
                    <p className="text-lg font-semibold text-white">R125,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold">
              Everything you need
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-2xl mx-auto">
              Powerful tools to manage your property portfolio efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Property Management', desc: 'Track all your properties in one place with detailed analytics' },
              { icon: Users, title: 'Tenant Portal', desc: 'Self-service portal for tenants to submit requests and pay rent' },
              { icon: DollarSign, title: 'Financial Tracking', desc: 'Automated rent collection, expense tracking, and reporting' },
              { icon: Wrench, title: 'Maintenance', desc: 'Streamlined maintenance requests with status tracking' },
              { icon: Calculator, title: 'Valuations', desc: 'AI-powered property valuations and market insights' },
              { icon: FileCheck, title: 'Documents', desc: 'Digital lease management and document storage' }
            ].map((feature, i) => (
              <div key={i} className="group bg-slate-800/50 border border-slate-700 hover:border-gold-500/30 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-gold-500/5">
                <div className="w-12 h-12 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-semibold mb-6">
            Ready to transform your property management?
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            Join thousands of property managers who trust PropAgent
          </p>
          <Link href="/register" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-xl shadow-gold-500/20 cursor-pointer">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
              <Home className="w-4 h-4 text-slate-900" />
            </div>
            <span className="font-semibold">PropAgent</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 PropAgent. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
