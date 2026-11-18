import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, Line, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

function ArticulatedOperator({
  basePosition,
  walkRangeX = 0,
  walkSpeed = 0.65,
  rotationY = 0,
  vestColor = '#12B76A',
  operatingHmi = false
}: {
  basePosition: [number, number, number];
  walkRangeX?: number;
  walkSpeed?: number;
  rotationY?: number;
  vestColor?: string;
  operatingHmi?: boolean;
}) {
  const rootRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const paused = useSimulationStore.getState().paused;
    if (paused) return;
    const t = state.clock.elapsedTime;

    if (walkRangeX > 0 && rootRef.current) {
      const phase = t * walkSpeed * 0.35;
      const offset = Math.sin(phase) * walkRangeX;
      const dir = Math.cos(phase) >= 0 ? 1 : -1;
      rootRef.current.position.x = basePosition[0] + offset;
      rootRef.current.position.z = basePosition[2] + offset * 0.195;
      rootRef.current.rotation.y = dir > 0 ? 1.38 : -1.76;

      const stride = Math.sin(t * 4.2) * 0.42;
      if (leftLegRef.current) leftLegRef.current.rotation.x = stride;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -stride;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -stride * 0.7;
      if (rightArmRef.current) rightArmRef.current.rotation.x = stride * 0.7;
    } else if (operatingHmi) {
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.75 + Math.sin(t * 2.2) * 0.14;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.9) * 0.25;
      }
    }
  });

  return (
    <group ref={rootRef} position={basePosition} rotation={[0, rotationY, 0]}>
      {/* Left & Right Articulated Legs + Safety Boots */}
      <group ref={leftLegRef} position={[-0.1, 0.82, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.068, 0.58, 6, 10]} />
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.76, 0.04]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.1, 0.82, 0]}>
        <mesh position={[0, -0.38, 0]} castShadow>
          <capsuleGeometry args={[0.068, 0.58, 6, 10]} />
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.76, 0.04]} castShadow>
          <boxGeometry args={[0.13, 0.1, 0.24]} />
          <meshStandardMaterial color="#0F172A" roughness={0.6} />
        </mesh>
      </group>

      {/* Torso + High-Visibility Reflective Safety Vest */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <capsuleGeometry args={[0.19, 0.42, 8, 14]} />
        <meshStandardMaterial color={vestColor} roughness={0.48} />
      </mesh>
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.196, 0.196, 0.045, 16]} />
        <meshStandardMaterial color="#F1F5F9" emissive="#E2E8F0" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.194, 0.194, 0.04, 16]} />
        <meshStandardMaterial color="#F1F5F9" emissive="#E2E8F0" emissiveIntensity={0.35} />
      </mesh>

      {/* Articulated Arms */}
      <group ref={leftArmRef} position={[-0.24, 1.32, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <capsuleGeometry args={[0.052, 0.38, 6, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.24, 1.32, 0]}>
        <mesh position={[0, -0.24, 0]} castShadow>
          <capsuleGeometry args={[0.052, 0.38, 6, 10]} />
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </mesh>
      </group>

      {/* Head + Industrial Safety Hardhat with Brim */}
      <group ref={headRef} position={[0, 1.54, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.125, 16, 16]} />
          <meshStandardMaterial color="#E0BEA2" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.055, 0]} castShadow>
          <sphereGeometry args={[0.145, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.22} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.045, 0.03]} rotation={[-0.12, 0, 0]}>
          <cylinderGeometry args={[0.155, 0.165, 0.02, 16]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

function HmiPedestal({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.22, 0.24, 0.04, 16]} />
        <meshStandardMaterial color="#475569" metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.048, 1.24, 12]} />
        <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.28, 0]} rotation={[-0.38, 0, 0]} castShadow>
        <boxGeometry args={[0.62, 0.4, 0.065]} />
        <meshStandardMaterial color="#1E293B" metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0, 1.28, 0.036]} rotation={[-0.38, 0, 0]}>
        <planeGeometry args={[0.54, 0.32]} />
        <meshBasicMaterial color="#0866FF" />
      </mesh>
    </group>
  );
}

