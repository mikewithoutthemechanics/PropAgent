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
import CircularCarousel from '@/components/ui/CircularCarousel';
import HeroAppShowcase from '@/components/HeroAppShowcase';
import HouseBuildScene from '@/components/HouseBuildScene';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const { user, loading, isDemoMode } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [activeFeature, setActiveFeature] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const parallaxOffset = useRef(0);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setScrolled(scrollY > 30);
    parallaxOffset.current = scrollY * 0.3;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (prefersReducedMotion) return;

    // Split text animation for hero title
    const heroTitle = document.getElementById('hero-title');
    if (heroTitle) {
      const text = heroTitle.innerText;
      heroTitle.innerHTML = text.split('').map(char => `<span class="char inline-block">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
      gsap.from('.char', {
        opacity: 0,
        y: 20,
        rotateX: -90,
        stagger: 0.02,
        duration: 0.8,
        ease: 'back.out(1.7)',
        delay: 0.5
      });
    }

    // Hero animations
    gsap.fromTo('.hero-animate', 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'power3.out', delay: 0.8 }
    );

    // Feature cards stagger
    gsap.from('.feature-card', {
      scrollTrigger: {
        trigger: '#features',
        start: 'top 80%',
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out'
    });

    // Perspective transitions for sections
    const sections = ['#features', '#testimonials', '#pricing', '#cta'];
    sections.forEach(section => {
      gsap.fromTo(section, 
        { perspective: 1000, rotationX: 10, opacity: 0.8 },
        { 
          rotationX: 0, 
          opacity: 1, 
          duration: 1.5,
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'top center',
            scrub: true
          }
        }
      );
    });

    // Parallax effects
    gsap.to('.parallax-bg', {
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Animate 3D scene elements on scroll could be done here if we had ref to them, 
    // but we'll stick to R3F's internal useFrame for now or simple opacity.

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [prefersReducedMotion]);

  const features = [
    { icon: Target, title: 'AI Buyer-Property Matching', desc: 'Scores every buyer against every listing in seconds — surfaces the hottest matches first' },
    { icon: Calculator, title: 'Intelligent Pricing', desc: 'AVM + live comparable sales recommend the right price, with confidence bands' },
    { icon: MessageSquare, title: 'AI Lead Concierge', desc: '24/7 WhatsApp & email bot qualifies leads, books viewings and routes hot prospects' },
    { icon: FileText, title: 'Lease & Contract AI', desc: 'Generate SA-compliant leases, mandates and addenda — e-signatures built in' },
    { icon: Building, title: 'Unified Property CRM', desc: 'One place for listings, buyers, tenants, landlords and the full deal pipeline' },
    { icon: BarChart3, title: 'Portfolio Analytics', desc: 'Real-time dashboards on yield, vacancy, arrears and deal velocity' },
    { icon: Wrench, title: 'Smart Operations', desc: 'Maintenance, inspections and vendor management with AI triage and cost tracking' },
    { icon: Shield, title: 'POPIA & FICA Ready', desc: 'Compliance checks and document verification baked into every flow' },
  ];

  const stats = [
    { value: 'R2.5B+', label: 'Property Value Matched' },
    { value: '12,000+', label: 'Active Listings & Buyers' },
    { value: '98%', label: 'Client Satisfaction' },
    { value: '42%', label: 'Faster Time-to-Offer' },
  ];

  const testimonials = [
    { 
      quote: "Agent Loop eliminated hours of administrative work. Our team now focuses on growth instead of paperwork.",
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
      period: '/mo',
      desc: 'For individual landlords',
      features: ['Up to 10 units', 'Tenant portal', 'Basic reporting', 'Email support'],
      popular: false,
      bg: 'bg-gradient-to-br from-lime-50 to-sky-50',
      border: 'border-lime-200',
      accent: 'text-lime-600'
    },
    {
      name: 'Professional',
      price: 'R999',
      period: '/mo',
      desc: 'For growing portfolios',
      features: ['Up to 50 units', 'Advanced analytics', 'Priority support', 'API access', 'Custom branding'],
      popular: true,
      bg: 'bg-gradient-to-br from-charcoal-900 to-charcoal-800',
      border: 'border-charcoal-700',
      accent: 'text-lime-400'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For large organizations',
      features: ['Unlimited units', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
      popular: false,
      bg: 'bg-gradient-to-br from-charcoal-50 to-sky-50',
      border: 'border-charcoal-200',
      accent: 'text-charcoal-600'
    },
  ];

  const getFadeInClass = (section: string, delay = 0) => {
    if (prefersReducedMotion) return 'animate-none';
    return visibleSections.has(section) 
      ? `opacity-100 translate-y-0 transition-all duration-700 ease-out` 
      : `opacity-0 translate-y-8 transition-all duration-700 ease-out`;
  };

  return (
    <div className="min-h-screen bg-white text-charcoal-900 font-sans overflow-x-hidden">
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-charcoal-900 focus:text-white focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply" 
        aria-hidden="true"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} 
      />

      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-charcoal-900/95 backdrop-blur-xl shadow-lg shadow-lime-500/5' : 'bg-charcoal-900/50 backdrop-blur-sm'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-500/20">
          <div 
            className="h-full bg-gradient-to-r from-lime-500 to-sky-500 transition-all duration-150"
            style={{ width: scrolled ? '100%' : '0%' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-lime-400 to-sky-400 rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/25">
                <Home className="w-5 h-5 text-charcoal-900" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-white">Agent Loop</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Testimonials', href: '#testimonials' }
              ].map((item) => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-sm text-white/70 hover:text-lime-400 transition-colors relative font-medium"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login" className="hidden sm:block text-sm text-white/60 hover:text-lime-400 transition-colors font-medium">
                Sign in
              </Link>
              <Link href="/register" className="px-4 py-2.5 bg-gradient-to-r from-lime-400 to-sky-400 text-charcoal-900 text-sm font-semibold rounded-full hover:from-lime-300 hover:to-sky-300 transition-all duration-300 shadow-lg shadow-lime-500/25 hover:shadow-xl">
                Get Started
              </Link>
              <button 
                className="md:hidden p-2 text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-charcoal-900 z-40 pt-24 px-6 md:hidden">
          <div className="flex flex-col gap-6">
            {['Features', 'Pricing', 'Testimonials'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-2xl font-medium text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <Link href="/login" className="text-2xl font-medium text-white">
              Sign in
            </Link>
          </div>
        </div>
      )}

      <section 
        id="hero"
        ref={heroRef as React.RefObject<HTMLElement>}
        className="relative pt-28 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-charcoal-800"
        aria-labelledby="hero-title"
      >
        {/* Grid background — property blueprint feel */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'linear-gradient(to right, #84cc16 1px, transparent 1px), linear-gradient(to bottom, #84cc16 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(ellipse at 50% 40%, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 40%, transparent 80%)',
          }}
        />
        {/* Ambient color glow */}
        <div className="parallax-bg absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-40 -left-40 w-[560px] h-[560px] rounded-full bg-lime-500/15 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-[620px] h-[620px] rounded-full bg-sky-500/15 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-6">
              <div className="hero-animate inline-flex items-center gap-2 px-4 py-1.5 bg-lime-500/15 border border-lime-400/30 text-lime-300 text-sm font-semibold rounded-full mb-6">
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span>The operating system for South African property</span>
              </div>

              <h1
                id="hero-title"
                className="hero-animate text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight leading-[1.05] mb-6 text-white"
              >
                List it.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-sky-400">
                  Match it.
                </span>{' '}
                Close it.
              </h1>

              <p className="hero-animate text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-8">
                Agent Loop is the AI deal engine for estate agents, landlords
                and sellers. Load a mandate once — we match it to pre-qualified
                buyers and tenants across agencies, generate POPIA &amp; FICA
                paperwork, and drive every deal from enquiry to keys-in-hand.
              </p>

              {/* Live stat ticker — property-specific */}
              <div className="hero-animate grid grid-cols-3 gap-3 max-w-lg mb-8">
                {[
                  { k: 'Listings under AI', v: '12,400+' },
                  { k: 'Ready buyers matched', v: 'R2.5B+' },
                  { k: 'Faster to offer', v: '42%' },
                ].map((s) => (
                  <div
                    key={s.k}
                    className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-3"
                  >
                    <div className="text-lg md:text-xl font-semibold text-white tabular-nums">
                      {s.v}
                    </div>
                    <div className="text-[11px] uppercase tracking-wider text-white/50 mt-0.5">
                      {s.k}
                    </div>
                  </div>
                ))}
              </div>

              <div className="hero-animate flex flex-col sm:flex-row gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gradient-to-r from-lime-400 to-sky-400 text-charcoal-900 font-semibold rounded-full hover:from-lime-300 hover:to-sky-300 transition-all duration-300 hover:shadow-xl hover:shadow-lime-400/25 group focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                >
                  List a property
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <Link
                  href="#build-scene"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/25 text-white font-medium rounded-full hover:bg-white/10 hover:border-white/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-charcoal-900"
                >
                  <Play className="w-4 h-4" aria-hidden="true" />
                  See how a deal is built
                </Link>
              </div>

              <div className="flex items-center gap-4 mt-8 pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 text-white/70">
                  <Shield className="w-4 h-4 text-lime-400" aria-hidden="true" />
                  <span className="text-sm">PPRA verified</span>
                </div>
                <div className="w-px h-4 bg-white/15" />
                <div className="flex items-center gap-2 text-white/70">
                  <FileCheck className="w-4 h-4 text-lime-400" aria-hidden="true" />
                  <span className="text-sm">POPIA &amp; FICA ready</span>
                </div>
                <div className="w-px h-4 bg-white/15" />
                <div className="flex items-center gap-2 text-white/70">
                  <Key className="w-4 h-4 text-lime-400" aria-hidden="true" />
                  <span className="text-sm">500+ agencies</span>
                </div>
              </div>
            </div>

            {/* Right: property-specific 3D app showcase */}
            <div className="lg:col-span-6 relative">
              <div className="hero-animate relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm overflow-hidden shadow-2xl shadow-lime-500/10">
                {/* floating labels — tie visual to real app features */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-charcoal-900/70 border border-white/10 text-[11px] text-white/70 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  Live matching engine
                </div>
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/70 border border-white/10 text-[11px] text-white/70 font-medium">
                  <Home className="w-3 h-3 text-sky-400" />
                  3 bed · Sea Point
                </div>
                <HeroAppShowcase />
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-[11px] text-white/60">
                  <span>Drag to explore · scroll for the full deal flow</span>
                  <span className="tabular-nums">LOT #A-4250</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <HouseBuildScene />

      <main id="main-content" className="relative z-10 bg-white">
      <section className="py-12 border-y border-lime-100/50 bg-gradient-to-r from-lime-50/50 via-white to-lime-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="text-center group"
              >
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-lime-600 to-sky-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                <p className="text-sm text-charcoal-500 mt-1 font-medium group-hover:text-sky-600 transition-colors">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        id="features"
        ref={featuresRef as React.RefObject<HTMLElement>}
        className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-lime-50/30 to-lime-50/50"
        aria-labelledby="features-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-700 delay-100 ${prefersReducedMotion ? '' : visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-sky-600 text-sm font-medium tracking-wider uppercase mb-3 block">The platform</span>
            <h2 id="features-heading" className="text-3xl md:text-5xl font-semibold tracking-tight mb-4">
              One AI platform. Every side of the deal.
            </h2>
            <p className="text-charcoal-500 text-lg max-w-xl mx-auto">
              From first enquiry to signed lease &mdash; AI that matches buyers to properties,
              prices listings intelligently and closes deals faster.
            </p>
          </div>

          <CircularCarousel
            items={features}
            radius={380}
            itemWidth={280}
            itemHeight={200}
            perspective={1200}
            autoRotateSpeed={0.12}
            tiltAngle={-10}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {features.map((feature, i) => (
              <div 
                key={i}
                className="feature-card bg-white p-6 rounded-2xl border border-charcoal-100 hover:border-lime-400/50 hover:shadow-xl hover:shadow-lime-400/5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-lime-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-lime-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-charcoal-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Link href="#pricing" className="inline-flex items-center gap-2 text-sky-600 font-medium hover:text-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-600 focus:ring-offset-2 rounded-lg px-4 py-2">
              View all features <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section 
        id="testimonials" 
        className={`py-20 md:py-32 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 text-white overflow-hidden transition-all duration-700 ${prefersReducedMotion ? '' : visibleSections.has('testimonials') ? 'opacity-100' : 'opacity-0'}`}
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
                className={`relative bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-lime-400/40 hover:bg-gray-750 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-lime-500/10 group focus-within:ring-2 focus-within:ring-white/30 focus-within:ring-offset-2 focus-within:ring-charcoal-900 ${prefersReducedMotion ? '' : visibleSections.has('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-lime-400/20 to-sky-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl" />
                <div className="flex gap-1 mb-6" aria-label="5-star rating">
                  {[1,2,3,4,5].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-lime-400 fill-lime-400" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-white leading-relaxed mb-6 group-hover:text-white transition-colors font-medium">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-sky-400 rounded-full flex items-center justify-center font-bold text-charcoal-900 shadow-lg shadow-lime-400/30 group-hover:shadow-xl group-hover:shadow-lime-400/50 transition-all">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-lime-400 transition-colors">{testimonial.author}</p>
                    <p className="text-sm text-white">{testimonial.role}, {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
                className={`relative rounded-3xl p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 ${
                  plan.popular 
                    ? `${plan.bg} shadow-2xl scale-105 z-10 border-2 border-lime-400` 
                    : `${plan.bg} hover:shadow-xl border-2 border-transparent hover:border-lime-300`
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-lime-400 text-charcoal-900 text-xs font-semibold rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-charcoal-900'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className={`text-4xl font-bold ${plan.popular ? 'text-white' : 'text-charcoal-900'}`}>{plan.price}</span>
                  {plan.period && <span className={plan.popular ? 'text-white' : 'text-charcoal-600'}>{plan.period}</span>}
                </div>
                <p className={plan.popular ? 'text-white text-sm mb-6 font-medium' : 'text-charcoal-800 text-sm mb-6 font-medium'}>{plan.desc}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${plan.accent}`} aria-hidden="true" />
                      <span className={plan.popular ? 'text-white' : 'text-charcoal-800'}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/register" 
                  className={`block text-center py-3.5 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    plan.popular 
                      ? 'bg-lime-400 text-charcoal-900 hover:bg-lime-300 focus:ring-lime-400' 
                      : 'bg-charcoal-900 text-white hover:bg-charcoal-800 focus:ring-charcoal-900'
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        id="cta"
        className={`py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 text-white transition-all duration-700 ${prefersReducedMotion ? '' : visibleSections.has('cta') ? 'opacity-100' : 'opacity-0'}`}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 id="cta-heading" className="text-3xl md:text-5xl font-semibold mb-6">
            The AI is ready. Are you?
          </h2>
          <p className="text-white/60 text-lg mb-10">
            Let AI match your buyers to the right property, price your listings with the market
            and handle the paperwork &mdash; so you can focus on closing deals.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-lime-400 to-sky-400 text-charcoal-900 font-semibold rounded-full hover:from-lime-300 hover:to-sky-300 transition-all duration-300 hover:shadow-xl hover:shadow-lime-400/25 group focus:outline-none focus:ring-2 focus:ring-lime-400 focus:ring-offset-2 focus:ring-charcoal-900"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
          <p className="text-white/40 text-sm mt-6">No credit card required. 14-day free trial.</p>
        </div>
      </section>
      </main>

      <footer className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 border-t border-charcoal-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-charcoal-900 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-lime-400" />
                </div>
                <span className="text-lg font-semibold">Agent Loop</span>
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
                <li><a href="https://github.com/mikewithoutthemechanics/AgentPing-" target="_blank" rel="noreferrer" className="hover:text-charcoal-900 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-charcoal-500">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" /> hello@agentloop.co.za
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
            <p className="text-charcoal-400 text-sm">© 2026 Agent Loop. All rights reserved.</p>
            <div className="flex items-center gap-6 text-charcoal-400 text-sm">
              <a href="/privacy" className="hover:text-charcoal-900 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-charcoal-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}