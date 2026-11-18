import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { CameraController } from './CameraController';
import { IndustrialHall } from './IndustrialHall';
import { IsobaricFiller3D } from './IsobaricFiller3D';
import { MachinesGroup } from './MachinesGroup';
import { BottleFlowInstanced } from './BottleFlowInstanced';
import { HseEffects3D } from './HseEffects3D';
import { SpatialOverlays } from './SpatialOverlays';
import { useSimulationStore } from '../../store/simulationStore';
import { useDeviceViewport } from '../../hooks/useDeviceViewport';

export function PlantCanvas() {
  const viewMode = useSimulationStore((s) => s.viewMode);
  const selectMachine = useSimulationStore((s) => s.selectMachine);
  const { recommendedDpr, recommendedFov } = useDeviceViewport();
  const isXray = viewMode === 'rayos_x';

  return (
    <div className="w-full h-full relative select-none touch-none">
      <Canvas
        shadows
        dpr={recommendedDpr}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: isXray ? 1.0 : 1.12,
          powerPreference: 'high-performance'
        }}
        camera={{ position: [-2.2, 6.2, 11.4], fov: recommendedFov, near: 0.15, far: 130 }}
        onPointerMissed={() => selectMachine(null, false)}
      >
        <color attach="background" args={[isXray ? '#050D1F' : '#111927']} />
        <fog attach="fog" args={[isXray ? '#050D1F' : '#111927', 28, 68]} />

        {/* Procedural Studio-Grade Industrial High-Bay HDRI Environment (Zero network dependency!) */}
        <Environment resolution={256} frames={1}>
          <color attach="background" args={['#0B1630']} />
          {/* Overhead High-Bay Linear LED Skylight Strips for realistic AISI 316 Stainless Reflections */}
          <Lightformer
            form="rect"
            intensity={isXray ? 1.2 : 3.4}
            color="#F8FAFC"
            position={[-8, 10, -1]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[14, 2.2, 1]}
          />
          <Lightformer
            form="rect"
            intensity={isXray ? 1.2 : 3.2}
            color="#F1F5F9"
            position={[8, 10, 2]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[14, 2.2, 1]}
          />
          {/* Cool Industrial Clerestory Window Side Bounce */}
          <Lightformer
            form="rect"
            intensity={1.8}
            color="#DCE8FF"
            position={[0, 5, 16]}
            rotation={[0, Math.PI, 0]}
            scale={[28, 5, 1]}
          />
          {/* Canal Ejecutivo Cobalt Rim Reflection */}
          <Lightformer
            form="rect"
            intensity={1.4}
            color="#0866FF"
            position={[-20, 6, -8]}
            rotation={[0, Math.PI / 3, 0]}
            scale={[12, 6, 1]}
          />
          {/* Warm Industrial IR Oven Fill */}
          <Lightformer
            form="circle"
            intensity={1.5}
            color="#FDBA74"
            position={[-16, 2.5, 2]}
            scale={[4, 4, 1]}
          />
        </Environment>

        {/* Key Physical Sun / Skylight + Fill */}
        <ambientLight intensity={isXray ? 0.45 : 0.35} color="#DCE8FF" />
        <hemisphereLight args={['#F1F5F9', '#0A2A66', isXray ? 0.35 : 0.45]} />
        <directionalLight
          castShadow
          position={[11, 20, 13]}
          intensity={isXray ? 0.7 : 1.65}
          color="#FFFDF9"
          shadow-bias={-0.0003}
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-24}
          shadow-camera-right={24}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
        />

        {/* Soft Grounding Ambient Occlusion Contact Shadows */}
        {!isXray && (
          <ContactShadows
            position={[0, 0.012, 0]}
            opacity={0.55}
            scale={46}
            blur={1.85}
            far={7}
            resolution={512}
            frames={1}
            color="#040914"
          />
        )}

        <CameraController />
        <IndustrialHall />
        <IsobaricFiller3D />
        <MachinesGroup />
        <BottleFlowInstanced />
        <HseEffects3D />
        <SpatialOverlays />
      </Canvas>
    </div>
  );
}
