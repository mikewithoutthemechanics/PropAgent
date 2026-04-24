'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';

/**
 * Sticky demo bar that slides up from the bottom after the user scrolls 30% of the page.
 * Dismissible via close button; respects prefers-reduced-motion (skips slide animation).
 */
export default function StickyDemoCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    prefersReduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const onScroll = () => {
      const threshold = document.documentElement.scrollHeight * 0.3;
      setVisible(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed]);

  if (dismissed) return null;

  const isShown = visible && !dismissed;

  return (
    <div
      role="complementary"
      aria-label="Book a demo"
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-500 ${
        isShown ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={prefersReduced.current ? { transition: 'none' } : undefined}
    >
      <div className="bg-[#0d0f14]/95 backdrop-blur-2xl border-t border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Left copy */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="inline-block w-2 h-2 rounded-full bg-lime-400 animate-pulse" aria-hidden />
            <span className="text-white/60 text-sm font-light">
              Trusted by <span className="text-white font-semibold">500+ agents</span> across South Africa
            </span>
          </div>

          {/* Centre CTA */}
          <div className="flex items-center gap-3 flex-1 sm:flex-none justify-center sm:justify-end">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-lime-400 text-[#060810] text-[11px] tracking-[0.14em] font-extrabold hover:bg-white transition-colors duration-200 rounded-sm"
            >
              BOOK A DEMO
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <span className="hidden md:block text-white/30 text-xs">No commitment required</span>
          </div>

          {/* Dismiss */}
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 text-white/30 hover:text-white transition-colors shrink-0"
            aria-label="Dismiss demo bar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
