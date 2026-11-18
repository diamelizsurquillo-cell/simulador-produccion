import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSimulationStore } from '../../store/simulationStore';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera } = useThree();
  const cameraTargetPose = useSimulationStore((s) => s.cameraTargetPose);

  const desiredPos = useRef(new THREE.Vector3(...cameraTargetPose.position));
  const desiredTarget = useRef(new THREE.Vector3(...cameraTargetPose.target));
  const isFlying = useRef(true);

  useEffect(() => {
    desiredPos.current.set(...cameraTargetPose.position);
    desiredTarget.current.set(...cameraTargetPose.target);
    isFlying.current = true;
  }, [cameraTargetPose]);

  useFrame((_, delta) => {
    // Advance simulation core in lockstep with render loop
    useSimulationStore.getState().tick(delta);

    if (isFlying.current && controlsRef.current) {
      const alpha = Math.min(1, delta * 3.8);
      camera.position.lerp(desiredPos.current, alpha);
      controlsRef.current.target.lerp(desiredTarget.current, alpha);
      controlsRef.current.update();

      if (
        camera.position.distanceTo(desiredPos.current) < 0.08 &&
        controlsRef.current.target.distanceTo(desiredTarget.current) < 0.08
      ) {
        isFlying.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.065}
      minDistance={1.9}
      maxDistance={40}
      maxPolarAngle={Math.PI / 2 - 0.04}
      onStart={() => {
        isFlying.current = false;
      }}
    />
  );
}
