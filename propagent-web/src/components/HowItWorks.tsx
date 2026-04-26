'use client';

import { useEffect, useRef } from 'react';
import { Upload, Cpu, Handshake } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    num: '01',
    icon: Upload,
    title: 'List',
    desc: 'Upload your property in under 60 seconds. Our AI enriches the listing with pricing intel, market comps and compliance checks automatically.',
    accent: '#00d4ff', // cyan primary
    img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&h=400&fit=crop&q=80',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'Match',
    desc: 'The engine scores every active buyer against your listing across 40+ attributes — location, budget, lifestyle fit — and surfaces the top 3 instantly.',
    accent: '#33ddff', // light cyan
    img: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?w=600&h=400&fit=crop&q=80',
  },
  {
    num: '03',
    icon: Handshake,
    title: 'Close',
    desc: 'AI Concierge handles WhatsApp follow-ups, books viewings and routes hot leads to your inbox. You arrive to the negotiation, not the chase.',
    accent: '#0090c2', // darker cyan
    img: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=600&h=400&fit=crop&q=80',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Headline reveal with slide-up
      gsap.fromTo(
        '.hiw-heading',
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.hiw-heading', start: 'top 85%' },
        }
      );

      // Cards reveal with stagger and scale
      gsap.fromTo(
        '.hiw-card',
        { opacity: 0, y: 80, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.1,
          stagger: 0.18,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.hiw-cards', start: 'top 75%' },
        }
      );

      // Connector lines draw
      gsap.fromTo(
        '.hiw-connector',
        { scaleX: 0, transformOrigin: 'left center', opacity: 0 },
        {
          scaleX: 1,
          opacity: 0.2,
          duration: 1,
          stagger: 0.18,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.hiw-cards', start: 'top 70%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-40 md:py-64 bg-[#060810] overflow-hidden"
      aria-labelledby="hiw-heading"
    >
      {/* Ambient glow — layered concentric soft glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(0,212,255,0.06)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_30%_30%,rgba(0,212,255,0.04)_0%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_70%_70%,rgba(51,221,255,0.04)_0%,transparent_50%)]" />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — asymmetric, with accent shape */}
        <div className="mb-32 md:mb-40 relative">
          {/* Decorative accent */}
          <div className="absolute -left-6 top-0 w-1 h-full bg-gradient-to-b from-[#00d4ff] via-[#33ddff] to-transparent opacity-30 hidden md:block" />

          <div className="relative pl-0 md:pl-12">
            <span className="block text-[10px] tracking-[0.4em] font-bold uppercase text-[#00d4ff] mb-8 hero-animate">
              HOW IT WORKS
            </span>
            <h2
              id="hiw-heading"
              className="hiw-heading text-display-5xl md:text-display-6xl font-extrabold text-white tracking-tighter leading-[0.88]"
            >
              Three steps.{'\n'}
              <span className="text-white/25">Infinite leverage.</span>
            </h2>
          </div>
        </div>

        {/* Cards — refined with glass, hover glow, and equal heights */}
        <div className="hiw-cards grid md:grid-cols-3 gap-8 md:gap-10 relative">
          {/* Connector lines (desktop only) — subtle */}
          <div className="hidden md:block absolute top-[120px] left-[calc(33.33%-40px)] right-[calc(33.33%-40px)] h-px pointer-events-none">
            <div className="hiw-connector absolute left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-[#00d4ff]/30 to-transparent" />
            <div className="hiw-connector absolute right-0 w-1/3 h-px bg-gradient-to-l from-transparent via-[#00d4ff]/30 to-transparent" />
            <div className="hiw-connector absolute left-1/2 -translate-x-px w-px h-full bg-[#00d4ff]/20" />
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const isLast = i === STEPS.length - 1;
            return (
              <div
                key={i}
                className="hiw-card group relative flex flex-col gap-7"
              >
                {/* Image wrapper — larger, more immersive */}
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-card group-hover:shadow-card-hover transition-all duration-500">
                  <img
                    src={step.img}
                    alt={step.title.replace('\n', ' ')}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060810]/90 via-[#060810]/20 to-transparent transition-opacity duration-500 group-hover:from-[#060810]/70" />

                  {/* Number badge — floating, glowing */}
                  <div
                    className="absolute -top-3 -right-3 w-14 h-14 rounded-full flex items-center justify-center text-[12px] font-extrabold border-2 transition-all duration-300 group-hover:scale-110 group-hover:border-[#00d4ff]"
                    style={{
                      backgroundColor: 'rgba(0, 212, 255, 0.12)',
                      color: step.accent,
                      borderColor: step.accent,
                      boxShadow: `0 0 24px ${step.accent}40`
                    }}
                  >
                    {step.num}
                  </div>
                </div>

                {/* Icon + title */}
                <div className="flex items-start gap-4">
                  <div
                    className="w-13 h-13 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{
                      backgroundColor: `${step.accent}15`,
                      border: '1px solid',
                      borderColor: `${step.accent}30`,
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-display-lg md:text-display-xl font-bold tracking-tight leading-none mb-2"
                      style={{ color: step.accent }}
                    >
                      {step.title.replace('\n', ' ')}
                    </h3>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/50 text-base leading-relaxed font-light">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
