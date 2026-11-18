import { useState } from 'react';
import {
  Activity,
  BarChart3,
  Eye,
  FileSpreadsheet,
  Flame,
  Gauge,
  Layers,
  Menu,
  Moon,
  ScanLine,
  Scissors,
  ShieldCheck,
  Sun,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { CurrencyCode, ViewMode3D } from '../../core/masterData/types';
import { formatMoney } from '../../core/masterData/linePet2Catalog';
import { useDeviceViewport } from '../../hooks/useDeviceViewport';

export function TopHeader() {
  const [speedPopoverOpen, setSpeedPopoverOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isCompact } = useDeviceViewport();

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
    <header className="pointer-events-auto relative h-[58px] px-2.5 sm:px-4 flex items-center justify-between gap-2 bg-[var(--ce-bg-canvas-veil)] backdrop-blur-md border-b border-[var(--ce-border-subtle)] z-30">
      {/* 1. Left: Brand Logo (Isotipo in Mobile, Full Horizontal Logo in Tablet/Laptop/PC) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {isMobile ? (
          <img
            src="/brand/ce-app-icon-512.png"
            alt="Canal Ejecutivo"
            className="h-8 w-8 rounded-[6px] object-contain select-none"
          />
        ) : (
          <img
            src={logoSrc}
            alt="Canal Ejecutivo"
            className="h-[24px] lg:h-[26px] w-auto object-contain select-none"
          />
        )}
        <div className="w-[3px] h-6 bg-[#0866FF] hidden sm:block" />
        <div className="hidden lg:block">
          <div className="ce-heading text-[14.5px] text-[var(--ce-text-primary)] leading-tight">
            SIMULADOR 3D · Línea PET 2
          </div>
          <div className="text-[10.5px] text-[var(--ce-text-muted)] leading-none mt-0.5">
            El render convence. El dato decide.
          </div>
        </div>
      </div>

      {/* 2. Center: Minimalist 3-KPI Live Pulse Bar (Adapts cleanly down to 360px) */}
      <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 rounded-[10px] bg-[var(--ce-bg-section)] border border-[var(--ce-border-subtle)] min-w-0">
        <div className="px-1 sm:px-2 flex items-center gap-1 sm:gap-1.5">
          <span className="text-[10px] sm:text-[11px] text-[var(--ce-text-muted)]">OEE</span>
          <span className="ce-mono text-[12px] sm:text-[14px] font-bold text-[var(--ce-text-primary)]">
            {oeePct.toLocaleString('es-419', { minimumFractionDigits: 1 })}%
          </span>
        </div>

        <div className="w-[1px] h-4 sm:h-5 bg-[var(--ce-border-strong)]" />

        <div className="relative">
          <button
            onClick={() => setSpeedPopoverOpen(!speedPopoverOpen)}
            className="px-1.5 sm:px-2 py-0.5 rounded-[6px] hover:bg-[var(--ce-bg-card-elevated)] flex items-center gap-1 cursor-pointer transition"
            title="Cambiar ritmo de la línea en vivo"
          >
            <Gauge className="w-3.5 h-3.5 text-[#63EDFF] shrink-0" />
            <span className="ce-mono text-[12px] sm:text-[13.5px] font-semibold text-[var(--ce-text-primary)]">
              {effectiveBpm}
              <span className="text-[10px] text-[var(--ce-text-muted)] hidden sm:inline"> bpm</span>
            </span>
          </button>

          {speedPopoverOpen && (
            <div className="absolute top-10 left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[230px] p-2.5 rounded-[10px] bg-[#050D1F] border border-[#0866FF] shadow-2xl z-50 space-y-2">
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
                    className={`py-2 px-2 rounded-[6px] text-[11px] font-semibold cursor-pointer border ${
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

        <div className="w-[1px] h-4 sm:h-5 bg-[var(--ce-border-strong)]" />

        {isHealthyOptimized ? (
          <div className="px-1.5 sm:px-2.5 py-0.5 rounded-[6px] bg-[#12B76A]/15 border border-[#12B76A]/50 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
            <span className="text-[11px] text-[#12B76A] hidden xl:inline font-medium">Salvado:</span>
            <span className="ce-mono text-[11.5px] sm:text-[13px] font-bold text-[#12B76A] truncate">
              +{formatMoney(Math.max(12_000, sessionMoneySavedCop), currency, isCompact)}
            </span>
          </div>
        ) : (
          <div className="px-1.5 sm:px-2.5 py-0.5 rounded-[6px] bg-[#F04438]/15 border border-[#F04438]/55 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-[#F04438] animate-pulse shrink-0" />
            <span className="text-[11px] text-[#FCA5A5] hidden xl:inline font-medium">
              {operatorCompensatesSetpoint ? 'Sobrellenado:' : 'Perdiendo:'}
            </span>
            <span className="ce-mono text-[11.5px] sm:text-[13px] font-bold text-[#F04438] truncate">
              -{formatMoney(sessionMoneyLostCop, currency, isCompact)}
            </span>
          </div>
        )}
      </div>

      {/* 3. Right: Adaptive Controls (Full on PC/Laptop, Compact Drawer + Menu on Mobile/Tablet) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden xl:flex items-center p-0.5 rounded-[8px] bg-[var(--ce-bg-section)] border border-[var(--ce-border-subtle)]">
          {viewModes.map((m) => (
            <button
              key={m.id}
              onClick={() => setViewMode(m.id)}
              className={`px-2.5 py-1 rounded-[6px] text-[12px] font-semibold flex items-center gap-1 transition cursor-pointer ${
                viewMode === m.id
                  ? 'bg-[#0866FF] text-white'
                  : 'text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)]'
              }`}
            >
              {m.icon}
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop & Tablet Quick Tools */}
        <div className="hidden md:flex items-center gap-1.5">
          <button
            onClick={() => setFortyExcelsModalOpen(true)}
            className="px-2.5 py-1.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1.5 border border-[#63EDFF]/45 bg-[var(--ce-accent-ai-bg)] text-[var(--ce-accent-ai)] hover:border-[#63EDFF] transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>40 Excel</span>
          </button>

          <button
            onClick={toggleIotTags}
            className={`px-2 py-1.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
              showIotTags
                ? 'bg-[#0866FF]/20 text-[#63EDFF] border-[#63EDFF]'
                : 'bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border-[var(--ce-border-subtle)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>IoT</span>
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
            className="p-1.5 rounded-[8px] bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border border-[var(--ce-border-subtle)] cursor-pointer"
            aria-label="Sonido"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-1.5 rounded-[8px] bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border border-[var(--ce-border-subtle)] cursor-pointer"
            aria-label="Tema"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Analytics Drawer Toggle (All Devices) */}
        <button
          onClick={() => setRightDrawerOpen(!rightDrawerOpen)}
          className={`px-2 sm:px-2.5 py-1.5 rounded-[8px] text-[12px] font-semibold flex items-center gap-1 border transition cursor-pointer ${
            rightDrawerOpen
              ? 'bg-[#0866FF] text-white border-[#0866FF]'
              : 'bg-[var(--ce-bg-section)] text-[var(--ce-text-secondary)] border-[var(--ce-border-subtle)]'
          }`}
          aria-label="Abrir analítica"
        >
          <BarChart3 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
          <span className="hidden lg:inline">Analítica</span>
        </button>

        {/* Mobile Tools Overflow Menu (< 768px) */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 rounded-[8px] bg-[var(--ce-bg-section)] text-[var(--ce-text-primary)] border border-[var(--ce-border-subtle)] cursor-pointer"
          aria-label="Más opciones"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Dropdown Tools Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[58px] right-2 w-[250px] p-3 rounded-[12px] bg-[#050D1F]/96 backdrop-blur-md border border-[#1E3158] shadow-2xl z-50 space-y-2.5">
          <div className="ce-overline text-[9.5px] text-[#63EDFF]">HERRAMIENTAS DEL SIMULADOR</div>

          <button
            onClick={() => {
              setFortyExcelsModalOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full py-2.5 px-3 rounded-[8px] bg-[#0866FF]/18 border border-[#63EDFF]/45 text-[#63EDFF] text-[12.5px] font-semibold flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Comparar 40 Excel vs. 3D</span>
          </button>

          <button
            onClick={() => {
              toggleIotTags();
              setMobileMenuOpen(false);
            }}
            className={`w-full py-2.5 px-3 rounded-[8px] border text-[12.5px] font-semibold flex items-center justify-between cursor-pointer ${
              showIotTags
                ? 'bg-[#0866FF] text-white border-[#0866FF]'
                : 'bg-[#0B1630] text-[#F1F5F9] border-[#1E3158]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Activity className="w-4 h-4" /> Etiquetas IoT (12)
            </span>
            <span className="ce-mono text-[11px]">{showIotTags ? 'ON' : 'OFF'}</span>
          </button>

          <div className="grid grid-cols-3 gap-1.5">
            <select
              aria-label="Moneda móvil"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="ce-mono py-2 px-2 rounded-[6px] text-[12px] font-semibold bg-[#0B1630] text-white border border-[#1E3158]"
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
              <option value="PEN">PEN</option>
              <option value="MXN">MXN</option>
            </select>

            <button
              onClick={toggleSound}
              className="py-2 rounded-[6px] bg-[#0B1630] border border-[#1E3158] text-white flex items-center justify-center cursor-pointer"
              aria-label="Alternar sonido"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="py-2 rounded-[6px] bg-[#0B1630] border border-[#1E3158] text-white flex items-center justify-center cursor-pointer"
              aria-label="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
