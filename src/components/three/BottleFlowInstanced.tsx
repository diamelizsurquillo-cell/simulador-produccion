import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/simulationStore';
import {
  getBottleLabelSleeveGeometry,
  getInternalLiquidGeometry,
  getSculptedPetBottleGeometry
} from './petBottleGeometry';

const MOVING_BOTTLE_COUNT = 104;
const MAX_REJECT_TABLE_BOTTLES = 28;
const SHRINK_PACK_COUNT = 14;

export function BottleFlowInstanced() {
  const shellMeshRef = useRef<THREE.InstancedMesh>(null);
  const liquidMeshRef = useRef<THREE.InstancedMesh>(null);
  const capMeshRef = useRef<THREE.InstancedMesh>(null);
  const labelMeshRef = useRef<THREE.InstancedMesh>(null);
  const rejectShellRef = useRef<THREE.InstancedMesh>(null);
  const rejectLiquidRef = useRef<THREE.InstancedMesh>(null);
  const packMeshRef = useRef<THREE.InstancedMesh>(null);

  const shellGeo = useMemo(() => getSculptedPetBottleGeometry(), []);
  const liquidGeo = useMemo(() => getInternalLiquidGeometry(), []);
  const labelGeo = useMemo(() => getBottleLabelSleeveGeometry(), []);

  const progressRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    const s = useSimulationStore.getState();
    const bpm = s.lineDynamics.effectiveFillerBpm;
    const speedFactor = s.paused ? 0 : (bpm / 400) * Math.min(s.simSpeedMultiplier, 10);
    progressRef.current = (progressRef.current + delta * speedFactor * 0.052) % 1;

    // 1. Sculpted PET Bottles flowing from Blower (-13.6) -> Filler -> Capper -> Inspector -> Buffer -> Labeler -> Shrink Wrapper (9.3)
    if (
      shellMeshRef.current &&
      liquidMeshRef.current &&
      capMeshRef.current &&
      labelMeshRef.current
    ) {
      for (let i = 0; i < MOVING_BOTTLE_COUNT; i++) {
        const u = (i / MOVING_BOTTLE_COUNT + progressRef.current) % 1;
        const x = -13.6 + u * 22.9;
        let z = 0.75 + (x - 0.6) * 0.201;

        // Multi-lane serpentine wave inside Accumulation Buffer ("Pulmón" x = 0.0..2.8)
        if (x > -0.2 && x < 2.8) {
          const bufRatio = s.bufferBottles / Math.max(100, s.bufferCapacity);
          z += Math.sin(i * 1.9) * 0.26 * Math.min(1, bufRatio * 1.8);
        }

        // Physical Ejector Kick at Inspector HF (x near -1.4) for every 40th bottle (Valve 23!) when not bypassed
        const isV23Bottle = i % 26 === 0 && !s.valve23Bypassed;
        if (isV23Bottle && x > -1.45 && x < -0.75) {
          const kickProgress = (x - -1.45) / 0.7;
          z += kickProgress * 0.95;
        }

        // Hide conveyor bottles inside solid Filler/Capper monobloc transfer (-9.3..-4.0) because carousel renders 40 bottles
        const insideFillerCore = (x > -9.2 && x < -4.0) || (isV23Bottle && x >= -0.75);
        const sc = insideFillerCore ? 0.001 : 1;

        // Outer Glossy PET Shell
        dummy.position.set(x, 1.05, z);
        dummy.rotation.set(0, i * 0.5, 0);
        dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix();
        shellMeshRef.current.setMatrixAt(i, dummy.matrix);

        // Internal Dark Cola Liquid (only present after Filler x >= -4.0)
        const hasLiquid = !insideFillerCore && x >= -4.0;
        const fillLevel = isV23Bottle ? 0.72 : s.operatorCompensatesSetpoint ? 1.05 : 0.99;
        dummy.position.set(x, 1.065, z);
        dummy.scale.set(hasLiquid ? 1 : 0.001, hasLiquid ? fillLevel : 0.001, hasLiquid ? 1 : 0.001);
        dummy.updateMatrix();
        liquidMeshRef.current.setMatrixAt(i, dummy.matrix);

        // Red Threaded Cap (present after Capper x >= -4.0)
        const capSc = hasLiquid ? 1 : 0.001;
        dummy.position.set(x, 1.61, z);
        dummy.scale.set(capSc, capSc, capSc);
        dummy.updateMatrix();
        capMeshRef.current.setMatrixAt(i, dummy.matrix);

        // Wrap-Around Branded Label Sleeve (present after Rotary Labeler x >= 4.2)
        const hasLabel = !insideFillerCore && x >= 4.2;
        dummy.position.set(x, 1.34, z);
        dummy.scale.set(hasLabel ? 1 : 0.001, hasLabel ? 1 : 0.001, hasLabel ? 1 : 0.001);
        dummy.updateMatrix();
        labelMeshRef.current.setMatrixAt(i, dummy.matrix);
      }

      shellMeshRef.current.instanceMatrix.needsUpdate = true;
      liquidMeshRef.current.instanceMatrix.needsUpdate = true;
      capMeshRef.current.instanceMatrix.needsUpdate = true;
      labelMeshRef.current.instanceMatrix.needsUpdate = true;
    }

    // 2. Sculpted Underfilled Bottles accumulated on the Reject Table
    if (rejectShellRef.current && rejectLiquidRef.current) {
      const visibleRejects = s.valve23Bypassed
        ? 2
        : Math.min(
            MAX_REJECT_TABLE_BOTTLES,
            Math.max(3, Math.round(s.fillerResult.totalLineRejectPct * 12))
          );

      for (let r = 0; r < MAX_REJECT_TABLE_BOTTLES; r++) {
        const col = r % 7;
        const row = Math.floor(r / 7);
        const rx = -1.85 + col * 0.205;
        const rz = 0.42 + row * 0.215;
        const sc = r < visibleRejects ? 1 : 0.001;

        dummy.position.set(rx, 0.99, rz);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(sc, sc, sc);
        dummy.updateMatrix();
        rejectShellRef.current.setMatrixAt(r, dummy.matrix);

        // Visibly underfilled (~72% height) on the reject table!
        dummy.position.set(rx, 1.005, rz);
        dummy.scale.set(sc, sc * 0.72, sc);
        dummy.updateMatrix();
        rejectLiquidRef.current.setMatrixAt(r, dummy.matrix);
      }
      rejectShellRef.current.instanceMatrix.needsUpdate = true;
      rejectLiquidRef.current.instanceMatrix.needsUpdate = true;
    }

    // 3. Glossy Shrink-Wrapped 6-Packs exiting Heat Tunnel toward Robot Pickup
    if (packMeshRef.current) {
      const haltedSto = s.activeHseEvents.includes('intrusion');
      for (let p = 0; p < SHRINK_PACK_COUNT; p++) {
        const u = (p / SHRINK_PACK_COUNT + (haltedSto ? 0 : progressRef.current * 2.4)) % 1;
        const x = 11.8 + u * 4.2;
        const z = 0.75 + (x - 0.6) * 0.201;
        dummy.position.set(x, 1.27, z);
        dummy.rotation.set(0, -0.198, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        packMeshRef.current.setMatrixAt(p, dummy.matrix);
      }
      packMeshRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Clear Glossy Sculpted PET Bottle Shells */}
      <instancedMesh
        ref={shellMeshRef}
        args={[shellGeo, undefined, MOVING_BOTTLE_COUNT]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#E2F1FF"
          transparent
          opacity={0.44}
          roughness={0.07}
          metalness={0.05}
          clearcoat={1}
        />
      </instancedMesh>

      {/* Internal Cola Liquid Columns */}
      <instancedMesh
        ref={liquidMeshRef}
        args={[liquidGeo, undefined, MOVING_BOTTLE_COUNT]}
      >
        <meshStandardMaterial color="#2D130B" roughness={0.18} metalness={0.08} />
      </instancedMesh>

      {/* Red Knurled Bottle Caps */}
      <instancedMesh ref={capMeshRef} args={[undefined, undefined, MOVING_BOTTLE_COUNT]}>
        <cylinderGeometry args={[0.025, 0.027, 0.042, 12]} />
        <meshStandardMaterial color="#DC2626" roughness={0.3} />
      </instancedMesh>

      {/* Wrap-AroundOPP Label Sleeves (Post-Labeler) */}
      <instancedMesh ref={labelMeshRef} args={[labelGeo, undefined, MOVING_BOTTLE_COUNT]}>
        <meshStandardMaterial
          color="#DC2626"
          roughness={0.22}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </instancedMesh>

      {/* Rejected Underfilled Bottles on Lateral Table (Shell + Low Liquid) */}
      <instancedMesh
        ref={rejectShellRef}
        args={[shellGeo, undefined, MAX_REJECT_TABLE_BOTTLES]}
        castShadow
      >
        <meshPhysicalMaterial
          color="#E2F1FF"
          transparent
          opacity={0.45}
          roughness={0.08}
          clearcoat={1}
        />
      </instancedMesh>
      <instancedMesh
        ref={rejectLiquidRef}
        args={[liquidGeo, undefined, MAX_REJECT_TABLE_BOTTLES]}
      >
        <meshStandardMaterial color="#7F1D1D" roughness={0.2} />
      </instancedMesh>

      {/* Glossy Shrink-Wrapped 6-Packs */}
      <instancedMesh ref={packMeshRef} args={[undefined, undefined, SHRINK_PACK_COUNT]} castShadow>
        <boxGeometry args={[0.45, 0.48, 0.31]} />
        <meshPhysicalMaterial
          color="#E2E8F0"
          transparent
          opacity={0.82}
          roughness={0.08}
          clearcoat={1}
        />
      </instancedMesh>
    </group>
  );
}