export function IndustrialHall() {
  const showDimensions = useSimulationStore((s) => s.showDimensions);
  const viewMode = useSimulationStore((s) => s.viewMode);
  const isXray = viewMode === 'rayos_x';
  const forkliftRef = useRef<THREE.Group>(null);
  const strobeRef = useRef<THREE.MeshStandardMaterial>(null);

  // Sanitary Curved Stainless Piping from Mixer (-3.0, -7.2) to Isobaric Filler Rotary Union (-7.5, -1.8)
  const sanitaryPipeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-3.0, 4.05, -7.2),
        new THREE.Vector3(-3.0, 5.15, -7.2),
        new THREE.Vector3(-7.5, 5.15, -6.8),
        new THREE.Vector3(-7.5, 5.15, -1.8),
        new THREE.Vector3(-7.5, 3.92, -1.8)
      ],
      false,
      'catmullrom',
      0.14
    );
    return new THREE.TubeGeometry(curve, 48, 0.075, 14, false);
  }, []);

  const co2PipeGeo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-1.6, 4.05, -7.2),
        new THREE.Vector3(-1.6, 5.42, -7.2),
        new THREE.Vector3(-7.15, 5.42, -6.5),
        new THREE.Vector3(-7.15, 5.42, -1.8),
        new THREE.Vector3(-7.15, 3.92, -1.8)
      ],
      false,
      'catmullrom',
      0.14
    );
    return new THREE.TubeGeometry(curve, 48, 0.052, 12, false);
  }, []);

  useFrame((state) => {
    const paused = useSimulationStore.getState().paused;
    const t = state.clock.elapsedTime;
    if (!paused && forkliftRef.current) {
      const cycle = Math.sin(t * 0.35);
      forkliftRef.current.position.x = 13.8 + cycle * 1.65;
      forkliftRef.current.position.z = 7.7 + cycle * 0.32;
    }
    if (strobeRef.current) {
      strobeRef.current.emissiveIntensity = 0.6 + Math.abs(Math.sin(t * 6)) * 2.2;
    }
  });

  const columnXs = [-20, -12, -4, 4, 12, 20];

  return (
    <group>
      {/* Semi-Reflective Industrial Polished Epoxy Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[58, 36]} />
        {isXray ? (
          <meshStandardMaterial color="#050D1F" roughness={0.85} metalness={0.1} />
        ) : (
          <MeshReflectorMaterial
            blur={[320, 90]}
            resolution={512}
            mixBlur={0.9}
            mixStrength={1.35}
            roughness={0.42}
            depthScale={0.8}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#364150"
            metalness={0.2}
            mirror={0.24}
          />
        )}
      </mesh>

      {/* Subtle Concrete Slab Expansion Joints */}
      {!isXray && <gridHelper args={[56, 14, '#27313F', '#2B3646']} position={[0, 0.005, 0]} />}
      {isXray && <gridHelper args={[54, 54, '#0866FF', '#12213F']} position={[0, 0.01, 0]} />}

      {/* OSHA Yellow Safety Pedestrian Walkway */}
      <Line
        points={[
          [-22, 0.018, 2.3],
          [22, 0.018, 6.0]
        ]}
        color="#F59E0B"
        lineWidth={3.2}
      />
      <Line
        points={[
          [-22, 0.018, 4.0],
          [22, 0.018, 7.7]
        ]}
        color="#F59E0B"
        lineWidth={2.2}
      />

      {/* Industrial Insulated Cladding Walls + Glazed Clerestory Strip */}
      {!isXray && (
        <group>
          <mesh position={[0, 5.5, -11.5]} receiveShadow>
            <boxGeometry args={[54, 11, 0.35]} />
            <meshStandardMaterial color="#2D3748" roughness={0.62} metalness={0.42} />
          </mesh>
          {/* Clerestory Translucent Daylight Band */}
          <mesh position={[0, 8.6, -11.28]}>
            <planeGeometry args={[50, 1.4]} />
            <meshStandardMaterial
              color="#DCE8FF"
              emissive="#B9D1FF"
              emissiveIntensity={0.45}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 3.8, -11.3]}>
            <boxGeometry args={[53.6, 0.24, 0.05]} />
            <meshStandardMaterial color="#0866FF" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[-26.2, 5.5, 0]} receiveShadow>
            <boxGeometry args={[0.35, 11, 25]} />
            <meshStandardMaterial color="#283140" roughness={0.68} metalness={0.38} />
          </mesh>
        </group>
      )}

      {/* Structural Steel H-Columns, Trusses & Suspended High-Bay LED Luminaires */}
      {columnXs.map((x) => (
        <group key={x}>
          {/* Back & Front Flanged H-Columns */}
          {[-10.6, 9.8].map((zPos, zi) => (
            <group key={zi} position={[x, 5.2, zPos]}>
              <mesh castShadow>
                <boxGeometry args={[0.14, 10.4, 0.42]} />
                <meshStandardMaterial
                  color="#0041AD"
                  metalness={0.68}
                  roughness={0.32}
                  transparent={isXray}
                  opacity={isXray ? 0.22 : 1}
                />
              </mesh>
              <mesh position={[-0.16, 0, 0]}>
                <boxGeometry args={[0.06, 10.4, 0.44]} />
                <meshStandardMaterial color="#0866FF" metalness={0.7} roughness={0.3} transparent={isXray} opacity={isXray ? 0.22 : 1} />
              </mesh>
              <mesh position={[0.16, 0, 0]}>
                <boxGeometry args={[0.06, 10.4, 0.44]} />
                <meshStandardMaterial color="#0866FF" metalness={0.7} roughness={0.3} transparent={isXray} opacity={isXray ? 0.22 : 1} />
              </mesh>
              {/* Concrete Anchor Plinth */}
              {!isXray && (
                <mesh position={[0, -5.0, 0]}>
                  <boxGeometry args={[0.58, 0.4, 0.58]} />
                  <meshStandardMaterial color="#64748B" roughness={0.85} />
                </mesh>
              )}
            </group>
          ))}

          {/* Overhead Steel Roof Truss + High-Bay Linear LED Fixtures */}
          <mesh position={[x, 10.2, -0.4]}>
            <boxGeometry args={[0.26, 0.48, 20.8]} />
            <meshStandardMaterial
              color="#0866FF"
              metalness={0.65}
              roughness={0.35}
              transparent={isXray}
              opacity={isXray ? 0.2 : 1}
            />
          </mesh>

          {!isXray &&
            [-3.5, 2.5].map((lz, li) => (
              <group key={li} position={[x, 9.55, lz]}>
                <mesh>
                  <boxGeometry args={[1.6, 0.08, 0.36]} />
                  <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
                </mesh>
                <mesh position={[0, -0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[1.48, 0.28]} />
                  <meshStandardMaterial
                    color="#FFFFFF"
                    emissive="#EEF4FF"
                    emissiveIntensity={2.2}
                  />
                </mesh>
              </group>
            ))}
        </group>
      ))}

      {/* Sanitary Stainless Steel Process Piping & Flanged Valves (Mixer -> Filler) */}
      <group>
        <mesh geometry={sanitaryPipeGeo} castShadow>
          <meshStandardMaterial
            color={isXray ? '#63EDFF' : '#E2E8F0'}
            metalness={0.92}
            roughness={0.14}
            transparent={isXray}
            opacity={isXray ? 0.55 : 1}
          />
        </mesh>
        <mesh geometry={co2PipeGeo}>
          <meshStandardMaterial
            color={isXray ? '#0866FF' : '#CBD5E1'}
            metalness={0.88}
            roughness={0.18}
            transparent={isXray}
            opacity={isXray ? 0.45 : 1}
          />
        </mesh>
        {/* Red Sanitary Isolation Handwheel on Pipe Bridge */}
        <mesh position={[-5.2, 5.15, -6.8]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.025, 10, 20]} />
          <meshStandardMaterial color="#F04438" metalness={0.4} roughness={0.35} />
        </mesh>
      </group>

      {/* Overhead 10t Bridge Crane with Hoist Trolley & Hook */}
      {!isXray && (
        <group>
          <mesh position={[0, 8.2, -10.2]}>
            <boxGeometry args={[44, 0.38, 0.32]} />
            <meshStandardMaterial color="#EAB308" metalness={0.55} roughness={0.38} />
          </mesh>
          <mesh position={[0, 8.2, 9.4]}>
            <boxGeometry args={[44, 0.38, 0.32]} />
            <meshStandardMaterial color="#EAB308" metalness={0.55} roughness={0.38} />
          </mesh>
          <group position={[-5.5, 8.65, -0.4]}>
            <mesh castShadow>
              <boxGeometry args={[0.62, 0.54, 19.8]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.5} roughness={0.38} />
            </mesh>
            {/* Hoist Winch Trolley + Hook */}
            <mesh position={[0, -0.35, -1.4]} castShadow>
              <boxGeometry args={[0.9, 0.45, 0.85]} />
              <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
            </mesh>
            <mesh position={[0, -1.1, -1.4]}>
              <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
              <meshStandardMaterial color="#94A3B8" metalness={0.8} />
            </mesh>
            <mesh position={[0, -1.72, -1.4]}>
              <boxGeometry args={[0.18, 0.22, 0.14]} />
              <meshStandardMaterial color="#F59E0B" roughness={0.4} />
            </mesh>
          </group>
        </group>
      )}

      {/* Finished Stretch-Wrapped Pallets & Animated Industrial Forklift */}
      {!isXray && (
        <group>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} position={[7.8 + i * 1.52, 0, 6.9 + i * 0.14]}>
              {/* Wooden Euro-Pallet Deck & Blocks */}
              <mesh position={[0, 0.07, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.2, 0.14, 1.0]} />
                <meshStandardMaterial color="#A47142" roughness={0.88} />
              </mesh>
              {/* Layered Packs visible inside Glossy Stretch Film */}
              <mesh position={[0, 0.72, 0]} castShadow>
                <boxGeometry args={[1.1, 1.16, 0.92]} />
                <meshStandardMaterial color="#CBD5E1" roughness={0.45} />
              </mesh>
              <mesh position={[0, 0.72, 0]}>
                <boxGeometry args={[1.13, 1.18, 0.95]} />
                <meshPhysicalMaterial
                  color="#F8FAFC"
                  transparent
                  opacity={0.38}
                  roughness={0.08}
                  clearcoat={1}
                />
              </mesh>
            </group>
          ))}

          {/* Realistic Counterbalance Forklift */}
          <group ref={forkliftRef} position={[13.8, 0, 7.7]} rotation={[0, -0.52, 0]}>
            {/* Counterweight Chassis */}
            <mesh position={[0, 0.52, -0.1]} castShadow>
              <boxGeometry args={[1.12, 0.76, 1.72]} />
              <meshStandardMaterial color="#F59E0B" metalness={0.35} roughness={0.36} />
            </mesh>
            <mesh position={[0, 0.26, -0.78]} castShadow>
              <boxGeometry args={[1.1, 0.42, 0.42]} />
              <meshStandardMaterial color="#1E293B" metalness={0.6} roughness={0.45} />
            </mesh>
            {/* 4 Rubber Industrial Tires */}
            {[
              [-0.56, 0.26, 0.52],
              [0.56, 0.26, 0.52],
              [-0.52, 0.22, -0.62],
              [0.52, 0.22, -0.62]
            ].map(([wx, wy, wz], wi) => (
              <mesh key={wi} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]} castShadow>
                <cylinderGeometry args={[wy, wy, 0.22, 18]} />
                <meshStandardMaterial color="#0F172A" roughness={0.9} />
              </mesh>
            ))}
            {/* ROPS Safety Cage Pillars */}
            {[
              [-0.48, 1.32, 0.38],
              [0.48, 1.32, 0.38],
              [-0.48, 1.32, -0.58],
              [0.48, 1.32, -0.58]
            ].map(([px, py, pz], pi) => (
              <mesh key={pi} position={[px, py, pz]}>
                <cylinderGeometry args={[0.032, 0.032, 1.05, 8]} />
                <meshStandardMaterial color="#0F172A" metalness={0.7} />
              </mesh>
            ))}
            <mesh position={[0, 1.85, -0.1]}>
              <boxGeometry args={[1.04, 0.05, 1.06]} />
              <meshStandardMaterial color="#0F172A" metalness={0.7} />
            </mesh>
            {/* Flashing Amber Safety Strobe */}
            <mesh position={[0.35, 1.94, -0.45]}>
              <cylinderGeometry args={[0.055, 0.065, 0.12, 12]} />
              <meshStandardMaterial ref={strobeRef} color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.8} />
            </mesh>
            {/* Duplex Hydraulic Mast & Steel Forks */}
            <mesh position={[-0.32, 1.15, 0.86]}>
              <boxGeometry args={[0.09, 2.1, 0.1]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.28} />
            </mesh>
            <mesh position={[0.32, 1.15, 0.86]}>
              <boxGeometry args={[0.09, 2.1, 0.1]} />
              <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.28} />
            </mesh>
            <mesh position={[-0.26, 0.14, 1.38]}>
              <boxGeometry args={[0.11, 0.04, 1.05]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
            </mesh>
            <mesh position={[0.26, 0.14, 1.38]}>
              <boxGeometry args={[0.11, 0.04, 1.05]} />
              <meshStandardMaterial color="#475569" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        </group>
      )}

      {/* Living Articulated Operators & Floor HMI Consoles */}
      {!isXray && (
        <>
          {/* Walking Line Supervisor along Yellow Pedestrian Walkway */}
          <ArticulatedOperator
            basePosition={[-3.5, 0, 3.8]}
            walkRangeX={6.5}
            walkSpeed={0.8}
            vestColor="#F59E0B"
          />

          {/* Filler / Quality Operator actively working at the HMI Console */}
          <ArticulatedOperator
            basePosition={[-0.45, 0, 1.95]}
            rotationY={2.85}
            vestColor="#12B76A"
            operatingHmi
          />
          <HmiPedestal position={[-0.25, 0, 1.35]} rotationY={-0.35} />

          <ArticulatedOperator
            basePosition={[-9.9, 0, 0.7]}
            rotationY={2.5}
            vestColor="#0866FF"
            operatingHmi
          />
          <HmiPedestal position={[-9.6, 0, 0.1]} rotationY={-0.5} />
        </>
      )}

      {/* Toggleable Engineering Dimensions */}
      {showDimensions && (
        <group>
          <Line
            points={[
              [-17.5, 0.08, 8.6],
              [19.0, 0.08, 8.6]
            ]}
            color="#63EDFF"
            lineWidth={2}
          />
          <Html position={[0.8, 0.35, 8.6]} center>
            <div className="ce-mono px-2 py-0.5 text-[11px] rounded bg-[#050D1F]/90 text-[#63EDFF] border border-[#63EDFF]/40 whitespace-nowrap">
              LONGITUD LÍNEA PET 2: 36,50 m · ESCALA 1:1
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
