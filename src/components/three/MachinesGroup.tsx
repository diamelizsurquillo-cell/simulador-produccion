import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import { MachineId } from '../../core/masterData/types';
import { playHoverTick } from '../../core/soundEffects';

export function MachinesGroup() {
  const labelerTurretRef = useRef<THREE.Group>(null);
  const blowerWheelRef = useRef<THREE.Mesh>(null);
  const pusherRodRef = useRef<THREE.Mesh>(null);
  const steamGroupRef = useRef<THREE.Group>(null);

  // 4-Axis Articulated Robot Joint Refs
  const robotWaistRef = useRef<THREE.Group>(null);
  const robotShoulderRef = useRef<THREE.Group>(null);
  const robotElbowRef = useRef<THREE.Group>(null);
  const robotWristRef = useRef<THREE.Group>(null);
  const carriedPackRef = useRef<THREE.Mesh>(null);

  const viewMode = useSimulationStore((s) => s.viewMode);
  const selectedMachineId = useSimulationStore((s) => s.selectedMachineId);
  const hoveredMachineId = useSimulationStore((s) => s.hoveredMachineId);
  const setHoveredMachine = useSimulationStore((s) => s.setHoveredMachine);
  const selectMachine = useSimulationStore((s) => s.selectMachine);

  const sampledBottle = useSimulationStore((s) => s.sampledBottle);
  const sampleBottleIn3D = useSimulationStore((s) => s.sampleBottleIn3D);
  const closeBottleSample = useSimulationStore((s) => s.closeBottleSample);

  const effectiveBpm = useSimulationStore((s) => s.lineDynamics.effectiveFillerBpm);
  const rejectPct = useSimulationStore((s) => s.fillerResult.totalLineRejectPct);
  const wearLabelerPct = useSimulationStore((s) => s.wearLabelerPct);
  const activeHseEvents = useSimulationStore((s) => s.activeHseEvents);
  const soundEnabled = useSimulationStore((s) => s.soundEnabled);
  const paused = useSimulationStore((s) => s.paused);
  const simSpeed = useSimulationStore((s) => s.simSpeedMultiplier);

  const isXray = viewMode === 'rayos_x';
  const isCutaway = viewMode === 'corte';
  const isExploded = viewMode === 'despiece';
  const robotStoppedSto = activeHseEvents.includes('intrusion');

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const s = useSimulationStore.getState();

    if (!paused && effectiveBpm > 0) {
      const rate = (effectiveBpm / 400) * Math.min(simSpeed, 8);

      if (labelerTurretRef.current) {
        labelerTurretRef.current.rotation.y += delta * rate * 1.1;
      }
      if (blowerWheelRef.current) {
        blowerWheelRef.current.rotation.y -= delta * rate * 0.85;
      }

      // Pneumatic Reject Pusher Strike at Inspector HF whenever V23 is not bypassed
      if (pusherRodRef.current) {
        const kickPulse = !s.valve23Bypassed
          ? Math.max(0, Math.sin(t * 5.2 * Math.min(simSpeed, 3)) - 0.78) * 1.9
          : 0;
        pusherRodRef.current.position.z = -0.22 + kickPulse;
      }

      // Thermal Vapor Wisps rising gently from Shrink Wrapper Exhaust
      if (steamGroupRef.current) {
        steamGroupRef.current.children.forEach((child, idx) => {
          const cycle = (t * 0.55 + idx * 0.33) % 1;
          child.position.y = 2.15 + cycle * 0.85;
          const sc = 0.22 + cycle * 0.35;
          child.scale.set(sc, sc, sc);
        });
      }

      // 4-Axis Articulated Palletizing Robot Kinematics (Pick from conveyor -> Lift -> Swing -> Place on Pallet)
      if (!robotStoppedSto && robotWaistRef.current && robotShoulderRef.current && robotElbowRef.current && robotWristRef.current) {
        const phase = (t * 0.55 * Math.min(simSpeed, 3)) % (Math.PI * 2);
        // Smooth pick-and-place trajectory
        const swing = Math.sin(phase); // -1 (conveyor pickup side) to +1 (pallet drop side)
        const dip = Math.pow(Math.cos(phase * 2), 2); // dips down at both ends (-1 and +1), lifts in middle (0)

        const j1 = -0.75 + (swing * 0.5 + 0.5) * 1.55; // Waist rotation
        const j2 = 0.18 + dip * 0.36; // Shoulder pitch forward
        const j3 = -0.35 + dip * 0.28; // Elbow pitch

        robotWaistRef.current.rotation.y = j1;
        robotShoulderRef.current.rotation.x = j2;
        robotElbowRef.current.rotation.x = j3;
        // Keep vacuum gripper strictly level with the floor!
        robotWristRef.current.rotation.x = -(j2 + j3);

        // Show 6-pack attached to vacuum gripper while moving from pickup (-1) to drop (+1)
        if (carriedPackRef.current) {
          carriedPackRef.current.visible = Math.cos(phase) > 0;
        }
      }
    }
  });

  const interactiveProps = (id: MachineId) => ({
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      document.body.style.cursor = 'pointer';
      if (hoveredMachineId !== id) {
        setHoveredMachine(id);
        playHoverTick(soundEnabled);
      }
    },
    onPointerOut: () => {
      document.body.style.cursor = 'auto';
      setHoveredMachine(null);
    },
    onClick: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      selectMachine(id, true);
    }
  });

  const renderFloorRing = (id: MachineId, radius = 2.2) => {
    const sel = selectedMachineId === id;
    const hov = hoveredMachineId === id;
    if (!sel && !hov) return null;
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <ringGeometry args={[radius - 0.16, radius, 44]} />
        <meshBasicMaterial
          color={sel ? '#63EDFF' : '#0866FF'}
          transparent
          opacity={sel ? 0.95 : 0.65}
          side={THREE.DoubleSide}
        />
      </mesh>
    );
  };

  return (
    <group>
      {/* MAIN STAINLESS CONVEYOR SPINE + SUPPORT STANDS + SEW DRIVE GEARMOTORS */}
      <group position={[0.6, 0.98, 0.75]} rotation={[0, -0.198, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[34.5, 0.12, 0.42]} />
          <meshStandardMaterial color={isXray ? '#12213F' : '#1E293B'} metalness={0.65} roughness={0.4} />
        </mesh>
        {/* Brushed Stainless Guide Rails */}
        <mesh position={[0, 0.11, 0.22]}>
          <boxGeometry args={[34.5, 0.055, 0.028]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.16} />
        </mesh>
        <mesh position={[0, 0.11, -0.22]}>
          <boxGeometry args={[34.5, 0.055, 0.028]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.16} />
        </mesh>

        {/* Multi-lane Dynamic Accumulation Buffer Bed ("Pulmón") */}
        <mesh position={[0.8, -0.02, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.8, 0.12, 1.05]} />
          <meshStandardMaterial color={isXray ? '#12213F' : '#334155'} metalness={0.7} roughness={0.35} />
        </mesh>

        {/* Conveyor H-Stands & Electric Drive Gearmotors every 4.5 m */}
        {[-12, -3.5, 0.8, 6.2, 13.5].map((cx, ci) => (
          <group key={ci} position={[cx, -0.49, 0]}>
            <mesh position={[0, 0, -0.16]}>
              <cylinderGeometry args={[0.028, 0.028, 0.96, 8]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.22} />
            </mesh>
            <mesh position={[0, 0, 0.16]}>
              <cylinderGeometry args={[0.028, 0.028, 0.96, 8]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.22} />
            </mesh>
            {/* Blue Industrial Gearmotor */}
            {ci % 2 === 1 && !isXray && (
              <mesh position={[0.18, 0.36, 0.32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.11, 0.11, 0.32, 14]} />
                <meshStandardMaterial color="#0052DB" metalness={0.55} roughness={0.35} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* 01 · SOPLADORA ROTATIVA + BANCOS IR INCANDESCENTES */}
      <group position={[-15.5, 0, -2.5]} {...interactiveProps('sopladora')}>
        {renderFloorRing('sopladora', 2.9)}
        {/* Elevated Base + Leveling Feet */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[4.4, 0.55, 2.8]} />
          <meshStandardMaterial color="#334155" metalness={0.75} roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.78, 0]} castShadow>
          <boxGeometry args={[4.4, 2.2, 2.8]} />
          <meshStandardMaterial
            color={isXray ? '#0B1630' : hoveredMachineId === 'sopladora' ? '#F8FAFC' : '#E2E8F0'}
            metalness={0.78}
            roughness={0.22}
            transparent={isXray || isCutaway}
            opacity={isXray ? 0.22 : isCutaway ? 0.38 : 1}
          />
        </mesh>

        {/* Tinted IR Oven Inspection Window + 7 Incandescent Halogen Lamps */}
        <group position={[-0.75, 1.55, 1.41]}>
          <mesh>
            <planeGeometry args={[2.2, 0.95]} />
            <meshBasicMaterial color="#431407" />
          </mesh>
          {[-0.85, -0.56, -0.28, 0, 0.28, 0.56, 0.85].map((lx, li) => (
            <mesh key={li} position={[lx, 0, 0.02]}>
              <cylinderGeometry args={[0.032, 0.032, 0.82, 10]} />
              <meshStandardMaterial
                color="#FDBA74"
                emissive="#FB923C"
                emissiveIntensity={effectiveBpm > 0 ? 2.6 : 0.2}
              />
            </mesh>
          ))}
          {effectiveBpm > 0 && !isXray && (
            <pointLight position={[0, 0, 0.45]} intensity={1.1} distance={4.5} color="#FB923C" />
          )}
        </group>

        {/* Rotary Stretch-Blow Molding Wheel */}
        <mesh ref={blowerWheelRef} position={[1.05, 1.62, 0]}>
          <cylinderGeometry args={[0.98, 0.98, 1.55, 20]} />
          <meshStandardMaterial color={isXray ? '#63EDFF' : '#CBD5E1'} metalness={0.88} roughness={0.18} />
        </mesh>
      </group>

      {/* 04 · INSPECTOR DE NIVEL HF + PISTÓN NEUMÁTICO EYECTOR + BALANZA 3D */}
      <group position={[-1.4, 0, -0.4]} {...interactiveProps('inspector')}>
        {renderFloorRing('inspector', 1.75)}
        {/* Stainless Bridge Arch */}
        <mesh position={[0, 1.42, 0]} castShadow>
          <boxGeometry args={[0.58, 1.48, 0.88]} />
          <meshStandardMaterial color={isXray ? '#1E3158' : '#E2E8F0'} metalness={0.82} roughness={0.2} />
        </mesh>
        {/* High-Frequency Sensor Head + Active Sensing Laser Beam */}
        <mesh position={[0, 1.58, 0.45]}>
          <boxGeometry args={[0.32, 0.32, 0.06]} />
          <meshStandardMaterial color="#F59E0B" roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.75, 8]} />
          <meshBasicMaterial color="#F04438" />
        </mesh>

        {/* Reciprocating Pneumatic Reject Pusher Cylinder */}
        <mesh position={[0.18, 1.24, -0.38]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.36, 12]} />
          <meshStandardMaterial color="#64748B" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh ref={pusherRodRef} position={[0.18, 1.24, -0.22]}>
          <boxGeometry args={[0.14, 0.12, 0.28]} />
          <meshStandardMaterial color="#F04438" metalness={0.5} roughness={0.3} />
        </mesh>

        {/* Andon Beacon */}
        <mesh position={[0, 2.34, 0]}>
          <cylinderGeometry args={[0.072, 0.072, 0.32, 14]} />
          <meshStandardMaterial
            color={rejectPct >= 1.5 ? '#F04438' : rejectPct >= 0.8 ? '#F79009' : '#12B76A'}
            emissive={rejectPct >= 1.5 ? '#F04438' : rejectPct >= 0.8 ? '#F79009' : '#12B76A'}
            emissiveIntensity={1.6}
          />
        </mesh>

        {/* Stainless Lateral Reject Accumulation Table + Rim */}
        <group position={[0.1, 0, 1.15]}>
          <mesh position={[0, 0.94, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.68, 0.08, 1.18]} />
            <meshStandardMaterial color="#CBD5E1" metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Containment Rim */}
          <mesh position={[0, 1.01, 0.57]}>
            <boxGeometry args={[1.68, 0.08, 0.03]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.16} />
          </mesh>
          {[
            [-0.74, 0.46, -0.5],
            [0.74, 0.46, -0.5],
            [-0.74, 0.46, 0.5],
            [0.74, 0.46, 0.5]
          ].map(([lx, ly, lz], i) => (
            <mesh key={i} position={[lx, ly, lz]}>
              <cylinderGeometry args={[0.032, 0.032, 0.92, 10]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.22} />
            </mesh>
          ))}

          {!sampledBottle && (
            <Html position={[0, 1.66, 0.25]} center zIndexRange={[22, 0]}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  sampleBottleIn3D();
                }}
                className="px-2.5 py-1 rounded-full bg-[#050D1F]/92 hover:bg-[#0866FF] text-[#F1F5F9] border border-[#63EDFF]/65 text-[11px] font-semibold shadow-lg whitespace-nowrap cursor-pointer transition flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-[#63EDFF] ce-pulse-dot" />
                <span>⚖️ Pesar botella en vivo</span>
              </button>
            </Html>
          )}

          {sampledBottle && (
            <Html position={[0, 2.38, 0.35]} center zIndexRange={[35, 0]}>
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-[255px] p-3 rounded-[10px] bg-[#050D1F]/96 border border-[#63EDFF] shadow-2xl text-[#F1F5F9]"
              >
                <div className="flex items-center justify-between border-b border-[#12213F] pb-1.5 mb-2">
                  <span className="ce-overline text-[9.5px] text-[#63EDFF]">
                    MUESTREO EN VIVO · LI-401 (±0,8 ml)
                  </span>
                  <button
                    onClick={closeBottleSample}
                    className="text-[#94A3B8] hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-20 rounded-t-[10px] rounded-b-[4px] bg-[#12213F] border border-[#334155] overflow-hidden shrink-0">
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-[#63EDFF] z-10"
                      style={{ bottom: '72%' }}
                    />
                    <div
                      className="absolute left-0 right-0 border-t border-[#F04438] z-10"
                      style={{ bottom: '52%' }}
                    />
                    <div
                      className="w-full absolute bottom-0 transition-all duration-300"
                      style={{
                        height: `${Math.max(
                          28,
                          Math.min(94, 72 + sampledBottle.deviationMl * 1.65)
                        )}%`,
                        backgroundColor:
                          sampledBottle.verdict === 'underfill_reject'
                            ? '#F04438'
                            : sampledBottle.verdict === 'overfill_giveaway'
                              ? '#F79009'
                              : '#12B76A'
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="ce-mono text-[11px] text-[#94A3B8]">
                      Boquilla origen:{' '}
                      <strong className="text-white">
                        V{String(sampledBottle.valveNumber).padStart(2, '0')}
                      </strong>
                    </div>
                    <div className="ce-mono text-[18px] font-bold text-white leading-tight mt-0.5">
                      {sampledBottle.volumeMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml
                    </div>
                    <div
                      className={`ce-mono text-[10.5px] font-semibold mt-1 ${
                        sampledBottle.verdict === 'underfill_reject'
                          ? 'text-[#F04438]'
                          : sampledBottle.verdict === 'overfill_giveaway'
                            ? 'text-[#F79009]'
                            : 'text-[#12B76A]'
                      }`}
                    >
                      {sampledBottle.verdict === 'underfill_reject'
                        ? `✕ RECHAZADA (${sampledBottle.deviationMl.toLocaleString('es-419')} ml)`
                        : sampledBottle.verdict === 'overfill_giveaway'
                          ? `! REGALANDO +${sampledBottle.deviationMl.toLocaleString('es-419')} ml`
                          : '✓ CONTENIDO EXACTO'}
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => sampleBottleIn3D()}
                    className="py-1.5 px-2 rounded-[6px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[11px] font-semibold cursor-pointer"
                  >
                    ↻ Otra botella
                  </button>
                  <button
                    onClick={() => sampleBottleIn3D(23)}
                    className="py-1.5 px-2 rounded-[6px] bg-[#12213F] hover:bg-[#1E3158] text-[#FCA5A5] border border-[#F04438]/40 text-[11px] font-semibold cursor-pointer"
                  >
                    Medir V23
                  </button>
                </div>
              </div>
            </Html>
          )}
        </group>
      </group>

      {/* 05 · ETIQUETADORA ROTATIVA OPP */}
      <group position={[4.2, 0, 1.2]} {...interactiveProps('etiquetadora')}>
        {renderFloorRing('etiquetadora', 2.45)}
        <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
          <boxGeometry args={[3.4, 0.56, 3.2]} />
          <meshStandardMaterial color={isXray ? '#0B1630' : '#CBD5E1'} metalness={0.86} roughness={0.2} />
        </mesh>
        {[
          [-1.5, -1.4],
          [1.5, -1.4],
          [-1.5, 1.4],
          [1.5, 1.4]
        ].map(([lx, lz], i) => (
          <mesh key={i} position={[lx, 0.24, lz]}>
            <cylinderGeometry args={[0.055, 0.055, 0.48, 10]} />
            <meshStandardMaterial color="#94A3B8" metalness={0.85} roughness={0.2} />
          </mesh>
        ))}

        <group ref={labelerTurretRef} position={[0, 1.52, 0]}>
          <mesh>
            <cylinderGeometry args={[1.04, 1.04, 0.86, 28]} />
            <meshStandardMaterial
              color={wearLabelerPct > 50 ? '#F79009' : isXray ? '#63EDFF' : '#E2E8F0'}
              metalness={0.9}
              roughness={0.16}
            />
          </mesh>
        </group>

        {/* Dual OPP Label Film Unwind Reels + Web Rollers */}
        {[-0.75, 0.45].map((rx, ri) => (
          <group key={ri} position={[rx, 1.22, 1.78]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.4, 0.4, 0.22, 24]} />
              <meshStandardMaterial color="#FACC15" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.12, 0.12, 0.26, 14]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {!isCutaway && !isXray && (
          <mesh position={[0, 2.04 + (isExploded ? 1.1 : 0), 0]}>
            <boxGeometry args={[3.35, 1.95, 3.15]} />
            <meshPhysicalMaterial
              color="#E6F2FF"
              transparent
              opacity={0.22}
              roughness={0.05}
              clearcoat={1}
            />
          </mesh>
        )}
      </group>

      {/* 06 · EMPACADORA TERMOENCOGIBLE ×6 + CORTINA TÉRMICA + VAPOR */}
      <group position={[10.4, 0, 2.6]} {...interactiveProps('empacadora')}>
        {renderFloorRing('empacadora', 2.55)}
        <mesh position={[-1.1, 1.38, 0]} castShadow>
          <boxGeometry args={[2.1, 1.85, 1.7]} />
          <meshStandardMaterial
            color={isXray ? '#12213F' : '#E2E8F0'}
            metalness={0.8}
            roughness={0.22}
            transparent={isXray}
            opacity={isXray ? 0.3 : 1}
          />
        </mesh>

        {/* Insulated Stainless Shrink Heat Tunnel + Exhaust Hood */}
        <mesh position={[1.15, 1.36, 0]} castShadow>
          <boxGeometry args={[2.4, 1.48, 1.56]} />
          <meshStandardMaterial color={isXray ? '#1E3158' : '#CBD5E1'} metalness={0.82} roughness={0.22} />
        </mesh>
        {/* Glowing Quartz Heating Window + Silicone Heat Curtain Strips */}
        <mesh position={[1.15, 1.18, 0.79]}>
          <planeGeometry args={[1.75, 0.5]} />
          <meshStandardMaterial color="#FB923C" emissive="#F97316" emissiveIntensity={1.8} />
        </mesh>
        {[-0.08, 2.38].map((cx, ci) => (
          <mesh key={ci} position={[cx, 1.24, 0]}>
            <boxGeometry args={[0.04, 0.62, 0.58]} />
            <meshPhysicalMaterial color="#F97316" transparent opacity={0.48} roughness={0.2} />
          </mesh>
        ))}

        {/* Rising Thermal Vapor Wisps above Exhaust Stack */}
        {!isXray && effectiveBpm > 0 && (
          <group ref={steamGroupRef} position={[1.15, 0, 0]}>
            {[0, 1, 2].map((si) => (
              <mesh key={si} position={[(si - 1) * 0.25, 2.2, 0]}>
                <sphereGeometry args={[0.45, 12, 12]} />
                <meshStandardMaterial color="#F8FAFC" transparent opacity={0.14} depthWrite={false} />
              </mesh>
            ))}
          </group>
        )}
      </group>

      {/* 07 · CELDA ROBÓTICA PALETIZADORA DE 4 EJES ARTICULADOS (IK) */}
      <group position={[16.8, 0, 4.0]} {...interactiveProps('paletizador')}>
        {renderFloorRing('paletizador', 3.15)}

        {/* Yellow Perimeter Safety Posts + Optical Light Curtain Pillars */}
        {[
          [-2.4, 1.1, -2.2],
          [2.4, 1.1, -2.2],
          [-2.4, 1.1, 2.2],
          [2.4, 1.1, 2.2]
        ].map(([fx, fy, fz], idx) => (
          <mesh key={idx} position={[fx, fy, fz]} castShadow>
            <boxGeometry args={[0.11, 2.2, 0.11]} />
            <meshStandardMaterial color={idx >= 2 ? '#EF4444' : '#F59E0B'} metalness={0.45} roughness={0.35} />
          </mesh>
        ))}

        {/* Heavy Cast-Iron Robot Pedestal */}
        <mesh position={[0, 0.32, -0.35]} castShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.64, 24]} />
          <meshStandardMaterial color="#1E293B" metalness={0.78} roughness={0.28} />
        </mesh>

        {/* J1: Rotating Waist Turret */}
        <group ref={robotWaistRef} position={[0, 0.68, -0.35]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.42, 0.46, 0.36, 20]} />
            <meshStandardMaterial
              color={robotStoppedSto ? '#F04438' : '#F59E0B'}
              metalness={0.38}
              roughness={0.32}
            />
          </mesh>

          {/* J2: Articulated Lower Arm (Shoulder Pitch) */}
          <group ref={robotShoulderRef} position={[0, 0.34, 0]}>
            <mesh position={[0, 0.72, 0]} castShadow>
              <boxGeometry args={[0.34, 1.48, 0.34]} />
              <meshStandardMaterial
                color={robotStoppedSto ? '#F04438' : '#F59E0B'}
                metalness={0.38}
                roughness={0.32}
              />
            </mesh>
            {/* Shoulder Servo Motor Housing */}
            <mesh position={[0.26, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.22, 16]} />
              <meshStandardMaterial color="#0F172A" metalness={0.7} />
            </mesh>

            {/* J3: Articulated Forearm (Elbow Pitch) */}
            <group ref={robotElbowRef} position={[0, 1.42, 0]}>
              <mesh position={[0, 0, 0.68]} castShadow>
                <boxGeometry args={[0.26, 0.26, 1.42]} />
                <meshStandardMaterial
                  color={robotStoppedSto ? '#F04438' : '#F59E0B'}
                  metalness={0.38}
                  roughness={0.32}
                />
              </mesh>

              {/* J4: Self-Leveling Wrist + Vacuum Suction Head + Picked 6-Pack */}
              <group ref={robotWristRef} position={[0, 0, 1.35]}>
                <mesh position={[0, -0.18, 0]} castShadow>
                  <boxGeometry args={[0.68, 0.14, 0.56]} />
                  <meshStandardMaterial color="#0F172A" metalness={0.75} roughness={0.3} />
                </mesh>
                {/* Carried 6-Pack under Vacuum Gripper */}
                <mesh ref={carriedPackRef} position={[0, -0.46, 0]} castShadow>
                  <boxGeometry args={[0.46, 0.44, 0.32]} />
                  <meshPhysicalMaterial
                    color="#E2E8F0"
                    roughness={0.12}
                    clearcoat={1}
                  />
                </mesh>
              </group>
            </group>
          </group>
        </group>

        {/* Active Wooden Pallet & Layered Pack Stack inside Cell */}
        <group position={[0.35, 0, 1.1]}>
          <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.22, 0.15, 1.02]} />
            <meshStandardMaterial color="#A47142" roughness={0.88} />
          </mesh>
          <mesh position={[0, 0.54, 0]} castShadow>
            <boxGeometry args={[1.08, 0.76, 0.88]} />
            <meshPhysicalMaterial color="#F1F5F9" roughness={0.18} clearcoat={0.8} />
          </mesh>
        </group>
      </group>

      {/* 08 · MIXER - CARBONATADOR AISI 316 MIRROR STAINLESS SKID */}
      <group position={[-3.0, 0, -7.2]} {...interactiveProps('mixer')}>
        {renderFloorRing('mixer', 3.1)}
        {/* Stainless Skid Base Frame */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.22, 2.2]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>

        {[-1.45, 0, 1.45].map((tx, idx) => (
          <group key={idx} position={[tx, 0.22, 0]}>
            {/* 3 Conical Tank Support Legs */}
            {[-0.38, 0.38].map((lx, li) => (
              <mesh key={li} position={[lx, 0.35, 0.32]}>
                <cylinderGeometry args={[0.045, 0.045, 0.7, 10]} />
                <meshStandardMaterial color="#CBD5E1" metalness={0.9} roughness={0.15} />
              </mesh>
            ))}
            {/* Mirror-Brushed AISI 316 Pressure Vessel */}
            <mesh position={[0, 2.1, 0]} castShadow>
              <cylinderGeometry args={[0.58, 0.58, 3.1, 32]} />
              <meshStandardMaterial
                color={isXray ? '#1E3158' : '#E2E8F0'}
                metalness={0.95}
                roughness={0.11}
              />
            </mesh>
            {/* Torispherical Top Dome */}
            <mesh position={[0, 3.65, 0]}>
              <sphereGeometry args={[0.58, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#F1F5F9" metalness={0.95} roughness={0.1} />
            </mesh>
            {/* Analog Dial Pressure Gauge */}
            {!isXray && (
              <mesh position={[0, 2.35, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.04, 16]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>
            )}
          </group>
        ))}
      </group>
    </group>
  );
}
