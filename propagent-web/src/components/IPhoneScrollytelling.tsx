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

        {/* Background gradient blob — smoother transitions */}
        <div
          className="pointer-events-none absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(ellipse 70% 70% at 70% 50%, ${step.accent}12 0%, transparent 70%)`,
          }}
        />

        {/* Additional ambient light layer */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#060810]/30 to-[#060810]/60" />

        <div className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-16 px-6 lg:px-20">
          {/* Left: Copy — editorial spacing */}
          <div className="flex-1 flex flex-col justify-center max-w-lg z-10">
            <span
              className="text-[10px] tracking-[0.5em] font-bold uppercase mb-8 block transition-all duration-700"
              style={{ color: step.accent, textShadow: `0 0 20px ${step.accent}40` }}
            >
              {step.label}
            </span>
            <h2 className="text-display-4xl md:text-display-6xl font-extrabold text-white tracking-tighter leading-[0.85] mb-10 whitespace-pre-line transition-all duration-500">
              {step.title}
            </h2>
            <p className="text-white/50 text-lg md:text-xl leading-relaxed font-light max-w-sm transition-all duration-500">
              {step.desc}
            </p>

            {/* Step indicators — refined */}
            <div className="flex gap-4 mt-16">
              {STEPS.map((s, idx) => (
                <button
                  key={idx}
                  aria-label={`Go to step ${idx + 1}: ${s.label}`}
                  className="h-1.5 rounded-full transition-all duration-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00d4ff]"
                  style={{
                    width: activeIndex === idx ? 48 : 16,
                    backgroundColor: activeIndex === idx ? step.accent : 'rgba(255,255,255,0.08)',
                    boxShadow: activeIndex === idx ? `0 0 12px ${step.accent}60` : 'none',
                  }}
                />
              ))}
            </div>

            {/* Step label list — refined */}
            <div className="mt-10 flex flex-col gap-4">
              {STEPS.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 transition-all duration-500"
                  style={{ opacity: idx === activeIndex ? 1 : 0.25 }}
                >
                  <div
                    className="w-7 h-7 flex items-center justify-center rounded-full text-[10px] font-bold border transition-all duration-500"
                    style={{
                      backgroundColor: idx === activeIndex ? `${s.accent}15` : 'transparent',
                      color: idx === activeIndex ? s.accent : 'rgba(255,255,255,0.3)',
                      borderColor: idx === activeIndex ? s.accent : 'rgba(255,255,255,0.08)',
                      boxShadow: idx === activeIndex ? `0 0 8px ${s.accent}20` : 'none',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className="text-[11px] tracking-[0.2em] font-bold uppercase"
                    style={{ color: idx === activeIndex ? s.accent : 'rgba(255,255,255,0.3)' }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: iPhone Frame — premium feel */}
          <div className="relative flex items-center justify-center z-10 shrink-0">
            {/* Ambient glow pulse behind iPhone — shifts colour per step */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-full blur-[120px] opacity-25 transition-colors duration-1000"
              style={{ backgroundColor: step.accent, transform: 'scale(0.55) translateY(8%)' }}
            />
            {/* Secondary outer halo — larger, softer */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none rounded-full blur-[180px] opacity-10 transition-colors duration-1500"
              style={{ backgroundColor: step.accent, transform: 'scale(1.2)' }}
            />
            {/* Ring accent */}
            <div
              className="absolute inset-0 pointer-events-none rounded-full border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              style={{ transform: 'scale(1.05)' }}
            />

            {/* iPhone outer shell — refined */}
            <div
              className="relative"
              style={{
                width: 260,
                height: 530,
                borderRadius: 48,
                background: 'linear-gradient(145deg, #1e1e1e 0%, #141414 40%, #0a0a0a 100%)',
                boxShadow: `
                  0 0 0 1px #2a2a2a,
                  0 0 0 2px #0a0a0a,
                  0 60px 140px rgba(0,0,0,0.9),
                  0 0 120px ${step.accent}35
                `,
                padding: 3,
                transition: 'box-shadow 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {/* Inner screen bezel — notch */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 45,
                  overflow: 'hidden',
                  background: '#0a0e14',
                  position: 'relative',
                }}
              >
                {/* Dynamic island / notch */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 100,
                    height: 28,
                    background: '#000',
                    borderBottomLeftRadius: 18,
                    borderBottomRightRadius: 18,
                    zIndex: 20,
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                />

                {/* Status bar — refined */}
                <div className="flex items-center justify-between px-5 pt-7 pb-2">
                  <span className="text-white/60 text-[9px] font-semibold">9:41</span>
                  <div className="flex gap-1.5 items-center">
                    <div className="w-3.5 h-1.5 rounded-sm bg-white/50" />
                    <div className="w-0.5 h-2 rounded-sm bg-white/40" />
                    <div className="w-3 h-1.5 rounded-sm border border-white/30 relative overflow-hidden">
                      <div className="absolute inset-0" style={{ backgroundColor: step.accent, opacity: 0.8 }} />
                    </div>
                  </div>
                </div>

                {/* Dynamic Screen Content */}
                <div className="px-2.5 pb-2" style={{ height: 'calc(100% - 56px)' }}>
                  <PhoneScreen step={step} />
                </div>

                {/* Home indicator — sleeker */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-0.5 rounded-full bg-white/20" />
              </div>

              {/* Side buttons — subtle */}
              <div className="absolute -left-1 top-28 w-px h-8 bg-[#222] rounded-full" />
              <div className="absolute -left-1 top-40 w-px h-14 bg-[#222] rounded-full" />
              <div className="absolute -left-1 top-58 w-px h-14 bg-[#222] rounded-full" />
              <div className="absolute -right-1 top-38 w-px h-18 bg-[#222] rounded-full" />
            </div>
          </div>
        </div>

      {/* Feature step scroll anchors */}
      {STEPS.map((_, i) => (
        <div key={i} className={`phone-step-${i} absolute`} />
      ))}
    </section>
  );
}
