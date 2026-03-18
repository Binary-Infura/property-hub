'use client';

import React, { useRef, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float, Sky, Html, Text, Clouds, Cloud, Edges, Billboard, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { UnitStatus } from '@/app/services/unitService';
import { ProjectType } from '@/app/services/propertyService';
import { Tower, SlimUnit } from '@/app/services/explorerService';

// ─── Status Colors (Vibrant Aura Bloom Palette - Light Mode Optimized) ───────
const STATUS_COLORS: Record<UnitStatus, { color: string; emissive: string }> = {
    DRAFT: { color: '#64748b', emissive: '#475569' }, // Gray for draft
    RESERVED: { color: '#fbbf24', emissive: '#d97706' }, // Amber
    BOOKED: { color: '#f97316', emissive: '#ea580c' }, // Orange
    SOLD: { color: '#f43f5e', emissive: '#e11d48' }, // Rose
};

// ─── Unit Item Component ───────────────────────────────────────────────────
interface UnitInstancesProps {
    units: SlimUnit[];
    towers: Tower[];
    projectType: ProjectType;
    hoveredId: string | null;
    selectedId: string | null;
    onHover: (id: string | null) => void;
    onSelect: (unitId: string) => void;
    viewMode: 'building' | 'floor';
    selectedFloor: number;
}

function UnitInstances({
    units,
    towers,
    towerIds,
    projectType,
    hoveredId,
    selectedId,
    onHover,
    onSelect,
    viewMode,
    selectedFloor,
}: UnitInstancesProps & { towerIds: string[] }) {
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

    const unitsByTowerAndFloor = useMemo(() => {
        const map: Record<string, Record<number, SlimUnit[]>> = {};
        for (const u of units) {
            const tId = u.towerId || towerIds[0] || 'default';
            const f = u.floor ?? 1;
            map[tId] = map[tId] ?? {};
            map[tId][f] = map[tId][f] ?? [];
            map[tId][f].push(u);
        }
        return map;
    }, [units, towerIds]);

    const towerSpacing = 50;

    // Cache base matrices for static positioning
    const baseMatrices = useMemo(() => {
        const floorOrder = [...new Set(units.map(u => u.floor ?? 1))].sort((a, b) => a - b);
        const matrices: THREE.Matrix4[] = [];

        displayed.forEach(u => {
            const tId = u.towerId || towerIds[0] || 'default';
            const towerIdx = Math.max(0, towerIds.indexOf(tId));
            const towerOffsetX = (towerIdx - (towerIds.length - 1) / 2) * towerSpacing;
            const f = u.floor ?? 1;
            const m = new THREE.Matrix4();

            let x = 0, y = 0, z = 0;
            if (projectType === 'PLOT' || projectType === 'VILLA') {
                const spacing = projectType === 'VILLA' ? 5 : 3.0;
                const towerUnits = units.filter(unit => (unit.towerId || towerIds[0] || 'default') === tId);
                const idx = towerUnits.indexOf(u);
                const cols = Math.ceil(Math.sqrt(Math.max(towerUnits.length, 1)));
                x = (idx % cols) * spacing - ((cols - 1) / 2) * spacing;
                z = Math.floor(idx / cols) * spacing - (Math.ceil(towerUnits.length / cols) / 2) * spacing;
                y = projectType === 'PLOT' ? 0.1 : 1.3;
            } else if (viewMode === 'floor') {
                const towerFloorUnits = unitsByTowerAndFloor[tId]?.[f] || [];
                const idx = towerFloorUnits.indexOf(u);
                const cols = Math.ceil(Math.sqrt(Math.max(towerFloorUnits.length, 1)));
                x = (idx % cols) * 2.6 - ((cols - 1) / 2) * 2.6;
                z = Math.floor(idx / cols) * 2.6 - (Math.ceil(towerFloorUnits.length / cols) / 2) * 2.6;
                y = floorOrder.indexOf(f) * 2.6 + 1.3;
            } else {
                const towerFloorUnits = unitsByTowerAndFloor[tId]?.[f] || [];
                const idx = towerFloorUnits.indexOf(u);
                x = idx * 2.6 - ((towerFloorUnits.length - 1) / 2) * 2.6;
                y = floorOrder.indexOf(f) * 2.6 + 1.3;
                z = 0;
            }
            m.setPosition(x + towerOffsetX, y, z);
            matrices.push(m);
        });
        return matrices;
    }, [displayed, units, viewMode, unitsByTowerAndFloor, towerIds, projectType]);


    return (
        <Instances range={displayed.length}>
            <boxGeometry args={[projectType === 'PLOT' ? 2.4 : 2, projectType === 'PLOT' ? 0.2 : 2, 2]} />
            <meshStandardMaterial metalness={0.7} roughness={0.3} transparent opacity={0.8} />
            {displayed.map((unit, i) => (
                <UnitItem 
                    key={unit.id}
                    unit={unit}
                    index={i}
                    baseMatrix={baseMatrices[i]}
                    isHovered={unit.id === hoveredId}
                    isSelected={unit.id === selectedId}
                    onHover={onHover}
                    onSelect={onSelect}
                    projectType={projectType}
                />
            ))}
        </Instances>
    );
}

function UnitItem({ unit, index, baseMatrix, isHovered, isSelected, onHover, onSelect, projectType }: {
    unit: SlimUnit;
    index: number;
    baseMatrix: THREE.Matrix4;
    isHovered: boolean;
    isSelected: boolean;
    onHover: (id: string | null) => void;
    onSelect: (unitId: string) => void;
    projectType: ProjectType;
}) {
    const ref = useRef<any>(null);
    const pos = useMemo(() => new THREE.Vector3().setFromMatrixPosition(baseMatrix), [baseMatrix]);
    
    useFrame((state) => {
        if (!ref.current) return;
        
        const targetScale = isHovered ? 1.25 : isSelected ? 1.15 : 1.0;
        ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.2);
        
        const bob = isHovered ? Math.sin(state.clock.elapsedTime * 6) * (projectType === 'PLOT' ? 0.3 : 0.08) : 0;
        ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, pos.y + bob, 0.2);
        
        if (isHovered && projectType !== 'PLOT') {
            ref.current.rotation.y += 0.02;
        } else {
            ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.1);
        }
        
        const color = new THREE.Color(STATUS_COLORS[unit.status].color);
        if (isHovered) color.lerp(new THREE.Color('#ffffff'), 0.3);
        ref.current.color.lerp(color, 0.2);
    });

    return (
        <Instance
            ref={ref}
            position={pos}
            onClick={(e) => { e.stopPropagation(); onSelect(unit.id); }}
            onPointerOver={(e) => { e.stopPropagation(); onHover(unit.id); }}
            onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
        />
    );
}

