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
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <RoundedBox args={[width, height, 0.1]} radius={0.05} smoothness={4}>
          <meshStandardMaterial 
            color="#1e293b" 
            roughness={0.1} 
            metalness={0.8} 
            envMapIntensity={2}
          />
        </RoundedBox>
        {/* Glass overlay effect */}
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[width - 0.1, height - 0.1]} />
          <meshStandardMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.05} 
            roughness={0} 
            metalness={1} 
          />
        </mesh>
        {/* accent glow */}
        <mesh position={[-(width / 2) + 0.02, 0, 0.06]}>
          <boxGeometry args={[0.04, height - 0.4, 0.02]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2} />
        </mesh>
        <Html
          transform
          occlude="blending"
          position={[0, 0, 0.07]}
          distanceFactor={1.2}
          style={{
            width: `${width * 160}px`,
            height: `${height * 160}px`,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            className="glass-card-content"
            style={{
              width: '100%',
              height: '100%',
              padding: '24px',
              color: 'white',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: 16,
              lineHeight: 1.5,
              background: 'rgba(15, 23, 42, 0.2)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {children}
          </div>
        </Html>
      </Float>
    </group>
  );
}

function RealisticHouse({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Foundation / Plinth */}
      <mesh position={[0, -0.4, 0]} receiveShadow>
        <boxGeometry args={[1.6, 0.2, 1.2]} />
        <meshStandardMaterial color="#475569" roughness={0.9} />
      </mesh>
      
      {/* Main Block */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 1.1]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Roof - Multi-part for realism */}
      <group position={[0, 0.5, 0]}>
        <mesh rotation={[0, 0, 0]} position={[0, 0.3, 0]} castShadow>
          <coneGeometry args={[1.2, 0.8, 4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* Chimney */}
        <mesh position={[0.4, 0.4, 0]} castShadow>
          <boxGeometry args={[0.15, 0.5, 0.15]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* Door - Detailed */}
      <group position={[0, -0.1, 0.56]}>
        <mesh>
          <boxGeometry args={[0.3, 0.5, 0.05]} />
          <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.1, 0, 0.03]}>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* Windows with glow */}
      {[
        [-0.4, 0.1, 0.56],
        [0.4, 0.1, 0.56],
        [0.76, 0.1, 0],
        [-0.76, 0.1, 0],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, i > 1 ? Math.PI/2 : 0, 0]}>
          <planeGeometry args={[0.3, 0.3]} />
          <meshStandardMaterial 
            color="#0ea5e9" 
            emissive="#0ea5e9" 
            emissiveIntensity={1.5} 
            transparent 
            opacity={0.6}
          />
        </mesh>
      ))}

      {/* Ground Glow / Shadow */}
      <mesh position={[0, -0.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color="#84cc16" transparent opacity={0.05} />
      </mesh>
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
      <DashboardCard position={[-1.8, 1.5, 0]} accent="#84cc16" width={3.2} height={1.8}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#84cc16', fontWeight: 600, letterSpacing: 2 }}>LIVE MANDATE</span>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>Sea Point · R4.25M</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 15, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Modern 3 Bed</div>
        <div style={{ fontSize: 14, color: '#cbd5e1', marginTop: 8, display: 'flex', gap: 10 }}>
          <span>142m²</span>
          <span>•</span>
          <span>Ocean View</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 15 }}>
          <div style={{ padding: '6px 12px', background: 'rgba(132, 204, 22, 0.1)', border: '1px solid rgba(132, 204, 22, 0.3)', borderRadius: 20, fontSize: 11, color: '#84cc16' }}>Verified</div>
          <div style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: 20, fontSize: 11 }}>FICA Ready</div>
        </div>
      </DashboardCard>

      {/* Match card */}
      <DashboardCard position={[2.2, 0.4, 0.8]} rotation={[0, -0.2, 0]} accent="#0ea5e9" width={3.0} height={2.0}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, background: '#0ea5e9', borderRadius: '50%' }} />
          <span style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 600, letterSpacing: 2 }}>AI MATCH ENGINE</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 15 }}>Sarah Mitchell</div>
        <div style={{ fontSize: 14, color: '#94a3b8', marginTop: 6 }}>94% Match Score</div>
        <div style={{ marginTop: 15, height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ width: '94%', height: '100%', background: 'linear-gradient(90deg, #84cc16, #0ea5e9)', boxShadow: '0 0 10px rgba(14, 165, 233, 0.5)' }} />
        </div>
        <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 15, fontStyle: 'italic' }}>
          "Looking for 3 bed in Sea Point area, budget R4.5M. Cash buyer."
        </div>
      </DashboardCard>

      {/* Deal pipeline mini card */}
      <DashboardCard position={[-1.0, -1.8, 1.2]} rotation={[0, 0.1, 0]} accent="#84cc16" width={2.8} height={1.5}>
        <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, letterSpacing: 2 }}>SMART PIPELINE</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 15 }}>
          {['Enquiry', 'Viewing', 'Offer', 'Deed'].map((s, i) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: i <= 2 ? 'linear-gradient(90deg,#84cc16,#0ea5e9)' : 'rgba(255,255,255,0.1)',
                  boxShadow: i <= 2 ? '0 0 8px rgba(132, 204, 22, 0.4)' : 'none'
                }}
              />
              <div style={{ fontSize: 10, color: i <= 2 ? '#fff' : '#64748b', marginTop: 8, fontWeight: i === 2 ? 700 : 400 }}>{s}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 15, alignItems: 'center' }}>
          <div style={{ fontSize: 13, color: '#fff' }}>Stage: <span style={{ color: '#84cc16' }}>Offer Received</span></div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>2h ago</div>
        </div>
      </DashboardCard>

      {/* House anchor */}
      <Float speed={1.5} floatIntensity={0.5} rotationIntensity={0.3}>
        <RealisticHouse position={[0.2, 0, -1.5]} />
      </Float>

      {/* Match beams connecting house -> cards */}
      <MatchBeam from={[0.2, 0.2, -1.5]} to={[-1.8, 1.5, 0]} color="#84cc16" />
      <MatchBeam from={[0.2, 0.2, -1.5]} to={[2.2, 0.4, 0.8]} color="#0ea5e9" />
      <MatchBeam from={[0.2, 0.2, -1.5]} to={[-1.0, -1.8, 1.2]} color="#84cc16" />
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
