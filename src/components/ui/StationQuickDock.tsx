import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Compass,
  Eye,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
  Scissors
} from 'lucide-react';
import { ASSETS_CATALOG } from '../../core/masterData/linePet2Catalog';
import { useSimulationStore } from '../../store/simulationStore';
import { ViewMode3D } from '../../core/masterData/types';

export function StationQuickDock() {
  const [eventsMenuOpen, setEventsMenuOpen] = useState(false);

  const selectedMachineId = useSimulationStore((s) => s.selectedMachineId);
  const selectMachine = useSimulationStore((s) => s.selectMachine);
  const resetCameraOverview = useSimulationStore((s) => s.resetCameraOverview);
  const viewMode = useSimulationStore((s) => s.viewMode);
  const setViewMode = useSimulationStore((s) => s.setViewMode);

  const simSpeedMultiplier = useSimulationStore((s) => s.simSpeedMultiplier);
  const setSimSpeed = useSimulationStore((s) => s.setSimSpeed);
  const paused = useSimulationStore((s) => s.paused);
  const togglePause = useSimulationStore((s) => s.togglePause);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const activeHseEvents = useSimulationStore((s) => s.activeHseEvents);
  const toggleHseEvent = useSimulationStore((s) => s.toggleHseEvent);
  const injectOperationalEvent = useSimulationStore((s) => s.injectOperationalEvent);
  const clearAllEvents = useSimulationStore((s) => s.clearAllEvents);

  // Keyboard shortcuts 0..8 for instant game-like station camera flight!
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === '0') {
        resetCameraOverview();
      } else if (e.key >= '1' && e.key <= '8') {
        const idx = Number(e.key) - 1;
        const asset = ASSETS_CATALOG[idx];
        if (asset) selectMachine(asset.id, true);
      } else if (e.key.toLowerCase() === 'x') {
        setViewMode(viewMode === 'rayos_x' ? 'operacion' : 'rayos_x');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [resetCameraOverview, selectMachine, setViewMode, viewMode]);

  const mobileModes: { id: ViewMode3D; label: string; icon: React.ReactNode }[] = [
    { id: 'operacion', label: 'Normal', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'corte', label: 'Corte', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'despiece', label: 'Despiece', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'rayos_x', label: 'Rayos X', icon: <ScanLine className="w-3.5 h-3.5" /> }
  ];

  return (
    <div className="pointer-events-auto flex flex-col items-center gap-2 w-full">
      {/* Compact Mobile/Tablet View Mode Bar (only shown < xl) */}
      <div className="flex xl:hidden items-center gap-1 p-1 rounded-[8px] bg-[var(--ce-bg-card)] backdrop-blur-md border border-[var(--ce-border-subtle)] shadow-md">
        {mobileModes.map((m) => (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            className={`px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold flex items-center gap-1 cursor-pointer ${
              viewMode === m.id
                ? 'bg-[#0866FF] text-white'
                : 'text-[var(--ce-text-secondary)]'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Main Game/Configurator Quick-Jump Dock */}
      <div className="relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-[12px] bg-[var(--ce-bg-card)] backdrop-blur-md border border-[var(--ce-border-strong)] shadow-2xl max-w-[calc(100vw-16px)] overflow-x-auto">
        {/* Overview Button (Key 0) */}
        <button
          onClick={resetCameraOverview}
          className={`px-2.5 py-1.5 rounded-[8px] text-[11.5px] font-semibold flex items-center gap-1 transition cursor-pointer ${
            !selectedMachineId
              ? 'bg-[#0866FF] text-white'
              : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] hover:bg-[var(--ce-bg-card-elevated)]'
          }`}
          title="Vista general de la nave (Tecla 0)"
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Planta</span>
        </button>

        <div className="h-4 w-[1px] bg-[var(--ce-border-strong)]" />

        {/* Stations 1..8 Quick Camera Jump */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[62vw] sm:max-w-none">
          {ASSETS_CATALOG.map((asset, i) => {
            const active = selectedMachineId === asset.id;
            const isFaultyFiller = asset.id === 'llenadora';
            return (
              <button
                key={asset.id}
                onClick={() => selectMachine(asset.id, true)}
                title={`${asset.name} (Tecla ${i + 1})`}
                className={`px-2 py-1 rounded-[6px] text-[11.5px] font-medium flex items-center gap-1 transition whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-[#0866FF] text-white font-semibold'
                    : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] hover:bg-[var(--ce-bg-card-elevated)]'
                }`}
              >
                <span className="ce-mono text-[10px] opacity-75">{i + 1}</span>
                <span className="hidden md:inline">{asset.shortName}</span>
                {isFaultyFiller && !active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F04438]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="h-4 w-[1px] bg-[var(--ce-border-strong)]" />

        {/* 1-Click Chaos / HSE Emergency Trigger Popover */}
        <div className="relative">
          <button
            onClick={() => setEventsMenuOpen(!eventsMenuOpen)}
            className={`px-2.5 py-1.5 rounded-[8px] text-[11.5px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
              activeHseEvents.length > 0
                ? 'bg-[#F04438] text-white border-[#F04438]'
                : 'bg-[var(--ce-bg-card-elevated)] text-[var(--ce-text-primary)] border-[var(--ce-border-subtle)] hover:border-[#F79009]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-[#F79009]" />
            <span>Simular falla</span>
            {activeHseEvents.length > 0 && (
              <span className="ce-mono text-[10px] px-1 rounded bg-white/20">
                {activeHseEvents.length}
              </span>
            )}
          </button>

          {eventsMenuOpen && (
            <div className="absolute bottom-11 right-0 w-[245px] p-2.5 rounded-[10px] bg-[#050D1F] border border-[#1E3158] shadow-2xl z-50 space-y-1.5">
              <div className="ce-overline text-[9.5px] text-[#63EDFF] pb-1 border-b border-[#12213F]">
                INYECTAR EMERGENCIA EN 3D
              </div>
              <button
                onClick={() => {
                  toggleHseEvent('co2_leak');
                  setEventsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[6px] text-[11.5px] bg-[#0B1630] hover:bg-[#12213F] text-[#F1F5F9] flex justify-between cursor-pointer"
              >
                <span>💨 Fuga de CO₂ en sala</span>
                <span className="ce-mono text-[10px] text-[#F04438]">HSE</span>
              </button>
              <button
                onClick={() => {
                  toggleHseEvent('intrusion');
                  setEventsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[6px] text-[11.5px] bg-[#0B1630] hover:bg-[#12213F] text-[#F1F5F9] flex justify-between cursor-pointer"
              >
                <span>🤖 Intrusión celda robot</span>
                <span className="ce-mono text-[10px] text-[#F04438]">STO</span>
              </button>
              <button
                onClick={() => {
                  toggleHseEvent('floor_spill');
                  setEventsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[6px] text-[11.5px] bg-[#0B1630] hover:bg-[#12213F] text-[#F1F5F9] flex justify-between cursor-pointer"
              >
                <span>💧 Derrame en piso</span>
                <span className="ce-mono text-[10px] text-[#F79009]">Caída</span>
              </button>
              <button
                onClick={() => {
                  injectOperationalEvent('blower_jam');
                  setEventsMenuOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-[6px] text-[11.5px] bg-[#0B1630] hover:bg-[#12213F] text-[#F1F5F9] flex justify-between cursor-pointer"
              >
                <span>⚙️ Atasco en sopladora</span>
                <span className="ce-mono text-[10px] text-[#63EDFF]">5 min</span>
              </button>
              {activeHseEvents.length > 0 && (
                <button
                  onClick={() => {
                    clearAllEvents();
                    setEventsMenuOpen(false);
                  }}
                  className="w-full text-center px-2.5 py-1.5 rounded-[6px] text-[11.5px] font-semibold bg-[#12B76A]/20 text-[#12B76A] cursor-pointer"
                >
                  ✓ Limpiar todas las emergencias
                </button>
              )}
            </div>
          )}
        </div>

        {/* Speed & Play/Reset Mini Controls */}
        <div className="flex items-center gap-1">
          {([1, 6, 30] as const).map((mult) => (
            <button
              key={mult}
              onClick={() => setSimSpeed(mult)}
              className={`ce-mono px-1.5 py-1 rounded-[5px] text-[11px] font-semibold cursor-pointer ${
                !paused && simSpeedMultiplier === mult
                  ? 'bg-[#0866FF] text-white'
                  : 'text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)]'
              }`}
            >
              ×{mult}
            </button>
          ))}
          <button
            onClick={togglePause}
            className="p-1.5 rounded-[6px] text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] cursor-pointer"
            title={paused ? 'Reanudar' : 'Pausar'}
          >
            {paused ? <Play className="w-3.5 h-3.5 text-[#F79009]" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-[6px] text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)] cursor-pointer"
            title="Reiniciar simulación"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