// ─── Single Tower Shell Component ──────────────────────────────────────────
function SingleTowerShell({
    units,
    projectType,
    selectedFloor,
    viewMode,
    name,
    position = [0, 0, 0],
    side = 'right'
}: {
    units: SlimUnit[];
    projectType: ProjectType;
    selectedFloor: number;
    viewMode: 'building' | 'floor';
    name?: string;
    position?: [number, number, number];
    side?: 'left' | 'right';
}) {
    const scanRef = useRef<THREE.Mesh>(null);
    
    // Create a realistic window grid texture for the building shell
    const windowTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        // Dark glass base
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 256, 256);
        
        const cols = 6;
        const rows = 10;
        const w = 256 / cols;
        const h = 256 / rows;
        const pad = 4;
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                // Randomize window brightness to give life to the facade
                const lit = Math.random() > 0.3;
                ctx.fillStyle = lit ? '#7dd3fc44' : '#1e293b66';
                ctx.fillRect(i * w + pad, j * h + pad, w - pad * 2, h - pad * 2);
                // Window frame
                ctx.strokeStyle = '#334155';
                ctx.lineWidth = 2;
                ctx.strokeRect(i * w + pad, j * h + pad, w - pad * 2, h - pad * 2);
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
        return Math.max(...Object.values(counts), 1);
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
            <group position={[position[0], height / 2, position[2]]}>
                {/* Building Podium / Foundation */}
                <mesh position={[0, -height / 2 - 0.4, 0]} receiveShadow>
                    <boxGeometry args={[width + 4, 0.8, depth + 4]} />
                    <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
                    <Edges threshold={15}><meshBasicMaterial color="#3b82f6" transparent opacity={0.3} /></Edges>
                </mesh>

                {/* Building Core (Elevator/Stairs) */}
                <mesh position={[0, 0, -depth / 2 + 0.5]}>
                    <boxGeometry args={[width * 0.4, height, 1]} />
                    <meshStandardMaterial color="#e2e8f0" transparent opacity={isFloorMode ? 0.3 : 1} />
                    <Edges threshold={15}><meshBasicMaterial color="#94a3b8" transparent opacity={isFloorMode ? 0.2 : 0.6} /></Edges>
                </mesh>

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
                        {/* Floor Level Label - side-placed based on tower position */}
                        {!isFloorMode && (
                            <Html position={[side === 'right' ? width / 2 + 1.5 : -width / 2 - 1.5, 0, 0]} center>
                                <div className="px-2 py-0.5 bg-white/80 backdrop-blur-md rounded-full border border-blue-200 shadow-md pointer-events-none">
                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider whitespace-nowrap">LVL {f}</span>
                                </div>
                            </Html>
                        )}
                    </group>
                ))}

                {/* Structural Glass Shell with Window Pattern */}
                <mesh>
                    <boxGeometry args={[width, height, depth]} />
                    <meshStandardMaterial 
                        transparent 
                        opacity={isFloorMode ? 0.05 : 0.18} 
                        roughness={0.05} 
                        metalness={0.5}
                        color="#1e3a5f"
                        map={windowTexture}
                    />
                    <Edges scale={1.001} threshold={15}>
                        <meshBasicMaterial color="#60a5fa" transparent opacity={isFloorMode ? 0.1 : 0.5} />
                    </Edges>
                </mesh>

                {/* Tech Scan Line - Only in full building mode */}
                {!isFloorMode && (
                    <mesh ref={scanRef}>
                        <boxGeometry args={[width + 0.5, 0.1, depth + 0.5]} />
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
                    </mesh>
                )}

                {/* TOWER IDENTITY LABEL - Billboarded to fix mirroring and always face camera */}
                {!isFloorMode && name && (
                    <group position={[0, height / 2 + 3, 0]}>
                         <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
                            <Billboard>
                                <Text
                                    fontSize={1.2}
                                    color="#1e293b"
                                    anchorX="center"
                                    anchorY="middle"
                                    maxWidth={width}
                                    textAlign="center"
                                >
                                    {name.toUpperCase()}
                                </Text>
                            </Billboard>
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
                {floorOrder.includes(selectedFloor) && (
                    <mesh position={[0, (floorOrder.indexOf(selectedFloor) * 2.6) - (height / 2) + 1.3, 0]}>
                        <boxGeometry args={[width + 0.2, 2.6, depth + 0.2]} />
                        <meshBasicMaterial color="#3b82f6" transparent opacity={isFloorMode ? 0.02 : 0.08} />
                        <Edges scale={1.002} threshold={15}>
                            <meshBasicMaterial color="#2563eb" transparent opacity={isFloorMode ? 0.1 : 0.6} />
                        </Edges>
                    </mesh>
                )}
            </group>
        );
    }
    return null;
}

