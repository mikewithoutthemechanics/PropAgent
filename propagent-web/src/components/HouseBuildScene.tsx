'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * HouseBuildScene
 *
 * Scroll-driven 3D visualization: a house is constructed step-by-step as
 * the user scrolls through this section. Stages are driven by a single
 * 0..1 progress value (updated via GSAP ScrollTrigger scrub), and mapped
 * to each building element:
 *   0.00 – 0.15  foundation slab rises from the ground
 *   0.15 – 0.45  walls extrude upward
 *   0.45 – 0.65  roof drops into place
 *   0.65 – 0.80  door + windows fade in
 *   0.80 – 1.00  trees / landscaping pop in, camera settles
 *
 * This is intentionally an *inline* scene (not fixed/fullscreen) so the
 * outer GSAP on the page can pin or scrub the wrapper as needed.
 */

const STAGES = [
  { label: 'Foundation', range: [0.0, 0.15] },
  { label: 'Walls', range: [0.15, 0.45] },
  { label: 'Roof', range: [0.45, 0.65] },
  { label: 'Windows & Doors', range: [0.65, 0.8] },
  { label: 'Landscaping', range: [0.8, 1.0] },
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const seg = (p: number, from: number, to: number) => {
  if (p <= from) return 0;
  if (p >= to) return 1;
  return easeOut((p - from) / (to - from));
};

function House({ progressRef }: { progressRef: React.MutableRefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const foundationRef = useRef<THREE.Group>(null);
  const wallsRef = useRef<THREE.Group>(null);
  const roofRef = useRef<THREE.Group>(null);
  const doorRef = useRef<THREE.Group>(null);
  const windowsRef = useRef<THREE.Group>(null);
  const landscapeRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = progressRef.current;

    // gentle camera-facing rotation driven by progress + time
    if (group.current) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.y = -0.6 + p * 1.1 + Math.sin(t * 0.2) * 0.05;
    }

    // Foundation: 0 -> 0.15
    const fp = seg(p, 0, 0.15);
    if (foundationRef.current) {
      foundationRef.current.scale.y = 0.01 + fp * 0.99;
      foundationRef.current.position.y = -1.0 + fp * 0.1;
      foundationRef.current.visible = fp > 0;
    }

    // Walls: 0.15 -> 0.45 — extrude upward
    const wp = seg(p, 0.15, 0.45);
    if (wallsRef.current) {
      wallsRef.current.scale.y = 0.001 + wp * 0.999;
      wallsRef.current.position.y = -0.85; // base stays pinned
      wallsRef.current.visible = wp > 0;
    }

    // Roof: 0.45 -> 0.65 — drop in from above
    const rp = seg(p, 0.45, 0.65);
    if (roofRef.current) {
      roofRef.current.position.y = 2.5 - rp * 1.4; // 2.5 -> 1.1
      roofRef.current.visible = rp > 0.01;
      roofRef.current.children.forEach(c => {
        if ((c as THREE.Mesh).material) {
           ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = rp;
        }
      });
    }

    // Door + windows: 0.65 -> 0.8
    const dp = seg(p, 0.65, 0.8);
    if (doorRef.current) {
      doorRef.current.scale.y = 0.01 + dp * 0.99;
      doorRef.current.visible = dp > 0.01;
      doorRef.current.children.forEach(c => {
        if ((c as THREE.Mesh).material) {
          ((c as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = dp;
        }
      });
    }
    if (windowsRef.current) {
      windowsRef.current.children.forEach((child, i) => {
        const delay = i * 0.15;
        const wwp = seg(p, 0.65 + delay * 0.1, 0.8 + delay * 0.1);
        child.visible = wwp > 0.01;
        if ((child as THREE.Group).children) {
            (child as THREE.Group).children.forEach(gc => {
                if ((gc as THREE.Mesh).material) {
                   ((gc as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = wwp;
                }
            });
        }
      });
    }

    // Landscape: 0.8 -> 1.0
    const lp = seg(p, 0.8, 1.0);
    if (landscapeRef.current) {
      landscapeRef.current.children.forEach((child, i) => {
        const delay = i * 0.08;
        const lwp = seg(p, 0.8 + delay * 0.1, 1.0);
        child.scale.setScalar(0.001 + lwp);
        child.visible = lwp > 0.01;
      });
    }
  });

  return (
    <group ref={group}>
      {/* Ground */}
      <mesh position={[0, -1.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[8, 64]} />
        <meshStandardMaterial color="#0f172a" roughness={1} />
      </mesh>

      {/* Foundation slab */}
      <group ref={foundationRef} position={[0, -1, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[3.4, 0.3, 2.6]} />
          <meshStandardMaterial color="#334155" roughness={0.8} />
        </mesh>
        {/* steps */}
        <mesh position={[0, -0.05, 1.4]} receiveShadow castShadow>
          <boxGeometry args={[1.2, 0.1, 0.4]} />
          <meshStandardMaterial color="#475569" />
        </mesh>
      </group>

      {/* Walls (detailed) */}
      <group ref={wallsRef} position={[0, -0.85, 0]}>
        {/* Main structure */}
        <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 1.8, 2.4]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.5} />
        </mesh>
        {/* trim / baseboard exterior */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[3.3, 0.2, 2.5]} />
          <meshStandardMaterial color="#cbd5e1" />
        </mesh>
      </group>

      {/* Roof (Realistic Gabled) */}
      <group ref={roofRef} position={[0, 1.1, 0]}>
         {/* Main Gable */}
        <mesh position={[0, 0.45, 0]} rotation={[0, 0, 0]} castShadow>
          <coneGeometry args={[2.4, 1.2, 4]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.1} transparent opacity={0} />
        </mesh>
        {/* Ridge cap */}
        <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI/4, 0]}>
          <boxGeometry args={[0.1, 0.1, 3.4]} />
          <meshStandardMaterial color="#0f172a" transparent opacity={0} />
        </mesh>
      </group>

      {/* Door with Frame */}
      <group ref={doorRef} position={[0, -0.25, 1.21]}>
        <mesh castShadow>
          <boxGeometry args={[0.65, 1.2, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} transparent opacity={0} />
        </mesh>
        <mesh position={[0, 0, 0.04]} castShadow>
          <boxGeometry args={[0.55, 1.1, 0.05]} />
          <meshStandardMaterial color="#84cc16" roughness={0.4} metalness={0.2} transparent opacity={0} />
        </mesh>
        {/* handle */}
        <mesh position={[0.2, 0, 0.08]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} transparent opacity={0} />
        </mesh>
      </group>

      {/* Windows with Frames */}
      <group ref={windowsRef}>
        {[
          { pos: [-1.0, 0.3, 1.21], rot: [0, 0, 0] },
          { pos: [1.0, 0.3, 1.21], rot: [0, 0, 0] },
          { pos: [1.61, 0.3, 0], rot: [0, Math.PI / 2, 0] },
          { pos: [-1.61, 0.3, 0], rot: [0, -Math.PI / 2, 0] },
        ].map((win, i) => (
          <group key={i} position={win.pos} rotation={win.rot}>
            {/* Frame */}
            <mesh>
              <boxGeometry args={[0.7, 0.55, 0.08]} />
              <meshStandardMaterial color="#1e293b" transparent opacity={0} />
            </mesh>
            {/* Glass */}
            <mesh position={[0, 0, 0.02]}>
              <planeGeometry args={[0.6, 0.45]} />
              <meshStandardMaterial 
                color="#0ea5e9" 
                emissive="#0ea5e9" 
                emissiveIntensity={0.5} 
                transparent 
                opacity={0} 
                metalness={0.9} 
                roughness={0.1}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Landscape (Improved) */}
      <group ref={landscapeRef}>
        {/* path */}
        <mesh position={[0, -0.99, 2.2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[1.2, 2.4]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* grass patches */}
        <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
           <circleGeometry args={[5, 32]} />
           <meshStandardMaterial color="#064e3b" />
        </mesh>
        {/* trees */}
        {[
          [-3.0, -0.6, 1.5],
          [3.2, -0.6, 0.8],
          [-3.5, -0.6, -1.2],
          [3.5, -0.6, -1.8],
        ].map(([x, y, z], i) => (
          <group key={i} position={[x, y, z]}>
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.1, 0.15, 0.8, 8]} />
              <meshStandardMaterial color="#451a03" />
            </mesh>
            <mesh position={[0, 1.0, 0]} castShadow>
              <sphereGeometry args={[0.6, 12, 12]} />
              <meshStandardMaterial color="#14532d" roughness={0.8} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

export default function HouseBuildScene() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      progressRef.current = 1;
      setProgressPct(100);
      setStageIndex(STAGES.length - 1);
      return;
    }

    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=2400',
      pin: stickyRef.current,
      scrub: 0.6,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        setProgressPct(Math.round(self.progress * 100));
        const idx = STAGES.findIndex(
          (s) => self.progress >= s.range[0] && self.progress < s.range[1],
        );
        setStageIndex(idx === -1 ? STAGES.length - 1 : idx);
      },
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="build-scene"
      aria-labelledby="build-scene-heading"
      className="relative bg-charcoal-900 text-white"
    >
      <div ref={stickyRef} className="relative h-screen w-full overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-10 md:pt-16 px-4 sm:px-6 lg:px-8 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <span className="text-lime-400 text-sm font-medium tracking-wider uppercase">
              From listing to keys
            </span>
            <h2
              id="build-scene-heading"
              className="text-3xl md:text-5xl font-semibold tracking-tight mt-2 max-w-2xl"
            >
              We build the deal — stage by stage.
            </h2>
            <p className="text-white/60 mt-3 max-w-xl text-base md:text-lg">
              Scroll to watch how Agent Loop turns a raw mandate into a sold,
              occupied home — mirroring how we construct every deal on the platform.
            </p>
          </div>
        </div>

        {/* Canvas */}
        <div className="absolute inset-0 z-0">
          <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
            <PerspectiveCamera makeDefault position={[5.5, 3.2, 7.5]} fov={35} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 12, 8]}
              intensity={1.5}
              color="#ffffff"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
            <pointLight position={[-8, 5, -5]} intensity={0.8} color="#0ea5e9" />
            <House progressRef={progressRef} />
            <ContactShadows position={[0, -1.0, 0]} opacity={0.6} scale={15} blur={2} far={5} />
            <Environment preset="night" />
          </Canvas>
        </div>

        {/* Stage HUD */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 md:pb-14 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs uppercase tracking-wider text-white/50 font-medium">
                Stage {stageIndex + 1} / {STAGES.length}
              </div>
              <div className="text-xs tabular-nums text-white/50">{progressPct}%</div>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {STAGES.map((s, i) => (
                <div
                  key={s.label}
                  className={`h-1.5 rounded-full transition-colors duration-300 ${
                    i <= stageIndex
                      ? 'bg-gradient-to-r from-lime-400 to-sky-400'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {STAGES.map((s, i) => (
                <span
                  key={s.label}
                  className={`text-sm font-medium transition-colors ${
                    i === stageIndex ? 'text-lime-400' : 'text-white/40'
                  }`}
                >
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
