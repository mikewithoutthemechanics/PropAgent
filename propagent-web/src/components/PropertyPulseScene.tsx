'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Float, 
  Text,
  Html,
  Sphere,
  MeshDistortMaterial,
  Environment
} from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

function Node({ position, color, label, delay = 0 }: any) {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={position}>
        <Sphere args={[0.2, 32, 32]}>
          <MeshDistortMaterial 
            color={color} 
            speed={4} 
            distort={0.3} 
            emissive={color} 
            emissiveIntensity={0.5} 
          />
        </Sphere>
        <Html distanceFactor={8} position={[0, 0.4, 0]}>
          <div className="bg-charcoal-900/80 backdrop-blur-md px-3 py-1 border border-white/10 whitespace-nowrap">
            <p className="text-[8px] tracking-[0.2em] font-bold text-white uppercase">{label}</p>
          </div>
        </Html>
      </group>
    </Float>
  );
}

function Connection({ start, end, progress }: any) {
  const lineRef = useRef<THREE.Line>(null);
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points]);
  
  useFrame(() => {
    if (lineRef.current) {
      // Animate dash offset or similar if we used a more complex shader, 
      // but for now we just show/hide based on progress
    }
  });

  return (
    <mesh>
      <tubeGeometry args={[curve, 20, 0.01, 8, false]} />
      <meshStandardMaterial 
        color="#84cc16" 
        emissive="#84cc16" 
        emissiveIntensity={2} 
        transparent 
        opacity={progress > 0.5 ? 0.4 : 0} 
      />
    </mesh>
  );
}

function DataPulse() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.1;
    }
  });

  const nodes = [
    { pos: [2, 1, 0], color: "#84cc16", label: "BUYER MATCH" },
    { pos: [-2, -1, 1], color: "#0ea5e9", label: "LISTING AI" },
    { pos: [0, 2, -2], color: "#fbbf24", label: "VALUATION" },
    { pos: [-1, 0, -3], color: "#6366f1", label: "LEAD SCORE" },
    { pos: [3, -2, -1], color: "#f43f5e", label: "CLOSE RATE" },
  ];

  return (
    <group ref={group}>
      {nodes.map((node, i) => (
        <Node key={i} position={node.pos} color={node.color} label={node.label} />
      ))}
      {/* Connections between some nodes */}
      <Connection start={nodes[0].pos} end={nodes[1].pos} progress={1} />
      <Connection start={nodes[0].pos} end={nodes[2].pos} progress={1} />
      <Connection start={nodes[1].pos} end={nodes[3].pos} progress={1} />
      <Connection start={nodes[2].pos} end={nodes[4].pos} progress={1} />
    </group>
  );
}

export default function PropertyPulseScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=1500',
      pin: stickyRef.current,
      scrub: true,
    });

    return () => st.kill();
  }, []);

  return (
    <section ref={containerRef} className="relative bg-charcoal-900 h-[200vh]">
      <div ref={stickyRef} className="h-screen w-full relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Canvas dpr={[1, 2]}>
            <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <DataPulse />
            <Environment preset="night" />
          </Canvas>
        </div>

        <div className="relative z-10 h-full flex items-center px-8 lg:px-20">
           <div className="max-w-2xl">
              <span className="text-lime-400 text-[10px] tracking-[0.4em] font-bold uppercase mb-8 block">SYNCHRONIZATION</span>
              <h2 className="text-6xl md:text-8xl font-bold text-white tracking-tighter leading-[0.85] mb-12">
                The Pulse of the <br /><span className="text-white/20">Market.</span>
              </h2>
              <p className="text-white/50 text-xl font-light leading-tight max-w-md">
                Every listing, every buyer, and every deal synced in real-time across the Agent Loop network. Intelligence in motion.
              </p>
           </div>
        </div>
      </div>
    </section>
  );
}
