'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, MeshWobbleMaterial, Sphere, PerspectiveCamera, Environment, ContactShadows, PresentationControls, ScrollControls, Scroll } from '@react-three/drei';
import * as THREE from 'three';

function BackgroundNodes() {
  const count = 40;
  const nodes = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10 - 5;
      temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.001;
    meshRef.current.rotation.x += 0.0005;
    
    // Smooth follow mouse
    const targetX = (state.mouse.x * 0.5);
    const targetY = (state.mouse.y * 0.5);
    meshRef.current.position.x += (targetX - meshRef.current.position.x) * 0.05;
    meshRef.current.position.y += (targetY - meshRef.current.position.y) * 0.05;
  });

  return (
    <group ref={meshRef}>
      {nodes.map((pos, i) => (
        <Sphere key={i} position={pos} args={[0.05, 16, 16]}>
          <meshBasicMaterial color={i % 2 === 0 ? "#84cc16" : "#0ea5e9"} transparent opacity={0.4} />
        </Sphere>
      ))}
    </group>
  );
}

function FloatingBuildingBlock({ position, color, speed, distort }: { position: [number, number, number], color: string, speed: number, distort: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.2;
    meshRef.current.rotation.x = Math.cos(time * speed * 0.5) * 0.1;
    meshRef.current.rotation.z = Math.sin(time * speed * 0.5) * 0.1;
  });

  return (
    <Float speed={speed * 2} rotationIntensity={1} floatIntensity={1}>
      <mesh ref={meshRef} position={position}>
        <boxGeometry args={[1, 1, 1]} />
        <MeshDistortMaterial 
          color={color} 
          speed={speed} 
          distort={distort} 
          radius={1} 
          transparent 
          opacity={0.7}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

function MainHeroObject() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    groupRef.current.rotation.y = time * 0.2;
  });

  return (
    <group ref={groupRef}>
      {/* Central "Core" of Agent Loop */}
      <Sphere args={[1.5, 64, 64]}>
        <MeshWobbleMaterial 
          color="#84cc16" 
          speed={1} 
          factor={0.4} 
          transparent 
          opacity={0.2}
          wireframe
        />
      </Sphere>
      
      {/* Abstract "Property Blocks" rotating around the core */}
      <FloatingBuildingBlock position={[3, 1, 0]} color="#0ea5e9" speed={1.2} distort={0.3} />
      <FloatingBuildingBlock position={[-3, -1.5, 1]} color="#84cc16" speed={0.8} distort={0.2} />
      <FloatingBuildingBlock position={[1.5, -2.5, -2]} color="#ffffff" speed={1.5} distort={0.4} />
      <FloatingBuildingBlock position={[-2, 2.5, -1]} color="#0ea5e9" speed={1} distort={0.2} />
    </group>
  );
}

export default function PropertyThreeScene() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-charcoal-900">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#84cc16" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0ea5e9" />
        <spotLight position={[0, 10, 0]} intensity={1.5} angle={0.3} penumbra={1} />
        
        <PresentationControls
          global
          config={{ mass: 2, tension: 500 }}
          snap={{ mass: 4, tension: 1500 }}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
        >
          <MainHeroObject />
        </PresentationControls>

        <BackgroundNodes />
        
        <Environment preset="city" />
        <ContactShadows 
          position={[0, -4.5, 0]} 
          scale={20} 
          blur={2} 
          far={4.5} 
          opacity={0.25} 
          color="#000000" 
        />
      </Canvas>
    </div>
  );
}
