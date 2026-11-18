import { Html } from '@react-three/drei';
import { useSimulationStore } from '../../store/simulationStore';
import { ASSETS_CATALOG } from '../../core/masterData/linePet2Catalog';

export function SpatialOverlays() {
  const showIotTags = useSimulationStore((s) => s.showIotTags);
  const sensorReadings = useSimulationStore((s) => s.sensorReadings);
  const fillerResult = useSimulationStore((s) => s.fillerResult);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const hoveredMachineId = useSimulationStore((s) => s.hoveredMachineId);
  const selectedMachineId = useSimulationStore((s) => s.selectedMachineId);
  const selectMachine = useSimulationStore((s) => s.selectMachine);

  const v23 = fillerResult.valves[22];
  const hoveredAsset = hoveredMachineId
    ? ASSETS_CATALOG.find((a) => a.id === hoveredMachineId)
    : null;

  return (
    <group>
      {/* Clean Hover Label ONLY for the machine currently under the cursor! */}
      {hoveredAsset && hoveredAsset.id !== selectedMachineId && (
        <Html
          position={[
            hoveredAsset.position3D[0],
            hoveredAsset.id === 'llenadora' ? 4.35 : 3.25,
            hoveredAsset.position3D[2]
          ]}
          center
          zIndexRange={[25, 0]}
        >
          <div className="px-2.5 py-1 rounded-[6px] bg-[#050D1F]/92 text-[#F1F5F9] border border-[#0866FF] text-[11.5px] font-semibold shadow-lg whitespace-nowrap pointer-events-none">
            <span className="ce-mono text-[#63EDFF] mr-1">{hoveredAsset.orderIndex}</span>
            {hoveredAsset.name} · <span className="text-[#8AB3FF]">Clic para operar</span>
          </div>
        </Html>
      )}

      {/* Single Clickable Fault Hotspot on Filler ONLY when unselected & failing */}
      {!valve23Bypassed && v23.status === 'critical' && selectedMachineId !== 'llenadora' && (
        <Html position={[-7.5, 4.65, -1.8]} center zIndexRange={[18, 0]}>
          <button
            onClick={() => selectMachine('llenadora', true)}
            className="ce-mono px-3 py-1 rounded-full bg-[#F04438] hover:bg-[#DC2626] text-white text-[11.5px] font-bold shadow-xl flex items-center gap-1.5 whitespace-nowrap cursor-pointer border border-white/40"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>! Falla activa en Llenadora (V23) · Clic para intervenir</span>
          </button>
        </Html>
      )}

      {/* Layer 2: 12 IIoT Sensor Tags (ONLY when toggled ON by user) */}
      {showIotTags &&
        sensorReadings.map((sensor) => {
          const borderCol =
            sensor.status === 'critical'
              ? 'border-[#F04438] text-[#FCA5A5]'
              : sensor.status === 'warning'
                ? 'border-[#F79009] text-[#FDE68A]'
                : 'border-[#63EDFF]/60 text-[#F1F5F9]';

          return (
            <Html key={sensor.tag} position={sensor.position3D} center zIndexRange={[20, 0]}>
              <button
                onClick={() => selectMachine(sensor.machineId, true)}
                title={`${sensor.name} · Precisión conocida: ${sensor.knownPrecision}`}
                className={`ce-mono px-2 py-0.5 rounded bg-[#050D1F]/92 border ${borderCol} text-[10.5px] shadow-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#63EDFF] ce-pulse-dot" />
                <span className="text-[#63EDFF] font-semibold">{sensor.tag}</span>
                <span>{sensor.formattedValue}</span>
              </button>
            </Html>
          );
        })}
    </group>
  );
}
