'use client';

import { useRef, useEffect, useState, useCallback, type ComponentType } from 'react';

interface CarouselItem {
  icon: ComponentType<{ style?: React.CSSProperties; 'aria-hidden'?: string }>;
  title: string;
  desc: string;
}

interface CircularCarouselProps {
  items: CarouselItem[];
  radius?: number;
  itemWidth?: number;
  itemHeight?: number;
  perspective?: number;
  autoRotateSpeed?: number;
  tiltAngle?: number;
  className?: string;
}

export default function CircularCarousel({
  items,
  radius = 420,
  itemWidth = 280,
  itemHeight = 200,
  perspective = 1200,
  autoRotateSpeed = 0.15,
  tiltAngle = -12,
  className = '',
}: CircularCarouselProps) {
  const [rotation, setRotation] = useState(0);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const velocity = useRef(0);
  const animationRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const onPointerDown = useCallback((e: PointerEvent) => {
    if (!containerRef.current?.contains(e.target as Node)) return;
    dragging.current = true;
    lastX.current = e.clientX;
    velocity.current = 0;
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    velocity.current = dx * 0.4;
    setRotation((r) => r + dx * 0.4);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
    setIsDragging(false);
  }, []);

  useEffect(() => {
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [onPointerDown, onPointerMove, onPointerUp]);

  useEffect(() => {
    function animate() {
      if (!dragging.current) {
        if (Math.abs(velocity.current) > 0.01) {
          setRotation((r) => r + velocity.current);
          velocity.current *= 0.95;
        }
        setRotation((r) => r + autoRotateSpeed);
      }
      animationRef.current = requestAnimationFrame(animate);
    }
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [autoRotateSpeed]);

  const N = items.length;
  const angleStep = 360 / N;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: Math.max(itemHeight + 120, 380),
        perspective,
        position: 'relative',
        overflow: 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transform: `rotateY(${rotation}deg)`,
          left: 0,
          top: 0,
        }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          const angle = angleStep * i;
          const isHovered = hoveredIndex === i;

          return (
            <div
              key={i}
              onPointerEnter={() => setHoveredIndex(i)}
              onPointerLeave={() => setHoveredIndex(null)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: itemWidth,
                height: itemHeight,
                marginLeft: -itemWidth / 2,
                marginTop: -itemHeight / 2,
                borderRadius: 24,
                overflow: 'hidden',
                transform: `rotateY(${angle}deg) translateZ(${radius}px) rotateX(${tiltAngle}deg)`,
                transition: 'box-shadow 0.3s ease',
                boxShadow: isHovered
                  ? '0 20px 60px rgba(132, 204, 22, 0.25), 0 0 0 1px rgba(132, 204, 22, 0.3)'
                  : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                backfaceVisibility: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: isHovered
                    ? 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f7fee7 100%)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  transition: 'background 0.3s ease',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #a3e635, #38bdf8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                    boxShadow: '0 4px 12px rgba(132, 204, 22, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    style={{ width: 24, height: 24, color: '#1c1917' }}
                    aria-hidden="true"
                  />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: '#1c1917',
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: '#78716c',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag hint */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          opacity: 0.5,
          fontSize: 13,
          color: '#78716c',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 9l-3 3 3 3" />
          <path d="M19 9l3 3-3 3" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        Drag to explore
      </div>
    </div>
  );
}
