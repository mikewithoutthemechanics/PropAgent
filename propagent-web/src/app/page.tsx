'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  ArrowRight,
  Zap,
  Menu,
  X,
  Building,
  Shield,
} from 'lucide-react';
import HeroVideo from '@/components/HeroVideo';
import HowItWorks from '@/components/HowItWorks';
import StickyDemoCTA from '@/components/StickyDemoCTA';
import PricingEditorial from '@/components/pricing/PricingEditorial';
import TestimonialsMarquee from '@/components/social/TestimonialsMarquee';
import FooterMinimal from '@/components/footer/FooterMinimal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Lazy-load heavy R3F / WebGL / 3D components — removes ~300KB from initial bundle
const AIMatchSection = dynamic(() => import('@/components/AIMatchSection'), { ssr: false });
const IPhoneScrollytelling = dynamic(() => import('@/components/IPhoneScrollytelling'), { ssr: false });
const PropertyCarousel3D = dynamic(() => import('@/components/PropertyCarousel3D'), { ssr: false });

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [emailValue, setEmailValue] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isTouchDevice = useRef(false);

  // Reduced motion detection
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // Touch / mouse tracking
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setMousePosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const onMouse = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    const onTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) setMousePosition({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };
    window.addEventListener('mousemove', onMouse, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  // Cursor micro-parallax for hero
  const heroParallaxStyle = useMemo((): React.CSSProperties => {
    if (prefersReducedMotion || isTouchDevice.current) return {};
    const cx = mousePosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1) - 0.5;
    const cy = mousePosition.y / (typeof window !== 'undefined' ? window.innerHeight : 1) - 0.5;
    return {
      transform: `translate3d(${Math.max(-14, Math.min(14, cx * 28))}px, ${Math.max(-10, Math.min(10, cy * 20))}px, 0)`,
    };
  }, [mousePosition, prefersReducedMotion]);

  // Nav scroll shrink
  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 30);
  }, []);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // CTA magnetic effect (movement on mouse hover within button)
  useEffect(() => {
    if (prefersReducedMotion) return;

    const buttons = document.querySelectorAll('.magnetic-cta');
    const onMove = (e: MouseEvent, btn: HTMLElement) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const dist = Math.sqrt(x * x + y * y);
      const maxMove = 6;
      const factor = Math.min(dist / (rect.width / 2), 1);
      const moveX = (x / rect.width) * maxMove * factor;
      const moveY = (y / rect.height) * maxMove * factor;
      btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    };

    buttons.forEach((btn) => {
      const el = btn as HTMLElement;
      el.addEventListener('mousemove', (e) => onMove(e, el));
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
      });
    });
  }, [prefersReducedMotion]);
  useEffect(() => {
    if (prefersReducedMotion) return;
    const ctx = gsap.context(() => {
      // Kinetic split-text hero title
      const heroTitle = document.getElementById('hero-title');
      if (heroTitle) {
        const words = heroTitle.innerText.split('\n');
        heroTitle.innerHTML = words
          .map(
            (line) =>
              `<span class="block overflow-hidden"><span class="line-inner inline-block">${line}</span></span>`
          )
          .join('');
        gsap.from('.line-inner', {
          y: '110%',
          opacity: 0,
          rotateX: -40,
          stagger: 0.12,
          duration: 1.0,
          ease: 'expo.out',
          delay: 0.4,
        });
      }

      // Hero sub-elements
      gsap.fromTo(
        '.hero-animate',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.8 }
      );

      // Hero intro wipe mask
      const mask = document.getElementById('hero-mask');
      if (mask) {
        gsap.fromTo(
          mask,
          { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
          { scaleX: 1, opacity: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.1 }
        );
        gsap.to(mask, { opacity: 0, duration: 0.5, delay: 0.7, ease: 'power1.out' });
      }

      // Ken Burns on hero video: subtle scale settle
      const heroVideo = document.querySelector('.parallax-bg video') as HTMLVideoElement | null;
      if (heroVideo) {
        gsap.fromTo(
          heroVideo,
          { scale: 1.07 },
          { scale: 1, duration: 3.5, ease: 'power1.out', delay: 0 }
        );
      }

      // Hero video parallax out on scroll
      gsap.to('.parallax-bg', {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Section entrance animations — clip-path wipe on headings
      gsap.utils.toArray<HTMLElement>('.section-heading-wipe').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0 100% 0 0)' },
          {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 85%' },
          }
        );
      });

      // General section entrance (depth feel)
      gsap.utils.toArray<HTMLElement>('.section-enter').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
            },
          }
        );
      });
    });

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [prefersReducedMotion]);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValue.trim()) return;
    // TODO: wire to your email collection endpoint / CRM
    setEmailSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#060810] text-white overflow-x-hidden">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-lime-400 focus:text-[#060810] focus:rounded-lg focus:font-medium"
      >
        Skip to main content
      </a>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-[#060810]/90 backdrop-blur-3xl border-b border-white/5 py-4'
            : 'bg-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo — refined typographic mark */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#00d4ff] to-[#0090c2] flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <div className="w-5 h-5 bg-[#060810] rounded-sm" />
              </div>
              <span className="text-lg font-extrabold tracking-[0.2em] text-white font-display">AGENT LOOP</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-10">
              {[
                { label: 'HOW IT WORKS', href: '#how-it-works' },
                { label: 'AI PLATFORM', href: '#ai' },
                { label: 'FEATURES', href: '#features' },
                { label: 'LISTINGS', href: '#listings' },
                { label: 'PRICING', href: '#pricing' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-[11px] tracking-[0.12em] text-white/60 hover:text-white transition-colors font-semibold"
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-5">
              <Link
                href="/login"
                className="hidden sm:block text-[11px] tracking-[0.12em] text-white/60 hover:text-white transition-colors font-semibold"
              >
                SIGN IN
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 bg-lime-400 text-[#060810] text-[11px] tracking-[0.12em] font-bold hover:bg-white transition-colors"
              >
                GET STARTED
              </Link>
              <button
                className="md:hidden p-2 text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#060810] z-40 pt-24 px-6 md:hidden flex flex-col gap-6">
          {[
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'AI Platform', href: '#ai' },
            { label: 'Features', href: '#features' },
            { label: 'Listings', href: '#listings' },
            { label: 'Pricing', href: '#pricing' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-2xl font-medium text-white"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Link href="/login" className="text-2xl font-medium text-white">Sign in</Link>
        </div>
      )}

       {/* HERO ─────────────────────────────────────────────────── */}
       <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden bg-[#060810]"
        aria-labelledby="hero-title"
      >
        {/* Hero masked intro wipe */}
        <div
          id="hero-mask"
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/0 via-white/15 to-white/0 opacity-0"
        />

        {/* Background video with enhanced overlay */}
        <HeroVideo
          videoSrc="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-modern-building-43082-large.mp4"
          posterSrc="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1920&auto=format&fit=crop"
          overlay
          className="absolute inset-0 !h-screen parallax-bg"
        >
          {/* Gradient mesh background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#060810] via-[#080c14] to-[#0a141c] opacity-80" />
          
          {/* Decorative accent grid */}
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)
              `,
              backgroundSize: '80px 80px',
            }}
          />

          <div
            className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            style={heroParallaxStyle}
          >
            <div className="max-w-6xl">
              {/* Badge — more substantial */}
              <div className="hero-animate inline-flex items-center gap-3 px-6 py-2.5 bg-white/4 backdrop-blur-xl border border-white/8 text-[10px] tracking-[0.35em] font-semibold uppercase mb-20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4ff]"></span>
                </span>
                AI-NATIVE PROPERTY PLATFORM · SOUTH AFRICA
              </div>

              {/* Headline — split-text reveal with stronger visual weight */}
              <h1
                id="hero-title"
                className="text-display-6xl sm:text-display-7xl md:text-display-8xl font-extrabold tracking-tight leading-[0.85] mb-14 text-white drop-shadow-[0_0_40px_rgba(0,212,255,0.15)]"
                style={{ perspective: 1000 }}
              >
                List it.{'\n'}Match it.{'\n'}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#33ddff] to-[#00a8c8] drop-shadow-[0_0_30px_rgba(0,212,255,0.4)]">
                  Close it.
                </span>
              </h1>

              {/* Sub-copy — stronger contrast, better rhythm */}
              <p className="hero-animate text-lg md:text-xl text-white/60 leading-relaxed font-light tracking-normal max-w-xl mb-12">
                The AI operating system for South African property professionals.
                <br className="hidden md:block" />
                <span className="text-white/40">Listings, buyers and deals — unified.</span>
              </p>

              {/* Inline email capture — primary CTA with magnetic feel */}
              <div className="hero-animate mb-8">
                {emailSubmitted ? (
                  <div className="inline-flex items-center gap-3 px-6 py-4 bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-sm font-medium rounded-sm backdrop-blur-md shadow-accent">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d4ff]"></span>
                    </span>
                    <span>You're on the list — we'll be in touch shortly.</span>
                  </div>
                ) : (
                  <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg" aria-label="Get early access">
                    <label htmlFor="hero-email" className="sr-only">Work email address</label>
                    <input
                      id="hero-email"
                      type="email"
                      required
                      placeholder="your@company.co.za"
                      value={emailValue}
                      onChange={(e) => setEmailValue(e.target.value)}
                      className="flex-1 px-6 py-4 bg-white/6 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.2)] transition-all duration-300 rounded-sm backdrop-blur-md hover:bg-white/8"
                    />
                    <button
                      type="submit"
                      className="magnetic-cta inline-flex items-center justify-center gap-2 px-10 py-4 bg-gradient-to-r from-[#00d4ff] to-[#0090c2] text-[#060810] text-[11px] tracking-[0.15em] font-extrabold hover:from-[#33ddff] hover:to-[#00d4ff] transition-all duration-300 rounded-sm whitespace-nowrap shadow-button hover:shadow-button-hover"
                    >
                      GET EARLY ACCESS
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>>

              {/* Secondary action */}
              <div className="hero-animate flex items-center gap-5">
                <a
                  href="#how-it-works"
                  className="text-white/40 text-[11px] tracking-[0.12em] font-medium hover:text-white/80 transition-colors inline-flex items-center gap-2"
                >
                  SEE HOW IT WORKS
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </HeroVideo>

        {/* Social proof bar — refined with subtle glow */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/6 bg-[#060810]/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-x-10 gap-y-3">
            <div className="flex items-center gap-2.5 text-white/40 text-[10px] tracking-[0.3em] font-semibold uppercase">
              <Shield className="w-3.5 h-3.5 text-[#00d4ff]" aria-hidden />
              PPRA Registered
            </div>
            <div className="w-px h-4 bg-white/8 hidden sm:block" aria-hidden />
            <span className="text-white/40 text-[10px] tracking-[0.3em] font-semibold uppercase">500+ Active Agents</span>
            <div className="w-px h-4 bg-white/8 hidden sm:block" aria-hidden />
            <span className="text-white/40 text-[10px] tracking-[0.3em] font-semibold uppercase">R2.5B+ Matched</span>
            <div className="w-px h-4 bg-white/8 hidden sm:block" aria-hidden />
            <span className="text-white/40 text-[10px] tracking-[0.3em] font-semibold uppercase">POPIA Compliant</span>
            <div className="w-px h-4 bg-white/8 hidden sm:block" aria-hidden />
            <span className="text-white/40 text-[10px] tracking-[0.3em] font-semibold uppercase">FICA Ready</span>
          </div>
        </div>

        {/* Scroll indicator — sleeker */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
          <span className="text-white/30 text-[10px] tracking-[0.2em] uppercase font-bold">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>

        {/* Floating stats pills — updated colors and motion */}
        <div className="absolute top-1/2 right-8 -translate-y-1/2 z-20 hidden lg:flex flex-col gap-4">
          {[
            { val: 'R2.5B+', label: 'Matched' },
            { val: '42%', label: 'Faster' },
            { val: '98%', label: 'Accuracy' },
          ].map((s, i) => (
            <div
              key={s.val + s.label}
              className="hero-animate flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-full shadow-button"
              style={{ animationDelay: `${0.9 + i * 0.15}s` }}
            >
              <span className="text-[#00d4ff] font-extrabold text-sm tracking-tight">{s.val}</span>
              <span className="text-white/40 text-[10px] tracking-widest uppercase whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main id="main-content">

        {/* How It Works — bridges hero to features */}
        <HowItWorks />

        {/* AI Match Intelligence Section */}
        <div id="ai">
          <AIMatchSection />
        </div>

        {/* iPhone-framed scrollytelling: AI Features */}
        <div id="features">
          <IPhoneScrollytelling />
        </div>

        {/* 3D Auto-rotating Property Carousel */}
        <div id="listings">
          <PropertyCarousel3D />
        </div>

        {/* Testimonials Marquee */}
        <TestimonialsMarquee />

        {/* Pricing */}
        <div id="pricing">
          <PricingEditorial />
        </div>

        {/* Final CTA — enhanced gradient and depth */}
        <section
          id="cta"
          className="py-40 md:py-64 px-4 sm:px-6 lg:px-8 bg-[#060810] relative overflow-hidden"
          aria-labelledby="cta-heading"
        >
          {/* Rich ambient glow with layered gradients */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.08)_0%,transparent_70%)] blur-[120px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.12)_20%,transparent_70%)] blur-[80px]" />
          </div>

          {/* Grid lines — subtle */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          {/* Decorative accent line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-[#00d4ff] to-transparent opacity-30" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="section-enter text-[#00d4ff] text-[10px] tracking-[0.5em] font-bold uppercase mb-16 block drop-shadow-[0_0_15px_rgba(0,212,255,0.5)]">
              READY TO CLOSE MORE DEALS?
            </span>
            <h2
              id="cta-heading"
              className="section-heading-wipe section-enter text-display-4xl md:text-display-6xl font-extrabold tracking-tighter mb-12 leading-[0.85] text-white"
            >
              The AI is Ready.{'\n'}
              <span className="text-white/15">Are You?</span>
            </h2>
            <p className="section-enter text-white/50 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed mb-20">
              Join the collective of high-performing property professionals who trust Agent Loop.
            </p>

             {/* Inline email capture in CTA */}
             <div className="section-enter flex flex-col items-center gap-6">
               {emailSubmitted ? (
                 <div className="inline-flex items-center gap-3 px-8 py-5 bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff] text-base font-medium shadow-accent">
                   <span className="relative flex h-2.5 w-2.5">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d4ff] opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00d4ff]"></span>
                   </span>
                   <span>You're on the list — we'll be in touch shortly.</span>
                 </div>
               ) : (
                 <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md w-full" aria-label="Get early access from CTA">
                   <label htmlFor="cta-email" className="sr-only">Work email address</label>
                   <input
                     id="cta-email"
                     type="email"
                     required
                     placeholder="your@company.co.za"
                     value={emailValue}
                     onChange={(e) => setEmailValue(e.target.value)}
                     className="flex-1 px-6 py-5 bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#00d4ff] focus:shadow-[0_0_0_3px_rgba(0,212,255,0.15)] transition-all duration-300 rounded-sm hover:bg-white/8"
                   />
                   <button
                     type="submit"
                     className="magnetic-cta px-10 py-5 bg-gradient-to-r from-[#00d4ff] to-[#0090c2] text-[#060810] text-[11px] tracking-[0.2em] font-extrabold hover:from-[#33ddff] hover:to-[#00d4ff] transition-all duration-300 rounded-sm whitespace-nowrap shadow-button hover:shadow-button-hover"
                   >
                     INITIALIZE PLATFORM
                   </button>
                 </form>
               )}
               <div className="flex items-center gap-2">
                 <span className="w-px h-4 bg-white/10" />
                 <span className="text-white/20 text-[10px] tracking-[0.2em] uppercase font-bold">No commitment required</span>
                 <span className="w-px h-4 bg-white/10" />
               </div>
             </div>
          </div>
        </section>
      </main>

      <FooterMinimal />

      {/* Sticky demo bar — appears after 30% scroll */}
      <StickyDemoCTA />
    </div>
  );
}
