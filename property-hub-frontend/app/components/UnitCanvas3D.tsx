'use client';

import React, { useRef, useMemo, useCallback, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment, Float, Sky, Html, Text, Clouds, Cloud, Edges, Billboard, RoundedBox, Center, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { UnitStatus } from '@/app/services/unitService';
import { ProjectType } from '@/app/services/propertyService';
import { Tower, SlimUnit } from '@/app/services/explorerService';

// ─── Status Colors (Vibrant Aura Bloom Palette - Light Mode Optimized) ───────
const STATUS_COLORS: Record<UnitStatus, { color: string; emissive: string }> = {
    AVAILABLE: { color: '#64748b', emissive: '#475569' }, // Gray for available status (formerly draft)
    RESERVED: { color: '#fbbf24', emissive: '#d97706' }, // Amber
    BOOKED: { color: '#f97316', emissive: '#ea580c' }, // Orange
    SOLD: { color: '#f43f5e', emissive: '#e11d48' }, // Rose
};

interface GlobalUnitPoolProps {
    units: SlimUnit[];
    towerIds: string[];
    globalFloorOrder: number[];
    projectType: ProjectType;
    hoveredId: string | null;
    selectedId: string | null;
    onHover: (id: string | null) => void;
    onSelect: (unitId: string) => void;
    viewMode: 'building' | 'floor';
    selectedFloor: number;
}

// ─── Individual Unit Component ─────────────────────────────────────────────
interface UnitBoxProps {
    unit: SlimUnit;
    position: [number, number, number];
    isHovered: boolean;
    isSelected: boolean;
    onHover: (id: string | null) => void;
    onSelect: (id: string) => void;
    projectType: ProjectType;
}

function UnitBox({ unit, position, isHovered, isSelected, onHover, onSelect, projectType }: UnitBoxProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { color } = STATUS_COLORS[unit.status];

    useFrame((state) => {
        if (!meshRef.current) return;
        const targetScale = isHovered ? 1.2 : isSelected ? 1.1 : 1.0;
        meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
        if (isHovered) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 4) * 0.1;
        } else {
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.15);
        }
    });

    const isPlot = projectType === 'PLOT';

    return (
        <RoundedBox 
            ref={meshRef}
            args={[isPlot ? 2.4 : 2, isPlot ? 0.2 : 2, 2]} 
            radius={0.1} 
            smoothness={4}
            position={position}
            onClick={(e: any) => { e.stopPropagation(); onSelect(unit.id); }}
            onPointerOver={(e: any) => { e.stopPropagation(); onHover(unit.id); }}
            onPointerOut={() => onHover(null)}
            castShadow
        >
            <meshStandardMaterial 
                color={isHovered ? '#ffffff' : color} 
                metalness={0.6} 
                roughness={0.4} 
                transparent 
                opacity={0.85}
                emissive={isHovered ? '#60a5fa' : color}
                emissiveIntensity={isHovered ? 0.5 : 0.1}
            />
            {isHovered && <Edges color="#3b82f6" />}
        </RoundedBox>
    );
}

