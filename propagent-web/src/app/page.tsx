'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  Home, 
  Users, 
  DollarSign, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Calculator,
  FileCheck,
  Play,
  Menu,
  X,
  Building2
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        scrolled ? 'bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <Home className="w-4 h-4 md:w-5 md:h-5 text-slate-900" />
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight">PropAgent</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'About'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {item}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors hidden sm:block">
                Sign in
              </Link>
              <Link href="/register" className="px-3 py-2 md:px-5 md:py-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 text-xs md:text-sm font-semibold rounded-lg hover:from-gold-400 hover:to-gold-500 transition-all shadow-lg shadow-gold-500/20 cursor-pointer">
                Get Started
              </Link>
              {/* Mobile Menu Button */}
              <button 
                className="md:hidden p-2 text-slate-400"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800">
              <div className="flex flex-col gap-4">
                {['Features', 'Pricing', 'About'].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`} 
                    className="text-sm text-slate-400 hover:text-white transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors py-2">
                  Sign in
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
          <div className="absolute top-1/4 -left-32 w-64 md:w-96 h-64 md:h-96 bg-gold-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-slate-800/50 border border-slate-700 rounded-full text-xs md:text-sm text-gold-400 mb-6 md:mb-8">
                <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                <span>South Africa's #1 Property Platform</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight px-4 lg:px-0">
                Property management{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-300">
                  reimagined
                </span>
              </h1>
              
              <p className="mt-4 md:mt-6 text-base md:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 px-4 lg:px-0 leading-relaxed">
                Streamline your rental business with PropAgent. Track tenants, handle maintenance, 
                and manage finances — all in one powerful platform.
              </p>
              
              <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start px-4 lg:px-0">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-xl shadow-gold-500/20 cursor-pointer text-sm md:text-base">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </Link>
                <Link href="#features" className="inline-flex items-center justify-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 border border-slate-700 hover:border-slate-600 text-white font-semibold rounded-xl transition-all cursor-pointer text-sm md:text-base">
                  <Play className="w-4 h-4 md:w-5 md:h-5" />
                  See Features
                </Link>
              </div>
              
              <div className="mt-10 md:mt-12 flex items-center justify-center lg:justify-start gap-6 md:gap-8">
                {[
                  { value: '500+', label: 'Properties' },
                  { value: '2,000+', label: 'Tenants' },
                  { value: 'R50M+', label: 'Managed' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xl md:text-2xl font-semibold text-gold-400">{stat.value}</p>
                    <p className="text-xs md:text-sm text-slate-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero UI Mockup - Hidden on mobile, shown on larger screens */}
            <div className="hidden lg:block relative">
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
      <section id="features" className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold">
              Everything you need
            </h2>
            <p className="mt-4 text-slate-400 text-base md:text-lg max-w-2xl mx-auto px-4">
              Powerful tools to manage your property portfolio efficiently
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              { icon: Building2, title: 'Property Management', desc: 'Track all your properties in one place with detailed analytics' },
              { icon: Users, title: 'Tenant Portal', desc: 'Self-service portal for tenants to submit requests and pay rent' },
              { icon: DollarSign, title: 'Financial Tracking', desc: 'Automated rent collection, expense tracking, and reporting' },
              { icon: Calculator, title: 'Valuations', desc: 'AI-powered property valuations and market insights' },
              { icon: FileCheck, title: 'Documents', desc: 'Digital lease management and document storage' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Real-time insights into your portfolio performance' }
            ].map((feature, i) => (
              <div key={i} className="group bg-slate-800/50 border border-slate-700 hover:border-gold-500/30 rounded-2xl p-5 md:p-6 transition-all hover:shadow-xl hover:shadow-gold-500/5">
                <div className="w-10 md:w-12 h-10 md:h-12 bg-gradient-to-br from-gold-500/20 to-gold-600/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 md:w-6 h-5 md:h-6 text-gold-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-4 md:mb-6">
            Ready to transform your property management?
          </h2>
          <p className="text-slate-400 text-base md:text-lg mb-8 md:mb-10 px-4">
            Join thousands of property managers who trust PropAgent
          </p>
          <Link href="/register" className="inline-flex items-center justify-center gap-2 md:gap-3 px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-semibold rounded-xl hover:from-gold-400 hover:to-gold-500 transition-all shadow-xl shadow-gold-500/20 cursor-pointer">
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
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
