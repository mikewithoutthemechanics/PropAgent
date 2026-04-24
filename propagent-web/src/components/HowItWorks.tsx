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
    accent: '#84cc16',
    img: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&h=400&fit=crop&q=80',
  },
  {
    num: '02',
    icon: Cpu,
    title: 'Match',
    desc: 'The engine scores every active buyer against your listing across 40+ attributes — location, budget, lifestyle fit — and surfaces the top 3 instantly.',
    accent: '#38bdf8',
    img: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?w=600&h=400&fit=crop&q=80',
  },
  {
    num: '03',
    icon: Handshake,
    title: 'Close',
    desc: 'AI Concierge handles WhatsApp follow-ups, books viewings and routes hot leads to your inbox. You arrive to the negotiation, not the chase.',
    accent: '#fbbf24',
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
      // Heading clip-path wipe
      gsap.fromTo(
        '.hiw-heading',
        { clipPath: 'inset(0 100% 0 0)' },
        {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-heading', start: 'top 85%' },
        }
      );

      // Cards stagger
      gsap.fromTo(
        '.hiw-card',
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.hiw-cards', start: 'top 80%' },
        }
      );

      // Connector lines draw
      gsap.fromTo(
        '.hiw-connector',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: { trigger: '.hiw-cards', start: 'top 75%' },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative py-32 md:py-48 bg-[#060810] overflow-hidden"
      aria-labelledby="hiw-heading"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-lime-400/5 blur-[160px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-sky-500/5 blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-20 md:mb-28">
          <span className="block text-[10px] tracking-[0.4em] font-bold uppercase text-lime-400 mb-6">
            HOW IT WORKS
          </span>
          <h2
            id="hiw-heading"
            className="hiw-heading text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.88]"
          >
            Three steps.<br />
            <span className="text-white/20">Infinite leverage.</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="hiw-cards grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connector lines (desktop only) */}
          <div className="hidden md:block absolute top-[88px] left-[calc(33.33%-32px)] right-[calc(33.33%-32px)] h-px pointer-events-none">
            <div className="hiw-connector absolute left-0 w-1/2 h-px bg-white/10" />
            <div className="hiw-connector absolute right-0 w-1/2 h-px bg-white/10" />
          </div>

          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className="hiw-card group relative flex flex-col gap-6"
              >
                {/* Image */}
                <div className="relative overflow-hidden rounded-2xl aspect-[4/3]">
                  <img
                    src={step.img}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060810]/80 via-transparent to-transparent" />
                  {/* Number badge */}
                  <div
                    className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-extrabold"
                    style={{ backgroundColor: `${step.accent}20`, color: step.accent, border: `1px solid ${step.accent}40` }}
                  >
                    {step.num}
                  </div>
                </div>

                {/* Icon + title */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${step.accent}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: step.accent }} />
                  </div>
                  <h3
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ color: step.accent }}
                  >
                    {step.title}
                  </h3>
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
