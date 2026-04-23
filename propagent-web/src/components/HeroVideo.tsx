'use client';

import React, { useEffect, useRef, useState } from 'react';

type HeroVideoProps = {
  videoSrc?: string;
  posterSrc?: string;
  overlay?: boolean;
  children?: React.ReactNode;
  className?: string;
};

/**
 * Full-bleed cinematic hero video with graceful fallbacks and accessibility.
 * - Uses prefers-reduced-motion to swap to poster image when needed
 * - Plays inline, muted, looped, and auto-plays on supported devices
 * - Accepts arbitrary overlay content via children
 */
export default function HeroVideo({
  videoSrc = 'https://storage.googleapis.com/coverr-main/mp4/Footage%20034-720p.mp4',
  posterSrc = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1920&auto=format&fit=crop',
  overlay = true,
  children,
  className = ''
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!videoRef.current || reducedMotion) return;
    const v = videoRef.current;
    const play = async () => {
      try { await v.play(); } catch { /* ignore autoplay block */ }
    };
    // attempt play when metadata is loaded
    v.addEventListener('loadeddata', play, { once: true });
    return () => v.removeEventListener('loadeddata', play);
  }, [reducedMotion]);

  return (
    <section className={`relative h-[92vh] min-h-[580px] w-full overflow-hidden ${className}`}>
      {/* Video / Poster Layer */}
      <div className="absolute inset-0 -z-10">
        {reducedMotion ? (
          // Poster image fallback
          <img
            src={posterSrc}
            alt="Architectural exterior hero"
            className="h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            autoPlay
            muted
            loop
            poster={posterSrc}
            aria-label="Cinematic architecture fly-through"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Brand gradient overlay */}
      {overlay && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
      )}

      {/* Content */}
      <div className="relative h-full">
        {children}
      </div>
    </section>
  );
}
