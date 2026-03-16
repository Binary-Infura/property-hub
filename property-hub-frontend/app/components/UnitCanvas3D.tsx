'use client';

import React, { useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float, Sky, Stars, Html, Text, Clouds, Cloud, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { PropertyUnit, UnitStatus } from '@/app/services/unitService';
import { ProjectType } from '@/app/services/propertyService';

// ─── Status Colors (Vibrant Aura Bloom Palette - Light Mode Optimized) ───────
const STATUS_COLORS: Record<UnitStatus, { color: string; emissive: string }> = {
    AVAILABLE: { color: '#10b981', emissive: '#059669' }, // Emerald
    RESERVED: { color: '#fbbf24', emissive: '#d97706' }, // Amber
    BOOKED: { color: '#f97316', emissive: '#ea580c' }, // Orange
    SOLD: { color: '#f43f5e', emissive: '#e11d48' }, // Rose
};

// ─── Unit Item Component ───────────────────────────────────────────────────
interface UnitInstancesProps {
    units: PropertyUnit[];
    projectType: ProjectType;
    hoveredId: string | null;
    selectedId: string | null;
    onHover: (id: string | null) => void;
    onSelect: (unit: PropertyUnit) => void;
    viewMode: 'building' | 'floor';
    selectedFloor: number;
}

function UnitInstances({
    units,
    projectType,
    hoveredId,
    selectedId,
    onHover,
    onSelect,
    viewMode,
    selectedFloor,
}: UnitInstancesProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const _color = useMemo(() => new THREE.Color(), []);

    // Geometry varies by type
    const boxGeo = useMemo(() => {
        if (projectType === 'PLOT') return new THREE.BoxGeometry(2.4, 0.2, 2.4);
        return new THREE.BoxGeometry(2, 2, 2);
    }, [projectType]);

    // Memoize White color for lerping to avoid GC
    const whiteColor = useMemo(() => new THREE.Color('#ffffff'), []);

    const displayed = useMemo(() => {
        if (viewMode === 'floor') {
            return units.filter(u => (u.floor ?? 1) === selectedFloor);
        }
        return units;
    }, [units, viewMode, selectedFloor]);

    const floorOrder = useMemo(
        () => [...new Set(units.map(u => u.floor ?? 1))].sort((a, b) => a - b),
        [units]
    );

    const unitsByFloor = useMemo(() => {
        const map: Record<number, PropertyUnit[]> = {};
        for (const u of units) {
            const f = u.floor ?? 1;
            map[f] = map[f] ?? [];
            map[f].push(u);
        }
        return map;
    }, [units]);

    const positions = useMemo((): THREE.Vector3[] => {
        if (viewMode === 'floor' || projectType === 'PLOT' || projectType === 'VILLA') {
            const currentUnits = viewMode === 'floor' ? displayed : units;
            const cols = Math.ceil(Math.sqrt(Math.max(currentUnits.length, 1)));
            const spacing = projectType === 'VILLA' ? 5 : 3.0;

            return (viewMode === 'floor' ? displayed : units).map((_, i) => {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const x = col * spacing - ((cols - 1) / 2) * spacing;
                const z = row * spacing - (Math.ceil(currentUnits.length / cols) / 2) * spacing;
                const y = projectType === 'PLOT' ? 0.1 : 1.3;
                return new THREE.Vector3(x, y, z);
            });
        }

        return displayed.map(u => {
            const f = u.floor ?? 1;
            const fUnits = unitsByFloor[f] || [];
            const idx = fUnits.indexOf(u);
            const x = idx * 2.6 - ((fUnits.length - 1) / 2) * 2.6;
            const y = floorOrder.indexOf(f) * 2.6 + 1.3;
            return new THREE.Vector3(x, y, 0);
        });
    }, [displayed, units, viewMode, unitsByFloor, floorOrder, projectType]);

    useFrame((state) => {
        const mesh = meshRef.current;
        if (!mesh) return;

        displayed.forEach((unit, i) => {
            const pos = positions[i];
            const isHovered = unit.id === hoveredId;
            const isSelected = unit.id === selectedId;

            mesh.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);

            // 1. Smooth Scale Transitions
            const targetScale = isHovered ? 1.25 : isSelected ? 1.15 : 1.0;
            const nextScale = THREE.MathUtils.lerp(dummy.scale.x, targetScale, 0.15);
            dummy.scale.setScalar(nextScale);

            // 2. Smooth Position & Rotation to prevent "snap-flicker"
            const bobHeight = projectType === 'PLOT' ? 0.3 : 0.08;
            const targetY = isHovered ? pos.y + Math.sin(state.clock.elapsedTime * 6) * bobHeight : pos.y;
            const targetRotY = (isHovered && projectType !== 'PLOT') ? state.clock.elapsedTime * 0.5 : 0;
            const targetRotX = (isHovered && projectType === 'PLOT') ? Math.sin(state.clock.elapsedTime * 2) * 0.1 : 0;

            dummy.position.y = THREE.MathUtils.lerp(dummy.position.y, targetY, 0.1);
            dummy.position.x = THREE.MathUtils.lerp(dummy.position.x, pos.x, 0.1);
            dummy.position.z = THREE.MathUtils.lerp(dummy.position.z, pos.z, 0.1);
            
            // Use Euler to update quaternion safely
            const currentEuler = new THREE.Euler().setFromQuaternion(dummy.quaternion);
            currentEuler.y = THREE.MathUtils.lerp(currentEuler.y, targetRotY, 0.1);
            currentEuler.x = THREE.MathUtils.lerp(currentEuler.x, targetRotX, 0.1);
            dummy.quaternion.setFromEuler(currentEuler);

            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);

            // 3. Color smoothing
            _color.set(STATUS_COLORS[unit.status].color);
            if (isHovered) _color.lerp(whiteColor, 0.3);
            mesh.setColorAt(i, _color);
        });
        mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    });

    const handlePointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (e.instanceId !== undefined && displayed[e.instanceId]) {
            document.body.style.cursor = 'pointer';
            onHover(displayed[e.instanceId].id);
        }
    }, [displayed, onHover]);

    const handlePointerOut = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        document.body.style.cursor = 'default';
        onHover(null);
    }, [onHover]);

    const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        // Check for instanceId and if the user isn't dragging
        if (e.instanceId !== undefined && displayed[e.instanceId]) {
            onSelect(displayed[e.instanceId]);
        }
    }, [displayed, onSelect]);

    return (
        <instancedMesh
            ref={meshRef}
            args={[boxGeo, undefined, displayed.length]}
            onPointerMove={handlePointerMove}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
            castShadow
            receiveShadow
        >
            <meshPhysicalMaterial
                metalness={0.9}
                roughness={0.1}
                transmission={0.2}
                thickness={1}
                envMapIntensity={2}
                transparent
                opacity={0.9}
            />
        </instancedMesh>
    );
}

