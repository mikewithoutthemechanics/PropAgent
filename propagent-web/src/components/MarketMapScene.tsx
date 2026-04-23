'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, PerspectiveCamera, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={'#2b2b2b'} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}

function Street({ from, to, width = 0.16 }: { from: [number, number, number]; to: [number, number, number]; width?: number }) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(end, start);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const rotY = Math.atan2(dir.x, dir.z);
  return (
    <group position={[mid.x, -1.19, mid.z]} rotation={[0, rotY, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[width, 0.02, len]} />
        <meshStandardMaterial color={'#3a3a3a'} roughness={0.9} />
      </mesh>
    </group>
  );
}

function HousePin({ position, price, status, label }: { position: [number, number, number]; price: string; status: 'new' | 'hot' | 'sold'; label?: string; }) {
  const group = useRef<THREE.Group>(null);
  const color = status === 'sold' ? '#7cc0f5' : status === 'hot' ? '#d7ef6a' : '#ffffff';
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.position.y = 0.2 + Math.sin(t * 2 + position[0]) * 0.06;
  });
  return (
    <group ref={group} position={position}>
      {/* Simple pin with a billboarded house icon */}
      <Billboard position={[0, 0.4, 0]}>
        <mesh>
          <circleGeometry args={[0.12, 24]} />
          <meshStandardMaterial color={'#1f2937'} />
        </mesh>
        <Html center distanceFactor={14} transform>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-charcoal-900 text-xs font-semibold shadow-md">
            🏠
          </div>
        </Html>
      </Billboard>
      {/* Label */}
      <Html distanceFactor={14} position={[0, 0.8, 0]}>
        <div className="px-2 py-1 rounded-full border border-white/10 bg-charcoal-900/70 backdrop-blur text-[10px] leading-none text-white whitespace-nowrap">
          {label ? `${label} · ` : ''}{status === 'sold' ? 'Sold' : status === 'hot' ? 'Hot' : 'New'} · {price}
        </div>
      </Html>
    </group>
  );
}

function DealArc({ from, to, progress = 1 }: { from: [number, number, number]; to: [number, number, number]; progress?: number; }) {
  const curve = useMemo(() => {
    const v0 = new THREE.Vector3(...from);
    const v1 = new THREE.Vector3(...to);
    const mid = v0.clone().lerp(v1, 0.5);
    mid.y += 0.8;
    return new THREE.CatmullRomCurve3([v0, mid, v1]);
  }, [from, to]);

  const points = useMemo(() => curve.getPoints(40), [curve]);
  const geom = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  return (
    <line geometry={geom}>
      <lineBasicMaterial color={'#7cc0f5'} linewidth={1} transparent opacity={0.35} />
    </line>
  );
}

export default function MarketMapScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=1600',
      pin: stickyRef.current!,
      scrub: true,
    });
    return () => st.kill();
  }, []);

  // Only render Canvas when in view to save GPU
  useEffect(() => {
    if (!containerRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { threshold: 0.05 }
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-[#0d0f12] h-[220vh]">
      <div ref={stickyRef} className="h-screen w-full relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {inView && (
          <Canvas dpr={[1, 1.6]}>
            <PerspectiveCamera makeDefault position={[0.4, 2.0, 4.5]} fov={42} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[6, 8, 4]} intensity={0.9} />
            <Ground />
            {/* Simple neighborhood streets */}
            <Street from={[-2.0, 0, -2.0]} to={[2.0, 0, -2.0]} />
            <Street from={[-2.0, 0, 0]} to={[2.0, 0, 0]} />
            <Street from={[-2.0, 0, 2.0]} to={[2.0, 0, 2.0]} />
            <Street from={[-2.0, 0, -2.0]} to={[-2.0, 0, 2.0]} />
            <Street from={[0, 0, -2.0]} to={[0, 0, 2.0]} />
            <Street from={[2.0, 0, -2.0]} to={[2.0, 0, 2.0]} />

            {/* House pins at intersections */}
            <HousePin position={[-2.0, 0, -2.0]} price={'R2.3m'} status={'hot'} label={'4 Bed • 3 Bath'} />
            <HousePin position={[0, 0, -2.0]} price={'R1.2m'} status={'new'} label={'2 Bed • 1 Bath'} />
            <HousePin position={[2.0, 0, 0]} price={'R3.9m'} status={'sold'} label={'5 Bed • Pool'} />
            <HousePin position={[-2.0, 0, 2.0]} price={'R950k'} status={'new'} label={'Townhouse'} />
            <DealArc from={[-2.0, 0.4, -2.0]} to={[2.0, 0.4, 0]} />
            <DealArc from={[0, 0.4, -2.0]} to={[-2.0, 0.4, 2.0]} />
          </Canvas>
          )}
        </div>

        <div className="relative z-10 h-full flex items-center px-8 lg:px-20">
          <div className="max-w-2xl">
            <span className="text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block">NEIGHBOURHOOD VIEW · REAL LISTINGS</span>
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-6">
              See your area, not a sci‑fi grid
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-xl">
              A familiar street map with pins for real homes. Watch matches form between your listings and buyers as deals progress.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
