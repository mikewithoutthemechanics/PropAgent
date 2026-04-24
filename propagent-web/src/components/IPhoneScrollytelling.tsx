'use client';

import { useRef, useEffect, useState } from 'react';
import { Target, Users, BarChart3, Zap, Shield, MessageSquare, Home, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const STEPS = [
  {
    id: 'match',
    label: 'AI MATCHING',
    title: 'Precision\nBuyer Match',
    desc: 'Our AI engine analyses 40+ property attributes and matches the perfect buyer to every listing in milliseconds.',
    icon: Target,
    accent: '#84cc16',
    screen: 'match',
  },
  {
    id: 'crm',
    label: 'SMART CRM',
    title: 'Lead\nIntelligence',
    desc: 'Automated lead nurturing, predictive follow-ups, and AI scoring so the hottest prospects never go cold.',
    icon: Users,
    accent: '#38bdf8',
    screen: 'crm',
  },
  {
    id: 'analytics',
    label: 'ANALYTICS',
    title: 'Live\nDashboards',
    desc: 'Real-time yield, vacancy, and market velocity data. Make every decision backed by live intelligence.',
    icon: BarChart3,
    accent: '#fbbf24',
    screen: 'analytics',
  },
  {
    id: 'comms',
    label: 'AI CONCIERGE',
    title: '24/7 Lead\nConcierge',
    desc: 'WhatsApp & email AI qualifies leads, books viewings and routes hot prospects — while you sleep.',
    icon: MessageSquare,
    accent: '#a78bfa',
    screen: 'comms',
  },
];

// iPhone Screen Content per step
function MatchScreen({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full bg-[#0f1117] flex flex-col p-3 gap-2">
      <div className="text-[8px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>TOP MATCHES</div>
      {[
        { match: 97, price: 'R 3.2M', beds: 4, area: 'Sandton', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=60&h=40&fit=crop&q=80' },
        { match: 93, price: 'R 1.8M', beds: 3, area: 'Cape Town', img: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=60&h=40&fit=crop&q=80' },
        { match: 88, price: 'R 2.5M', beds: 4, area: 'Umhlanga', img: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=60&h=40&fit=crop&q=80' },
      ].map((p, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
          <img src={p.img} alt={p.area} className="w-10 h-7 object-cover rounded-md" />
          <div className="flex-1 min-w-0">
            <div className="text-white text-[9px] font-semibold truncate">{p.price} · {p.beds}bed · {p.area}</div>
            <div className="text-white/40 text-[8px]">{p.beds} beds</div>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full text-[9px] font-extrabold" style={{ backgroundColor: `${accent}22`, color: accent }}>
            {p.match}%
          </div>
        </div>
      ))}
      <div className="mt-auto rounded-lg py-2 text-center text-[9px] font-bold tracking-wider" style={{ backgroundColor: accent, color: '#0f1117' }}>
        VIEW ALL MATCHES
      </div>
    </div>
  );
}

function CRMScreen({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full bg-[#0f1117] flex flex-col p-3 gap-2">
      <div className="text-[8px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>PIPELINE</div>
      {['Hot Lead', 'Viewing Booked', 'Offer Made', 'Closing'].map((stage, i) => (
        <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg p-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent, opacity: 1 - i * 0.2 }} />
          <span className="text-white text-[9px] font-semibold flex-1">{stage}</span>
          <span className="text-white/40 text-[8px]">{4 - i} leads</span>
        </div>
      ))}
      <div className="mt-2 bg-white/5 rounded-lg p-2">
        <div className="text-[8px] text-white/40 mb-1">AI Sentiment</div>
        <div className="flex gap-1">
          {[80, 60, 90, 45, 70].map((v, i) => (
            <div key={i} className="flex-1 rounded-sm" style={{ height: v * 0.3, backgroundColor: accent, opacity: 0.5 + v / 200 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function AnalyticsScreen({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full bg-[#0f1117] flex flex-col p-3 gap-2">
      <div className="text-[8px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>PORTFOLIO METRICS</div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Yield', value: '9.2%', up: true },
          { label: 'Vacancy', value: '3.1%', up: false },
          { label: 'Arrears', value: 'R 4.2k', up: false },
          { label: 'Deals', value: '14 active', up: true },
        ].map((m, i) => (
          <div key={i} className="bg-white/5 rounded-lg p-2">
            <div className="text-white/40 text-[7px] mb-1">{m.label}</div>
            <div className="font-bold text-[11px]" style={{ color: m.up ? accent : '#f87171' }}>{m.value}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-white/5 rounded-lg p-2 flex items-end gap-1">
        {[40, 60, 50, 80, 70, 90, 65].map((h, i) => (
          <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, backgroundColor: accent, opacity: 0.4 + i * 0.08 }} />
        ))}
      </div>
    </div>
  );
}

function CommsScreen({ accent }: { accent: string }) {
  return (
    <div className="w-full h-full bg-[#0f1117] flex flex-col p-3 gap-2">
      <div className="text-[8px] font-bold tracking-widest uppercase mb-1" style={{ color: accent }}>AI CONCIERGE</div>
      <div className="flex-1 flex flex-col gap-2 overflow-hidden">
        {[
          { from: 'Buyer', msg: 'Is this still available?', time: '09:41' },
          { from: 'AI', msg: 'Yes! Would you like to book a viewing for tomorrow?', time: '09:41' },
          { from: 'Buyer', msg: '10am works!', time: '09:42' },
          { from: 'AI', msg: 'Confirmed ✓ Calendar invite sent.', time: '09:42' },
        ].map((m, i) => (
          <div key={i} className={`flex ${m.from === 'AI' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[80%] rounded-xl px-2 py-1.5 text-[8px]" style={{
              backgroundColor: m.from === 'AI' ? `${accent}22` : 'rgba(255,255,255,0.06)',
              color: m.from === 'AI' ? accent : 'rgba(255,255,255,0.8)',
            }}>
              {m.msg}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5">
        <span className="text-white/20 text-[8px] flex-1">Reply...</span>
        <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: accent }}>
          <Zap className="w-2 h-2 text-[#0f1117]" />
        </div>
      </div>
    </div>
  );
}

function PhoneScreen({ step }: { step: typeof STEPS[0] }) {
  switch (step.screen) {
    case 'match': return <MatchScreen accent={step.accent} />;
    case 'crm': return <CRMScreen accent={step.accent} />;
    case 'analytics': return <AnalyticsScreen accent={step.accent} />;
    case 'comms': return <CommsScreen accent={step.accent} />;
    default: return null;
  }
}

export default function IPhoneScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: `+=${STEPS.length * 100}%`,
          pin: true,
          anticipatePin: 1,
          scrub: 1.2,
          snap: {
            snapTo: 1 / Math.max(1, STEPS.length - 1),
            duration: 0.7,
            ease: 'power2.out',
          },
          onUpdate(self) {
            const idx = Math.min(Math.floor(self.progress * STEPS.length), STEPS.length - 1);
            setActiveIndex(idx);
          },
        },
      });

      // Animate the phone in on each step
      STEPS.forEach((_, i) => {
        if (i === 0) return;
        tl.fromTo(
          `.phone-step-${i}`,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5 },
          i / STEPS.length
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const step = STEPS[activeIndex];

  return (
    <section
      ref={containerRef}
      className="relative h-screen bg-[#080a0e] overflow-hidden"
      aria-label="Features showcase"
    >
      {/* Background gradient blob */}
      <div
        className="pointer-events-none absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 60% 60% at 70% 50%, ${step.accent}18 0%, transparent 70%)`,
        }}
      />

      <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-12 px-6 lg:px-20">
        {/* Left: Copy */}
        <div className="flex-1 flex flex-col justify-center max-w-lg z-10">
          <span
            className="text-[10px] tracking-[0.4em] font-bold uppercase mb-6 block transition-all duration-500"
            style={{ color: step.accent }}
          >
            {step.label}
          </span>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.9] mb-8 whitespace-pre-line transition-all duration-500">
            {step.title}
          </h2>
          <p className="text-white/50 text-lg leading-relaxed font-light max-w-sm transition-all duration-500">
            {step.desc}
          </p>

          {/* Step indicators */}
          <div className="flex gap-3 mt-14">
            {STEPS.map((s, i) => (
              <button
                key={i}
                aria-label={`Go to step ${i + 1}: ${s.label}`}
                className="h-1 rounded-full transition-all duration-500"
                style={{
                  width: i === activeIndex ? 48 : 16,
                  backgroundColor: i === activeIndex ? step.accent : 'rgba(255,255,255,0.1)',
                }}
              />
            ))}
          </div>

          {/* Step label list */}
          <div className="mt-8 flex flex-col gap-3">
            {STEPS.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-3 transition-all duration-500"
                style={{ opacity: i === activeIndex ? 1 : 0.3 }}
              >
                <div
                  className="w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    backgroundColor: i === activeIndex ? `${s.accent}20` : 'transparent',
                    color: i === activeIndex ? s.accent : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${i === activeIndex ? s.accent : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {i + 1}
                </div>
                <span
                  className="text-[11px] tracking-widest font-bold uppercase"
                  style={{ color: i === activeIndex ? s.accent : 'rgba(255,255,255,0.3)' }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: iPhone Frame */}
        <div className="relative flex items-center justify-center z-10 shrink-0">
          {/* iPhone outer shell */}
          <div
            className="relative"
            style={{
              width: 240,
              height: 490,
              borderRadius: 44,
              background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 40%, #111 100%)',
              boxShadow: `0 0 0 2px #333, 0 40px 120px rgba(0,0,0,0.8), 0 0 80px ${step.accent}33`,
              padding: 4,
              transition: 'box-shadow 0.8s ease',
            }}
          >
            {/* Inner screen bezel */}
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: 40,
                overflow: 'hidden',
                background: '#0f1117',
                position: 'relative',
              }}
            >
              {/* Notch */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 80,
                  height: 22,
                  background: '#111',
                  borderBottomLeftRadius: 14,
                  borderBottomRightRadius: 14,
                  zIndex: 20,
                }}
              />

              {/* Status bar */}
              <div className="flex items-center justify-between px-4 pt-6 pb-2">
                <span className="text-white text-[8px] font-semibold">9:41</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-1.5 rounded-sm bg-white/60" />
                  <div className="w-0.5 h-2 rounded-sm bg-white/60" />
                  <div className="w-3 h-1.5 rounded-sm border border-white/40">
                    <div className="w-2 h-full rounded-sm" style={{ backgroundColor: step.accent }} />
                  </div>
                </div>
              </div>

              {/* Dynamic Screen Content */}
              <div className="px-2 pb-2" style={{ height: 'calc(100% - 54px)' }}>
                <PhoneScreen step={step} />
              </div>

              {/* Home indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 rounded-full bg-white/30" />
            </div>

            {/* Side buttons */}
            <div className="absolute -left-1 top-24 w-0.5 h-8 bg-[#333] rounded-full" />
            <div className="absolute -left-1 top-36 w-0.5 h-12 bg-[#333] rounded-full" />
            <div className="absolute -left-1 top-52 w-0.5 h-12 bg-[#333] rounded-full" />
            <div className="absolute -right-1 top-36 w-0.5 h-16 bg-[#333] rounded-full" />
          </div>

          {/* Reflection / glow */}
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: step.accent, transform: 'scale(0.7) translateY(20%)' }}
          />
        </div>
      </div>

      {/* Feature step scroll anchors */}
      {STEPS.map((_, i) => (
        <div key={i} className={`phone-step-${i} absolute`} />
      ))}
    </section>
  );
}
