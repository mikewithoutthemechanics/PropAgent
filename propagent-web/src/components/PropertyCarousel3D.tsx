'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, Bed, Bath, Maximize2, Heart, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const PROPERTIES = [
  {
    id: 1,
    title: 'Clifton Penthouse',
    location: 'Clifton, Cape Town',
    price: 'R 18.5M',
    beds: 4,
    baths: 3,
    size: '420 m²',
    tag: 'LUXURY',
    tagColor: '#00d4ff',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 2,
    title: 'Sandton Skyrise',
    location: 'Sandton, Johannesburg',
    price: 'R 6.2M',
    beds: 3,
    baths: 2,
    size: '210 m²',
    tag: 'HOT DEAL',
    tagColor: '#f472b6',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 3,
    title: 'Umhlanga Ridge',
    location: 'Umhlanga, Durban',
    price: 'R 4.9M',
    beds: 4,
    baths: 3,
    size: '310 m²',
    tag: 'NEW',
    tagColor: '#34d399',
    image: 'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 4,
    title: 'Stellenbosch Estate',
    location: 'Stellenbosch, Western Cape',
    price: 'R 12.8M',
    beds: 5,
    baths: 4,
    size: '620 m²',
    tag: 'PRESTIGE',
    tagColor: '#fbbf24',
    image: 'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 5,
    title: 'Waterfront Loft',
    location: 'V&A Waterfront, Cape Town',
    price: 'R 9.1M',
    beds: 2,
    baths: 2,
    size: '185 m²',
    tag: 'VIEWS',
    tagColor: '#a855f7',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop&q=80',
  },
  {
    id: 6,
    title: 'Constantia Manor',
    location: 'Constantia, Cape Town',
    price: 'R 22.0M',
    beds: 6,
    baths: 5,
    size: '850 m²',
    tag: 'ICONIC',
    tagColor: '#f43f5e',
    image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop&q=80',
  },
];

const CARD_W = 300;
const CARD_H = 400;
const RADIUS = 520;

