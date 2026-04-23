'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type Item = {
  title: string;
  location: string;
  price: string;
  image: string;
};

const ITEMS: Item[] = [
  {
    title: 'Sea Point Penthouse',
    location: 'Cape Town',
    price: 'R12.9m',
    image:
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=2000',
  },
  {
    title: 'Modern Garden Loft',
    location: 'Sandton',
    price: 'R3.2m',
    image:
      'https://images.unsplash.com/photo-1502005229762-cf1b2da7c3f5?auto=format&fit=crop&q=80&w=2000',
  },
  {
    title: 'Family Suburban',
    location: 'Durban North',
    price: 'R2.1m',
    image:
      'https://images.unsplash.com/photo-1505691723518-36a5ac3b2d52?auto=format&fit=crop&q=80&w=2000',
  },
  {
    title: 'Clifton Terrace',
    location: 'Cape Town',
    price: 'R22.0m',
    image:
      'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?auto=format&fit=crop&q=80&w=2000',
  },
  {
    title: 'City Micro‑Loft',
    location: 'Johannesburg',
    price: 'R1.4m',
    image:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=2000',
  },
  {
    title: 'Eco Ridge Home',
    location: 'Stellenbosch',
    price: 'R6.8m',
    image:
      'https://images.unsplash.com/photo-1434082033009-b81d41d32e1c?auto=format&fit=crop&q=80&w=2000',
  },
];

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

// Minimal hover displacement shader
const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uStrength;
  void main() {
    vec2 uv = vUv;
    // simple radial push based on hover strength
    vec2 c = vec2(0.5);
    vec2 d = uv - c;
    float dist = length(d);
    float amt = smoothstep(0.0, 0.6, 0.6 - dist) * uStrength * 0.06;
    uv += normalize(d + 1e-6) * amt;
    vec4 color = texture2D(uTex, uv);
    // subtle film grain via dither
    float grain = fract(sin(dot(uv * 1000.0, vec2(12.9898,78.233))) * 43758.5453);
    color.rgb += (grain - 0.5) * 0.02 * uStrength;
    gl_FragColor = color;
  }
`;

function HoverCard({ image }: { image: string }) {
  const mesh = useRef<THREE.Mesh>(null);
  const tex = useMemo(() => new THREE.TextureLoader().load(image), [image]);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const strength = useRef(0);
  useFrame((_, dt) => {
    // ease strength for smooth feel
    const target = hovered ? 1 : 0;
    strength.current += (target - strength.current) * Math.min(1, dt * 6);
    if (materialRef.current) {
      materialRef.current.uniforms.uStrength.value = strength.current;
    }
  });
  return (
    <mesh
      ref={mesh}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1.6, 1.0, 1, 1]} />
      {/* @ts-ignore */}
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={{ uTex: { value: tex }, uStrength: { value: 0 } }}
        transparent={false}
      />
    </mesh>
  );
}

function DPRCapper() {
  const { gl } = useThree();
  useEffect(() => {
    const desired = Math.min(window.devicePixelRatio || 1, 1.6);
    gl.setPixelRatio(desired);
  }, [gl]);
  return null;
}

export default function PropertyGallery() {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold: 0.1 }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="gallery" className="relative py-24 md:py-36 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12 md:mb-16">
          <div>
            <span className="text-lime-500 text-[10px] tracking-[0.4em] font-bold uppercase mb-4 block">FEATURED WORKS</span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Properties in Motion</h2>
          </div>
          <div className="hidden md:block text-sm text-charcoal-500">Hover cards for a live feel</div>
        </div>

        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-6 md:gap-10 min-w-full pr-6">
            {ITEMS.map((item, idx) => (
              <article
                key={idx}
                className="relative group w-[320px] md:w-[520px] shrink-0"
                aria-label={`${item.title} in ${item.location} for ${item.price}`}
              >
                <div className="relative aspect-[16/10] bg-charcoal-100 overflow-hidden border border-charcoal-200">
                  {/* WebGL card when motion allowed and section visible */}
                  {!reduced && mounted && inView ? (
                    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0, 2.4], fov: 38 }}>
                      <DPRCapper />
                      <ambientLight intensity={0.6} />
                      <HoverCard image={item.image} />
                    </Canvas>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-charcoal-900">{item.title}</h3>
                    <p className="text-sm text-charcoal-500">{item.location}</p>
                  </div>
                  <div className="text-charcoal-900 font-bold">{item.price}</div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
