'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  Environment, 
  OrbitControls, 
  Float, 
  ContactShadows,
  MeshReflectorMaterial,
  Text,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useScroll } from '@react-three/fiber';

/**
 * HomeFlythroughHero
 * 
 * A cinematic 3D fly-through experience.
 * Instead of abstract blocks, we build a stylized modern minimalist "Glass House".
 * The camera follows a path through the architecture.
 */

function Room({ position, color = "#ffffff", children }: any) {
  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={40}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#151515"
          metalness={0.5}
        />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 1, -5]} receiveShadow>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Side Wall Left */}
      <mesh position={[-5, 1, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[10, 6, 0.1]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 4, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      
      {children}
    </group>
  );
}

function ModernFurniture() {
  return (
    <group>
      {/* Abstract Sofa */}
      <mesh position={[-2, -1.6, -2]} castShadow>
        <boxGeometry args={[4, 0.8, 1.5]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>
      <mesh position={[-2, -1.1, -2.6]} castShadow>
        <boxGeometry args={[4, 1.2, 0.4]} />
        <meshStandardMaterial color="#222" roughness={0.9} />
      </mesh>

      {/* Coffee Table */}
      <mesh position={[1, -1.7, -1.5]} castShadow>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.1} />
      </mesh>
      
      {/* "Art" on wall */}
      <mesh position={[0, 1, -4.94]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#84cc16" emissive="#84cc16" emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
}

function CinematicCamera() {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (cameraRef.current) {
      // Fly-through path
      cameraRef.current.position.x = Math.sin(t * 0.2) * 5;
      cameraRef.current.position.z = 10 + Math.cos(t * 0.15) * 5;
      cameraRef.current.position.y = 1 + Math.sin(t * 0.3) * 0.5;
      cameraRef.current.lookAt(0, 0, -2);
    }
  });

  return <PerspectiveCamera ref={cameraRef} makeDefault fov={45} />;
}

export default function HomeFlythroughHero() {
  return (
    <div className="relative w-full h-full min-h-[600px] lg:min-h-[800px]">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <CinematicCamera />
        
        <ambientLight intensity={0.2} />
        <spotLight 
          position={[10, 15, 10]} 
          angle={0.3} 
          penumbra={1} 
          intensity={2} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-10, 5, -5]} intensity={1} color="#84cc16" />
        
        <Room position={[0, 0, 0]} color="#f8fafc">
           <ModernFurniture />
        </Room>

        {/* Floating UI Elements that "fly" in the space */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           <Html position={[2, 1, -1]} distanceFactor={10}>
              <div className="bg-white/10 backdrop-blur-xl p-4 border border-white/20 whitespace-nowrap">
                 <p className="text-white text-[10px] tracking-widest uppercase font-bold">AI Valuation</p>
                 <p className="text-lime-400 text-2xl font-bold">R4,250,000</p>
              </div>
           </Html>
        </Float>

        <Environment preset="night" />
        <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
      </Canvas>
      
      {/* Vingette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
