'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, MeshDistortMaterial, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * ArchitecturalHero
 * 
 * A museum-grade, minimalist architectural visual for the property industry.
 * Replaces the "techy" dashboard cards with a cinematic, abstract property
 * representation using clean lines, light, and high-end materials.
 */

function MuseumHouse() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.y = Math.sin(t * 0.2) * 0.1;
  });

  return (
    <group ref={meshRef}>
      {/* Abstract Architectural Composition */}
      
      {/* The "Monolith" - Main Structure */}
      <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 3.5, 0.2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            roughness={0.05} 
            metalness={0.1}
          />
        </mesh>
        
        {/* Floating Glass Plane */}
        <mesh position={[0.8, 0.5, 0.4]} rotation={[0, -0.2, 0]}>
          <boxGeometry args={[2, 2.5, 0.05]} />
          <meshStandardMaterial 
            color="#84cc16" 
            transparent 
            opacity={0.15} 
            roughness={0} 
            metalness={1}
            emissive="#84cc16"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Floating Gold/Accent Beam */}
        <mesh position={[-1.2, -1, 0.3]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.05, 3, 0.05]} />
          <meshStandardMaterial 
            color="#fbbf24" 
            emissive="#fbbf24"
            emissiveIntensity={1}
            metalness={1}
            roughness={0}
          />
        </mesh>
      </Float>

      {/* Background Architectural Elements */}
      <mesh position={[-2, -1.5, -1]} rotation={[0, 0.5, 0]}>
        <boxGeometry args={[4, 0.1, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      <mesh position={[2, 2, -2]} rotation={[0, -0.3, 0]}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <MeshDistortMaterial 
          color="#0ea5e9" 
          speed={2} 
          distort={0.4} 
          radius={1}
        />
      </mesh>
    </group>
  );
}

export default function ArchitecturalHero() {
  return (
    <div className="relative w-full h-full min-h-[500px] md:min-h-[700px]">
      <Canvas dpr={[1, 2]} shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={35} />
        
        {/* Studio Lighting */}
        <ambientLight intensity={0.4} />
        <spotLight 
          position={[10, 10, 10]} 
          angle={0.15} 
          penumbra={1} 
          intensity={2} 
          castShadow 
        />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#84cc16" />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#0ea5e9" />
        
        <MuseumHouse />
        
        <Environment preset="studio" />
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
      </Canvas>
      
      {/* Cinematic Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-charcoal-900/40 via-transparent to-transparent" />
    </div>
  );
}
