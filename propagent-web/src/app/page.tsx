'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  Home, 
  Users, 
  DollarSign, 
  ArrowRight,
  TrendingUp,
  FileText,
  Wrench,
  Building,
  Check,
  Star,
  MapPin,
  Mail,
  Phone,
  Menu,
  X,
  Play,
  ChevronRight,
  BarChart3,
  Shield,
  Clock,
  CreditCard,
  HeadphonesMic,
  Zap,
  Layers,
  Key,
  Calendar,
  MessageSquare,
  FileCheck,
  Calculator,
  Target,
  Award,
  Heart
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const parallaxOffset = useRef(0);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Scroll handler with parallax
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setScrolled(scrollY > 30);
    parallaxOffset.current = scrollY * 0.3;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Intersection observer for scroll-triggered animations
  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleSections(new Set(['hero', 'features', 'testimonials', 'pricing', 'cta']));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const sections = ['hero', 'features', 'testimonials', 'pricing', 'cta'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!loading && (user || isDemoMode)) {
      router.push('/dashboard');
    }
  }, [user, loading, router, isDemoMode]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-charcoal-100 border-t-lime-400 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const features = [
    { icon: Building, title: 'Property Portfolio', desc: 'Manage unlimited properties with detailed tracking' },
    { icon: Users, title: 'Tenant Management', desc: 'Full tenant profiles, lease tracking & communication' },
    { icon: DollarSign, title: 'Rent Collection', desc: 'Automated payments, invoicing & financial reports' },
    { icon: Calculator, title: 'Property Valuations', desc: 'AI-powered market valuations & trend analysis' },
    { icon: FileText, title: 'Document Center', desc: 'Digital leases, agreements & e-signatures' },
    { icon: Wrench, title: 'Maintenance', desc: 'Work orders, vendor management & tracking' },
    { icon: BarChart3, title: 'Analytics', desc: 'Real-time insights & portfolio performance' },
    { icon: Shield, title: 'Compliance', desc: 'Legal compliance & risk management' },
  ];

  const stats = [
    { value: 'R2.5B+', label: 'Property Value Managed' },
    { value: '12,000+', label: 'Units Under Management' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: 'R180M+', label: 'Rent Collected Annually' },
  ];

  const testimonials = [
    { 
      quote: "PropAgent eliminated hours of administrative work. Our team now focuses on growth instead of paperwork.",
      author: "Sarah van der Merwe",
      role: "Director",
      company: "Coastal Properties",
      image: null
    },
    { 
      quote: "The tenant portal alone revolutionized how we communicate. Maintenance requests dropped by 60% in the first month.",
      author: "Michael Roberts",
      role: "Portfolio Manager",
      company: "Urban Living SA",
      image: null
    },
    { 
      quote: "Finally, a property management system that actually understands the South African market. Worth every rand.",
      author: "James Mitchell",
      role: "CEO",
      company: "Mitchell Properties",
      image: null
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 'R499',
      desc: 'For individual landlords',
      features: ['Up to 10 units', 'Tenant portal', 'Basic reporting', 'Email support'],
      popular: false
    },
    {
      name: 'Professional',
      price: 'R999',
      desc: 'For growing portfolios',
      features: ['Up to 50 units', 'Advanced analytics', 'Priority support', 'API access', 'Custom branding'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'For large organizations',
      features: ['Unlimited units', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
      popular: false
    },
  ];

  // Animation classes
  const getFadeInClass = (section: string, delay = 0) => {
    if (prefersReducedMotion) return 'animate-none';
    return visibleSections.has(section) 
      ? `opacity-100 translate-y-0 transition-all duration-700 ease-out` 
      : `opacity-0 translate-y-8 transition-all duration-700 ease-out`;
  };

  return (
    <div className="min-h-screen bg-white text-charcoal-900 font-sans overflow-x-hidden">
      {/* Skip Link for Accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-charcoal-900 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* Noise Texture Overlay */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply" 
        aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
      />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.05)]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-charcoal-900 rounded-xl flex items-center justify-center">
                <Home className="w-5 h-5 text-lime-400" />
              </div>
              <span className="text-lg font-semibold tracking-tight">PropAgent</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Testimonials', href: '#testimonials' }
              ].map((item) => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors relative"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm text-charcoal-500 hover:text-charcoal-900 transition-colors font-medium">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2.5 bg-charcoal-900 text-white text-sm font-medium rounded-full hover:bg-charcoal-800 transition-all duration-300 hover:shadow-lg hover:shadow-charcoal-900/20">
                Get Started
              </Link>
              <button 
                className="md:hidden p-2 text-charcoal-900"
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
        <div className="fixed inset-0 bg-white z-40 pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6">
            {['Features', 'Pricing', 'Testimonials'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-2xl font-medium text-charcoal-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link href="/login" className="text-2xl font-medium text-charcoal-900">
              Sign in
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section 
        id="hero"
        ref={heroRef as React.RefObject<HTMLElement>}
        className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-b from-white via-white to-[#fafaf8]"
        aria-labelledby="hero-title"
      >
        {/* Parallax Background Elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div 
            className="absolute top-0 right-0 w-[800px] h-[800px] bg-lime-400/20 rounded-full blur-3xl transition-transform duration-75 ease-out"
            style={{ transform: `translateY(${parallaxOffset.current * 0.2}px)` }}
          />
          <div 
            className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-3xl transition-transform duration-75 ease-out"
            style={{ transform: `translateY(${-parallaxOffset.current * 0.15}px)` }}
          />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0 / 3%) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
          {/* Animated grid lines */}
          <div 
            className="absolute inset-0 opacity-30 transition-opacity duration-1000"
            style={{
              backgroundImage: `linear-gradient(rgb(0 0 0 / 5%) 1px, transparent 1px), linear-gradient(90deg, rgb(0 0 0 / 5%) 1px, transparent 1px)`,
              backgroundSize: '100px 100px',
              transform: `translateY(${parallaxOffset.current * 0.05}px)`
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`max-w-3xl transition-all duration-1000 ease-out ${prefersReducedMotion ? 'opacity-100' : visibleSections.has('hero') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-lime-400/10 rounded-full text-sm font-medium text-lime-600 mb-6 animate-pulse-slow">
              <Zap className="w-4 h-4" aria-hidden="true" />
              <span>South Africa's #1 Property Platform</span>
            </div>
            
            <h1 
              id="hero-title"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6"
            >
              Property management{' '}
              <span className="text-lime-500 relative">
                <span className="relative z-10">reimagined</span>
                <span className="absolute inset-0 bg-lime-400/20 blur-xl rounded-full" aria-hidden="true" />
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-charcoal-500 max-w-xl leading-relaxed mb-8">
              The complete platform for South African property professionals. 
              Streamline operations, delight tenants, and grow your portfolio.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-charcoal-900 text-white font-medium rounded-full hover:bg-charcoal-800 transition-all duration-300 hover:shadow-xl hover:shadow-charcoal-900/20 group focus:outline-none focus:ring-2 focus:ring-charcoal-900 focus:ring-offset-2"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link 
                href="#features" 
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-charcoal-200 text-charcoal-700 font-medium rounded-full hover:bg-charcoal-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-charcoal-900 focus:ring-offset-2"
              >
                <Play className="w-4 h-4" aria-hidden="true" />
                See How It Works
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-charcoal-100">
              <div className="flex -space-x-3" aria-label="Trusted by property professionals">
                {[1,2,3,4,5].map((i) => (
                  <div 
                    key={i} 
                    className="w-10 h-10 rounded-full bg-charcoal-200 border-2 border-white flex items-center justify-center text-xs font-medium"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1" aria-label="5-star rating">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-charcoal-500">Trusted by 500+ property professionals</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Wrapper for Skip Link */}
      <main id="main-content">
      {/* Stats Bar */}
      <section className="py-12 border-y border-charcoal-100 bg-charcoal-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-2xl md:text-3xl font-semibold text-charcoal-900">{stat.value}</p>
                <p className="text-sm text-charcoal-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid - Bento Style */}
      <section 
        id="features"
        ref={featuresRef as React.RefObject<HTMLElement>}
        className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-[#fafaf8]"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 delay-100 ${prefersReducedMotion ? '' : visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-lime-500 text-sm font-medium tracking-wider uppercase mb-3 block">Features</span>
            <h2 id="features-heading" className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Everything you need
            </h2>
            <p className="text-charcoal-500 text-lg max-w-xl mx-auto">
              A complete suite of tools designed for South African property management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Main feature - spans 2 cols */}
            <div 
              className={`md:col-span-2 lg:row-span-2 bg-charcoal-900 rounded-3xl p-8 text-white relative overflow-hidden group transition-all duration-700 delay-200 ${prefersReducedMotion ? '' : visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            >
              <div 
                className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 rounded-full blur-3xl group-hover:bg-lime-400/20 transition-all duration-500" 
                aria-hidden="true"
              />
              <div className="relative z-10">
                <div className="w-14 h-14 bg-lime-400/20 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-lime-400" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">Powerful Analytics</h3>
                <p className="text-white/60 mb-6">Get deep insights into your portfolio performance with real-time dashboards and custom reports.</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-2xl font-semibold text-lime-400">+24%</p>
                    <p className="text-xs text-white/50">Revenue Growth</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <p className="text-2xl font-semibold text-lime-400">98%</p>
                    <p className="text-xs text-white/50">Occupancy Rate</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regular features with staggered animations */}
            {features.slice(0, 4).map((feature, i) => (
              <div 
                key={i} 
                className={`bg-charcoal-50 rounded-3xl p-6 hover:bg-charcoal-100 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] focus-within:ring-2 focus-within:ring-charcoal-900 focus-within:ring-offset-2 ${prefersReducedMotion ? '' : visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${300 + i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                  <feature.icon className="w-6 h-6 text-charcoal-700" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal-500">{feature.desc}</p>
              </div>
            ))}

            {/* Bottom row */}
            {features.slice(4, 7).map((feature, i) => (
              <div 
                key={i + 4} 
                className={`bg-charcoal-50 rounded-3xl p-6 hover:bg-charcoal-100 transition-all duration-300 group hover:shadow-lg hover:scale-[1.02] ${prefersReducedMotion ? '' : visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${600 + i * 100}ms` }}
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                  <feature.icon className="w-6 h-6 text-charcoal-700" aria-hidden="true" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-charcoal-500">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link href="#pricing" className="inline-flex items-center gap-2 text-charcoal-600 font-medium hover:text-charcoal-900 transition-colors focus:outline-none focus:ring-2 focus:ring-charcoal-900 focus:ring-offset-2 rounded-lg">
              View all features <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - Horizontal Scroll Cards */}
      <section 
        id="testimonials" 
        className={`py-20 md:py-32 bg-charcoal-900 text-white overflow-hidden transition-all duration-700 ${prefersReducedMotion ? '' : visibleSections.has('testimonials') ? 'opacity-100' : 'opacity-0'}`}
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-lime-400 text-sm font-medium tracking-wider uppercase mb-3 block">Testimonials</span>
            <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-semibold">
              Loved by property professionals
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div 
                key={i} 
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] focus-within:ring-2 focus-within:ring-white/30 focus-within:ring-offset-2 focus-within:ring-charcoal-900 ${prefersReducedMotion ? '' : visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="flex gap-1 mb-6" aria-label="5-star rating">
                  {[1,2,3,4,5].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-white/80 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-lime-400/20 rounded-full flex items-center justify-center font-semibold text-lime-400" aria-hidden="true">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.author}</p>
                    <p className="text-sm text-white/50">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section 
        id="pricing" 
        className={`py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-white transition-all duration-700 ${prefersReducedMotion ? '' : visibleSections.has('pricing') ? 'opacity-100' : 'opacity-0'}`}
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-lime-500 text-sm font-medium tracking-wider uppercase mb-3 block">Pricing</span>
            <h2 id="pricing-heading" className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-charcoal-500 text-lg max-w-xl mx-auto">
              No hidden fees. No surprises. Just powerful property management.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:shadow-xl ${
                  plan.popular 
                    ? 'bg-charcoal-900 text-white shadow-2xl scale-105 z-10' 
                    : 'bg-charcoal-50 hover:bg-charcoal-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-lime-400 text-charcoal-900 text-xs font-medium rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-semibold">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className={plan.popular ? 'text-white/60' : 'text-charcoal-500'}>/month</span>}
                </div>
                <p className={plan.popular ? 'text-white/60 text-sm mb-6' : 'text-charcoal-500 text-sm mb-6'}>{plan.desc}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check className={`w-4 h-4 ${plan.popular ? 'text-lime-400' : 'text-lime-500'}`} aria-hidden="true" />
                      <span className={plan.popular ? 'text-white/80' : 'text-charcoal-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/register" 
                  className={`block text-center py-3 rounded-full font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-charcoal-900 focus:ring-offset-2 ${
                    plan.popular 
                      ? 'bg-lime-400 text-charcoal-900 hover:bg-lime-300' 
                      : 'bg-charcoal-900 text-white hover:bg-charcoal-800'
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
      <section 
        id="cta"
        className={`py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-charcoal-900 text-white transition-all duration-700 ${prefersReducedMotion ? '' : visibleSections.has('cta') ? 'opacity-100' : 'opacity-0'}`}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl md:text-5xl font-semibold mb-6">
            Ready to transform your property management?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Join thousands of South African property professionals already using PropAgent
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime-400 text-charcoal-900 font-semibold rounded-full hover:bg-lime-300 transition-all duration-300 hover:shadow-xl hover:shadow-lime-400/25 group focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-charcoal-900"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
          <p className="text-white/40 text-sm mt-6">No credit card required. 14-day free trial.</p>
        </div>
      </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-charcoal-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-charcoal-900 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-lime-400" />
                </div>
                <span className="text-lg font-semibold">PropAgent</span>
              </div>
              <p className="text-charcoal-500 max-w-sm">
                South Africa's leading property management platform. Built for modern property professionals.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-charcoal-500">
                <li><a href="#features" className="hover:text-charcoal-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-charcoal-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-charcoal-900 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-charcoal-500">
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
          
          <div className="pt-8 border-t border-charcoal-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-charcoal-400 text-sm">© 2026 PropAgent. All rights reserved.</p>
            <div className="flex items-center gap-6 text-charcoal-400 text-sm">
              <a href="#" className="hover:text-charcoal-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-charcoal-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
