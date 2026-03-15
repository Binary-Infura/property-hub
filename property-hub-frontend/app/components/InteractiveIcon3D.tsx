"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  MeshDistortMaterial, 
  PresentationControls,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";

const FloatingGem = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh ref={meshRef} castShadow>
          <octahedronGeometry args={[2, 0]} />
          <MeshDistortMaterial 
            color="#3b82f6" 
            speed={3} 
            distort={0.4} 
            radius={1} 
            emissive="#1d4ed8"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        
        {/* Outer Glow Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.2, 0.03, 16, 100]} />
          <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={2} transparent opacity={0.8} />
        </mesh>
      </Float>
    </group>
  );
};

const InteractiveIcon3D = () => {
  return (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-transparent relative">
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        className="w-full h-full"
        style={{ pointerEvents: 'auto' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={40} />
        
        {/* Robust Lighting Setup (No External Assets) */}
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow color="#ffffff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#6366f1" />
        <rectAreaLight width={5} height={5} intensity={5} position={[0, 5, 5]} color="#3b82f6" />
        
        <PresentationControls
          global
          snap
          rotation={[0, Math.PI / 6, 0]}
          polar={[-Math.PI / 3, Math.PI / 3]}
          azimuth={[-Math.PI / 2, Math.PI / 2]}
        >
          <FloatingGem />
        </PresentationControls>

        <ContactShadows 
          position={[0, -4, 0]} 
          opacity={0.4} 
          scale={12} 
          blur={2.5} 
          far={10} 
        />
      </Canvas>
    </div>
  );
};

export default InteractiveIcon3D;