export default function PropertyCarousel3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const n = PROPERTIES.length;
  const angleStep = 360 / n;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  // Animate section entrance via GSAP ScrollTrigger
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from('.carousel3d-heading', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: 'power3.out',
      });
      gsap.from('.carousel3d-sub', {
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
        opacity: 0,
        y: 40,
        duration: 1,
        delay: 0.2,
        ease: 'power3.out',
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Auto-spin rAF loop
  useEffect(() => {
    if (prefersReducedMotion) return;

    const tick = () => {
      if (!pausedRef.current && trackRef.current) {
        angleRef.current -= 0.15; // degrees per frame
        trackRef.current.style.transform = `rotateY(${angleRef.current}deg)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    // Pause when tab hidden
    const handleVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [prefersReducedMotion]);

  const toggleLike = useCallback((id: number) => {
    setLiked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-32 bg-[#060810] overflow-hidden"
      aria-label="Featured properties"
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-sky-500/5 blur-[200px]" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#060810] to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#060810] to-transparent" />
      </div>

      {/* Section header */}
      <div className="relative z-10 text-center mb-20 px-4">
        <span className="carousel3d-sub block text-[10px] tracking-[0.4em] font-bold uppercase text-lime-400 mb-6">
          FEATURED PROPERTIES
        </span>
        <h2 className="carousel3d-heading text-5xl md:text-7xl font-extrabold text-white tracking-tighter leading-[0.9] mb-6">
          Prime Listings.<br />
          <span className="text-white/25">Matched by AI.</span>
        </h2>
        <p className="carousel3d-sub text-white/40 text-lg font-light max-w-md mx-auto">
          Every property scored and ranked against your buyers in real-time.
        </p>
      </div>

      {/* 3D Carousel stage */}
      <div
        className="relative mx-auto"
        style={{
          width: CARD_W,
          height: CARD_H,
          perspective: 1200,
          perspectiveOrigin: '50% 50%',
        }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        {/* 3D track — rotates */}
        <div
          ref={trackRef}
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: 'relative',
          }}
        >
          {PROPERTIES.map((prop, i) => {
            const rotY = i * angleStep;
            return (
              <div
                key={prop.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: CARD_W,
                  height: CARD_H,
                  transform: `rotateY(${rotY}deg) translateZ(${RADIUS}px)`,
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden',
                }}
              >
                {/* Card — premium glass morphism */}
                <div
                  className="group w-full h-full rounded-3xl overflow-hidden relative cursor-pointer"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 60%, rgba(0,0,0,0.2) 100%)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: `
                      0 30px 60px -20px rgba(0,0,0,0.8),
                      0 0 0 1px rgba(255,255,255,0.04),
                      0 20px 40px -10px rgba(0,0,0,0.6),
                      inset 0 1px 0 rgba(255,255,255,0.04)
                    `,
                    transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
                  }}
                >
                  {/* Property image */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-120"
                      loading="lazy"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060810]/90 via-[#060810]/30 to-transparent transition-opacity duration-500" />

                    {/* Tag — glowing, modern */}
                    <div
                      className="absolute top-4 left-4 px-3 py-1 text-[10px] font-extrabold tracking-widest rounded-sm backdrop-blur-md transition-all duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: `${prop.tagColor}30`,
                        color: '#fff',
                        border: `1px solid ${prop.tagColor}50`,
                        boxShadow: `0 0 16px ${prop.tagColor}40`,
                        textShadow: `0 0 8px ${prop.tagColor}60`,
                      }}
                    >
                      {prop.tag}
                    </div>

                    {/* Like button — with glow */}
                    <button
                      className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xl bg-white/5 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-[#00d4ff] hover:shadow-[0_0_20px_rgba(0,212,255,0.4)]"
                      aria-label={liked.has(prop.id) ? 'Unlike' : 'Like'}
                      onClick={(e) => { e.stopPropagation(); toggleLike(prop.id); }}
                    >
                      <Heart
                        className="w-4 h-4 transition-all duration-300"
                        fill={liked.has(prop.id) ? '#f87171' : 'none'}
                        stroke={liked.has(prop.id) ? '#f87171' : 'rgba(255,255,255,0.6)'}
                        style={liked.has(prop.id) ? { filter: 'drop-shadow(0 0 8px #f87171)' } : {}}
                      />
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2.5">
                      <h3 className="text-white font-bold text-sm leading-tight group-hover:text-[#00d4ff] transition-colors duration-300">
                        {prop.title}
                      </h3>
                      <span className="text-[#00d4ff] font-extrabold text-sm ml-2 whitespace-nowrap drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">
                        {prop.price}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>{prop.location}</span>
                    </div>
                    <div className="flex items-center gap-5 text-white/50 text-[10px]">
                      <span className="flex items-center gap-1.5"><Bed className="w-3 h-3 opacity-60" /> {prop.beds}</span>
                      <span className="flex items-center gap-1.5"><Bath className="w-3 h-3 opacity-60" /> {prop.baths}</span>
                      <span className="flex items-center gap-1.5"><Maximize2 className="w-3 h-3 opacity-60" /> {prop.size}</span>
                    </div>
                  </div>

                  {/* View CTA — more dramatic reveal */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5 pt-12 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <button className="w-full py-3 text-[11px] font-bold tracking-[0.15em] text-black bg-gradient-to-r from-[#00d4ff] to-[#0090c2] rounded-lg flex items-center justify-center gap-2 shadow-button hover:shadow-button-hover transition-shadow">
                      VIEW LISTING <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Floating accent light on hover */}
                  <div
                    className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
                    style={{ background: prop.tagColor || '#00d4ff', filter: 'blur(40px)' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reduced motion fallback: flat grid */}
      {prefersReducedMotion && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 mt-10">
          {PROPERTIES.map((prop) => (
            <div key={prop.id} className="rounded-2xl overflow-hidden bg-white/5 border border-white/10">
              <img src={prop.image} alt={prop.title} className="w-full h-40 object-cover" />
              <div className="p-4">
                <div className="text-white font-bold text-sm">{prop.title}</div>
                <div className="text-lime-400 text-sm font-bold">{prop.price}</div>
                <div className="text-white/40 text-xs">{prop.location}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="relative z-10 text-center mt-20">
        <a
          href="/register"
          className="inline-flex items-center gap-3 px-10 py-5 bg-white text-charcoal-900 text-[12px] tracking-[0.15em] font-bold hover:bg-lime-400 transition-colors duration-300"
        >
          EXPLORE ALL LISTINGS <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}
