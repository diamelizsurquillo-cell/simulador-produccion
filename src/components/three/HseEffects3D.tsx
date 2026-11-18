import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';

export function HseEffects3D() {
  const activeHseEvents = useSimulationStore((s) => s.activeHseEvents);
  const resolveHseIn3D = useSimulationStore((s) => s.resolveHseIn3D);
  const co2CloudRef = useRef<THREE.Group>(null);
  const spillRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (co2CloudRef.current) {
      co2CloudRef.current.children.forEach((child, idx) => {
        child.position.y = 1.6 + Math.sin(t * 1.4 + idx) * 0.45 + (idx % 3) * 0.55;
        const sc = 0.85 + Math.sin(t * 1.8 + idx * 0.9) * 0.22;
        child.scale.set(sc, sc, sc);
      });
    }
    if (spillRingRef.current) {
      const pulse = 1 + Math.sin(t * 3.2) * 0.06;
      spillRingRef.current.scale.set(pulse, pulse, 1);
    }
  });

  const hasIntrusion = activeHseEvents.includes('intrusion');
  const hasCo2 = activeHseEvents.includes('co2_leak');
  const hasSpill = activeHseEvents.includes('floor_spill');

  return (
    <group>
      {/* 1. INTRUSION IN ROBOT CELL — DIRECT 3D LOTO RESET */}
      {hasIntrusion && (
        <group position={[16.8, 0, 4.0]}>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[4.8, 2.3, 4.4]} />
            <meshBasicMaterial color="#F04438" transparent opacity={0.18} side={THREE.DoubleSide} />
          </mesh>
          <group position={[1.15, 0, 1.35]}>
            <mesh position={[0, 0.9, 0]}>
              <capsuleGeometry args={[0.2, 0.85, 8, 12]} />
              <meshStandardMaterial color="#F97316" emissive="#F04438" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 1.56, 0]}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>
          </group>
          <Html position={[0, 3.0, 0]} center zIndexRange={[35, 0]}>
            <div className="p-2.5 rounded-[10px] bg-[#050D1F]/95 border border-[#F04438] shadow-2xl text-center space-y-1.5">
              <div className="text-[11.5px] font-bold text-[#FCA5A5]">
                ✕ Intrusión en Celda · Robot en Parada STO
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resolveHseIn3D('intrusion');
                }}
                className="w-full px-3 py-1.5 rounded-[6px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[11.5px] font-semibold cursor-pointer"
              >
                🔒 Despejar área, aplicar LOTO y rearmar
              </button>
            </div>
          </Html>
        </group>
      )}

      {/* 2. CO2 GAS LEAK — DIRECT 3D EXTRACTION & VALVE ISOLATION */}
      {hasCo2 && (
        <group position={[-2.6, 0, -5.8]}>
          <group ref={co2CloudRef}>
            {[
              [0, 2.2, 0],
              [-0.7, 1.8, 0.5],
              [0.65, 1.5, 0.4],
              [-0.3, 1.2, 1.1],
              [0.4, 2.6, -0.4],
              [0.1, 0.9, 1.5]
            ].map(([cx, cy, cz], idx) => (
              <mesh key={idx} position={[cx, cy, cz]}>
                <sphereGeometry args={[0.68, 16, 16]} />
                <meshStandardMaterial
                  color="#E2E8F0"
                  emissive="#63EDFF"
                  emissiveIntensity={0.22}
                  transparent
                  opacity={0.34}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
          <Html position={[0, 3.85, 0]} center zIndexRange={[35, 0]}>
            <div className="p-2.5 rounded-[10px] bg-[#050D1F]/95 border border-[#F04438] shadow-2xl text-center space-y-1.5">
              <div className="ce-mono text-[11.5px] font-bold text-[#FCA5A5]">
                ✕ Fuga CO₂ · AT-901: 3.250 ppm
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resolveHseIn3D('co2_leak');
                }}
                className="w-full px-3 py-1.5 rounded-[6px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[11.5px] font-semibold cursor-pointer"
              >
                🌀 Activar extracción y aislar brida CO₂
              </button>
            </div>
          </Html>
        </group>
      )}

      {/* 3. PRODUCT SPILL ON FLOOR — DIRECT 3D CLEANUP */}
      {hasSpill && (
        <group position={[-1.25, 0.02, 1.95]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} scale={[1.35, 0.95, 1]}>
            <circleGeometry args={[1.05, 32]} />
            <meshStandardMaterial color="#2A120A" roughness={0.08} metalness={0.35} />
          </mesh>
          <mesh ref={spillRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[1.48, 1.62, 48]} />
            <meshBasicMaterial color="#F79009" side={THREE.DoubleSide} />
          </mesh>
          <Html position={[0, 1.05, 0]} center zIndexRange={[35, 0]}>
            <div className="p-2.5 rounded-[10px] bg-[#050D1F]/95 border border-[#F79009] shadow-2xl text-center space-y-1.5">
              <div className="text-[11.5px] font-bold text-[#FDE68A]">
                ! Derrame azucarado · Riesgo de caída
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resolveHseIn3D('floor_spill');
                }}
                className="w-full px-3 py-1.5 rounded-[6px] bg-[#F79009] hover:bg-[#F59E0B] text-[#050D1F] text-[11.5px] font-bold cursor-pointer"
              >
                🧹 Señalizar y limpiar derrame ahora
              </button>
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
