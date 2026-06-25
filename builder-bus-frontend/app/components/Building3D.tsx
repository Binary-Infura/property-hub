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

const AnimatedBus = ({ color, speed, startX, zOffset, direction }: { color: string, speed: number, startX: number, zOffset: number, direction: number }) => {
  const group = useRef<THREE.Group>(null);
  const busMesh = useRef<THREE.Group>(null);
  const directionRef = useRef(direction);
  
  useFrame((state, delta) => {
    if (group.current && busMesh.current) {
      // Move bus horizontally based on the direction it's currently facing
      group.current.position.x += Math.sin(busMesh.current.rotation.y) * speed * delta;
      
      // Trigger U-turn at boundaries
      if (directionRef.current > 0 && group.current.position.x > 7) {
        directionRef.current = -1;
      } else if (directionRef.current < 0 && group.current.position.x < -7) {
        directionRef.current = 1;
      }
      
      // Smoothly rotate the bus model towards the target direction
      const targetRotation = directionRef.current > 0 ? Math.PI / 2 : -Math.PI / 2;
      busMesh.current.rotation.y += (targetRotation - busMesh.current.rotation.y) * delta * 3;
    }
  });

  return (
    <group ref={group} position={[startX, 0.9, zOffset]}>
      <group ref={busMesh} rotation={[0, direction > 0 ? Math.PI/2 : -Math.PI/2, 0]}>
        {/* Bus Body */}
        <mesh castShadow>
          <boxGeometry args={[1.2, 1.4, 3.5]} />
          <meshStandardMaterial color={color} />
        </mesh>
        
        {/* Windows - Side */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[1.25, 0.5, 3]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Windshield */}
        <mesh position={[0, 0.2, 1.76]} castShadow>
          <planeGeometry args={[1.1, 0.6]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Headlights */}
        <mesh position={[0.4, -0.4, 1.76]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.4, -0.4, 1.76]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
        </mesh>

        {/* Taillights */}
        <mesh position={[0.4, -0.4, -1.76]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>
        <mesh position={[-0.4, -0.4, -1.76]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
        </mesh>

        {/* Wheels */}
        {[-1.1, 1.1].map((z, i) => (
          <React.Fragment key={i}>
            <Wheel position={[-0.6, -0.6, z]} speed={speed} />
            <Wheel position={[0.6, -0.6, z]} speed={speed} />
          </React.Fragment>
        ))}
      </group>
    </group>
  );
};

const Wheel = ({ position, speed }: { position: [number, number, number], speed: number }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Roll the wheel based on bus speed and wheel radius (0.3)
      meshRef.current.rotation.x += (speed / 0.3) * delta;
    }
  });

  return (
    <group position={position}>
      <group ref={meshRef}>
        {/* Tyre */}
        <mesh rotation={[0, 0, Math.PI/2]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
        {/* Hubcaps (hexagon to make rotation visible) */}
        <mesh rotation={[0, 0, Math.PI/2]} position={[0.12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI/2]} position={[-0.12, 0, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 0.05, 6]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
};

const HouseModel = () => {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      // Gentle oscillation around the front face
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.05 + Math.PI / 4;
    }
  });

  return (
    <group ref={group} position={[6, 0, -6]} scale={1.6}>
      {/* Main Base / Yard */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[10, 0.1, 10]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Modern House Body */}
      <group position={[0, 1.5, 0]}>
        {/* Ground Floor */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5, 3, 3]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        
        {/* Large Window on Front */}
        <mesh position={[1, 0, 1.51]}>
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

        {/* Second Floor */}
        <group position={[-0.5, 3, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[4, 3, 3.2]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0, 1.61]}>
            <planeGeometry args={[2.5, 2]} />
            <meshPhysicalMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={0.5} />
          </mesh>
        </group>

        {/* Balcony Railing */}
        <mesh position={[2, 1.6, 1.5]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1, 0.1, 0.1]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>
      </group>

      {/* Animated Busses */}
      <AnimatedBus color="#3b82f6" speed={1.5} startX={5} zOffset={4.5} direction={-1} />

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
          rotation={[0, Math.PI / 8, 0]}
          polar={[-Math.PI / 12, Math.PI / 12]}
          azimuth={[-Math.PI / 3, Math.PI / 3]}
          snap
        >
          <HouseModel />
        </PresentationControls>

        <ContactShadows 
          position={[6, 0, -6]} 
          opacity={0.3} 
          scale={28} 
          blur={3} 
          far={6} 
        />
      </Canvas>
    </div>
  );
};

export default Building3D;
