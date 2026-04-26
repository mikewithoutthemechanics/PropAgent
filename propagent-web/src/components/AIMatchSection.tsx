'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { Zap, Target, TrendingUp, Clock, Shield, Brain } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: 'R2.5B+', label: 'Property Value Matched', icon: TrendingUp, color: '#00d4ff' },
  { value: '12,000+', label: 'Active Listings Processed', icon: Target, color: '#33ddff' },
  { value: '42%', label: 'Faster Time-to-Offer', icon: Clock, color: '#0090c2' },
  { value: '98%', label: 'Match Accuracy Rate', icon: Brain, color: '#66e6ff' },
];

const PILLARS = [
  {
    icon: Brain,
    title: 'Neural Matching Engine',
    desc: 'Decomposes every listing into 40+ semantic vectors, cross-references with buyer profiles in real-time.',
    accent: '#00d4ff',
  },
  {
    icon: Zap,
    title: 'Instant Lead Scoring',
    desc: 'Every inbound lead receives a predictive score based on financial readiness, intent signals, and property fit.',
    accent: '#33ddff',
  },
  {
    icon: Shield,
    title: 'POPIA-Compliant AI',
    desc: 'Full audit trail, consent management and data minimisation baked into every AI workflow.',
    accent: '#0090c2',
  },
];

// Animated counter hook
function useCounter(target: number, shouldStart: boolean, duration = 1.8) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    const start = performance.now();
    const update = (now: number) => {
      const elapsed = (now - start) / (duration * 1000);
      const progress = Math.min(elapsed, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [shouldStart, target, duration]);
  return count;
}