// ─── World Layout Organizer ────────────────────────────────────────────────
function WorldUnits({ 
    units, 
    towerIds, 
    globalFloorOrder, 
    projectType, 
    hoveredId, 
    selectedId, 
    onHover, 
    onSelect, 
    viewMode, 
    selectedFloor 
}: GlobalUnitPoolProps) {
    const towerSpacing = 50;

    return (
        <Center top>
            <group>
                {towerIds.map((tId, towerIdx) => {
                    const towerOffsetX = (towerIdx - (towerIds.length - 1) / 2) * towerSpacing;
                    
                    // Robust tower filtering: match specific ID or default to the first tower for unassigned units
                    const towerUnits = units.filter(u => {
                        const unitTId = u.towerId || towerIds[0] || 'default';
                        return unitTId === tId;
                    });

                    // Filter by floor if in floor view
                    const visibleUnits = viewMode === 'floor' 
                        ? towerUnits.filter(u => (u.floor ?? 1) === selectedFloor)
                        : towerUnits;

                    return (
                        <group key={tId} position={[towerOffsetX, 0, 0]}>
                            {visibleUnits.map((unit) => {
                                const f = unit.floor ?? 1;
                                const floorIdx = globalFloorOrder.indexOf(f);
                                const y = (floorIdx === -1 ? 0 : floorIdx) * 2.6 + 1.3;

                                let x = 0, z = 0;
                                // Use ID-based finding to avoid referential equality bugs with indexOf
                                const floorUnits = towerUnits.filter(u => (u.floor ?? 1) === f);
                                const idxInFloor = floorUnits.findIndex(u => u.id === unit.id);

                                if (projectType === 'PLOT' || projectType === 'VILLA') {
                                    const spacing = projectType === 'VILLA' ? 5 : 3.0;
                                    const cols = Math.ceil(Math.sqrt(towerUnits.length));
                                    const idxInTower = towerUnits.findIndex(u => u.id === unit.id);
                                    x = (idxInTower % cols) * spacing - ((cols - 1) / 2) * spacing;
                                    z = Math.floor(idxInTower / cols) * spacing - (Math.ceil(towerUnits.length / cols) / 2) * spacing;
                                } else if (viewMode === 'floor') {
                                    const cols = Math.ceil(Math.sqrt(floorUnits.length));
                                    x = (idxInFloor % cols) * 2.6 - ((cols - 1) / 2) * 2.6;
                                    z = Math.floor(idxInFloor / cols) * 2.6 - (Math.ceil(floorUnits.length / cols) / 2) * 2.6;
                                } else {
                                    // Default Apartment/Commercial horizontal layout
                                    x = idxInFloor * 2.6 - ((floorUnits.length - 1) / 2) * 2.6;
                                    z = 0;
                                }

                                return (
                                    <UnitBox
                                        key={unit.id}
                                        unit={unit}
                                        position={[x, y, z]}
                                        isHovered={unit.id === hoveredId}
                                        isSelected={unit.id === selectedId}
                                        onHover={onHover}
                                        onSelect={onSelect}
                                        projectType={projectType}
                                    />
                                );
                            })}
                        </group>
                    );
                })}
            </group>
        </Center>
    );
}

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
            const scanPosition = Math.sin(clock.elapsedTime * 0.5) * (height / 2);
            scanRef.current.position.y = scanPosition;
        }
    });

    const isFloorMode = viewMode === 'floor';

    if (projectType === 'APARTMENT' || projectType === 'COMMERCIAL') {
        const width = maxUnitsInFloor * 2.6 + 1;
        const depth = 4;

        return (
            <group position={[position[0], height / 2, position[2]]}>
                {/* Building Podium / Foundation */}
                <RoundedBox position={[0, -height / 2 - 0.4, 0]} args={[width + 4, 0.8, depth + 4]} radius={0.2} receiveShadow>
                    <meshStandardMaterial color="#cbd5e1" roughness={0.7} />
                    <Edges threshold={15}><meshBasicMaterial color="#3b82f6" transparent opacity={0.3} /></Edges>
                </RoundedBox>

                {/* Building Core (Elevator/Stairs) */}
                <RoundedBox position={[0, 0, -depth / 2 + 0.5]} args={[width * 0.4, height, 1]} radius={0.1}>
                    <meshStandardMaterial color="#e2e8f0" transparent opacity={isFloorMode ? 0.3 : 0.8} />
                    <Edges threshold={15}><meshBasicMaterial color="#94a3b8" transparent opacity={isFloorMode ? 0.1 : 0.4} /></Edges>
                </RoundedBox>

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
                        {!isFloorMode && (
                            <Html position={[side === 'right' ? width / 2 + 1.5 : -width / 2 - 1.5, 0, 0]} center>
                                <div className="px-2 py-0.5 bg-white/80 backdrop-blur-md rounded-full border border-blue-200 shadow-md pointer-events-none">
                                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider whitespace-nowrap">LVL {f}</span>
                                </div>
                            </Html>
                        )}
                    </group>
                ))}

                {/* Structural Glass Shell */}
                <RoundedBox args={[width, height, depth]} radius={0.1}>
                    <meshStandardMaterial 
                        transparent 
                        opacity={isFloorMode ? 0.05 : 0.15} 
                        roughness={0.05} 
                        metalness={0.9}
                        color="#bae6fd"
                    />
                    <Edges scale={1.001} threshold={15}>
                        <meshBasicMaterial color="#60a5fa" transparent opacity={isFloorMode ? 0.1 : 0.5} />
                    </Edges>
                </RoundedBox>

                {/* Tech Scan Line */}
                {!isFloorMode && (
                    <mesh ref={scanRef}>
                        <boxGeometry args={[width + 0.5, 0.1, depth + 0.5]} />
                        <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
                    </mesh>
                )}

                {!isFloorMode && name && (
                    <group position={[0, height / 2 + 3, 0]}>
                         <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
                            <Billboard>
                                <Text fontSize={1.2} color="#1e293b" anchorX="center" anchorY="middle" maxWidth={width} textAlign="center">
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
                {/* GLOBAL GROUND MANAGED BY SceneAtmosphere */}
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
                    const towerUnits = units.filter(u => {
                        const unitTId = u.towerId || towerIds[0] || 'default';
                        return unitTId === tId;
                    });
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
                {/* GLOBAL GROUND MANAGED BY SceneAtmosphere */}
                
                {/* Site Roads & Boundaries */}
                {!isFloorMode && (
                    <group>
                        {/* Main Road Loop */}
                        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
                            <ringGeometry args={[65, 75, 64]} />
                            <meshStandardMaterial color="#1e293b" roughness={0.9} />
                        </mesh>
                        

                        
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
                <RoundedBox args={[width, height, depth]} radius={0.5} castShadow receiveShadow>
                    <meshStandardMaterial color="#64748b" metalness={0.2} roughness={0.8} />
                    <Edges threshold={15}><meshBasicMaterial color="#334155" /></Edges>
                </RoundedBox>
                {/* Corrugated Roof */}
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
                {/* Industrial Doors */}
                {[-10, 0, 10].map((x, i) => (
                    <mesh key={i} position={[x, -height/2 + 2, depth/2 + 0.01]}>
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
    const groundColor = '#f8fafc';
    return (
        <group position={[0, -0.4, 0]}>
            {/* Seamless Large Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <circleGeometry args={[800, 64]} />
                <meshStandardMaterial color={groundColor} roughness={0.8} />
            </mesh>
            
            {/* Professional Endless Grid from Drei */}
            <Grid 
                args={[100, 100]} 
                sectionSize={12} 
                sectionColor="#3b82f6" 
                sectionThickness={1.5} 
                cellColor="#cbd5e1" 
                cellThickness={0.6} 
                fadeDistance={100} 
                fadeStrength={5} 
                infiniteGrid 
                position={[0, 0.05, 0]} 
            />

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
            <fog attach="fog" args={['#f8fafc', 30, 300]} />

            {/* Bright, Clear Lighting for Maximum Visibility */}
            <ambientLight intensity={1.2} />
            <spotLight
                position={[40, 60, 40]}
                angle={0.25}
                penumbra={1}
                intensity={2}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={200}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />
            <pointLight position={[-30, 30, -30]} intensity={0.7} color="#bfdbfe" />
            <pointLight position={[30, 25, 30]} intensity={0.5} color="#fecaca" />

            <SceneAtmosphere camY={camY} />

            <Suspense fallback={null}>
                <Environment files="/environments/warehouse.hdr" />
            </Suspense>
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

            {/* DECLARATIVE WORLD UNITS - Simple and maintainable */}
            <WorldUnits
                units={units}
                towerIds={towerIds}
                globalFloorOrder={floorOrder}
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
