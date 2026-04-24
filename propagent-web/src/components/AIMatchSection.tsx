'use client';

import { useRef, useEffect, useState } from 'react';
import { Zap, Target, TrendingUp, Clock, Shield, Brain } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STATS = [
  { value: 'R2.5B+', label: 'Property Value Matched', icon: TrendingUp, color: '#84cc16' },
  { value: '12,000+', label: 'Active Listings Processed', icon: Target, color: '#38bdf8' },
  { value: '42%', label: 'Faster Time-to-Offer', icon: Clock, color: '#fbbf24' },
  { value: '98%', label: 'Match Accuracy Rate', icon: Brain, color: '#a78bfa' },
];

const PILLARS = [
  {
    icon: Brain,
    title: 'Neural Matching Engine',
    desc: 'Decomposes every listing into 40+ semantic vectors, cross-references with buyer profiles in real-time.',
    accent: '#84cc16',
  },
  {
    icon: Zap,
    title: 'Instant Lead Scoring',
    desc: 'Every inbound lead receives a predictive score based on financial readiness, intent signals, and property fit.',
    accent: '#38bdf8',
  },
  {
    icon: Shield,
    title: 'POPIA-Compliant AI',
    desc: 'Full audit trail, consent management and data minimisation baked into every AI workflow.',
    accent: '#fbbf24',
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

  return (
    <section
      ref={sectionRef}
      className="relative py-40 overflow-hidden bg-[#070a0f]"
      aria-labelledby="ai-match-heading"
    >
      {/* Parallax ambient blobs */}
      <div className="ai-bg-blob pointer-events-none absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-lime-400/5 blur-[150px]" />
      <div className="ai-bg-blob pointer-events-none absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-sky-400/5 blur-[150px]" />

      {/* Grid pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <div className="ai-section-heading text-center mb-24">
          <span className="block text-[10px] tracking-[0.4em] font-bold uppercase text-lime-400 mb-8">
            AI INTELLIGENCE
          </span>
          <h2
            id="ai-match-heading"
            className="text-5xl md:text-8xl font-extrabold text-white tracking-tighter leading-[0.85] mb-8"
          >
            Matching buyers<br />
            <span className="text-white/20">to properties.</span>
          </h2>
          <p className="text-white/40 text-xl md:text-2xl font-light max-w-2xl mx-auto leading-tight">
            Our AI doesn't just search — it understands intent, finances, lifestyle and timing to surface the perfect match.
          </p>
        </div>

        {/* Stats row */}
        <div className="ai-stats grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {STATS.map((stat, i) => (
            <div
              key={i}
              className="ai-stat relative p-8 rounded-2xl border overflow-hidden"
              style={{
                borderColor: `${stat.color}20`,
                background: `linear-gradient(135deg, ${stat.color}08 0%, transparent 60%)`,
              }}
            >
              <stat.icon className="w-6 h-6 mb-4 opacity-60" style={{ color: stat.color }} />
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight"
                style={prefersReducedMotion ? {} : {}}>
                {stat.value}
              </div>
              <div className="text-white/40 text-[11px] tracking-wider uppercase font-medium">{stat.label}</div>

              {/* Corner accent */}
              <div
                className="absolute bottom-0 right-0 w-20 h-20 rounded-tl-3xl opacity-10"
                style={{ backgroundColor: stat.color }}
              />
            </div>
          ))}
        </div>

        {/* 3 Pillars */}
        <div className="ai-pillars grid md:grid-cols-3 gap-6">
          {PILLARS.map((pillar, i) => (
            <div
              key={i}
              className="ai-pillar group relative p-10 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-500 overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 50% 0%, ${pillar.accent}15 0%, transparent 60%)` }}
              />

              <div
                className="w-12 h-12 flex items-center justify-center rounded-xl mb-8 relative z-10"
                style={{ backgroundColor: `${pillar.accent}15` }}
              >
                <pillar.icon className="w-6 h-6" style={{ color: pillar.accent }} />
              </div>

              <h3 className="relative z-10 text-2xl font-bold text-white tracking-tight mb-4">{pillar.title}</h3>
              <p className="relative z-10 text-white/40 text-base leading-relaxed font-light">{pillar.desc}</p>

              {/* Number accent */}
              <div
                className="absolute top-8 right-8 text-7xl font-extrabold opacity-5 leading-none"
                style={{ color: pillar.accent }}
              >
                0{i + 1}
              </div>
            </div>
          ))}
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
