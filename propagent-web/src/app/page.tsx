'use client';

import { useEffect, useState, useRef } from 'react';
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
  Building2,
  ChevronDown,
  Star,
  Check,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-slate-950/95 backdrop-blur-2xl border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg shadow-gold-500/20">
                <Home className="w-4 h-4 md:w-5 md:h-5 text-slate-900" />
              </div>
              <span className="text-lg md:text-xl font-semibold tracking-tight">PropAgent</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'About', href: '#about' }
              ].map((item) => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-sm text-white/70 hover:text-white transition-all duration-300 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/login" className="text-sm text-white/70 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2 md:px-6 md:py-2.5 bg-white text-slate-900 text-xs md:text-sm font-semibold rounded-full hover:bg-gold-400 transition-all duration-300 cursor-pointer">
                Get Started
              </Link>
              <button 
                className="md:hidden p-2 text-white/70"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-950 z-40 pt-20 px-6 md:hidden">
          <div className="flex flex-col gap-6">
            {['Features', 'Pricing', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-2xl font-light text-white/80 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link href="/login" className="text-2xl font-light text-white/80 hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video/Image Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />
          <div className="absolute inset-0 opacity-30">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80')] bg-cover bg-center" />
          </div>
          {/* Gradient overlays */}
          <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gold-500/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-[150px]" />
        </div>

        {/* Animated Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gold-400 mb-8 md:mb-12 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>South Africa's Premium Property Platform</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight mb-6 md:mb-8">
            Property management{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-400">
              elevated
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-10 md:mb-12">
            Experience the future of property management. Elegant, powerful, 
            and designed for South Africa's finest properties.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
            <Link href="/register" className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-medium rounded-full hover:bg-gold-400 transition-all duration-300 cursor-pointer">
              Start Free Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#features" className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-all duration-300 cursor-pointer">
              <Play className="w-5 h-5" />
              Watch Demo
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-6 h-6 text-white/30" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 md:py-16 border-y border-white/5 bg-slate-900/50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {[
              { value: '500+', label: 'Properties Managed' },
              { value: '2,000+', label: 'Happy Tenants' },
              { value: 'R50M+', label: 'Rent Collected' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl md:text-4xl font-light text-gold-400">{stat.value}</p>
                <p className="text-sm text-white/50 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="text-gold-400 text-sm tracking-widest uppercase mb-4 block">Features</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">
              Everything you need
            </h2>
            <p className="mt-4 text-white/50 text-lg max-w-xl mx-auto">
              Powerful tools to manage your property portfolio with elegance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: 'Property Management', desc: 'Track all your properties in one place with detailed analytics and insights.' },
              { icon: Users, title: 'Tenant Portal', desc: 'Self-service portal for tenants to submit requests and pay rent seamlessly.' },
              { icon: DollarSign, title: 'Financial Tracking', desc: 'Automated rent collection, expense tracking, and comprehensive reporting.' },
              { icon: Calculator, title: 'Valuations', desc: 'AI-powered property valuations and real-time market insights.' },
              { icon: FileCheck, title: 'Documents', desc: 'Digital lease management and secure document storage.' },
              { icon: TrendingUp, title: 'Analytics', desc: 'Real-time insights into your portfolio performance.' }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 md:p-10 bg-slate-900/50 border border-white/5 hover:border-gold-500/20 rounded-2xl transition-all duration-500 hover:bg-slate-900 active:bg-slate-800"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-gold-500/10 to-gold-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold-500/20 group-active:scale-105 group-active:bg-gold-500/30 transition-all duration-500">
                  <feature.icon className="w-6 h-6 text-gold-400" />
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-slate-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-8">
            {[1,2,3,4,5].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-gold-400 fill-gold-400" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-4xl font-light leading-tight text-white/80 mb-8">
            "PropAgent has transformed how we manage our property portfolio. 
            The elegance and functionality is unmatched in South Africa."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full" />
            <div className="text-left">
              <p className="font-medium">James Mitchell</p>
              <p className="text-sm text-white/50">CEO, Mitchell Properties</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <span className="text-gold-400 text-sm tracking-widest uppercase mb-4 block">Pricing</span>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight">
              Simple, transparent pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { 
                name: 'Starter', 
                price: 'R499', 
                desc: 'Perfect for small portfolios',
                features: ['Up to 10 properties', 'Basic analytics', 'Email support']
              },
              { 
                name: 'Professional', 
                price: 'R999', 
                desc: 'For growing portfolios',
                features: ['Up to 50 properties', 'Advanced analytics', 'Priority support', 'API access'],
                popular: true
              },
              { 
                name: 'Enterprise', 
                price: 'Custom', 
                desc: 'For large portfolios',
                features: ['Unlimited properties', 'Custom integrations', 'Dedicated account manager', 'SLA']
              }
            ].map((plan, i) => (
              <div 
                key={i}
                className={`p-8 md:p-10 rounded-2xl border transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-slate-900 border-gold-500/50 scale-105 shadow-xl shadow-gold-500/10' 
                    : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                }`}
              >
                {plan.popular && (
                  <span className="inline-block px-3 py-1 bg-gold-500 text-slate-900 text-xs font-medium rounded-full mb-4">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-light">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-white/50">/month</span>}
                </div>
                <p className="text-white/50 text-sm mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-gold-400" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/register" 
                  className={`block text-center py-3 rounded-full transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-white text-slate-900 hover:bg-gold-400' 
                      : 'border border-white/20 hover:bg-white/5'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-light tracking-tight mb-6">
            Ready to elevate your property management?
          </h2>
          <p className="text-white/50 text-lg mb-10">
            Join the waitlist for early access
          </p>
          <Link href="/register" className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-white text-slate-900 font-medium rounded-full hover:bg-gold-400 transition-all duration-300 cursor-pointer">
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-4 gap-8 md:gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-slate-900" />
                </div>
                <span className="text-xl font-semibold">PropAgent</span>
              </div>
              <p className="text-white/50 max-w-md">
                South Africa's premium property management platform. 
                Elegant, powerful, and designed for the modern landlord.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Product</h4>
              <ul className="space-y-3 text-white/50">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Contact</h4>
              <ul className="space-y-3 text-white/50">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> hello@propagent.co.za
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> +27 21 555 0123
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Cape Town, SA
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">© 2026 PropAgent. All rights reserved.</p>
            <div className="flex items-center gap-6 text-white/30 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
