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
import HeroVideo from '@/components/HeroVideo';
import HouseBuildScene from '@/components/HouseBuildScene';
import ScrollytellingFeatures from '@/components/ScrollytellingFeatures';
import MarketMapScene from '@/components/MarketMapScene';
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
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"
    },
    { 
      quote: "The tenant portal alone revolutionized how we communicate. Maintenance requests dropped by 60% in the first month.",
      author: "Michael Roberts",
      role: "Portfolio Manager",
      company: "Urban Living SA",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
    },
    { 
      quote: "Finally, a property management system that actually understands the South African market. Worth every rand.",
      author: "James Mitchell",
      role: "CEO",
      company: "Mitchell Properties",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
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
        className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-charcoal-900"
        aria-labelledby="hero-title"
      >
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-charcoal-900/40 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover scale-110"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-exterior-4410-large.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-4xl">
            <div className="hero-animate inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-white text-[10px] tracking-[0.4em] font-bold uppercase mb-12">
              <Zap className="w-4 h-4 text-lime-400" aria-hidden="true" />
              <span>THE OPERATING SYSTEM FOR PROPERTY LEADERS</span>
            </div>

            <h1
              id="hero-title"
              className="hero-animate text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-bold tracking-tighter leading-[0.85] mb-12 text-white"
            >
              List it. <br />
              <span className="text-white/20">Match it.</span> <br />
              Close it.
            </h1>

            <div className="grid md:grid-cols-2 gap-12 items-end">
               <p className="hero-animate text-xl md:text-2xl text-white/70 leading-tight font-light tracking-tight max-w-sm">
                 Architecting the future of South African property management with cinematic intelligence.
               </p>
               
               <div className="hero-animate flex flex-col sm:flex-row gap-6">
                 <Link
                   href="/register"
                   className="inline-flex items-center justify-center gap-4 px-10 py-6 bg-white text-charcoal-900 text-[10px] tracking-[0.3em] font-bold hover:bg-lime-400 transition-all duration-500 group"
                 >
                   INITIALIZE PLATFORM
                   <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </Link>
                 <Link
                   href="#pricing"
                   className="inline-flex items-center justify-center gap-4 px-10 py-6 border border-white/20 text-white text-[10px] tracking-[0.3em] font-bold hover:bg-white/10 transition-all duration-500"
                 >
                   VIEW EDITIONS
                 </Link>
               </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce">
           <div className="w-px h-12 bg-gradient-to-b from-white to-transparent opacity-50" />
        </div>
      </section>

      <MarketMapScene />

      <ScrollytellingFeatures />

      <main id="main-content" className="relative z-10 bg-white">

      <section 
        id="testimonials" 
        className="py-40 md:py-60 bg-charcoal-900 text-white overflow-hidden"
        aria-labelledby="testimonials-heading"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-32 gap-8">
            <div className="max-w-3xl">
              <span className="text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block">THE COLLECTIVE</span>
              <h2 id="testimonials-heading" className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]">
                Endorsed by the <br /><span className="text-white/20">Market Leaders.</span>
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {testimonials.map((t, i) => (
              <div key={i} className="group relative">
                <div className="absolute -top-12 -left-8 text-[12rem] font-bold text-white/5 pointer-events-none select-none">
                  &ldquo;
                </div>
                <div className="relative z-10">
                  <p className="text-2xl md:text-3xl font-light text-white/90 mb-16 leading-tight tracking-tight">
                    {t.quote}
                  </p>
                  
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 grayscale hover:grayscale-0 transition-all duration-700">
                      {t.image ? (
                        <img src={t.image} alt={t.author} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <span className="text-xl font-bold">{t.author[0]}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-[10px] tracking-[0.3em] uppercase mb-1">{t.author}</h4>
                      <div className="flex items-center gap-3">
                         <p className="text-lime-400 text-[10px] tracking-[0.2em] uppercase font-bold">{t.role}</p>
                         <div className="w-1 h-1 bg-white/20 rounded-full" />
                         <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase">{t.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-40 pt-20 border-t border-white/5 flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale">
             {['Pam Golding', 'Seeff', 'RE/MAX', 'Lew Geffen', 'Chas Everitt'].map(brand => (
               <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      <section 
        id="pricing" 
        className="py-40 md:py-60 px-4 sm:px-6 lg:px-8 bg-white"
        aria-labelledby="pricing-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32">
            <span className="text-charcoal-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block">EDITIONS</span>
            <h2 id="pricing-heading" className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
              Investment <br /><span className="text-charcoal-300">Tiers.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`relative group p-12 transition-all duration-700 border ${
                  plan.popular 
                    ? `bg-charcoal-900 border-charcoal-800 shadow-[0_40px_100px_rgba(0,0,0,0.2)]` 
                    : `bg-white border-charcoal-100 hover:border-charcoal-300`
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 px-4 py-1 bg-lime-400 text-charcoal-900 text-[10px] tracking-widest font-bold uppercase">
                    POPULAR
                  </div>
                )}
                
                <div className="mb-12">
                   <h3 className={`text-[10px] tracking-[0.4em] font-bold mb-8 uppercase ${plan.popular ? 'text-white/50' : 'text-charcoal-400'}`}>
                     {plan.name}
                   </h3>
                   <div className="flex items-baseline gap-1 mb-4">
                     <span className={`text-7xl font-bold tracking-tighter ${plan.popular ? 'text-white' : 'text-charcoal-900'}`}>
                       {plan.price}
                     </span>
                     {plan.period && <span className={`text-sm font-bold tracking-widest ${plan.popular ? 'text-white/30' : 'text-charcoal-300'}`}>{plan.period}</span>}
                   </div>
                   <p className={`text-sm tracking-wide ${plan.popular ? 'text-white/60' : 'text-charcoal-500'}`}>
                     {plan.desc}
                   </p>
                </div>

                <div className={`w-full h-px mb-12 ${plan.popular ? 'bg-white/10' : 'bg-charcoal-100'}`} />
                
                <ul className="space-y-6 mb-16">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-4">
                      <div className={`w-1 h-1 ${plan.popular ? 'bg-lime-400' : 'bg-charcoal-900'}`} />
                      <span className={`text-[11px] tracking-wider uppercase font-bold ${plan.popular ? 'text-white/70' : 'text-charcoal-600'}`}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href="/register" 
                  className={`block text-center py-6 text-[10px] tracking-[0.3em] font-bold transition-all duration-500 ${
                    plan.popular 
                      ? 'bg-white text-charcoal-900 hover:bg-lime-400' 
                      : 'bg-charcoal-900 text-white hover:bg-lime-400 hover:text-charcoal-900'
                  }`}
                >
                  ACQUIRE LICENSE
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