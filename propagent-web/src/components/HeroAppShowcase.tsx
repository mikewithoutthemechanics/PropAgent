'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox, Html, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroAppShowcase
 *
 * A property-industry-specific hero visual. Instead of abstract blobs, this
 * renders a tilted, floating 3D "device" with stacked dashboard cards that
 * mirror the real Agent Loop UI: a listing card, a buyer-match card, and a
 * deal-pipeline card. A subtle house silhouette and animated "match" beams
 * tie the visual to the property industry.
 *
 * Designed to live inside the hero section (not fullscreen), so it composes
 * with the surrounding HTML layout.
 */

function MatchBeam({ from, to, color = '#84cc16' }: { from: [number, number, number]; to: [number, number, number]; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = start.clone().lerp(end, 0.5);
  const len = start.distanceTo(end);
  const dir = end.clone().sub(start).normalize();
  const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.35 + Math.sin(t * 2) * 0.25;
  });

  return (
    <mesh ref={ref} position={mid.toArray()} quaternion={quat}>
      <cylinderGeometry args={[0.015, 0.015, len, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.5} />
    </mesh>
  );
}

function HouseSilhouette({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.2, 0.9, 0.8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.1} />
      </mesh>
      {/* roof */}
      <mesh position={[0, 0.75, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.95, 0.7, 4]} />
        <meshStandardMaterial color="#84cc16" roughness={0.4} metalness={0.2} />
      </mesh>
      {/* window glow */}
      <mesh position={[0, 0.05, 0.41]}>
        <planeGeometry args={[0.35, 0.25]} />
        <meshBasicMaterial color="#0ea5e9" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

function DashboardCard({
  position,
  rotation = [0, 0, 0],
  width = 2.6,
  height = 1.6,
  accent = '#84cc16',
  children,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  width?: number;
  height?: number;
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[width, height, 0.08]} radius={0.1} smoothness={4}>
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.4} />
      </RoundedBox>
      {/* accent strip */}
      <mesh position={[-(width / 2) + 0.05, 0, 0.042]}>
        <planeGeometry args={[0.06, height - 0.2]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <Html
        transform
        occlude="blending"
        position={[0.06, 0, 0.05]}
        distanceFactor={1.4}
        style={{
          width: `${width * 160}px`,
          height: `${height * 160}px`,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            padding: '18px 20px',
            color: 'white',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {children}
        </div>
      </Html>
    </group>
  );
}

function Scene() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    // subtle idle sway
    group.current.rotation.y = Math.sin(t * 0.3) * 0.08 - 0.25;
    group.current.rotation.x = Math.sin(t * 0.4) * 0.04 - 0.08;
  });

  return (
    <group ref={group}>
      {/* Listing card */}
      <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.2}>
        <DashboardCard position={[-1.5, 1.3, 0]} accent="#84cc16" width={2.8} height={1.6}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#84cc16', fontWeight: 600, letterSpacing: 1 }}>NEW LISTING</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>Cape Town · Sea Point</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 10 }}>3 Bed Apartment</div>
          <div style={{ fontSize: 15, color: '#cbd5e1', marginTop: 4 }}>R 4,250,000</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <span style={{ padding: '3px 10px', background: '#1e293b', borderRadius: 12, fontSize: 11 }}>3 Bed</span>
            <span style={{ padding: '3px 10px', background: '#1e293b', borderRadius: 12, fontSize: 11 }}>2 Bath</span>
            <span style={{ padding: '3px 10px', background: '#1e293b', borderRadius: 12, fontSize: 11 }}>Sea view</span>
          </div>
        </DashboardCard>
      </Float>

      {/* Match card */}
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.25}>
        <DashboardCard position={[1.8, 0.2, 0.6]} rotation={[0, -0.3, 0]} accent="#0ea5e9" width={2.7} height={1.7}>
          <div style={{ fontSize: 11, color: '#0ea5e9', fontWeight: 600, letterSpacing: 1 }}>AI MATCH · 94%</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 10 }}>Sarah M. · Ready buyer</div>
          <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Pre-approved R4.5M · Atlantic Seaboard</div>
          <div style={{ marginTop: 12, height: 8, background: '#1e293b', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg,#84cc16,#0ea5e9)' }} />
          </div>
          <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 10 }}>PPRA verified · FICA ✓ · POPIA ✓</div>
        </DashboardCard>
      </Float>

      {/* Deal pipeline mini card */}
      <Float speed={1} rotationIntensity={0.08} floatIntensity={0.2}>
        <DashboardCard position={[-0.8, -1.5, 1.0]} rotation={[0, 0.25, 0]} accent="#84cc16" width={2.4} height={1.3}>
          <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: 1 }}>DEAL PIPELINE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginTop: 12 }}>
            {['Lead', 'View', 'Offer', 'Close'].map((s, i) => (
              <div key={s} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    height: 8,
                    borderRadius: 4,
                    background: i <= 2 ? 'linear-gradient(90deg,#84cc16,#0ea5e9)' : '#1e293b',
                  }}
                />
                <div style={{ fontSize: 10, color: '#cbd5e1', marginTop: 6 }}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 12 }}>
            12 active · <span style={{ color: '#84cc16' }}>3 hot</span>
          </div>
        </DashboardCard>
      </Float>

      {/* House anchor */}
      <Float speed={0.8} floatIntensity={0.4} rotationIntensity={0.2}>
        <HouseSilhouette position={[0.2, -0.1, -1.2]} />
      </Float>

      {/* Match beams connecting house -> cards */}
      <MatchBeam from={[0.2, 0.2, -1.2]} to={[-1.5, 1.3, 0]} color="#84cc16" />
      <MatchBeam from={[0.2, 0.2, -1.2]} to={[1.8, 0.2, 0.6]} color="#0ea5e9" />
      <MatchBeam from={[0.2, 0.2, -1.2]} to={[-0.8, -1.5, 1.0]} color="#84cc16" />
    </group>
  );
}

export default function HeroAppShowcase() {
  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[650px]">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 6.5]} fov={40} />
        <ambientLight intensity={0.55} />
        <pointLight position={[5, 6, 5]} intensity={1.1} color="#84cc16" />
        <pointLight position={[-6, -3, -4]} intensity={0.6} color="#0ea5e9" />
        <spotLight position={[0, 6, 4]} intensity={0.8} angle={0.5} penumbra={1} color="#ffffff" />
        <Scene />
        <Environment preset="city" />
      </Canvas>
      {/* soft edge vignette so cards fade into hero */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(closest-side at 50% 50%, rgba(0,0,0,0) 55%, rgba(15,23,42,0.55) 100%)',
        }}
      />
    </div>
  );
}
