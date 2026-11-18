import { useState } from 'react';
import {
  Activity,
  BarChart3,
  Eye,
  FileSpreadsheet,
  Flame,
  Gauge,
  Layers,
  Moon,
  ScanLine,
  Scissors,
  ShieldCheck,
  Sun,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { CurrencyCode, ViewMode3D } from '../../core/masterData/types';
import { formatMoney } from '../../core/masterData/linePet2Catalog';

export function TopHeader() {
  const [speedPopoverOpen, setSpeedPopoverOpen] = useState(false);

  const theme = useSimulationStore((s) => s.theme);
  const setTheme = useSimulationStore((s) => s.setTheme);
  const currency = useSimulationStore((s) => s.currency);
  const setCurrency = useSimulationStore((s) => s.setCurrency);
  const soundEnabled = useSimulationStore((s) => s.soundEnabled);
  const toggleSound = useSimulationStore((s) => s.toggleSound);

  const viewMode = useSimulationStore((s) => s.viewMode);
  const setViewMode = useSimulationStore((s) => s.setViewMode);
  const rightDrawerOpen = useSimulationStore((s) => s.rightDrawerOpen);
  const setRightDrawerOpen = useSimulationStore((s) => s.setRightDrawerOpen);
  const showIotTags = useSimulationStore((s) => s.showIotTags);
  const toggleIotTags = useSimulationStore((s) => s.toggleIotTags);
  const setFortyExcelsModalOpen = useSimulationStore((s) => s.setFortyExcelsModalOpen);

  const oeePct = useSimulationStore((s) => s.lineDynamics.oeePct);
  const effectiveBpm = useSimulationStore((s) => s.lineDynamics.effectiveFillerBpm);
  const targetSpeedBpm = useSimulationStore((s) => s.targetSpeedBpm);
  const setTargetSpeedBpm = useSimulationStore((s) => s.setTargetSpeedBpm);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const operatorCompensatesSetpoint = useSimulationStore((s) => s.operatorCompensatesSetpoint);
  const sessionMoneyLostCop = useSimulationStore((s) => s.sessionMoneyLostCop);
  const sessionMoneySavedCop = useSimulationStore((s) => s.sessionMoneySavedCop);
  const currentBleedRateCopPerHour = useSimulationStore((s) => s.currentBleedRateCopPerHour);

  const logoSrc =
    theme === 'dark'
      ? '/brand/ce-logo-horizontal-blanco.png'
      : '/brand/ce-logo-horizontal-azul.png';

  const isHealthyOptimized =
    valve23Bypassed && !operatorCompensatesSetpoint && currentBleedRateCopPerHour < 120_000;

  const viewModes: { id: ViewMode3D; label: string; icon: React.ReactNode }[] = [
    { id: 'operacion', label: 'Operación', icon: <Eye className="w-3.5 h-3.5" /> },
    { id: 'corte', label: 'Corte', icon: <Scissors className="w-3.5 h-3.5" /> },
    { id: 'despiece', label: 'Despiece', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'rayos_x', label: 'Rayos X', icon: <ScanLine className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="pointer-events-auto h-[58px] px-4 flex items-center justify-between gap-3 bg-[var(--ce-bg-canvas-veil)] backdrop-blur-md border-b border-[var(--ce-border-subtle)] z-30">
      {/* 1. Left: Official Canal Ejecutivo Master Logo + Plant Title */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src={logoSrc}
          alt="Canal Ejecutivo"
          className="h-[26px] w-auto object-contain select-none"
        />
        <div className="w-[3px] h-6 bg-[#0866FF]" />
        <div className="hidden sm:block">
          <div className="ce-heading text-[14.5px] text-[var(--ce-text-primary)] leading-tight">
            SIMULADOR 3D · Línea PET 2
          </div>
          <div className="text-[10.5px] text-[var(--ce-text-muted)] leading-none mt-0.5">
            El render convence. El dato decide.
          </div>
        </div>
      </div>

      {/* 2. Center: Minimalist 3-KPI Live Pulse Bar (OEE + Quick Speed + Live Money Bleed Taximeter) */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-[10px] bg-[var(--ce-bg-section)] border border-[var(--ce-border-subtle)]">
        {/* KPI 1: OEE */}
        <div className="px-2 flex items-center gap-2">
          <span className="text-[11px] text-[var(--ce-text-muted)] hidden md:inline">OEE</span>
          <span className="ce-mono text-[14px] font-bold text-[var(--ce-text-primary)]">
            {oeePct.toLocaleString('es-419', { minimumFractionDigits: 1 })}%
          </span>
        </div>

        <div className="w-[1px] h-5 bg-[var(--ce-border-strong)]" />

        {/* KPI 2: Clickable Speed Tuner */}
        <div className="relative">
          <button
            onClick={() => setSpeedPopoverOpen(!speedPopoverOpen)}
            className="px-2 py-0.5 rounded-[6px] hover:bg-[var(--ce-bg-card-elevated)] flex items-center gap-1.5 cursor-pointer transition"
            title="Cambiar ritmo de la línea en vivo"
          >
            <Gauge className="w-3.5 h-3.5 text-[#63EDFF]" />
            <span className="ce-mono text-[13.5px] font-semibold text-[var(--ce-text-primary)]">
              {effectiveBpm} <span className="text-[11px] text-[var(--ce-text-muted)]">bpm</span>
            </span>
          </button>

          {speedPopoverOpen && (
            <div className="absolute top-10 left-0 w-[230px] p-2.5 rounded-[10px] bg-[#050D1F] border border-[#0866FF] shadow-2xl z-50 space-y-2">
              <div className="ce-overline text-[9.5px] text-[#63EDFF] flex justify-between">
                <span>RITMO DE LLENADORA</span>
                <span>{targetSpeedBpm} BPM</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: 'Base · 365', bpm: 365 },
                  { label: '★ Óptimo · 404', bpm: 404, best: true },
                  { label: 'Lento · 320', bpm: 320 },
                  { label: 'Forzado · 440', bpm: 440 }
                ].map((opt) => (
                  <button
                    key={opt.bpm}
                    onClick={() => {
                      setTargetSpeedBpm(opt.bpm);
                      setSpeedPopoverOpen(false);
                    }}
                    className={`py-1.5 px-2 rounded-[6px] text-[11px] font-semibold cursor-pointer border ${
                      Math.abs(targetSpeedBpm - opt.bpm) <= 3
                        ? 'bg-[#0866FF] text-white border-[#0866FF]'
                        : opt.best
                          ? 'bg-[#12B76A]/15 text-[#12B76A] border-[#12B76A]/50 hover:bg-[#12B76A]/25'
                          : 'bg-[#0B1630] text-[#F1F5F9] border-[#1E3158] hover:border-[#0866FF]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-[var(--ce-border-strong)]" />

        {/* KPI 3: Live Financial Bleed / Savings Ticker */}
        {isHealthyOptimized ? (
          <div
            className="px-2.5 py-0.5 rounded-[6px] bg-[#12B76A]/15 border border-[#12B76A]/50 flex items-center gap-1.5"
            title="Pérdida controlada gracias al Bypass HMI en V23"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A]" />
            <span className="text-[11px] text-[#12B76A] hidden lg:inline font-medium">Salvado:</span>
            <span className="ce-mono text-[13px] font-bold text-[#12B76A]">
              +{formatMoney(Math.max(12_000, sessionMoneySavedCop), currency)}
            </span>
          </div>
        ) : (
          <div
            className="px-2.5 py-0.5 rounded-[6px] bg-[#F04438]/15 border border-[#F04438]/55 flex items-center gap-1.5"
            title={`Fuga activa de dinero (${formatMoney(currentBleedRateCopPerHour, currency, true)}/h por rechazos y sobrellenado)`}
          >
            <Flame className="w-3.5 h-3.5 text-[#F04438] animate-pulse" />
            <span className="text-[11px] text-[#FCA5A5] hidden lg:inline font-medium">
              {operatorCompensatesSetpoint ? 'Sobrellenado:' : 'Perdiendo:'}
            </span>
            <span className="ce-mono text-[13px] font-bold text-[#F04438]">
              -{formatMoney(sessionMoneyLostCop, currency)}
            </span>
          </div>
        )}
      </div>

      {/* 3. Right: Clean 3D Modes + Essential Controls */}
      <div className="flex items-center gap-1.5">
        <div className="hidden xl:flex items-center p-0.5 rounded-[8px] bg-[var(--ce-bg-section)] border border-[var(--ce-border-subtle)]">
          {viewModes.map((m) => {
            const active = viewMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setViewMode(m.id)}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                  active
                    ? 'bg-[#0866FF] text-white'
                    : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)]'
                }`}
              >
                {m.icon}
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setFortyExcelsModalOpen(true)}
          className="px-2.5 py-1.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 border border-[#63EDFF]/45 bg-[var(--ce-accent-ai-bg)] text-[var(--ce-accent-ai)] hover:border-[#63EDFF] transition cursor-pointer"
          title="Ver por qué 40 Excel rotos ocultan este problema"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span className="hidden md:inline">40 Excel</span>
        </button>

        <button
          onClick={toggleIotTags}
          className={`px-2 py-1.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
            showIotTags
              ? 'bg-[#0866FF]/20 text-[#63EDFF] border-[#63EDFF]'
              : 'bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)]'
          }`}
          title="Mostrar u ocultar los 12 sensores IIoT en el espacio 3D"
        >
          <Activity className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">IoT</span>
        </button>

        <select
          aria-label="Moneda"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
          className="ce-mono px-1.5 py-1.5 rounded-[6px] text-[11.5px] font-semibold bg-[var(--ce-bg-section)] text-[var(--ce-text-primary)] border border-[var(--ce-border-subtle)] cursor-pointer"
        >
          <option value="COP">COP</option>
          <option value="USD">USD</option>
          <option value="PEN">PEN</option>
          <option value="MXN">MXN</option>
        </select>

        <button
          onClick={toggleSound}
          className="p-1.5 rounded-[8px] bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)] cursor-pointer"
          title={soundEnabled ? 'Silenciar efectos táctiles' : 'Activar efectos táctiles'}
          aria-label="Sonido de interfaz"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-[8px] bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)] cursor-pointer hidden sm:flex"
          aria-label="Tema claro/oscuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
          className={`px-2.5 py-1.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
            rightDrawerOpen
              ? 'bg-[#0866FF] text-white border-[#0866FF]'
              : 'bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border-[var(--ce-border-subtle)] hover:text-[var(--ce-text-primary)]'
          }`}
          title="Abrir o cerrar panel de analítica detallada"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Analítica</span>
        </button>
      </div>
    </header>
  );
}
