"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";


const Particle = ({ color, position }: { color: string, position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Very slight vertical drift
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.002;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
      <mesh position={position} ref={meshRef}>
        {/* Simplified geometry to reduce vertex count */}
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
    </Float>
  );
};

const AmbientParticles = () => {
  const particles = useMemo(() => {
    // Reduced count from 40 to 20 for smoother scrolling
    return Array.from({ length: 20 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10 - 5
      ] as [number, number, number],
      color: i % 2 === 0 ? "#3b82f6" : "#6366f1"
    }));
  }, []);

  return (
    <group>
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}
    </group>
  );
};

const FloatingBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none opacity-30 select-none">
      <Canvas 
        camera={{ position: [0, 0, 10] }}
        dpr={1} // Lock to 1 to save GPU
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <AmbientParticles />
      </Canvas>
    </div>
  );
};

export default FloatingBackground;
