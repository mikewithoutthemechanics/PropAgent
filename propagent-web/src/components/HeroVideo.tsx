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
  // Default to a highly reliable CDN sample if no asset provided
  videoSrc = 'https://cdn.coverr.co/videos/coverr-modern-house-exterior-3804/1080p.mp4',
  posterSrc = 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1920&auto=format&fit=crop',
  overlay = true,
  children,
  className = ''
}: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

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
    const tryPlay = async () => {
      try {
        await v.play();
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    };
    // Attempt to play when data is available
    v.addEventListener('canplay', tryPlay, { once: true });
    // Also try after a small delay (mobile Safari quirks)
    const t = setTimeout(tryPlay, 600);
    return () => {
      v.removeEventListener('canplay', tryPlay);
      clearTimeout(t);
    };
  }, [reducedMotion]);

  // Defer loading until section is in view to improve LCP and avoid blocked autoplay before visible
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => setIsVisible(e.isIntersecting));
      },
      { root: null, threshold: 0.25 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const handleUserPlay = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setAutoplayBlocked(false);
    } catch {
      // no-op
    }
  };

  return (
    <section ref={sectionRef} className={`relative h-[92vh] min-h-[580px] w-full overflow-hidden ${className}`}>
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
            autoPlay={isVisible}
            muted
            loop
            preload="auto"
            crossOrigin="anonymous"
            poster={posterSrc}
            aria-label="Cinematic architecture fly-through"
            controls={false}
            controlsList="nodownload nofullscreen noplaybackrate"
            disablePictureInPicture
          >
            {/* Prefer MP4; optionally add WebM if provided in future */}
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

      {/* Tap-to-play overlay if autoplay is blocked */}
      {!reducedMotion && autoplayBlocked && (
        <button
          type="button"
          onClick={handleUserPlay}
          className="absolute inset-0 z-10 grid place-items-center bg-black/40 text-white"
          aria-label="Play hero video"
        >
          <div className="px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur text-sm">
            Tap to play
          </div>
        </button>
      )}
    </section>
  );
}
