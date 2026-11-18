import { useState } from 'react';
import { ChevronDown, ChevronUp, ScanLine, ShieldAlert, Sparkles, X, Zap } from 'lucide-react';
import { ASSETS_CATALOG, HSE_CATALOG } from '../../core/masterData/linePet2Catalog';
import { useSimulationStore } from '../../store/simulationStore';

export function AssetAndHseInspectorCard() {
  const [expanded, setExpanded] = useState(false);

  const selectedMachineId = useSimulationStore((s) => s.selectedMachineId);
  const selectedHseId = useSimulationStore((s) => s.selectedHseId);
  const selectMachine = useSimulationStore((s) => s.selectMachine);
  const selectHseEvent = useSimulationStore((s) => s.selectHseEvent);
  const resolveHseIn3D = useSimulationStore((s) => s.resolveHseIn3D);
  const setViewMode = useSimulationStore((s) => s.setViewMode);
  const viewMode = useSimulationStore((s) => s.viewMode);
  const sampleBottleIn3D = useSimulationStore((s) => s.sampleBottleIn3D);
  const applyDecisionOption = useSimulationStore((s) => s.applyDecisionOption);

  const fillerResult = useSimulationStore((s) => s.fillerResult);
  const lineDynamics = useSimulationStore((s) => s.lineDynamics);
  const businessImpact = useSimulationStore((s) => s.businessImpact);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const sensorReadings = useSimulationStore((s) => s.sensorReadings);

  // Progressive Disclosure: ZERO clutter when nothing is selected!
  if (!selectedMachineId && !selectedHseId) {
    return null;
  }

  // 1. Compact HSE Action Card
  if (selectedHseId && HSE_CATALOG[selectedHseId]) {
    const hse = HSE_CATALOG[selectedHseId];
    return (
      <aside className="pointer-events-auto w-[calc(100vw-24px)] max-w-[300px] rounded-[12px] bg-[var(--ce-bg-card)] backdrop-blur-md border border-[#F04438] p-3 sm:p-3.5 shadow-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F04438] text-white">
            ✕ EMERGENCIA HSE ACTIVA
          </span>
          <button
            onClick={() => selectHseEvent(null, false)}
            className="text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="ce-heading text-[15px] text-[var(--ce-text-primary)]">{hse.title}</h2>
        <div className="ce-mono text-[11px] text-[#63EDFF]">{hse.sensorTag}</div>
        <p className="text-[12px] text-[var(--ce-text-secondary)] leading-snug">{hse.effect}</p>

        <button
          onClick={() => resolveHseIn3D(selectedHseId)}
          className="w-full py-2 px-3 rounded-[8px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[12.5px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Ejecutar protocolo y despejar</span>
        </button>
      </aside>
    );
  }

  // 2. Minimalist Selected Machine Card (3 Key Metrics + 1 Direct Action + Expandable Detail)
  const asset = ASSETS_CATALOG.find((a) => a.id === selectedMachineId)!;
  const v23 = fillerResult.valves[22];
  const machineSensors = sensorReadings.filter((s) => s.machineId === asset.id);
  const topFmea = businessImpact.fmeaRanking[0];

  return (
    <aside className="pointer-events-auto w-[calc(100vw-24px)] max-w-[305px] max-h-[55dvh] overflow-y-auto rounded-[12px] bg-[var(--ce-bg-card)] backdrop-blur-md border border-[var(--ce-border-strong)] p-3 sm:p-3.5 shadow-2xl space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="ce-mono text-[10px] text-[#63EDFF]">UT SAP {asset.sapLocation}</div>
          <h2 className="ce-heading text-[15.5px] text-[var(--ce-text-primary)] mt-0.5">
            {asset.name}
          </h2>
        </div>
        <button
          onClick={() => selectMachine(null, false)}
          className="text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)] cursor-pointer"
          aria-label="Cerrar tarjeta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Only 3 Crisp Metrics */}
      {asset.id === 'llenadora' ? (
        <div className="grid grid-cols-3 gap-1.5 text-center">
          <div className="p-2 rounded-[6px] bg-[var(--ce-bg-card-elevated)]/70">
            <div className="text-[10px] text-[var(--ce-text-muted)]">Ritmo</div>
            <div className="ce-mono text-[13.5px] font-bold mt-0.5">{lineDynamics.effectiveFillerBpm}</div>
          </div>
          <div className="p-2 rounded-[6px] bg-[var(--ce-bg-card-elevated)]/70">
            <div className="text-[10px] text-[var(--ce-text-muted)]">Válvula 23</div>
            <div className="ce-mono text-[13.5px] font-bold text-[#F04438] mt-0.5">
              {valve23Bypassed ? 'BYPASS' : `${v23.meanDeviationMl.toLocaleString('es-419')}ml`}
            </div>
          </div>
          <div className="p-2 rounded-[6px] bg-[var(--ce-bg-card-elevated)]/70">
            <div className="text-[10px] text-[var(--ce-text-muted)]">Causa #1</div>
            <div className="ce-mono text-[13.5px] font-bold text-[#63EDFF] mt-0.5">
              {topFmea.probabilityPct}%
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          <div className="p-2 rounded-[6px] bg-[var(--ce-bg-card-elevated)]/70">
            <div className="text-[10px] text-[var(--ce-text-muted)]">Nominal</div>
            <div className="ce-mono text-[13px] font-bold mt-0.5">{asset.designSpeedBpm} bpm</div>
          </div>
          <div className="p-2 rounded-[6px] bg-[var(--ce-bg-card-elevated)]/70">
            <div className="text-[10px] text-[var(--ce-text-muted)]">
              {machineSensors[0]?.tag ?? 'Estado'}
            </div>
            <div className="ce-mono text-[13px] font-bold text-[#63EDFF] mt-0.5">
              {machineSensors[0]?.formattedValue ?? '✓ OK'}
            </div>
          </div>
        </div>
      )}

      {/* Primary Direct Action per Machine */}
      {asset.id === 'llenadora' && !valve23Bypassed && (
        <button
          onClick={() => (viewMode !== 'rayos_x' ? setViewMode('rayos_x') : applyDecisionOption('B'))}
          className="w-full py-2 px-3 rounded-[8px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[12.5px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {viewMode !== 'rayos_x' ? (
            <>
              <ScanLine className="w-4 h-4" />
              <span>Ver válvulas en Rayos X</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Hacer Bypass a Válvula 23</span>
            </>
          )}
        </button>
      )}

      {asset.id === 'inspector' && (
        <button
          onClick={() => sampleBottleIn3D()}
          className="w-full py-2 px-3 rounded-[8px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[12.5px] font-semibold cursor-pointer"
        >
          ⚖️ Pesar botella en vivo ahora
        </button>
      )}

      {/* Optional Expandable Technical FMEA & BOM Detail */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full pt-1.5 border-t border-[var(--ce-border-subtle)] flex items-center justify-between text-[11px] text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)] cursor-pointer"
      >
        <span>{expanded ? 'Ocultar diagnóstico FMEA y BOM' : 'Ver diagnóstico FMEA y repuestos'}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="space-y-2 text-[11.5px] pt-1">
          <div className="flex items-center justify-between">
            <span className="ce-overline text-[9.5px] text-[#63EDFF]">FMEA × SEÑALES</span>
            <span className="text-[10px] text-[var(--ce-text-muted)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#63EDFF]" /> Modelo activo
            </span>
          </div>
          {(asset.id === 'llenadora' ? businessImpact.fmeaRanking : asset.fmeaModes.map((m) => ({
            id: m.id,
            cause: m.cause,
            probabilityPct: Math.round(m.basePrior * 100)
          }))).map((f, idx) => (
            <div key={f.id}>
              <div className="flex justify-between gap-2 text-[11px]">
                <span className="truncate">{f.cause}</span>
                <span className="ce-mono font-semibold">{f.probabilityPct}%</span>
              </div>
              <div className="w-full h-1 bg-[var(--ce-bg-card-elevated)] rounded-full mt-0.5 overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${f.probabilityPct}%`,
                    backgroundColor: idx === 0 ? '#0866FF' : '#64748B'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
