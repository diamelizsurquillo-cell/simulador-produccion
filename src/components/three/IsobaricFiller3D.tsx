import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import { playHoverTick } from '../../core/soundEffects';
import {
  getInternalLiquidGeometry,
  getSculptedPetBottleGeometry
} from './petBottleGeometry';

export function IsobaricFiller3D() {
  const carouselRef = useRef<THREE.Group>(null);
  const capperRef = useRef<THREE.Group>(null);
  const infeedStarRef = useRef<THREE.Group>(null);
  const transferStarRef = useRef<THREE.Group>(null);
  const wormScrewRef = useRef<THREE.Mesh>(null);
  const roofGroupRef = useRef<THREE.Group>(null);
  const bowlGroupRef = useRef<THREE.Group>(null);
  const liquidRefs = useRef<(THREE.Mesh | null)[]>([]);
  const foamRefs = useRef<(THREE.Mesh | null)[]>([]);

  const bottleShellGeo = useMemo(() => getSculptedPetBottleGeometry(), []);
  const liquidGeo = useMemo(() => getInternalLiquidGeometry(), []);

  const viewMode = useSimulationStore((s) => s.viewMode);
  const setViewMode = useSimulationStore((s) => s.setViewMode);
  const selectedMachineId = useSimulationStore((s) => s.selectedMachineId);
  const hoveredMachineId = useSimulationStore((s) => s.hoveredMachineId);
  const setHoveredMachine = useSimulationStore((s) => s.setHoveredMachine);
  const selectMachine = useSimulationStore((s) => s.selectMachine);

  const hoveredValveNumber = useSimulationStore((s) => s.hoveredValveNumber);
  const setHoveredValve = useSimulationStore((s) => s.setHoveredValve);
  const selectedValveNumber = useSimulationStore((s) => s.selectedValveNumber);
  const selectValve = useSimulationStore((s) => s.selectValve);

  const fillerResult = useSimulationStore((s) => s.fillerResult);
  const effectiveBpm = useSimulationStore((s) => s.lineDynamics.effectiveFillerBpm);
  const targetSpeedBpm = useSimulationStore((s) => s.targetSpeedBpm);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const operatorCompensatesSetpoint = useSimulationStore((s) => s.operatorCompensatesSetpoint);
  const setOperatorCompensates = useSimulationStore((s) => s.setOperatorCompensates);
  const applyDecisionOption = useSimulationStore((s) => s.applyDecisionOption);
  const setSapModalOpen = useSimulationStore((s) => s.setSapModalOpen);
  const soundEnabled = useSimulationStore((s) => s.soundEnabled);
  const paused = useSimulationStore((s) => s.paused);
  const simSpeed = useSimulationStore((s) => s.simSpeedMultiplier);

  const isXray = viewMode === 'rayos_x';
  const isCutaway = viewMode === 'corte';
  const isExploded = viewMode === 'despiece';
  const isSelected = selectedMachineId === 'llenadora';
  const isHovered = hoveredMachineId === 'llenadora';

  useFrame((_, delta) => {
    const freezeForValveClick = hoveredValveNumber !== null;
    if (!paused && effectiveBpm > 0 && !freezeForValveClick) {
      const omega = (effectiveBpm / 400) * 0.58 * Math.min(simSpeed, 8);
      if (carouselRef.current) carouselRef.current.rotation.y += delta * omega;
      if (capperRef.current) capperRef.current.rotation.y -= delta * omega * 2.4;
      if (infeedStarRef.current) infeedStarRef.current.rotation.y -= delta * omega * 2.8;
      if (transferStarRef.current) transferStarRef.current.rotation.y -= delta * omega * 2.8;
      if (wormScrewRef.current) wormScrewRef.current.rotation.x += delta * omega * 8.0;
    }

    // Progressive Real-Time Liquid Level Calculation around the 300° Filling Arc!
    if (carouselRef.current) {
      const rotY = carouselRef.current.rotation.y;
      const valvesState = useSimulationStore.getState().fillerResult.valves;
      const isFoamingSpeed = useSimulationStore.getState().targetSpeedBpm > 416;

      for (let i = 0; i < 40; i++) {
        const liqMesh = liquidRefs.current[i];
        const foamMesh = foamRefs.current[i];
        const vData = valvesState[i];
        if (!liqMesh || !vData || !vData.active) continue;

        // World angle normalized [0, 2π) starting from infeed starwheel (~3.4 rad)
        const baseAngle = (i / 40) * Math.PI * 2;
        const worldAngle = (((baseAngle + rotY - 2.65) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        // Filling happens smoothly across the first 5.1 radians (~292°) of carousel travel
        const fillArcProgress = Math.min(1, Math.max(0.06, worldAngle / 5.0));

        // Target final fill ratio: 1.0 nominal, visibly lower (~0.68) on failing V23, higher (1.06) on +5ml overfill!
        const finalRatio = Math.max(
          0.58,
          Math.min(1.08, 1.0 + vData.meanDeviationMl * 0.016)
        );
        const currentFillScale = 0.05 + fillArcProgress * (finalRatio - 0.05);
        liqMesh.scale.set(1, currentFillScale, 1);

        if (foamMesh) {
          const showFoam = fillArcProgress > 0.35 && (isFoamingSpeed || vData.meanDeviationMl > 3.5);
          foamMesh.visible = showFoam;
          if (showFoam) {
            foamMesh.position.y = 0.02 + currentFillScale * 0.435;
          }
        }
      }
    }

    if (roofGroupRef.current) {
      const targetRoofY = isExploded ? 1.85 : 0;
      roofGroupRef.current.position.y = THREE.MathUtils.lerp(
        roofGroupRef.current.position.y,
        targetRoofY,
        delta * 5
      );
    }
    if (bowlGroupRef.current) {
      const targetBowlY = isExploded ? 0.65 : 0;
      bowlGroupRef.current.position.y = THREE.MathUtils.lerp(
        bowlGroupRef.current.position.y,
        targetBowlY,
        delta * 5
      );
    }
  });

  const v23 = fillerResult.valves[22];

  return (
    <group
      position={[-7.5, 0, -1.8]}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        if (hoveredMachineId !== 'llenadora') {
          setHoveredMachine('llenadora');
          playHoverTick(soundEnabled);
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setHoveredMachine(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectMachine('llenadora', true);
      }}
    >
      {/* Interactive Selection / Hover Halo */}
      {(isSelected || isHovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0.025, 0.2]}>
          <ringGeometry args={[3.45, 3.65, 56]} />
          <meshBasicMaterial
            color={isSelected ? '#63EDFF' : '#0866FF'}
            transparent
            opacity={isSelected ? 0.95 : 0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Overfill Warning Aura */}
      {operatorCompensatesSetpoint && !valve23Bypassed && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 3.24, 0]}>
          <ringGeometry args={[1.82, 2.02, 48]} />
          <meshBasicMaterial color="#F79009" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Sanitary Elevated Stainless Machine Bed + 8 Adjustable Leveling Feet */}
      <group>
        <mesh position={[0.8, 0.88, 0.2]} castShadow receiveShadow>
          <boxGeometry args={[6.6, 0.44, 4.6]} />
          <meshStandardMaterial
            color={isXray ? '#0B1630' : '#CBD5E1'}
            metalness={isXray ? 0.25 : 0.88}
            roughness={0.2}
            transparent={isXray}
            opacity={isXray ? 0.35 : 1}
          />
        </mesh>
        {/* Under-bed Drive Gearbox Housing */}
        {!isXray && (
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[1.15, 1.25, 0.65, 24]} />
            <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
          </mesh>
        )}
        {/* 8 Stainless Adjustable Leveling Legs */}
        {[
          [-2.25, -1.85],
          [0.8, -1.85],
          [3.85, -1.85],
          [-2.25, 2.25],
          [0.8, 2.25],
          [3.85, 2.25]
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 0, lz]}>
            <mesh position={[0, 0.34, 0]} castShadow>
              <cylinderGeometry args={[0.065, 0.065, 0.68, 12]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0.025, 0]}>
              <cylinderGeometry args={[0.13, 0.14, 0.05, 14]} />
              <meshStandardMaterial color="#1E293B" roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Side-Mounted Rittal Stainless Electrical / PLC Cabinet */}
        {!isXray && (
          <group position={[-2.15, 1.95, -2.28]}>
            <mesh castShadow>
              <boxGeometry args={[1.45, 1.85, 0.42]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.82} roughness={0.24} />
            </mesh>
            {/* Red/Yellow Rotary Main Disconnect + Pilot LEDs */}
            <mesh position={[0.45, 0.25, 0.22]}>
              <boxGeometry args={[0.12, 0.12, 0.04]} />
              <meshStandardMaterial color="#FACC15" />
            </mesh>
            <mesh position={[0.45, 0.25, 0.25]}>
              <boxGeometry args={[0.04, 0.08, 0.03]} />
              <meshStandardMaterial color="#F04438" />
            </mesh>
            <mesh position={[-0.35, 0.55, 0.22]}>
              <sphereGeometry args={[0.03, 10, 10]} />
              <meshStandardMaterial color="#12B76A" emissive="#12B76A" emissiveIntensity={1.6} />
            </mesh>
          </group>
        )}
      </group>

      {/* Blue UHMW-PE Infeed Timing Worm Screw + Infeed & Transfer Starwheels */}
      <group position={[0, 1.12, 0]}>
        {/* Helical Blue Infeed Worm Screw */}
        <mesh ref={wormScrewRef} position={[-2.45, 0.38, 1.18]} rotation={[0, -0.2, Math.PI / 2]}>
          <cylinderGeometry args={[0.085, 0.085, 1.15, 16]} />
          <meshStandardMaterial color="#0866FF" roughness={0.3} metalness={0.15} />
        </mesh>

        {/* Infeed Starwheel */}
        <group ref={infeedStarRef} position={[-1.65, 0.36, 1.08]}>
          <mesh>
            <cylinderGeometry args={[0.48, 0.48, 0.06, 16]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>

        {/* Filler-to-Capper Transfer Starwheel */}
        <group ref={transferStarRef} position={[1.82, 0.36, 0.82]}>
          <mesh>
            <cylinderGeometry args={[0.52, 0.52, 0.06, 16]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.88} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.4, 12]} />
            <meshStandardMaterial color="#64748B" metalness={0.8} roughness={0.25} />
          </mesh>
        </group>
      </group>

      {/* Rotating 40-Valve Isobaric Carousel */}
      <group ref={carouselRef} position={[0, 1.12, 0]}>
        {/* Polished AISI 316 Central Column & Rotary Distributor */}
        <mesh position={[0, 1.38, 0]}>
          <cylinderGeometry args={[0.34, 0.42, 2.75, 28]} />
          <meshStandardMaterial
            color={isXray ? '#1E3158' : '#E2E8F0'}
            metalness={0.92}
            roughness={0.14}
            transparent={isXray}
            opacity={isXray ? 0.45 : 1}
          />
        </mesh>

        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[1.78, 1.78, 0.08, 48]} />
          <meshStandardMaterial
            color={isXray ? '#0866FF' : '#94A3B8'}
            metalness={0.85}
            roughness={0.22}
            transparent={isXray}
            opacity={isXray ? 0.35 : 1}
          />
        </mesh>

        {/* Explodable Isobaric Bowl + Radial Manifold + 40 Sculpted Valves & Progressive Bottles */}
        <group ref={bowlGroupRef}>
          <mesh position={[0, 2.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.62, 0.23, 24, 56]} />
            <meshStandardMaterial
              color={isXray ? '#8AB3FF' : '#F1F5F9'}
              metalness={0.94}
              roughness={0.1}
              transparent={isXray}
              opacity={isXray ? 0.55 : 1}
            />
          </mesh>

          {[0, 1, 2, 3, 4, 5].map((s) => (
            <mesh
              key={s}
              position={[0, 2.08, 0]}
              rotation={[0, (s * Math.PI) / 3, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.055, 0.055, 3.12, 12]} />
              <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.15} />
            </mesh>
          ))}

          {fillerResult.valves.map((v, i) => {
            const angle = (i / 40) * Math.PI * 2;
            const r = 1.62;
            const vx = Math.cos(angle) * r;
            const vz = Math.sin(angle) * r;
            const isV23 = v.valveNumber === 23;
            const isValveHovered = hoveredValveNumber === v.valveNumber;
            const isValveSelected = selectedValveNumber === v.valveNumber;
            const bypassLiftY = isV23 && v.status === 'bypass' ? 0.28 : 0;

            const valveColor = isValveHovered
              ? '#FFFFFF'
              : v.status === 'bypass'
                ? '#F79009'
                : v.status === 'critical'
                  ? '#F04438'
                  : isXray
                    ? '#1FD3F0'
                    : '#E2E8F0';

            const emissiveColor = isValveHovered
              ? '#63EDFF'
              : v.status === 'bypass'
                ? '#F79009'
                : v.status === 'critical'
                  ? '#F04438'
                  : isXray
                    ? '#0AA5C2'
                    : '#000000';

            return (
              <group
                key={v.valveNumber}
                position={[vx, bypassLiftY, vz]}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                  setHoveredValve(v.valveNumber);
                  playHoverTick(soundEnabled);
                }}
                onPointerOut={(e) => {
                  e.stopPropagation();
                  setHoveredValve(null);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectValve(v.valveNumber);
                }}
              >
                {/* Pneumatic Lifting Pedestal under Bottle */}
                <mesh position={[0, 0.14 - bypassLiftY, 0]}>
                  <cylinderGeometry args={[0.055, 0.065, 0.14, 10]} />
                  <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
                </mesh>

                {/* Stainless Valve Body + Centering Tulip Cone */}
                <mesh
                  position={[0, 1.54, 0]}
                  scale={isV23 || isValveHovered ? [1.22, 1.05, 1.22] : [1, 1, 1]}
                >
                  <cylinderGeometry args={[0.068, 0.054, 0.68, 12]} />
                  <meshStandardMaterial
                    color={valveColor}
                    emissive={emissiveColor}
                    emissiveIntensity={
                      isV23 || isValveHovered || isValveSelected ? 1.05 : isXray ? 0.45 : 0
                    }
                    metalness={0.85}
                    roughness={0.18}
                  />
                </mesh>

                {/* Centering Tulip Bell */}
                <mesh position={[0, 0.82, 0]}>
                  <cylinderGeometry args={[0.042, 0.068, 0.1, 12]} />
                  <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
                </mesh>

                {/* Calibrated Inner Gas Return Tube */}
                <mesh position={[0, 1.12, 0]}>
                  <cylinderGeometry args={[0.02, 0.02, 0.56, 8]} />
                  <meshBasicMaterial
                    color={
                      isV23
                        ? v.status === 'bypass'
                          ? '#F79009'
                          : '#F04438'
                        : '#63EDFF'
                    }
                  />
                </mesh>

                {/* Sculpted Clear Glossy PET Bottle + Rising Internal Cola Liquid */}
                {v.active && (
                  <group position={[0, 0.21, 0]}>
                    {/* Inner Dark Cola Liquid (scaled dynamically in useFrame!) */}
                    <mesh
                      ref={(el) => {
                        liquidRefs.current[i] = el;
                      }}
                      geometry={liquidGeo}
                      position={[0, 0.015, 0]}
                    >
                      <meshStandardMaterial
                        color={isV23 && v.status === 'critical' ? '#991B1B' : '#2E130B'}
                        roughness={0.15}
                        metalness={0.1}
                      />
                    </mesh>

                    {/* White Carbonation Foam Collar at High Speed / Overfill */}
                    <mesh
                      ref={(el) => {
                        foamRefs.current[i] = el;
                      }}
                      visible={false}
                      position={[0, 0.42, 0]}
                    >
                      <cylinderGeometry args={[0.055, 0.062, 0.035, 12]} />
                      <meshStandardMaterial color="#FFFBEB" emissive="#FEF3C7" emissiveIntensity={0.35} />
                    </mesh>

                    {/* Glossy Clear PET Shell */}
                    <mesh geometry={bottleShellGeo}>
                      <meshPhysicalMaterial
                        color="#E6F4FF"
                        transparent
                        opacity={isXray ? 0.25 : 0.36}
                        roughness={0.06}
                        metalness={0.05}
                        clearcoat={1}
                        clearcoatRoughness={0.05}
                      />
                    </mesh>
                  </group>
                )}

                {isValveHovered && (
                  <Html position={[0, 2.15, 0]} center zIndexRange={[35, 0]}>
                    <div className="ce-mono px-2.5 py-1 rounded-[6px] bg-[#050D1F]/95 text-[#F1F5F9] border border-[#63EDFF] text-[11px] shadow-xl whitespace-nowrap pointer-events-none">
                      <strong className="text-[#63EDFF]">{v.label}</strong> ·{' '}
                      {v.status === 'bypass'
                        ? 'EN BYPASS HMI'
                        : `${v.meanVolumeMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml (${
                            v.meanDeviationMl > 0 ? '+' : ''
                          }${v.meanDeviationMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml)`}
                      {isV23 && v.status !== 'bypass' && (
                        <span className="ml-1.5 text-[#F04438] font-bold">· CLIC PARA OPERAR</span>
                      )}
                    </div>
                  </Html>
                )}

                {isV23 && !isValveHovered && (isXray || isExploded) && (
                  <Html position={[0, 2.02, 0]} center zIndexRange={[25, 0]}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        selectValve(23);
                      }}
                      className={`ce-mono px-2 py-0.5 rounded text-[10.5px] font-bold whitespace-nowrap border cursor-pointer shadow-lg ${
                        v23.status === 'bypass'
                          ? 'bg-[#050D1F]/95 text-[#F79009] border-[#F79009]'
                          : 'bg-[#F04438] text-white border-white/50 animate-pulse'
                      }`}
                    >
                      {v23.status === 'bypass'
                        ? '✓ V23 EN BYPASS'
                        : `✕ V23 (${v23.meanDeviationMl.toLocaleString('es-419')} ml) · TOCAR`}
                    </button>
                  </Html>
                )}
              </group>
            );
          })}
        </group>
      </group>

      {/* IN-SCENE 3D DIRECT HMI ACTION POPUP */}
      {isSelected && (
        <Html position={[0, 4.65, 1.4]} center zIndexRange={[30, 0]}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[270px] p-2.5 rounded-[10px] bg-[#050D1F]/95 backdrop-blur-md border border-[#0866FF] shadow-2xl text-[#F1F5F9]"
          >
            <div className="flex items-center justify-between border-b border-[#12213F] pb-1.5 mb-2">
              <span className="ce-overline text-[10px] text-[#63EDFF]">
                CONTROL HMI EN PLANTA · LLENADORA
              </span>
              <span className="ce-mono text-[10px] text-[#94A3B8]">
                {fillerResult.activeValveCount}/40 válv.
              </span>
            </div>

            <div className="space-y-1.5">
              {!isXray && (
                <button
                  onClick={() => setViewMode('rayos_x')}
                  className="w-full py-1.5 px-2.5 rounded-[6px] bg-[#12213F] hover:bg-[#1E3158] text-[#63EDFF] text-[11.5px] font-semibold flex items-center justify-between cursor-pointer border border-[#63EDFF]/35"
                >
                  <span>1. Inspeccionar en Rayos X</span>
                  <span className="ce-mono text-[10px]">40 válv.</span>
                </button>
              )}

              {!valve23Bypassed && (
                <button
                  onClick={() => setOperatorCompensates(!operatorCompensatesSetpoint)}
                  className={`w-full py-1.5 px-2.5 rounded-[6px] text-[11.5px] font-semibold flex items-center justify-between cursor-pointer border transition ${
                    operatorCompensatesSetpoint
                      ? 'bg-[#F79009] text-[#050D1F] border-[#F79009]'
                      : 'bg-[#F79009]/15 hover:bg-[#F79009]/25 text-[#FDE68A] border-[#F79009]/45'
                  }`}
                >
                  <span>
                    {operatorCompensatesSetpoint
                      ? 'Quitar sobrellenado (+5 ml)'
                      : 'Probar trampa +5 ml (40 Excel)'}
                  </span>
                  <span className="ce-mono text-[10px]">! Costo</span>
                </button>
              )}

              {!valve23Bypassed ? (
                <button
                  onClick={() => applyDecisionOption('B')}
                  className="w-full py-2 px-2.5 rounded-[6px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[12px] font-semibold flex items-center justify-between cursor-pointer shadow-md"
                >
                  <span>⚡ Hacer Bypass a Válvula 23</span>
                  <span className="ce-mono text-[10px] bg-white/20 px-1.5 rounded">ÓPTIMO</span>
                </button>
              ) : (
                <button
                  onClick={() => setSapModalOpen(true)}
                  className="w-full py-2 px-2.5 rounded-[6px] bg-[#12B76A] hover:bg-[#10B981] text-white text-[12px] font-semibold flex items-center justify-between cursor-pointer shadow-md"
                >
                  <span>✓ Bypass activo · Emitir SAP PM</span>
                  <span className="ce-mono text-[10px]">IW21 →</span>
                </button>
              )}
            </div>
          </div>
        </Html>
      )}

      {/* Overspeed Foaming Warning Callout when forced > 416 bpm */}
      {targetSpeedBpm > 416 && !isXray && (
        <Html position={[1.8, 2.5, 0.9]} center zIndexRange={[20, 0]}>
          <div className="ce-mono px-2 py-0.5 rounded bg-[#F79009] text-[#050D1F] text-[10px] font-bold shadow whitespace-nowrap pointer-events-none">
            ! ESPUMADO ISOBÁRICO ({targetSpeedBpm} bpm)
          </div>
        </Html>
      )}

      {/* Integrated 12-Head Magnetic Capper ("03 Roscadora") + Vibratory Cap Bowl */}
      <group
        position={[3.1, 1.12, 0.55]}
        onClick={(e) => {
          e.stopPropagation();
          selectMachine('roscadora', true);
        }}
      >
        {/* Overhead Stainless Vibratory Cap Hopper */}
        <mesh position={[0, 2.15, 0]} castShadow>
          <cylinderGeometry args={[0.58, 0.36, 0.42, 24]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.16} />
        </mesh>
        <group ref={capperRef}>
          <mesh position={[0, 1.12, 0]}>
            <cylinderGeometry args={[0.68, 0.68, 0.34, 24]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.88} roughness={0.16} />
          </mesh>
          {Array.from({ length: 12 }, (_, k) => {
            const a = (k / 12) * Math.PI * 2;
            return (
              <mesh key={k} position={[Math.cos(a) * 0.56, 0.74, Math.sin(a) * 0.56]}>
                <cylinderGeometry args={[0.04, 0.036, 0.44, 10]} />
                <meshStandardMaterial color="#DC2626" metalness={0.65} roughness={0.25} />
              </mesh>
            );
          })}
        </group>
      </group>

      {/* Framed Polycarbonate Cleanroom Enclosure & HEPA Hood */}
      <group ref={roofGroupRef}>
        <mesh position={[0.8, 3.85, 0.2]} castShadow>
          <boxGeometry args={[6.7, 0.24, 4.7]} />
          <meshStandardMaterial
            color={isXray ? '#0B1630' : '#E2E8F0'}
            metalness={0.75}
            roughness={0.22}
            transparent={isXray || isCutaway}
            opacity={isXray ? 0.16 : isCutaway ? 0.28 : 1}
          />
        </mesh>

        {/* Cleanroom HEPA Laminar Filter Unit on Roof */}
        {!isXray && (
          <mesh position={[-0.4, 4.18, 0.2]} castShadow>
            <boxGeometry args={[1.8, 0.42, 1.6]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.8} roughness={0.25} />
          </mesh>
        )}

        {/* Clearcoat Glazed Safety Guard Doors with Aluminum Mullions */}
        {!isCutaway && !isXray && (
          <group>
            <mesh position={[0.8, 2.45, 2.48]}>
              <planeGeometry args={[6.5, 2.6]} />
              <meshPhysicalMaterial
                color="#E6F2FF"
                transparent
                opacity={0.22}
                roughness={0.05}
                metalness={0.05}
                clearcoat={1}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Vertical Door Mullions + Door Handles */}
            {[-0.8, 0.8, 2.4].map((mx, mi) => (
              <group key={mi} position={[mx, 2.45, 2.49]}>
                <mesh>
                  <boxGeometry args={[0.06, 2.6, 0.04]} />
                  <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
                </mesh>
                <mesh position={[0.14, -0.15, 0.04]}>
                  <boxGeometry args={[0.03, 0.24, 0.04]} />
                  <meshStandardMaterial color="#0F172A" roughness={0.4} />
                </mesh>
              </group>
            ))}
          </group>
        )}

        {[
          [-2.45, 2.45, -2.05],
          [4.05, 2.45, -2.05],
          [-2.45, 2.45, 2.45],
          [4.05, 2.45, 2.45]
        ].map(([px, py, pz], idx) => (
          <mesh key={idx} position={[px, py, pz]}>
            <boxGeometry args={[0.11, 2.75, 0.11]} />
            <meshStandardMaterial color={isXray ? '#0866FF' : '#CBD5E1'} metalness={0.85} roughness={0.2} />
          </mesh>
        ))}

        {/* Industrial Multi-Stack Andon Light Tower */}
        <group position={[3.85, 4.02, 2.25]}>
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />
            <meshStandardMaterial color="#475569" metalness={0.8} />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.12, 14]} />
            <meshStandardMaterial
              color="#12B76A"
              emissive="#12B76A"
              emissiveIntensity={v23.status === 'normal' ? 1.8 : 0.1}
            />
          </mesh>
          <mesh position={[0, 0.39, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.12, 14]} />
            <meshStandardMaterial
              color="#F79009"
              emissive="#F79009"
              emissiveIntensity={v23.status === 'bypass' || v23.status === 'warning' ? 1.8 : 0.1}
            />
          </mesh>
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.12, 14]} />
            <meshStandardMaterial
              color="#F04438"
              emissive="#F04438"
              emissiveIntensity={v23.status === 'critical' ? 2.2 : 0.1}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
