'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function GridFloor() {
  const grid = useRef<THREE.LineSegments>(null);
  useFrame(({ clock }) => {
    if (grid.current) {
      grid.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.05) * 0.03;
    }
  });
  return (
    <gridHelper ref={grid as any} args={[40, 40, '#333333', '#222222']} position={[0, -1.2, 0]} />
  );
}

function HousePin({ position, price, status }: { position: [number, number, number]; price: string; status: 'new' | 'hot' | 'sold'; }) {
  const group = useRef<THREE.Group>(null);
  const color = status === 'sold' ? '#53B4F0' : status === 'hot' ? '#D8F053' : '#FFFFFF';
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.position.y = 0.2 + Math.sin(t * 2 + position[0]) * 0.06;
  });
  return (
    <group ref={group} position={position}>
      {/* Pin base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={status === 'hot' ? 0.7 : 0.2} />
      </mesh>
      {/* House marker */}
      <mesh position={[0, 0.25, 0]}>
        <coneGeometry args={[0.11, 0.18, 4]} />
        <meshStandardMaterial color={color} metalness={0.1} roughness={0.3} />
      </mesh>
      {/* Label */}
      <Html distanceFactor={12} position={[0, 0.6, 0]}>
        <div className="px-2 py-1 rounded-full border border-white/10 bg-charcoal-900/70 backdrop-blur text-[10px] leading-none text-white">
          {status === 'sold' ? 'SOLD' : status === 'hot' ? 'HOT' : 'NEW'} · {price}
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
      <lineBasicMaterial color={'#53B4F0'} linewidth={2} transparent opacity={0.6} />
    </line>
  );
}

export default function MarketMapScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

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

  return (
    <section ref={containerRef} className="relative bg-charcoal-900 h-[220vh]">
      <div ref={stickyRef} className="h-screen w-full relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0.5, 2.4, 4.8]} fov={40} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[4, 6, 3]} intensity={1.1} />
            <GridFloor />

            {/* Pins across a city-like grid */}
            <HousePin position={[-1.5, 0, -0.8]} price={'R2.3m'} status={'hot'} />
            <HousePin position={[0.8, 0, -1.6]} price={'R1.2m'} status={'new'} />
            <HousePin position={[1.6, 0, 0.6]} price={'R3.9m'} status={'sold'} />
            <HousePin position={[-0.4, 0, 1.2]} price={'R950k'} status={'new'} />
            <DealArc from={[-1.5, 0.4, -0.8]} to={[1.6, 0.4, 0.6]} />
            <DealArc from={[0.8, 0.4, -1.6]} to={[-0.4, 0.4, 1.2]} />

            <Environment preset="city" />
          </Canvas>
        </div>

        <div className="relative z-10 h-full flex items-center px-8 lg:px-20">
          <div className="max-w-2xl">
            <span className="text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block">LIVE INVENTORY · DEAL FLOW</span>
            <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[0.95] mb-6">
              Property Map in Motion
            </h2>
            <p className="text-white/70 text-lg md:text-xl max-w-xl">
              Real listings. Real buyers. Real deals. Watch your market light up as matches form across your territory — in real time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