// ─── Building Shell Component ──────────────────────────────────────────────
function BuildingShell({
    units,
    projectType,
    selectedFloor,
    viewMode,
    projectName
}: {
    units: PropertyUnit[];
    projectType: ProjectType;
    selectedFloor: number;
    viewMode: 'building' | 'floor';
    projectName?: string;
}) {
    const scanRef = useRef<THREE.Mesh>(null);
    
    // Create a window grid texture for the building shell
    const windowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        ctx.fillStyle = '#1e293b'; 
        ctx.fillRect(0, 0, 512, 512);
        
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 10;
        
        const cols = 8;
        const rows = 12;
        const w = 512 / cols;
        const h = 512 / rows;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                ctx.fillStyle = '#64748b33';
                ctx.fillRect(i * w + 5, j * h + 5, w - 10, h - 10);
                ctx.strokeRect(i * w, j * h, w, h);
            }
        }
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        return tex;
    }, []);

    const floorOrder = useMemo(() => [...new Set(units.map(u => u.floor ?? 1))].sort((a, b) => a - b), [units]);
    const maxUnitsInFloor = useMemo(() => {
        const counts = units.reduce((acc, u) => {
            const f = u.floor ?? 1;
            acc[f] = (acc[f] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);
        return Math.max(...Object.values(counts), 0);
    }, [units]);

    const height = floorOrder.length * 2.6 || 5;

    useFrame(({ clock }) => {
        if (scanRef.current) {
            // Animate scan line from bottom to top and back
            const scanSpeed = 0.5; // Adjust speed as needed
            const scanRange = height / 2; // Scan from -height/2 to +height/2
            const scanPosition = Math.sin(clock.elapsedTime * scanSpeed) * scanRange;
            scanRef.current.position.y = scanPosition;
        }
    });

    const isFloorMode = viewMode === 'floor';

    if (projectType === 'APARTMENT' || projectType === 'COMMERCIAL') {
        const width = maxUnitsInFloor * 2.6 + 1;
        const depth = 4;
        const color = projectType === 'COMMERCIAL' ? '#60a5fa' : '#ffffff';

        return (
            <group position={[0, height / 2, 0]}>
                {/* Building Podium / Foundation */}
                <mesh position={[0, -height / 2 - 0.4, 0]} receiveShadow>
                    <boxGeometry args={[width + 4, 0.8, depth + 4]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
                    <Edges threshold={15}><meshBasicMaterial color="#3b82f6" transparent opacity={0.3} /></Edges>
                </mesh>

                {/* Building Base / Site Area */}
                <mesh position={[0, -height / 2 - 0.9, 0]} receiveShadow>
                    <boxGeometry args={[width + 12, 0.2, depth + 12]} />
                    <meshStandardMaterial color="#f1f5f9" />
                    <Edges threshold={15}><meshBasicMaterial color="#3b82f6" transparent opacity={0.1} /></Edges>
                </mesh>

                {/* Landscaping / Trees - Hidden or Faded in Floor Mode */}
                {!isFloorMode && [...Array(12)].map((_, i) => {
                    const x = (i % 2 === 0 ? 1 : -1) * (width/2 + THREE.MathUtils.randFloat(2, 6));
                    const z = THREE.MathUtils.randFloat(-depth/2 - 10, depth/2 + 10);
                    const scale = THREE.MathUtils.randFloat(0.8, 1.5);
                    return (
                        <group key={i} position={[x, -height/2, z]} scale={scale}>
                            <mesh position={[0, 0.5, 0]}>
                                <cylinderGeometry args={[0.05, 0.1, 1]} />
                                <meshStandardMaterial color="#451a03" />
                            </mesh>
                            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                                <mesh position={[0, 1.2, 0]}>
                                    <sphereGeometry args={[0.5, 12, 12]} />
                                    <meshStandardMaterial color="#065f46" roughness={0.6} />
                                </mesh>
                            </Float>
                        </group>
                    );
                })}

                {/* Building Core (Elevator/Stairs) */}
                <mesh position={[0, 0, -depth / 2 + 0.5]}>
                    <boxGeometry args={[width * 0.4, height, 1]} />
                    <meshStandardMaterial color="#e2e8f0" transparent opacity={isFloorMode ? 0.3 : 1} />
                    <Edges threshold={15}><meshBasicMaterial color="#94a3b8" transparent opacity={isFloorMode ? 0.2 : 0.6} /></Edges>
                </mesh>

                {/* Rooftop Structure */}
                {!isFloorMode && (
                    <mesh position={[0, height / 2 + 0.45, 0]}>
                        <boxGeometry args={[width * 0.6, 0.8, depth * 0.6]} />
                        <meshStandardMaterial color="#cbd5e1" />
                        <Edges threshold={15}><meshBasicMaterial color="#94a3b8" /></Edges>
                    </mesh>
                )}

                {/* Horizontal Floor Plates */}
                {floorOrder.map((f, i) => (
                    <group key={f} position={[0, (i * 2.6) - (height / 2) + 0.1, 0]}>
                        <mesh>
                            <boxGeometry args={[width - 0.1, 0.05, depth - 0.1]} />
                            <meshStandardMaterial 
                                color="#ffffff" 
                                transparent 
                                opacity={isFloorMode ? (f === selectedFloor ? 0.3 : 0.05) : 0.2} 
                            />
                        </mesh>
                        {/* Floor Level Label */}
                        {!isFloorMode && (
                            <Html position={[width / 2 + 1, 0, depth / 2]} center>
                                <div className="px-3 py-1 bg-white/50 backdrop-blur-md rounded-full border border-slate-200 shadow-sm pointer-events-none">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">LVL {f}</span>
                                </div>
                            </Html>
                        )}
                    </group>
                ))}

                {/* Structural Glass Shell with Window Pattern */}
                <mesh>
                    <boxGeometry args={[width, height, depth]} />
                    <meshPhysicalMaterial 
                        transparent 
                        opacity={isFloorMode ? 0.05 : 0.15} 
                        transmission={0.4} 
                        thickness={1} 
                        roughness={0.2} 
                        color={color}
                        map={windowTexture}
                        envMapIntensity={1}
                    />
                    <Edges scale={1.001} threshold={15}>
                        <meshBasicMaterial color="#3b82f6" transparent opacity={isFloorMode ? 0.1 : 0.4} />
                    </Edges>
                </mesh>

                {/* COMMERCIAL SPECIALIZATION: Helipad & Billboards */}
                {projectType === 'COMMERCIAL' && !isFloorMode && (
                    <group>
                        {/* ROOFTOP HELIPAD */}
                        <group position={[0, height / 2 + 0.1, 0]}>
                            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                                <circleGeometry args={[depth / 3, 32]} />
                                <meshStandardMaterial color="#334155" />
                            </mesh>
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                                <ringGeometry args={[depth / 3.5, depth / 3.2, 32]} />
                                <meshBasicMaterial color="#ffffff" />
                            </mesh>
                            <Text
                                position={[0, 0.1, 0]}
                                fontSize={depth / 6}
                                color="#ffffff"
                                rotation={[-Math.PI / 2, 0, 0]}
                            >
                                H
                            </Text>
                        </group>
                        
                        {/* DIGITAL BILLBOARDS */}
                        <group position={[width / 2 + 0.1, height / 3, 0]} rotation={[0, Math.PI / 2, 0]}>
                            <mesh>
                                <planeGeometry args={[depth * 0.8, height / 4]} />
                                <meshStandardMaterial color="#1e1b4b" emissive="#3b82f6" emissiveIntensity={2} />
                            </mesh>
                            <Text
                                position={[0, 0, 0.05]}
                                fontSize={0.8}
                                color="#ffffff"
                                maxWidth={depth * 0.7}
                            >
                                PREMIUM OFFICE SPACE
                            </Text>
                        </group>
                    </group>
                )}

                {/* Tech Scan Line - Only in full building mode */}
                {!isFloorMode && (
                    <mesh ref={scanRef}>
                        <boxGeometry args={[width + 0.5, 0.1, depth + 0.5]} />
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
                    </mesh>
                )}

                {/* PROJECT IDENTITY LABEL - Floating 3D Title */}
                {!isFloorMode && projectName && (
                    <group position={[0, height / 2 + 3, 0]}>
                         <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
                            <Text
                                fontSize={1.2}
                                color="#1e293b"
                                anchorX="center"
                                anchorY="middle"
                                maxWidth={width}
                                textAlign="center"
                            >
                                {projectName.toUpperCase()}
                            </Text>
                            <mesh position={[0, -1, 0]}>
                                <boxGeometry args={[width * 0.3, 0.05, 0.1]} />
                                <meshBasicMaterial color="#3b82f6" />
                            </mesh>
                         </Float>
                    </group>
                )}

                {/* Vertical Support Beams - Persistent Context */}
                {[-width/2, width/2].map((x, i) => (
                    [-depth/2, depth/2].map((z, j) => (
                        <mesh key={`${i}-${j}`} position={[x, 0, z]}>
                            <boxGeometry args={[0.15, height, 0.15]} />
                            <meshStandardMaterial color="#94a3b8" transparent opacity={isFloorMode ? 0.05 : 1} />
                        </mesh>
                    ))
                ))}

                {/* Highlight Selected Floor Interaction Zone */}
                <mesh position={[0, (floorOrder.indexOf(selectedFloor) * 2.6) - (height / 2) + 1.3, 0]}>
                    <boxGeometry args={[width + 0.2, 2.6, depth + 0.2]} />
                    <meshBasicMaterial color="#3b82f6" transparent opacity={isFloorMode ? 0.02 : 0.08} />
                    <Edges scale={1.002} threshold={15}>
                        <meshBasicMaterial color="#2563eb" transparent opacity={isFloorMode ? 0.1 : 0.6} />
                    </Edges>
                </mesh>
            </group>
        );
    }

    if (projectType === 'VILLA' || projectType === 'PLOT') {
        const isFloorMode = viewMode === 'floor';
        return (
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                    <planeGeometry args={[200, 200]} />
                    <meshStandardMaterial color="#f8fafc" roughness={1} />
                </mesh>
                <gridHelper args={[200, 40, '#cbd5e1', '#f1f5f9']} position={[0, 0.02, 0]} />
                
                {/* Site Roads & Boundaries */}
                {!isFloorMode && (
                    <group>
                        {/* Main Road Loop */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
                            <ringGeometry args={[65, 75, 64]} />
                            <meshStandardMaterial color="#1e293b" roughness={0.9} />
                        </mesh>
                        
                        {/* AMENITIES: CRYSTAL POOL & EDEN GARDENS */}
                        <group position={[45, 0.1, -45]}>
                            {/* Pool */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                                <boxGeometry args={[25, 15, 0.1]} />
                                <meshPhysicalMaterial color="#3b82f6" transmission={0.5} thickness={1} roughness={0} />
                            </mesh>
                            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
                                <boxGeometry args={[27, 17, 0.5]} />
                                <meshStandardMaterial color="#e2e8f0" />
                            </mesh>
                        </group>

                        <group position={[-45, 0.1, 45]}>
                            {/* Garden Patch */}
                            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                                <planeGeometry args={[30, 30]} />
                                <meshStandardMaterial color="#10b981" roughness={0.9} />
                            </mesh>
                        </group>
                        
                        {/* Street Lights - Small glowing spheres along the road */}
                        {[...Array(12)].map((_, i) => {
                            const angle = (i / 12) * Math.PI * 2;
                            const x = Math.cos(angle) * 70;
                            const z = Math.sin(angle) * 70;
                            return (
                                <group key={i} position={[x, 0, z]}>
                                    <mesh position={[0, 2.5, 0]}>
                                        <cylinderGeometry args={[0.05, 0.05, 5]} />
                                        <meshStandardMaterial color="#475569" />
                                    </mesh>
                                    <mesh position={[0, 5, 0]}>
                                        <sphereGeometry args={[0.2, 8, 8]} />
                                        <meshBasicMaterial color="#fbbf24" />
                                    </mesh>
                                    <pointLight position={[0, 5, 0]} intensity={0.5} distance={10} color="#fbbf24" />
                                </group>
                            );
                        })}

                        {/* Site Boundary Pulse */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                            <planeGeometry args={[130, 130]} />
                            <Edges threshold={15}>
                                <meshBasicMaterial color="#3b82f6" transparent opacity={0.3}/>
                            </Edges>
                            <meshBasicMaterial color="#3b82f6" transparent opacity={0.01} />
                        </mesh>
                        
                        {/* Site Amenity Callouts */}
                        <group position={[40, 0, 40]}>
                            <Html distanceFactor={15}>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg mb-2">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12.75L11.25 15L15 9.75M21 12c0 1.25-.2 2.44-.57 3.54 -1.33 4.88-5.62 8.46-10.43 8.46 -4.81 0-9.1-3.58-10.43-8.46C.2 14.44 0 13.25 0 12c0-5.17 3.58-9.46 8.46-10.43C9.56.2 10.75 0 12 0s2.44.2 3.54.57c4.88 1.33 8.46 5.62 8.46 10.43z" /></svg>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-white/50 backdrop-blur-md px-2 py-1 rounded-md">Main Security</span>
                                </div>
                            </Html>
                        </group>

                        <group position={[-40, 0, -40]}>
                            <Html distanceFactor={15}>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg mb-2">
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A4.833 4.833 0 0118 9a4.833 4.833 0 01-1.5 1.332V21h-9V10.332A4.833 4.833 0 016 9a4.833 4.833 0 01-1.5 1.332V21H3v-3.375c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125V21" /></svg>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap bg-white/50 backdrop-blur-md px-2 py-1 rounded-md">Clubhouse</span>
                                </div>
                            </Html>
                        </group>
                        
                        {/* Decorative Vehicles on Road */}
                        {[...Array(8)].map((_, i) => (
                            <group key={i} rotation={[0, (i * Math.PI / 4) + 0.5, 0]} position={[0, 0.1, 0]}>
                                <mesh position={[70, 0.25, 0]}>
                                    <boxGeometry args={[2.5, 0.8, 1.2]} />
                                    <meshStandardMaterial color={i % 2 === 0 ? "#3b82f6" : "#ef4444"} />
                                    <mesh position={[0.8, 0.3, 0]}>
                                        <boxGeometry args={[1, 0.6, 1]} />
                                        <meshStandardMaterial color="#ffffff" transparent opacity={0.7} />
                                    </mesh>
                                </mesh>
                            </group>
                        ))}
                    </group>
                )}
            </group>
        );
    }

    if (projectType === 'INDUSTRIAL') {
        const width = 45;
        const depth = 30;
        const height = 10;
        return (
            <group position={[0, height / 2, 0]}>
                {/* Warehouse Main Body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[width, height, depth]} />
                    <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.8} />
                    <Edges threshold={15}><meshBasicMaterial color="#334155" /></Edges>
                </mesh>
                {/* Corrugated Roof Slant */}
                <group position={[0, height / 2, 0]}>
                    <mesh rotation={[0.1, 0, 0]} position={[0, 1.5, 0]}>
                        <boxGeometry args={[width + 2, 0.5, depth / 2 + 1]} />
                        <meshStandardMaterial color="#334155" />
                    </mesh>
                    <mesh rotation={[-0.1, 0, 0]} position={[0, 1.5, 0]}>
                        <boxGeometry args={[width + 2, 0.5, depth / 2 + 1]} />
                        <meshStandardMaterial color="#334155" />
                    </mesh>
                </group>
                {/* Large Industrial Doors */}
                {[-10, 0, 10].map((x, i) => (
                    <mesh key={i} position={[x, -height/2 + 2, depth/2 + 0.1]}>
                        <planeGeometry args={[6, 4]} />
                        <meshStandardMaterial color="#94a3b8" />
                    </mesh>
                ))}
            </group>
        );
    }

    return null;
}

// ─── Environment ─────────────────────────────────────────────────────────────
function SceneAtmosphere({ camY }: { camY: number }) {
    return (
        <group position={[0, -0.1, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[300, 300]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
            </mesh>
            <gridHelper args={[300, 150, '#e2e8f0', '#cbd5e1']} position={[0, 0.05, 0]} />

            {/* Subtle Aura Glows */}
            <mesh position={[40, 0, -40]}>
                <sphereGeometry args={[40, 32, 32]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.02} side={THREE.BackSide} />
            </mesh>
            <mesh position={[-40, 0, 40]}>
                <sphereGeometry args={[45, 32, 32]} />
                <meshBasicMaterial color="#6366f1" transparent opacity={0.02} side={THREE.BackSide} />
            </mesh>
        </group>
    );
}

// ─── Cloud Layer ─────────────────────────────────────────────────────────────
function CloudLayer() {
    return (
        <group position={[0, 80, 0]}>
            <Clouds material={THREE.MeshBasicMaterial}>
                <Cloud seed={1} bounds={[100, 20, 100]} color="#ffffff" opacity={0.3} position={[0, 0, 0]} speed={0.2} segments={20}/>
                <Cloud seed={2} bounds={[100, 20, 100]} color="#f1f5f9" opacity={0.2} position={[50, -10, -50]} speed={0.3} segments={15}/>
            </Clouds>
        </group>
    );
}

// ─── Main Scene Export ───────────────────────────────────────────────────────
export default function UnitCanvas3D({
    units,
    projectType,
    projectName,
    selectedId,
    onUnitClick,
    viewMode,
    selectedFloor,
}: {
    units: PropertyUnit[];
    projectType: ProjectType;
    projectName?: string;
    selectedId: string | null;
    onUnitClick: (unit: PropertyUnit) => void;
    viewMode: 'building' | 'floor';
    selectedFloor: number;
}) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const floorOrder = useMemo(
        () => [...new Set(units.map(u => u.floor ?? 1))].sort((a, b) => a - b),
        [units]
    );

    const camY = useMemo(() => {
        if (viewMode === 'floor' || projectType === 'VILLA' || projectType === 'PLOT') return 5;
        return (floorOrder.length * 2.6) / 2;
    }, [viewMode, floorOrder, projectType]);

    if (units.length === 0) return null;

    return (
        <Canvas
            shadows={{ type: THREE.PCFShadowMap }}
            dpr={[1, 2]}
            camera={{ position: [30, camY + 25, 30], fov: 35 }}
            gl={{ antialias: true, alpha: true }}
            style={{ pointerEvents: 'auto', background: 'transparent' }}
            onPointerMissed={() => setHoveredId(null)}
        >
            <color attach="background" args={['#f8fafc']} />

            {/* Bright, Clear Lighting for Maximum Visibility */}
            <ambientLight intensity={1.2} />
            <spotLight
                position={[40, 60, 40]}
                angle={0.25}
                penumbra={1}
                intensity={2}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <pointLight position={[-30, 30, -30]} intensity={0.7} color="#bfdbfe" />
            <pointLight position={[30, 25, 30]} intensity={0.5} color="#fecaca" />

            <SceneAtmosphere camY={camY} />

            <Environment preset="city" />
            <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Moving Clouds */}
            <CloudLayer />

            <BuildingShell 
                units={units} 
                projectType={projectType} 
                projectName={projectName}
                selectedFloor={selectedFloor} 
                viewMode={viewMode}
            />

            {/* FLOATING COMPASS */}
            <group position={[-20, 0, -20]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[1.8, 2, 32]} />
                    <meshBasicMaterial color="#94a3b8" />
                </mesh>
                <mesh position={[0, 0.1, -1.8]}>
                    <coneGeometry args={[0.2, 0.6, 4]} />
                    <meshBasicMaterial color="#ef4444" />
                </mesh>
                <Text
                    position={[0, 0.1, -2.5]}
                    fontSize={0.6}
                    color="#ef4444"
                    rotation={[-Math.PI / 2, 0, 0]}
                >
                    N
                </Text>
            </group>

            <UnitInstances
                units={units}
                projectType={projectType}
                hoveredId={hoveredId}
                selectedId={selectedId}
                onHover={setHoveredId}
                onSelect={onUnitClick}
                viewMode={viewMode}
                selectedFloor={selectedFloor}
            />

            <ContactShadows resolution={1024} scale={100} blur={2} opacity={0.15} far={40} color="#475569" />

            <OrbitControls
                enableDamping
                dampingFactor={0.07}
                target={[0, camY, 0]}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={15}
                maxDistance={150}
                makeDefault
            />
        </Canvas>
    );
}
