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
  ChevronLeft,
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
import HomeFlythroughHero from '@/components/HomeFlythroughHero';
import HouseBuildScene from '@/components/HouseBuildScene';
import ScrollytellingFeatures from '@/components/ScrollytellingFeatures';
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

    // Feature reveal animation
    gsap.utils.toArray('.feature-reveal').forEach((feature: any) => {
      gsap.from(feature, {
        scrollTrigger: {
          trigger: feature,
          start: 'top 90%',
        },
        opacity: 0,
        y: 100,
        duration: 1.2,
        ease: 'expo.out'
      });
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
      desc: 'Individual Portfolios',
      features: ['Up to 10 units', 'Tenant portal', 'Basic reporting', 'Email support'],
      popular: false,
      bg: 'bg-white',
      border: 'border-charcoal-100',
      accent: 'text-charcoal-900'
    },
    {
      name: 'Professional',
      price: 'R999',
      period: '/mo',
      desc: 'Scale Operations',
      features: ['Up to 50 units', 'Advanced analytics', 'Priority support', 'API access', 'Custom branding'],
      popular: true,
      bg: 'bg-charcoal-900',
      border: 'border-charcoal-800',
      accent: 'text-lime-400'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'Institutional Grade',
      features: ['Unlimited units', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
      popular: false,
      bg: 'bg-white',
      border: 'border-charcoal-100',
      accent: 'text-charcoal-900'
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled ? 'bg-charcoal-900/90 backdrop-blur-3xl py-4' : 'bg-transparent py-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-none flex items-center justify-center">
                <Home className="w-6 h-6 text-charcoal-900" />
              </div>
              <span className="text-xl font-bold tracking-[0.2em] uppercase text-white">Agent Loop</span>
            </Link>

            <div className="hidden md:flex items-center gap-12">
              {[
                { label: 'MANIFESTO', href: '#features' },
                { label: 'EDITIONS', href: '#pricing' },
                { label: 'COLLECTIVE', href: '#testimonials' }
              ].map((item) => (
                <a 
                  key={item.label} 
                  href={item.href} 
                  className="text-[10px] tracking-[0.3em] text-white/50 hover:text-white transition-all font-bold"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <Link href="/login" className="hidden sm:block text-[10px] tracking-[0.3em] text-white/50 hover:text-white transition-all font-bold">
                SIGN IN
              </Link>
              <Link href="/register" className="px-6 py-3 bg-white text-charcoal-900 text-[10px] tracking-[0.3em] font-bold hover:bg-lime-400 transition-all">
                GET STARTED
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
                className="hero-animate text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[0.9] mb-8 text-white"
              >
                The New <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-sky-400">
                  Standard.
                </span>
              </h1>

              <p className="hero-animate text-xl md:text-2xl text-white/80 max-w-xl leading-tight mb-10 font-light tracking-tight">
                Architecting the future of property management. 
                Experience a cinematic platform that matches intuition with intelligence.
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

              <div className="hero-animate flex flex-col sm:flex-row gap-5">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-charcoal-900 font-bold rounded-none hover:bg-lime-400 transition-all duration-500 hover:shadow-[0_0_30px_rgba(132,204,22,0.3)] group focus:outline-none"
                >
                  ENTER THE LOOP
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
                <Link
                  href="#build-scene"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 border border-white/20 text-white font-medium rounded-none hover:bg-white/5 hover:border-white transition-all duration-500 focus:outline-none"
                >
                  VIEW MONOGRAPH
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

            {/* Right: Architectural Hero Visual */}
            <div className="lg:col-span-6 relative">
              <div className="hero-animate relative overflow-hidden">
                <HomeFlythroughHero />
              </div>
            </div>
          </div>
        </div>
      </section>

      <HouseBuildScene />

      <ScrollytellingFeatures />

      <main id="main-content" className="relative z-10 bg-white">

      <section 
        id="testimonials" 
        className="py-40 md:py-60 bg-white"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <span className="text-charcoal-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-6 block">COLLECTIVE</span>
              <h2 id="testimonials-heading" className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
                Trusted by the Industry&apos;s Finest.
              </h2>
            </div>
            <div className="flex gap-4">
              {/* Custom Navigation */}
              <div className="w-16 h-16 border border-charcoal-200 flex items-center justify-center hover:bg-charcoal-900 hover:text-white transition-all cursor-pointer">
                <ChevronLeft className="w-6 h-6" />
              </div>
              <div className="w-16 h-16 border border-charcoal-200 flex items-center justify-center hover:bg-charcoal-900 hover:text-white transition-all cursor-pointer">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
            {testimonials.map((t, i) => (
              <div key={i} className="group">
                <p className="text-2xl font-light text-charcoal-600 mb-12 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-charcoal-100 flex items-center justify-center group-hover:bg-lime-400 transition-colors duration-500">
                    <span className="text-sm font-bold">{t.author[0]}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[10px] tracking-widest uppercase">{t.author}</h4>
                    <p className="text-charcoal-400 text-[10px] tracking-widest uppercase">{t.company}</p>
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

          <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`relative rounded-none p-12 transition-all duration-700 border ${
                  plan.popular 
                    ? `bg-charcoal-900 border-charcoal-800 scale-110 z-10 shadow-[0_0_50px_rgba(0,0,0,0.3)]` 
                    : `bg-white border-charcoal-100 hover:border-charcoal-300`
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 px-4 py-1 bg-lime-400 text-charcoal-900 text-[10px] tracking-widest font-bold uppercase">
                    RECOMMENDED
                  </div>
                )}
                <h3 className={`text-[10px] tracking-[0.4em] font-bold mb-8 uppercase ${plan.popular ? 'text-white/50' : 'text-charcoal-400'}`}>{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className={`text-6xl font-bold tracking-tighter ${plan.popular ? 'text-white' : 'text-charcoal-900'}`}>{plan.price}</span>
                  {plan.period && <span className={plan.popular ? 'text-white/50' : 'text-charcoal-400'}>{plan.period}</span>}
                </div>
                <p className={plan.popular ? 'text-white/80 text-xl mb-12 font-light' : 'text-charcoal-500 text-xl mb-12 font-light'}>{plan.desc}</p>
                
                <ul className="space-y-6 mb-16">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4 text-sm">
                      <div className={`w-1.5 h-1.5 rounded-none ${plan.popular ? 'bg-lime-400' : 'bg-charcoal-900'}`} />
                      <span className={plan.popular ? 'text-white/70' : 'text-charcoal-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/register" 
                  className={`block text-center py-5 text-[10px] tracking-[0.3em] font-bold transition-all duration-500 ${
                    plan.popular 
                      ? 'bg-white text-charcoal-900 hover:bg-lime-400' 
                      : 'bg-charcoal-900 text-white hover:bg-lime-400 hover:text-charcoal-900'
                  }`}
                >
                  SECURE EDITION
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section 
        id="cta"
        className="py-40 md:py-60 px-4 sm:px-6 lg:px-8 bg-charcoal-900 text-white relative overflow-hidden"
        aria-labelledby="cta-heading"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lime-400/20 rounded-full blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-12 block">CONSIGNMENT</span>
          <h2 id="cta-heading" className="text-5xl md:text-8xl font-bold tracking-tighter mb-12 leading-[0.85]">
            The AI is Ready.<br />Are You?
          </h2>
          <p className="text-white/60 text-xl md:text-2xl mb-16 font-light max-w-2xl mx-auto leading-tight">
            Join the collective of high-performing property professionals who trust Agent Loop for their digital infrastructure.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <Link 
              href="/register" 
              className="px-12 py-6 bg-white text-charcoal-900 text-[10px] tracking-[0.3em] font-bold hover:bg-lime-400 transition-all duration-500 w-full sm:w-auto"
            >
              INITIALIZE PLATFORM
            </Link>
            <p className="text-white/30 text-[10px] tracking-widest font-bold uppercase">NO COMMITMENT REQUIRED</p>
          </div>
        </div>
      </section>
      </main>

      <footer className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 border-t border-charcoal-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-12 gap-16 mb-24">
            <div className="md:col-span-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-charcoal-900 flex items-center justify-center">
                  <Home className="w-6 h-6 text-lime-400" />
                </div>
                <span className="text-xl font-bold tracking-[0.2em] uppercase">Agent Loop</span>
              </div>
              <p className="text-charcoal-500 text-xl font-light max-w-md leading-relaxed">
                South Africa&apos;s leading property management platform. Built for modern property professionals who value precision over noise.
              </p>
            </div>
            
            <div className="md:col-span-3">
              <h4 className="text-[10px] tracking-[0.3em] font-bold uppercase mb-8 text-charcoal-400">PRODUCT</h4>
              <ul className="space-y-4 text-charcoal-600 font-medium">
                <li><a href="#features" className="hover:text-charcoal-900 transition-all">MANIFESTO</a></li>
                <li><a href="#pricing" className="hover:text-charcoal-900 transition-all">EDITIONS</a></li>
                <li><a href="https://github.com/mikewithoutthemechanics/AgentPing-" target="_blank" rel="noreferrer" className="hover:text-charcoal-900 transition-all text-xs">SOURCE CODE</a></li>
              </ul>
            </div>
            
            <div className="md:col-span-3">
              <h4 className="text-[10px] tracking-[0.3em] font-bold uppercase mb-8 text-charcoal-400">CONTACT</h4>
              <ul className="space-y-4 text-charcoal-600 font-medium">
                <li className="flex items-center gap-2">
                  hello@agentloop.co.za
                </li>
                <li className="flex items-center gap-2">
                  +27 21 555 0123
                </li>
                <li className="flex items-center gap-2">
                  Cape Town, SA
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-charcoal-100 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-charcoal-400 text-[10px] tracking-[0.2em] font-bold uppercase">© 2026 Agent Loop. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-12 text-charcoal-400 text-[10px] tracking-[0.2em] font-bold uppercase">
              <a href="/privacy" className="hover:text-charcoal-900 transition-all">PRIVACY</a>
              <a href="/terms" className="hover:text-charcoal-900 transition-all">TERMS</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}