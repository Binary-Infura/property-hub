"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  Float, 
  ContactShadows, 
  Environment,
  PresentationControls
} from "@react-three/drei";
import * as THREE from "three";

const HouseModel = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Main Base / Yard */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Modern House Body */}
      <group position={[1, 1.5, 0]}>
        {/* Ground Floor */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4, 3, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Large Window */}
        <mesh position={[2.01, 0, 0]}>
          <planeGeometry args={[2, 2]} />
          <meshPhysicalMaterial 
            color="#93c5fd" 
            transmission={0.9} 
            thickness={0.5} 
            roughness={0} 
            ior={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>

        {/* Second Floor - Offset */}
        <group position={[-0.5, 3, 0.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[3, 3, 4]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0, 2.01]}>
            <planeGeometry args={[2, 2]} />
            <meshPhysicalMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* Balcony Railing */}
        <mesh position={[1, 1.6, 2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[3, 0.1, 0.1]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Decorative Tree / Low-poly Greenery */}
      <group position={[-3, 1, 3]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.2, 2]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
        <mesh position={[0, 1.5, 0]} castShadow>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#10b981" />
        </mesh>
      </group>

      {/* Distant Abstract Buildings for Depth */}
      <group position={[-10, 0, -10]}>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[i * 3, Math.random() * 5 + 2, 0]} castShadow>
            <boxGeometry args={[2, (i + 1) * 3, 2]} />
            <meshStandardMaterial color="#cbd5e1" opacity={0.5} transparent />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Building3D = () => {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        shadows={false} // Disable shadows for significant performance boost
        dpr={[1, 1.5]}
        camera={{ position: [12, 8, 12], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#ffffff"]} />
        <ambientLight intensity={1} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={2} color="#ffffff" />
        <pointLight position={[-10, 10, -10]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[0, -10, 0]} intensity={0.5} color="#6366f1" />
        
        <PresentationControls
          global
          rotation={[0, -Math.PI / 4, 0]}
          polar={[-Math.PI / 6, Math.PI / 6]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
          snap
        >
          <HouseModel />
        </PresentationControls>

        <ContactShadows 
          position={[0, 0, 0]} 
          opacity={0.3} 
          scale={20} 
          blur={3} 
          far={6} 
        />
      </Canvas>
    </div>
  );
};

export default Building3D;