export default function AIMatchSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;

    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    io.observe(sectionRef.current);

    if (!prefersReducedMotion) {
      const ctx = gsap.context(() => {
        // Heading parallax / reveal
        gsap.from('.ai-section-heading', {
          scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
          opacity: 0,
          y: 80,
          duration: 1.4,
          ease: 'expo.out',
        });

        // Pillar cards stagger
        gsap.from('.ai-pillar', {
          scrollTrigger: { trigger: '.ai-pillars', start: 'top 80%' },
          opacity: 0,
          y: 60,
          stagger: 0.15,
          duration: 1,
          ease: 'power3.out',
        });

        // Stat chips stagger
        gsap.from('.ai-stat', {
          scrollTrigger: { trigger: '.ai-stats', start: 'top 80%' },
          opacity: 0,
          scale: 0.85,
          stagger: 0.1,
          duration: 0.8,
          ease: 'back.out(1.5)',
        });

        // Background parallax
        gsap.to('.ai-bg-blob', {
          y: -80,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      }, sectionRef);

      return () => {
        ctx.revert();
        io.disconnect();
      };
    }

    return () => io.disconnect();
  }, [prefersReducedMotion]);

  const formatted = useMemo(() =>
    new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 0 }),
  []);

  // Animated counter with elastic feel
  const AnimatedStat = ({ value, suffix = '' }: { value: string | number, suffix?: string }) => {
    const [display, setDisplay] = useState(0);
    const [hasAnimated, setHasAnimated] = useState(false);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!inView || hasAnimated || prefersReducedMotion) return;
      const numVal = typeof value === 'number' ? value : 0;
      if (numVal === 0) return;

      let start: number;
      const duration = 2000;
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

      const animate = (now: number) => {
        if (!start) start = now;
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOut(progress);
        setDisplay(Math.floor(eased * numVal));
        if (progress < 1) requestAnimationFrame(animate);
        else setHasAnimated(true);
      };
      requestAnimationFrame(animate);
    }, [inView, hasAnimated, value, prefersReducedMotion]);

    return (
      <span className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight tabular-nums">
        {typeof value === 'number' ? display : value}{suffix}
      </span>
    );
  };

  return (
    <section
      ref={sectionRef}
      className="relative py-48 md:py-64 overflow-hidden bg-[#060810]"
      aria-labelledby="ai-match-heading"
    >
      {/* Parallax ambient blobs — more layers, richer */}
      <div className="ai-bg-blob pointer-events-none absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.08)_0%,transparent_70%)]" />
      <div className="ai-bg-blob pointer-events-none absolute bottom-1/3 right-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(51,221,255,0.06)_0%,transparent_70%)]" />
      <div className="ai-bg-blob pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[400px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.04)_0%,transparent_70%)]" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label — decorative underline */}
        <div className="ai-section-heading text-center mb-32">
          <span className="block text-[10px] tracking-[0.5em] font-bold uppercase text-[#00d4ff] mb-8 hero-animate flex items-center justify-center gap-4">
            <span className="w-12 h-px bg-[#00d4ff]/30" />
            AI INTELLIGENCE
            <span className="w-12 h-px bg-[#00d4ff]/30" />
          </span>
          <h2
            id="ai-match-heading"
            className="text-display-4xl md:text-display-6xl font-extrabold text-white tracking-tighter leading-[0.85] mb-10"
          >
            Matching buyers.{'\n'}
            <span className="text-white/20">to properties.</span>
          </h2>
          <p className="text-white/50 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-relaxed">
            Our AI doesn't just search — it understands intent, finances, lifestyle and timing to surface the perfect match.
          </p>
        </div>

        {/* Stats row — enhanced with animated counters and glow */}
        <div className="ai-stats grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-32">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="ai-stat relative p-8 md:p-10 rounded-2xl border overflow-hidden transition-all duration-500 hover:border-[#00d4ff]/40 group"
                style={{
                  borderColor: `${stat.color}25`,
                  background: `linear-gradient(135deg, ${stat.color}10 0%, transparent 50%)`,
                }}
              >
                {/* Glow on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 30% 0%, ${stat.color}15 0%, transparent 60%)`,
                  }}
                />

                <Icon className="w-7 h-7 mb-5 opacity-60 relative z-10" style={{ color: stat.color }} />
                <div className="relative z-10 text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
                  {typeof stat.value === 'number' ? (
                    <AnimatedStat value={stat.value} />
                  ) : (
                    stat.value
                  )}
                </div>
                <div className="relative z-10 text-white/40 text-[11px] tracking-[0.15em] uppercase font-semibold">
                  {stat.label}
                </div>

                {/* Corner accent — more dynamic */}
                <div
                  className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-3xl opacity-15 group-hover:opacity-25 transition-opacity duration-500"
                  style={{ backgroundColor: stat.color }}
                />

                {/* Subtle top highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

        {/* 3 Pillars — premium glass-morphism cards */}
        <div className="ai-pillars grid md:grid-cols-3 gap-6 md:gap-8">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="ai-pillar group relative p-8 md:p-10 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
                style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)' }}
              >
                {/* Animated gradient ambience */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 50% -30%, ${pillar.accent}12 0%, transparent 50%)`,
                  }}
                />

                {/* Hover glow ring */}
                <div
                  className="absolute -inset-px opacity-0 group-hover:opacity-30 transition-opacity duration-700 rounded-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${pillar.accent}15 0%, transparent 50%, ${pillar.accent}10 100%)`,
                    filter: 'blur(8px)',
                  }}
                />

                <div
                  className="w-12 h-12 flex items-center justify-center rounded-xl mb-8 relative z-10 transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${pillar.accent}15`,
                    border: `1px solid ${pillar.accent}25`,
                    boxShadow: `0 0 20px ${pillar.accent}15`,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: pillar.accent }} />
                </div>

                <h3 className="relative z-10 text-2xl font-bold text-white tracking-tight mb-4 group-hover:text-[#00d4ff] transition-colors duration-300">
                  {pillar.title}
                </h3>
                <p className="relative z-10 text-white/50 text-base leading-relaxed font-light">
                  {pillar.desc}
                </p>

                {/* Number accent — watermark style */}
                <div
                  className="absolute top-8 right-8 text-7xl font-extrabold opacity-6 leading-none pointer-events-none select-none"
                  style={{ color: pillar.accent }}
                >
                  0{i + 1}
                </div>
              </div>
            );
          })}
        </div>
        {/* Bottom horizontal rule */}
        <div className="mt-24 flex items-center gap-8">
          <div className="flex-1 h-px bg-white/5" />
          <div className="text-[10px] tracking-[0.4em] uppercase text-white/20 font-bold">
            SA&apos;s FIRST AI-NATIVE PROPERTY PLATFORM
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>
      </div>
    </section>
  );
}
