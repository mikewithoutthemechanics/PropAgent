'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import {
  Home,
  ArrowRight,
  Zap,
  Menu,
  X,
  Building,
} from 'lucide-react';
import HeroVideo from '@/components/HeroVideo';
import AIMatchSection from '@/components/AIMatchSection';
import IPhoneScrollytelling from '@/components/IPhoneScrollytelling';
import PropertyCarousel3D from '@/components/PropertyCarousel3D';
import PricingEditorial from '@/components/pricing/PricingEditorial';
import TestimonialsMarquee from '@/components/social/TestimonialsMarquee';
import FooterMinimal from '@/components/footer/FooterMinimal';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
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

  // Hero GSAP animations
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

      // Section entrance animations (perspective depth feel)
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

  return (
    <div className="min-h-screen bg-[#060810] text-white font-sans overflow-x-hidden">
      {/* Skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-charcoal-900 focus:text-white focus:rounded-lg focus:font-medium"
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
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-400 flex items-center justify-center">
                <Building className="w-5 h-5 text-[#060810]" />
              </div>
              <span className="text-lg font-bold tracking-[0.08em] uppercase text-white">Agent Loop</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-10">
              {[
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

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-screen flex items-center pt-28 pb-16 overflow-hidden bg-[#060810]"
        aria-labelledby="hero-title"
      >
        {/* Hero masked intro wipe */}
        <div
          id="hero-mask"
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0"
        />

        <HeroVideo
          videoSrc="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-modern-building-43082-large.mp4"
          posterSrc="https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1920&auto=format&fit=crop"
          overlay
          className="absolute inset-0 !h-screen parallax-bg"
        >
          <div
            className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"
            style={heroParallaxStyle}
          >
            <div className="max-w-5xl">
              {/* Badge */}
              <div className="hero-animate inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-white text-[10px] tracking-[0.35em] font-bold uppercase mb-14">
                <Zap className="w-4 h-4 text-lime-400" aria-hidden />
                AI-NATIVE PROPERTY PLATFORM · SOUTH AFRICA
              </div>

              {/* Headline — split-text reveal */}
              <h1
                id="hero-title"
                className="text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] font-extrabold tracking-tight leading-[0.85] mb-14 text-white"
                style={{ perspective: 800 }}
              >
                List it.{'\n'}Match it.{'\n'}Close it.
              </h1>

              {/* Sub-copy + CTAs */}
              <div className="grid md:grid-cols-2 gap-12 items-end">
                <p className="hero-animate text-xl md:text-2xl text-white/70 leading-tight font-light tracking-tight max-w-sm">
                  The AI operating system for South African property leaders. Listings, buyers and deals — unified.
                </p>
                <div className="hero-animate flex flex-col sm:flex-row gap-5">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center gap-4 px-10 py-6 bg-lime-400 text-[#060810] text-[12px] tracking-[0.12em] font-bold hover:bg-white transition-colors duration-300 group"
                  >
                    START FREE
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex items-center justify-center gap-4 px-10 py-6 border border-white/20 text-white text-[12px] tracking-[0.12em] font-medium hover:bg-white/10 transition-colors duration-300"
                  >
                    SEE HOW IT WORKS
                  </a>
                </div>
              </div>
            </div>
          </div>
        </HeroVideo>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 animate-bounce">
          <span className="text-white/30 text-[9px] tracking-widest uppercase font-bold">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/50 to-transparent" />
        </div>

        {/* Floating stats pills */}
        <div className="absolute bottom-20 right-8 z-20 hidden lg:flex flex-col gap-3">
          {[
            { val: 'R2.5B+', label: 'Matched' },
            { val: '42%', label: 'Faster' },
            { val: '98%', label: 'Accuracy' },
          ].map((s) => (
            <div key={s.val} className="hero-animate flex items-center gap-3 bg-white/5 backdrop-blur-lg border border-white/10 px-4 py-2 rounded-full">
              <span className="text-lime-400 font-extrabold text-sm">{s.val}</span>
              <span className="text-white/40 text-[10px] tracking-widest uppercase">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
      <main id="main-content">

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

        {/* Final CTA */}
        <section
          id="cta"
          className="py-40 md:py-60 px-4 sm:px-6 lg:px-8 bg-[#060810] relative overflow-hidden"
          aria-labelledby="cta-heading"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-lime-400/10 blur-[160px]" />
          </div>

          {/* Grid lines */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
              backgroundSize: '80px 80px',
            }}
          />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <span className="section-enter text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-12 block">
              READY TO CLOSE MORE DEALS?
            </span>
            <h2
              id="cta-heading"
              className="section-enter text-5xl md:text-8xl font-extrabold tracking-tighter mb-12 leading-[0.85] text-white"
            >
              The AI is Ready.<br />
              <span className="text-white/20">Are You?</span>
            </h2>
            <p className="section-enter text-white/50 text-xl md:text-2xl mb-16 font-light max-w-2xl mx-auto leading-tight">
              Join the collective of high-performing property professionals who trust Agent Loop.
            </p>
            <div className="section-enter flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/register"
                className="px-14 py-6 bg-lime-400 text-[#060810] text-[11px] tracking-[0.3em] font-extrabold hover:bg-white transition-all duration-500 w-full sm:w-auto"
              >
                INITIALIZE PLATFORM
              </Link>
              <span className="text-white/20 text-[10px] tracking-widest font-bold uppercase">NO COMMITMENT REQUIRED</span>
            </div>
          </div>
        </section>
      </main>

      <FooterMinimal />
    </div>
  );
}
