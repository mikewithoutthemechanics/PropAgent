'use client';

// Centralized motion utilities: GSAP registration and Lenis smooth scrolling
import React, { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Always register in client
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * LenisProvider mounts Lenis smooth scrolling (if available) and bridges it to GSAP ScrollTrigger.
 * - Dynamically imports `lenis` to avoid hard dependency at build-time.
 * - Respects `prefers-reduced-motion` and disables when set.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: any | null = null;
    let rafId = 0;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) {
      // Reduced motion: ensure ScrollTrigger refresh for native scroll
      ScrollTrigger.refresh();
      return;
    }

    // Dynamically import lenis; if unavailable, fail silently
    import('lenis')
      .then((mod) => {
        const Lenis = (mod as any).default || (mod as any);
        lenis = new Lenis({
          smoothWheel: true,
          smoothTouch: false,
          lerp: 0.1,
          gestureOrientation: 'vertical',
          normalizeWheel: true,
        });

        // Bridge lenis scroll to ScrollTrigger
        lenis.on('scroll', () => {
          ScrollTrigger.update();
        });

        const raf = (time: number) => {
          lenis?.raf(time);
          rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        // Ensure ScrollTrigger uses documentElement for scroller
        ScrollTrigger.scrollerProxy(document.documentElement, {
          scrollTop(value) {
            if (arguments.length && typeof value === 'number') {
              lenis?.scrollTo(value, { immediate: true });
            }
            return document.documentElement.scrollTop || window.scrollY || 0;
          },
          getBoundingClientRect() {
            return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
          },
        });

        ScrollTrigger.addEventListener('refresh', () => lenis?.resize());
        ScrollTrigger.refresh();
      })
      .catch(() => {
        // No lenis installed — continue with native scrolling
        ScrollTrigger.refresh();
      });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      try {
        lenis?.destroy?.();
      } catch {}
    };
  }, []);

  return children as React.ReactNode;
}

/**
 * Utility to apply split-text animation to an element by id.
 * Degrades gracefully when reduced motion is enabled.
 */
export function animateSplitTextById(id: string, options?: { delay?: number }) {
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) return;
  const el = document.getElementById(id);
  if (!el) return;
  const text = el.innerText;
  el.innerHTML = text
    .split('')
    .map((ch) => `<span class="char inline-block">${ch === ' ' ? '&nbsp;' : ch}</span>`) 
    .join('');
  gsap.from(`#${CSS.escape(id)} .char`, {
    opacity: 0,
    y: 20,
    rotateX: -90,
    stagger: 0.02,
    duration: 0.8,
    ease: 'back.out(1.7)',
    delay: options?.delay ?? 0.4,
  });
}
