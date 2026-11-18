import { Pause, Play, RotateCcw } from 'lucide-react';
import { ScenarioPresetId, useSimulationStore } from '../../store/simulationStore';

export function BottomTransportBar() {
  const scenarioId = useSimulationStore((s) => s.scenarioId);
  const setScenario = useSimulationStore((s) => s.setScenario);
  const simSpeedMultiplier = useSimulationStore((s) => s.simSpeedMultiplier);
  const setSimSpeed = useSimulationStore((s) => s.setSimSpeed);
  const paused = useSimulationStore((s) => s.paused);
  const togglePause = useSimulationStore((s) => s.togglePause);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);
  const operationalEventBanner = useSimulationStore((s) => s.operationalEventBanner);

  const speeds: (1 | 6 | 30)[] = [1, 6, 30];

  return (
    <div className="pointer-events-auto flex flex-wrap items-center gap-2 px-3 py-2 rounded-[8px] bg-[var(--ce-bg-card)] backdrop-blur-md border border-[var(--ce-border-subtle)] shadow-lg">
      <label className="ce-overline text-[10px] text-[var(--ce-text-muted)]">ESCENARIO</label>
      <select
        aria-label="Seleccionar escenario operativo"
        value={scenarioId}
        onChange={(e) => setScenario(e.target.value as ScenarioPresetId)}
        className="px-2.5 py-1 rounded-[4px] text-[12px] font-medium bg-[var(--ce-bg-card-elevated)] text-[var(--ce-text-primary)] border border-[var(--ce-border-strong)] cursor-pointer"
      >
        <option value="v23_wear">Desgaste válvula de llenado 23</option>
        <option value="hidden_overfill">Sobrellenado oculto (+5,0 ml setpoint)</option>
        <option value="optimal_nominal">Operación óptima gobernada (404 bpm)</option>
        <option value="labeler_wear">Vibración y desgaste en etiquetadora</option>
        <option value="overspeed_foam">Sobrevelocidad forzada y espumado (440 bpm)</option>
      </select>

      <div className="h-4 w-[1px] bg-[var(--ce-border-strong)] mx-1" />

      <span className="ce-overline text-[10px] text-[var(--ce-text-muted)]">VEL.</span>
      <div className="flex items-center gap-1">
        {speeds.map((mult) => {
          const active = !paused && simSpeedMultiplier === mult;
          return (
            <button
              key={mult}
              onClick={() => setSimSpeed(mult)}
              className={`ce-mono px-2 py-1 rounded-[4px] text-[11.5px] font-semibold border transition cursor-pointer ${
                active
                  ? 'bg-[#0866FF] text-white border-[#0866FF]'
                  : 'bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)]'
              }`}
            >
              ×{mult}
            </button>
          );
        })}

        <button
          onClick={togglePause}
          className={`p-1.5 rounded-[4px] border transition cursor-pointer ${
            paused
              ? 'bg-[#F79009] text-[#050D1F] border-[#F79009]'
              : 'bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)]'
          }`}
          title={paused ? 'Reanudar simulación' : 'Pausar simulación'}
          aria-label={paused ? 'Reanudar simulación' : 'Pausar simulación'}
        >
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={resetSimulation}
          className="px-2.5 py-1 rounded-[4px] text-[11.5px] font-semibold bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)] flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reiniciar</span>
        </button>
      </div>

      {operationalEventBanner && (
        <div className="ce-mono text-[11px] px-2 py-0.5 rounded bg-[#F79009]/20 text-[#F79009] border border-[#F79009]/50">
          ! {operationalEventBanner}
        </div>
      )}
    </div>
  );
}