// ─── Building Shell Component ──────────────────────────────────────────────
function BuildingShell({
    units,
    towers,
    towerIds,
    projectType,
    selectedFloor,
    viewMode,
    projectName
}: {
    units: SlimUnit[];
    towers: Tower[];
    towerIds: string[];
    projectType: ProjectType;
    selectedFloor: number;
    viewMode: 'building' | 'floor';
    projectName?: string;
}) {
    const isFloorMode = viewMode === 'floor';
    const towerSpacing = 50;

    if (projectType === 'APARTMENT' || projectType === 'COMMERCIAL') {
        return (
            <group>
                {/* Global Site Area with optimized grid */}
                <mesh position={[0, -0.9, 0]} receiveShadow>
                    <boxGeometry args={[150, 0.2, 60]} />
                    <meshStandardMaterial color="#f1f5f9" />
                    <Edges threshold={15}><meshBasicMaterial color="#3b82f6" transparent opacity={0.1} /></Edges>
                </mesh>

                {/* Shared Landscaping - Optimized placement */}
                {!isFloorMode && [...Array(24)].map((_, i) => {
                    const x = THREE.MathUtils.randFloat(-70, 70);
                    const z = (i % 2 === 0 ? 1 : -1) * THREE.MathUtils.randFloat(15, 25);
                    const scale = THREE.MathUtils.randFloat(0.8, 1.5);
                    return (
                        <group key={i} position={[x, 0, z]} scale={scale}>
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

                {towerIds.map((tId, idx) => {
                    const towerUnits = units.filter(u => (u.towerId || towerIds[0] || 'default') === tId);
                    const towerName = towers.find(t => t.id === tId)?.name || (towerIds.length > 1 ? `Tower ${idx + 1}` : projectName);
                    const towerOffsetX = (idx - (towerIds.length - 1) / 2) * towerSpacing;
                    const mid = (towerIds.length - 1) / 2;
                    
                    return (
                        <SingleTowerShell
                            key={tId}
                            units={towerUnits}
                            projectType={projectType}
                            selectedFloor={selectedFloor}
                            viewMode={viewMode}
                            name={towerName}
                            position={[towerOffsetX, 0, 0]}
                            side={idx < mid ? 'left' : 'right'}
                        />
                    );
                })}
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
    towers,
    projectType,
    projectName,
    selectedId,
    onUnitClick,
    viewMode,
    selectedFloor,
}: {
    units: SlimUnit[];
    towers: Tower[];
    projectType: ProjectType;
    projectName?: string;
    selectedId: string | null;
    onUnitClick: (unitId: string) => void;
    viewMode: 'building' | 'floor';
    selectedFloor: number;
}) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const towerIds = useMemo(() => {
        const sortedTowers = [...towers].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        const ids = sortedTowers.length > 0 
            ? sortedTowers.map(t => t.id) 
            : [...new Set(units.map(u => u.towerId).filter(id => !!id))].sort() as string[];

        return ids.length > 0 ? ids : ['default'];
    }, [towers, units]);

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
            shadows={{ type: THREE.BasicShadowMap }}
            dpr={[1, 1.5]}
            camera={{ position: [30, camY + 25, 30], fov: 35 }}
            gl={{ antialias: false, alpha: false, stencil: false, depth: true }}
            style={{ pointerEvents: 'auto', background: '#f8fafc' }}
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
            <Sky distance={450000} sunPosition={[100, 100, 20]} inclination={0.49} azimuth={0.25} />
            
            {/* Moving Clouds - Optimized */}
            <group position={[0, 80, 0]}>
                <Clouds material={THREE.MeshBasicMaterial}>
                    <Cloud seed={1} bounds={[100, 20, 100]} color="#ffffff" opacity={0.3} speed={0.2} segments={10}/>
                    <Cloud seed={2} bounds={[100, 20, 100]} color="#f1f5f9" opacity={0.2} position={[50, -10, -50]} speed={0.3} segments={8}/>
                </Clouds>
            </group>

            <BuildingShell 
                units={units} 
                towers={towers}
                towerIds={towerIds}
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
                key={`${towers.length}-${units.length}-${towerIds.join(',')}`}
                units={units}
                towers={towers}
                towerIds={towerIds}
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
