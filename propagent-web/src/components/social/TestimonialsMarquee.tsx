'use client';

import React, { useEffect, useRef, useState } from 'react';

type Testimonial = {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  image?: string;
  avatarColor?: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote: 'Agent Loop eliminated hours of admin. We now focus on growth instead of paperwork.',
    author: 'Sarah van der Merwe',
    role: 'Director',
    company: 'Coastal Properties',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
  },
  {
    quote: 'Tenant portal revolutionized communication. Maintenance requests dropped 60% in month one.',
    author: 'Michael Roberts',
    role: 'Portfolio Manager',
    company: 'Urban Living SA',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
  },
  {
    quote: 'Finally a platform that understands the South African market. Worth every rand.',
    author: 'James Mitchell',
    role: 'CEO',
    company: 'Mitchell Properties',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
  },
  {
    quote: 'Matching engine surfaces hot buyers instantly. Our time-to-offer improved dramatically.',
    author: 'Lerato Khoza',
    role: 'Sales Lead',
    company: 'Gauteng Homes',
    avatarColor: '#84cc16',
  },
  {
    quote: 'The analytics give us clarity on yield and vacancy like never before.',
    author: 'Daniel Naidoo',
    role: 'COO',
    company: 'Township Living',
    avatarColor: '#f472b6',
  },
  {
    quote: 'Agent Loop paid for itself in the first month. The AI matching is genuinely impressive.',
    author: 'Pieter van Wyk',
    role: 'Principal',
    company: 'Cape Coastal Realty',
    avatarColor: '#fbbf24',
  },
];

/** Derive initials (up to 2 chars) from a full name */
function initials(name: string): string {
  const parts = name.trim().split(' ');
  return (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export default function TestimonialsMarquee() {
  const reduced = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (reduced) return; // static fallback
    const el = trackRef.current;
    if (!el) return;

    let x = 0;
    const speed = 0.4; // px per frame
    const step = () => {
      if (!hovered && !document.hidden) {
        x -= speed;
        if (Math.abs(x) >= el.scrollWidth / 2) {
          x = 0; // loop seamlessly
        }
        el.style.transform = `translateX(${x}px)`;
      }
      frameRef.current = requestAnimationFrame(step);
    };
    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [reduced, hovered]);

  const row = [...TESTIMONIALS, ...TESTIMONIALS]; // duplicate for seamless loop

  return (
    <section
      id="testimonials"
      className="py-40 md:py-60 bg-charcoal-900 text-white overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 md:mb-24 gap-8">
          <div className="max-w-3xl">
            <span className="text-[#00d4ff] text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
              THE COLLECTIVE
            </span>
            <h2 id="testimonials-heading" className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9]">
              Endorsed by the <br /><span className="text-white/20">Market Leaders.</span>
            </h2>
          </div>
        </div>

        {reduced ? (
          <div className="grid md:grid-cols-3 gap-10">
            {TESTIMONIALS.map((t, i) => (
              <figure key={i} className="p-8 bg-white/5 border border-white/10 hover:border-[#00d4ff]/20 transition-all duration-500 rounded-2xl">
                <blockquote className="text-xl md:text-2xl font-light text-white/90 mb-8 leading-tight tracking-tight">
                  "{t.quote}"
                </blockquote>
                <figcaption className="flex items-center gap-4">
                  {t.image ? (
                    <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full object-cover border-2 transition-all duration-300 hover:border-[#00d4ff]" style={{ boxShadow: `0 0 0 2px ${t.avatarColor ?? '#00d4ff'}40` }} />
                  ) : (
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold tracking-wide border-2 transition-all duration-300 hover:scale-105 hover:border-[#00d4ff]"
                      style={{
                        backgroundColor: `${t.avatarColor ?? '#00d4ff'}20`,
                        color: t.avatarColor ?? '#00d4ff',
                        boxShadow: `0 0 0 2px ${t.avatarColor ?? '#00d4ff'}40`,
                      }}
                      aria-hidden="true"
                    >
                      {initials(t.author)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-[10px] tracking-[0.3em] uppercase text-white">{t.author}</div>
                    <div className="text-white/50 text-xs">{[t.role, t.company].filter(Boolean).join(' · ')}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
                  )}
                  <div>
                    <div className="font-bold text-[10px] tracking-[0.3em] uppercase">{t.author}</div>
                    <div className="text-white/50 text-xs">{[t.role, t.company].filter(Boolean).join(' · ')}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div
            className="relative border-t border-b border-white/10 py-8 cursor-default select-none"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            aria-label="Client testimonials marquee"
          >
            <div className="overflow-hidden">
              <div ref={trackRef} className="whitespace-nowrap will-change-transform">
                {row.map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-4 px-8 md:px-12 text-white/80">
                    {t.image ? (
                      <img
                        src={t.image}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                        style={{ boxShadow: `0 0 0 2px ${t.avatarColor ?? '#84cc16'}50` }}
                        aria-hidden="true"
                      />
                    ) : (
                      <span
                        className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0"
                        style={{ backgroundColor: `${t.avatarColor ?? '#84cc16'}20`, color: t.avatarColor ?? '#84cc16', boxShadow: `0 0 0 2px ${t.avatarColor ?? '#84cc16'}50` }}
                        aria-hidden="true"
                      >
                        {initials(t.author)}
                      </span>
                    )}
                    <span className="text-sm md:text-base">“{t.quote}” — <span className="text-white">{t.author}</span></span>
                    <span className="w-2 h-2 bg-white/10 inline-block" aria-hidden="true" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
