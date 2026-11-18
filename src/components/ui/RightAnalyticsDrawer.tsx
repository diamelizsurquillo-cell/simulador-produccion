import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Database,
  FileCheck2,
  FileSpreadsheet,
  Sliders,
  Sparkles,
  Wifi
} from 'lucide-react';
import {
  ASSETS_CATALOG,
  formatMoney,
  MATERIAL_MASTER
} from '../../core/masterData/linePet2Catalog';
import { formatShiftClock, useSimulationStore } from '../../store/simulationStore';
import { RightDrawerTab } from '../../core/guidedCaseSteps';
import {
  OeeGaugeRing,
  Radial40ValvesChart,
  SparklineCard,
  SpeedVsMarginChart,
  VCurveChart
} from './ChartsSvg';

export function RightAnalyticsDrawer() {
  const rightDrawerOpen = useSimulationStore((s) => s.rightDrawerOpen);
  const rightTab = useSimulationStore((s) => s.rightTab);
  const setRightTab = useSimulationStore((s) => s.setRightTab);
  const currency = useSimulationStore((s) => s.currency);

  const simSecondsElapsed = useSimulationStore((s) => s.simSecondsElapsed);
  const fillerResult = useSimulationStore((s) => s.fillerResult);
  const lineDynamics = useSimulationStore((s) => s.lineDynamics);
  const businessImpact = useSimulationStore((s) => s.businessImpact);
  const sensorReadings = useSimulationStore((s) => s.sensorReadings);
  const activeAlarms = useSimulationStore((s) => s.activeAlarms);
  const sixBigLosses = useSimulationStore((s) => s.sixBigLosses);
  const decisionLog = useSimulationStore((s) => s.decisionLog);

  const historyOee = useSimulationStore((s) => s.historyOee);
  const historyAvailability = useSimulationStore((s) => s.historyAvailability);
  const historyPerformance = useSimulationStore((s) => s.historyPerformance);
  const historyQuality = useSimulationStore((s) => s.historyQuality);
  const historyRejectPct = useSimulationStore((s) => s.historyRejectPct);
  const historyOverfillMl = useSimulationStore((s) => s.historyOverfillMl);

  const targetSpeedBpm = useSimulationStore((s) => s.targetSpeedBpm);
  const setTargetSpeedBpm = useSimulationStore((s) => s.setTargetSpeedBpm);
  const wearValve23Pct = useSimulationStore((s) => s.wearValve23Pct);
  const setWearValve23Pct = useSimulationStore((s) => s.setWearValve23Pct);
  const wearLabelerPct = useSimulationStore((s) => s.wearLabelerPct);
  const setWearLabelerPct = useSimulationStore((s) => s.setWearLabelerPct);
  const manualSetpointMl = useSimulationStore((s) => s.manualSetpointMl);
  const setManualSetpointMl = useSimulationStore((s) => s.setManualSetpointMl);
  const operatorCompensatesSetpoint = useSimulationStore((s) => s.operatorCompensatesSetpoint);
  const setOperatorCompensates = useSimulationStore((s) => s.setOperatorCompensates);
  const bufferBottles = useSimulationStore((s) => s.bufferBottles);
  const bufferCapacity = useSimulationStore((s) => s.bufferCapacity);
  const setBufferCapacity = useSimulationStore((s) => s.setBufferCapacity);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const appliedDecision = useSimulationStore((s) => s.appliedDecision);
  const appliedDecisionTime = useSimulationStore((s) => s.appliedDecisionTime);
  const applyDecisionOption = useSimulationStore((s) => s.applyDecisionOption);

  const marginPerBottleCop = useSimulationStore((s) => s.marginPerBottleCop);
  const liquidCostPerMlCop = useSimulationStore((s) => s.liquidCostPerMlCop);
  const variableCostPerBottleCop = useSimulationStore((s) => s.variableCostPerBottleCop);
  const targetOeePct = useSimulationStore((s) => s.targetOeePct);
  const monthlyOperatingHours = useSimulationStore((s) => s.monthlyOperatingHours);
  const updateFinancialAssumption = useSimulationStore((s) => s.updateFinancialAssumption);

  const activeHseEvents = useSimulationStore((s) => s.activeHseEvents);
  const injectOperationalEvent = useSimulationStore((s) => s.injectOperationalEvent);
  const toggleHseEvent = useSimulationStore((s) => s.toggleHseEvent);
  const clearAllEvents = useSimulationStore((s) => s.clearAllEvents);

  const sensorDriftSimulated = useSimulationStore((s) => s.sensorDriftSimulated);
  const toggleSensorDrift = useSimulationStore((s) => s.toggleSensorDrift);

  const selectMachine = useSimulationStore((s) => s.selectMachine);
  const selectHseEvent = useSimulationStore((s) => s.selectHseEvent);
  const focusCamera = useSimulationStore((s) => s.focusCamera);
  const setSapModalOpen = useSimulationStore((s) => s.setSapModalOpen);
  const setFortyExcelsModalOpen = useSimulationStore((s) => s.setFortyExcelsModalOpen);
  const sapNotificationCreated = useSimulationStore((s) => s.sapNotificationCreated);

  if (!rightDrawerOpen) return null;

  const { clock, shiftMinute } = formatShiftClock(simSecondsElapsed);
  const v23 = fillerResult.valves[22];

  const tabs: { id: RightDrawerTab; label: string; badge?: number }[] = [
    { id: 'diagnostico', label: 'Diagnóstico', badge: activeAlarms.length },
    { id: 'control', label: 'Control' },
    { id: 'maestros', label: 'Maestros' },
    { id: 'iot', label: 'IoT', badge: 12 },
    { id: 'insights', label: 'Insights' }
  ];

  const totalLossMin =
    sixBigLosses.reducedSpeedMin +
    sixBigLosses.changeoverAdjustMin +
    sixBigLosses.microstopsMin +
    sixBigLosses.breakdownsMin +
    sixBigLosses.processRejectsMin +
    sixBigLosses.startupRejectsMin;

  return (
    <aside className="pointer-events-auto w-[415px] max-w-[94vw] h-[calc(100vh-60px)] bg-[var(--ce-bg-section)]/95 backdrop-blur-md border-l border-[var(--ce-border-subtle)] flex flex-col z-20">
      {/* Top OEE & Shift Header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-[var(--ce-border-subtle)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-[6px] flex items-center justify-center font-bold text-xs ${
              activeAlarms.some((a) => a.severity === 'critical')
                ? 'bg-[#F04438] text-white'
                : activeAlarms.length > 0
                  ? 'bg-[#F79009] text-[#050D1F]'
                  : 'bg-[#12B76A] text-white'
            }`}
          >
            {activeAlarms.length > 0 ? '!' : '✓'}
          </div>
          <div>
            <div className="ce-heading text-[14.5px] text-[var(--ce-text-primary)] leading-tight">
              Diagnóstico OEE · Gemelo
            </div>
            <div className="text-[11px] text-[var(--ce-text-muted)]">
              Medido en llenadora (cuello de botella)
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="ce-mono text-[15px] font-semibold text-[var(--ce-text-primary)] leading-tight">
            {clock}
          </div>
          <div className="ce-mono text-[10.5px] text-[var(--ce-text-muted)]">
            Turno A · min {shiftMinute}
          </div>
        </div>
      </div>

      {/* Navigation Tabs with Official C|E Active Indicator (§5.1 & §7.4) */}
      <div className="px-3 flex items-center border-b border-[var(--ce-border-subtle)] bg-[var(--ce-bg-page)]/40 overflow-x-auto">
        {tabs.map((t) => {
          const active = rightTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setRightTab(t.id)}
              className={`relative px-2.5 py-2.5 text-[12px] font-semibold flex items-center gap-1 transition whitespace-nowrap cursor-pointer ${
                active
                  ? 'text-[var(--ce-text-primary)] bg-[#0866FF]/12'
                  : 'text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)]'
              }`}
            >
              <span>{t.label}</span>
              {t.badge !== undefined && t.badge > 0 && (
                <span
                  className={`ce-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                    active
                      ? 'bg-[#0866FF] text-white'
                      : 'bg-[var(--ce-bg-card-elevated)] text-[var(--ce-text-secondary)]'
                  }`}
                >
                  {t.badge}
                </span>
              )}
              {active && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#0866FF]" />}
            </button>
          );
        })}
      </div>

      {/* Scrollable Tab Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ================= TAB 1: DIAGNÓSTICO ================= */}
        {rightTab === 'diagnostico' && (
          <>
            {/* OEE Ring + Formula */}
            <div className="p-3 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/55 border border-[var(--ce-border-subtle)] flex items-center gap-3">
              <OeeGaugeRing oeePct={lineDynamics.oeePct} targetPct={targetOeePct} />
              <div className="min-w-0 flex-1">
                <div className="ce-mono text-[11.5px] text-[var(--ce-text-primary)] leading-snug">
                  OEE = <span className="font-semibold">{lineDynamics.availabilityPct}%</span> Disp. ×{' '}
                  <span className="font-semibold">{lineDynamics.performancePct}%</span> Rend. ×{' '}
                  <span className="font-semibold">{lineDynamics.qualityPct}%</span> Cal.
                </div>
                <div className="ce-mono text-[11px] text-[var(--ce-text-secondary)] mt-1">
                  Meta {targetOeePct}% · brecha{' '}
                  <span
                    className={
                      businessImpact.oeeGapPts >= 0 ? 'text-[#12B76A] font-semibold' : 'text-[#F79009] font-semibold'
                    }
                  >
                    {businessImpact.oeeGapPts >= 0 ? '+' : ''}
                    {businessImpact.oeeGapPts.toLocaleString('es-419', { minimumFractionDigits: 1 })} pts
                  </span>
                </div>
              </div>
            </div>

            {/* 6 Sparkline KPI Cards */}
            <div className="grid grid-cols-3 gap-2">
              <SparklineCard
                label="OEE"
                valueText={`${lineDynamics.oeePct.toLocaleString('es-419', { minimumFractionDigits: 1 })}%`}
                subLabel={`meta ${targetOeePct}%`}
                series={historyOee}
              />
              <SparklineCard
                label="Disponibilidad"
                valueText={`${lineDynamics.availabilityPct.toLocaleString('es-419', { minimumFractionDigits: 1 })}%`}
                subLabel="meta 95%"
                series={historyAvailability}
              />
              <SparklineCard
                label="Rendimiento"
                valueText={`${lineDynamics.performancePct.toLocaleString('es-419', { minimumFractionDigits: 1 })}%`}
                subLabel="meta 92%"
                series={historyPerformance}
              />
              <SparklineCard
                label="Calidad"
                valueText={`${lineDynamics.qualityPct.toLocaleString('es-419', { minimumFractionDigits: 1 })}%`}
                subLabel="meta 99,5%"
                series={historyQuality}
              />
              <SparklineCard
                label="Rechazo bajo nivel"
                valueText={`${fillerResult.totalLineRejectPct.toLocaleString('es-419', { minimumFractionDigits: 2 })}%`}
                subLabel="lím. 0,80%"
                series={historyRejectPct}
                alertState={
                  fillerResult.totalLineRejectPct >= 1.5
                    ? 'critical'
                    : fillerResult.totalLineRejectPct >= 0.8
                      ? 'warning'
                      : 'normal'
                }
              />
              <SparklineCard
                label="Sobrellenado medio"
                valueText={`${fillerResult.averageOverfillMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml`}
                subLabel="obj. ≤ 1,5 ml"
                series={historyOverfillMl}
                alertState={fillerResult.averageOverfillMl > 2.2 ? 'critical' : 'normal'}
              />
            </div>

            {/* Active Alarms */}
            <div>
              <div className="ce-overline text-[var(--ce-text-muted)] mb-2">ALARMAS ACTIVAS</div>
              {activeAlarms.length === 0 ? (
                <div className="p-2.5 rounded-[8px] bg-[#12B76A]/10 border border-[#12B76A]/40 text-[12px] text-[#12B76A] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>✓ Línea operando en parámetros nominales sin alarmas activas.</span>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {activeAlarms.map((alm) => (
                    <button
                      key={alm.id}
                      onClick={() => {
                        if (alm.hseId) selectHseEvent(alm.hseId, true);
                        else if (alm.machineId) selectMachine(alm.machineId, true);
                      }}
                      className={`w-full text-left p-2.5 rounded-[8px] border transition cursor-pointer ${
                        alm.severity === 'critical'
                          ? 'bg-[#F04438]/12 border-[#F04438]/45 hover:border-[#F04438]'
                          : 'bg-[#F79009]/12 border-[#F79009]/45 hover:border-[#F79009]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[var(--ce-text-primary)] flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              alm.severity === 'critical' ? 'bg-[#F04438]' : 'bg-[#F79009]'
                            }`}
                          />
                          {alm.severity === 'critical' ? '✕' : '!'} {alm.title}
                        </span>
                        <span className="ce-mono text-[10.5px] text-[var(--ce-text-muted)]">
                          {alm.timestamp}
                        </span>
                      </div>
                      <div className="ce-mono text-[11px] text-[var(--ce-text-secondary)] mt-0.5 pl-3.5">
                        {alm.detail}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 40-Valve Radial Analysis */}
            <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
              <div className="flex items-center justify-between mb-2">
                <span className="ce-overline text-[var(--ce-text-muted)]">
                  ANÁLISIS POR VÁLVULA · LLENADORA
                </span>
                <span className="ce-mono text-[10px] text-[var(--ce-text-muted)]">
                  vs. 1.500 ml
                </span>
              </div>
              <Radial40ValvesChart
                valves={fillerResult.valves}
                worstValve={fillerResult.worstValve}
              />
              <p className="text-[11.5px] text-[var(--ce-text-secondary)] mt-2 leading-snug">
                {businessImpact.fmeaConfidenceNote}
              </p>
            </div>

            {/* V-Curve Speed by Machine */}
            <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
              <div className="flex items-center justify-between mb-1">
                <span className="ce-overline text-[var(--ce-text-muted)]">
                  CURVA V · VELOCIDAD POR MÁQUINA
                </span>
                <span className="text-[10px] text-[var(--ce-text-muted)]">% de llenadora</span>
              </div>
              <VCurveChart points={lineDynamics.vCurve} />
            </div>

            {/* Status by Component (8 Machines) */}
            <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
              <div className="ce-overline text-[var(--ce-text-muted)] mb-2">
                ESTADO POR COMPONENTE (CLIC PARA ENFOCAR)
              </div>
              <div className="divide-y divide-[var(--ce-border-subtle)]">
                {ASSETS_CATALOG.map((asset) => {
                  let metricLabel = `${asset.designSpeedBpm} bpm nom.`;
                  let state: 'normal' | 'warning' | 'critical' = 'normal';

                  if (asset.id === 'sopladora') metricLabel = 'Horno zona 3 · 109 °C';
                  else if (asset.id === 'llenadora') {
                    metricLabel = valve23Bypassed
                      ? 'V23 en Bypass (39/40)'
                      : `Válvula 23 · ${v23.meanDeviationMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml`;
                    state = valve23Bypassed ? 'warning' : v23.status === 'critical' ? 'critical' : 'normal';
                  } else if (asset.id === 'roscadora') metricLabel = 'Torque 1,91 N·m';
                  else if (asset.id === 'inspector') {
                    metricLabel = `Bajo nivel ${fillerResult.totalLineRejectPct.toLocaleString('es-419', { minimumFractionDigits: 2 })}%`;
                    state =
                      fillerResult.totalLineRejectPct >= 1.5
                        ? 'critical'
                        : fillerResult.totalLineRejectPct >= 0.8
                          ? 'warning'
                          : 'normal';
                  } else if (asset.id === 'etiquetadora') {
                    metricLabel = `Vibración ${(1.65 + (wearLabelerPct / 100) * 3.1).toLocaleString('es-419', { maximumFractionDigits: 1 })} mm/s`;
                    state = wearLabelerPct > 60 ? 'warning' : 'normal';
                  } else if (asset.id === 'empacadora') {
                    metricLabel = `${Math.round(lineDynamics.effectiveFillerBpm / 6)} paq/min`;
                  } else if (asset.id === 'paletizador') {
                    const intr = activeHseEvents.includes('intrusion');
                    metricLabel = intr ? 'Parada segura STO' : 'Ciclo 9 s';
                    state = intr ? 'critical' : 'normal';
                  } else if (asset.id === 'mixer') {
                    const co2 = activeHseEvents.includes('co2_leak');
                    metricLabel = co2 ? 'Fuga CO₂ 3.250 ppm' : 'Brix 10,8 · CO₂ 3,8 vol';
                    state = co2 ? 'critical' : 'normal';
                  }

                  return (
                    <button
                      key={asset.id}
                      onClick={() => selectMachine(asset.id, true)}
                      className="w-full py-1.5 flex items-center justify-between text-left hover:bg-[var(--ce-bg-card-elevated)]/50 px-1 rounded transition cursor-pointer"
                    >
                      <span className="text-[12px] text-[var(--ce-text-primary)]">
                        <span className="ce-mono text-[10.5px] text-[var(--ce-text-muted)] mr-1.5">
                          {asset.orderIndex}
                        </span>
                        {asset.shortName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="ce-mono text-[11px] text-[var(--ce-text-secondary)]">
                          {metricLabel}
                        </span>
                        <span
                          className={`ce-mono text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                            state === 'critical'
                              ? 'bg-[#F04438]/20 text-[#F04438] border border-[#F04438]/50'
                              : state === 'warning'
                                ? 'bg-[#F79009]/20 text-[#F79009] border border-[#F79009]/50'
                                : 'bg-[#12B76A]/20 text-[#12B76A] border border-[#12B76A]/50'
                          }`}
                        >
                          {state === 'critical'
                            ? 'CRÍTICO'
                            : state === 'warning'
                              ? 'ADVERTENCIA'
                              : 'NORMAL'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6 Big Losses (TPM) */}
            <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
              <div className="flex justify-between items-center mb-2">
                <span className="ce-overline text-[var(--ce-text-muted)]">
                  6 GRANDES PÉRDIDAS · TURNO
                </span>
                <span className="text-[10px] text-[var(--ce-text-muted)]">min equivalentes</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { label: 'Velocidad reducida', val: sixBigLosses.reducedSpeedMin, col: '#F79009' },
                  { label: 'Cambios / ajustes', val: sixBigLosses.changeoverAdjustMin, col: '#0866FF' },
                  { label: 'Microparadas y bloqueos', val: sixBigLosses.microstopsMin, col: '#4D8EFF' },
                  { label: 'Averías', val: sixBigLosses.breakdownsMin, col: '#63EDFF' },
                  { label: 'Rechazos proceso', val: sixBigLosses.processRejectsMin, col: '#F04438' },
                  { label: 'Rechazos arranque', val: sixBigLosses.startupRejectsMin, col: '#64748B' }
                ].map((loss) => {
                  const pct = Math.min(100, (loss.val / Math.max(1, totalLossMin)) * 100);
                  return (
                    <div key={loss.label} className="grid grid-cols-12 items-center gap-2 text-[11.5px]">
                      <span className="col-span-5 text-[var(--ce-text-secondary)] truncate">
                        {loss.label}
                      </span>
                      <div className="col-span-5 h-2 bg-[var(--ce-bg-card-elevated)] rounded-xs overflow-hidden">
                        <div
                          className="h-full"
                          style={{ width: `${pct}%`, backgroundColor: loss.col }}
                        />
                      </div>
                      <span className="col-span-2 ce-mono text-right text-[11px]">
                        {loss.val.toLocaleString('es-419', { minimumFractionDigits: 1 })}&apos;
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Business Impact ("El costo que el OEE no ve") */}
            <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
              <div className="ce-overline text-[#63EDFF] mb-2">
                IMPACTO EN NEGOCIO (EL DATO DECIDE)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)]">
                  <div className="text-[11px] text-[var(--ce-text-muted)]">Brecha vs. meta OEE</div>
                  <div className="ce-mono text-[18px] font-semibold mt-0.5">
                    {businessImpact.oeeGapPts > 0 ? '+' : ''}
                    {businessImpact.oeeGapPts.toLocaleString('es-419', { minimumFractionDigits: 1 })} pts
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)]">
                  <div className="text-[11px] text-[var(--ce-text-muted)]">Botellas no producidas / h</div>
                  <div className="ce-mono text-[18px] font-semibold mt-0.5">
                    {businessImpact.unproducedBottlesPerHour.toLocaleString('es-419')}
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)]">
                  <div className="text-[11px] text-[var(--ce-text-muted)]">
                    Producto regalado / h (sobrellenado)
                  </div>
                  <div className="ce-mono text-[16.5px] font-semibold text-[#F79009] mt-0.5">
                    {formatMoney(businessImpact.overfillGiveawayCopPerHour, currency)}
                  </div>
                  <div className="ce-mono text-[10px] text-[var(--ce-text-muted)]">
                    {businessImpact.overfillLitersPerHour.toLocaleString('es-419')} L/h fuera de estándar
                  </div>
                </div>
                <div
                  className={`p-2.5 rounded-[8px] border ${
                    businessImpact.monthlyProjectedLossCop > 0
                      ? 'bg-[#F79009]/10 border-[#F79009]/60'
                      : 'bg-[#12B76A]/10 border-[#12B76A]/50'
                  }`}
                >
                  <div className="text-[11px] text-[var(--ce-text-muted)]">Costo mensual si persiste</div>
                  <div
                    className={`ce-mono text-[16.5px] font-semibold mt-0.5 ${
                      businessImpact.monthlyProjectedLossCop > 0 ? 'text-[#F79009]' : 'text-[#12B76A]'
                    }`}
                  >
                    {formatMoney(businessImpact.monthlyProjectedLossCop, currency, true)}
                  </div>
                </div>
              </div>
            </div>

            {/* Prescriptive Decision Evaluator (Options A / B / C) + SAP PM CTA */}
            <div className="p-3 rounded-[10px] bg-[var(--ce-bg-page)]/65 border border-[var(--ce-border-strong)] space-y-2.5">
              <div className="text-[12.5px] font-semibold text-[var(--ce-text-primary)]">
                Decisión válvula 23 · horizonte 4 h hasta el próximo CIP
              </div>

              <div className="space-y-1.5">
                {businessImpact.options.map((opt) => {
                  const isApplied = appliedDecision === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => applyDecisionOption(opt.id)}
                      className={`w-full text-left p-2.5 rounded-[8px] border transition cursor-pointer ${
                        isApplied
                          ? 'bg-[#0866FF]/20 border-[#0866FF]'
                          : opt.isRecommended
                            ? 'bg-[#12B76A]/10 border-[#12B76A]/60 hover:border-[#12B76A]'
                            : 'bg-[var(--ce-bg-card-elevated)]/60 border-[var(--ce-border-subtle)] hover:border-[var(--ce-border-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[var(--ce-text-primary)]">
                          {opt.title}
                        </span>
                        <span
                          className={`ce-mono text-[12px] font-bold shrink-0 ${
                            opt.isRecommended ? 'text-[#12B76A]' : 'text-[var(--ce-text-primary)]'
                          }`}
                        >
                          {formatMoney(opt.totalCostHorizonCop, currency, true)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5 text-[11px] text-[var(--ce-text-secondary)]">
                        <span>{opt.subtitle}</span>
                        {opt.isRecommended && (
                          <span className="ce-mono text-[9.5px] px-1.5 py-0.2 rounded bg-[#12B76A]/20 text-[#12B76A] font-semibold">
                            ÓPTIMA
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {appliedDecision && (
                <div className="text-[11.5px] text-[#12B76A] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    ✓ Opción {appliedDecision} aplicada a las {appliedDecisionTime}.
                  </span>
                </div>
              )}

              {/* Editable Financial Assumptions */}
              <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
                <div className="text-[10.5px] text-[var(--ce-text-muted)] mb-1.5">
                  Supuestos financieros editables (base COP):
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[11px]">
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--ce-text-muted)]">Margen/bot</span>
                    <input
                      type="number"
                      value={marginPerBottleCop}
                      onChange={(e) =>
                        updateFinancialAssumption('marginPerBottleCop', Number(e.target.value))
                      }
                      className="ce-mono px-1.5 py-1 rounded-[4px] bg-[var(--ce-bg-card-elevated)] border border-[var(--ce-border-subtle)] text-[var(--ce-text-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--ce-text-muted)]">Líquido/ml</span>
                    <input
                      type="number"
                      step="0.1"
                      value={liquidCostPerMlCop}
                      onChange={(e) =>
                        updateFinancialAssumption('liquidCostPerMlCop', Number(e.target.value))
                      }
                      className="ce-mono px-1.5 py-1 rounded-[4px] bg-[var(--ce-bg-card-elevated)] border border-[var(--ce-border-subtle)] text-[var(--ce-text-primary)]"
                    />
                  </label>
                  <label className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-[var(--ce-text-muted)]">Horas/mes</span>
                    <input
                      type="number"
                      value={monthlyOperatingHours}
                      onChange={(e) =>
                        updateFinancialAssumption('monthlyOperatingHours', Number(e.target.value))
                      }
                      className="ce-mono px-1.5 py-1 rounded-[4px] bg-[var(--ce-bg-card-elevated)] border border-[var(--ce-border-subtle)] text-[var(--ce-text-primary)]"
                    />
                  </label>
                </div>
              </div>

              {/* Single Primary Brand CTA (§7.2: #0866FF, radius 8px) */}
              <button
                onClick={() => setSapModalOpen(true)}
                className="w-full h-[40px] rounded-[8px] bg-[#0866FF] hover:bg-[var(--ce-brand-hover)] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>
                  {sapNotificationCreated
                    ? 'Ver aviso SAP PM liberado (#10084921)'
                    : 'Crear aviso SAP PM (simulado)'}
                </span>
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 2: CONTROL ("TÚ MANDAS") ================= */}
        {rightTab === 'control' && (
          <>
            {/* Speed Presets + Net Margin Optimization Curve */}
            <div className="space-y-2.5">
              <div className="ce-overline text-[var(--ce-text-muted)]">
                RITMO DE LÍNEA VS. MARGEN NETO POR HORA
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { label: 'Lento', bpm: 320 },
                  { label: 'Base', bpm: 360 },
                  { label: 'Nominal', bpm: 400 },
                  { label: 'Forzado', bpm: 440 },
                  { label: 'Óptimo', bpm: 404, highlight: true }
                ].map((p) => {
                  const active = Math.abs(targetSpeedBpm - p.bpm) <= 2;
                  return (
                    <button
                      key={p.label}
                      onClick={() => setTargetSpeedBpm(p.bpm)}
                      className={`py-1.5 px-1 rounded-[6px] text-center border transition cursor-pointer ${
                        active
                          ? p.highlight
                            ? 'bg-[#12B76A]/25 border-[#12B76A] text-[#12B76A]'
                            : 'bg-[#0866FF] border-[#0866FF] text-white'
                          : 'bg-[var(--ce-bg-card-elevated)]/60 border-[var(--ce-border-subtle)] text-[var(--ce-text-secondary)] hover:text-[var(--ce-text-primary)]'
                      }`}
                    >
                      <div className="text-[10.5px] font-semibold">{p.label}</div>
                      <div className="ce-mono text-[11px]">{p.bpm}</div>
                    </button>
                  );
                })}
              </div>

              <SpeedVsMarginChart
                curve={lineDynamics.speedOptimizationCurve}
                currentSpeedBpm={targetSpeedBpm}
                optimalPoint={lineDynamics.optimalSpeedPoint}
                currency={currency}
              />

              <p className="text-[11.5px] text-[var(--ce-text-secondary)] leading-relaxed">
                A <strong className="ce-mono text-[var(--ce-text-primary)]">{targetSpeedBpm} bpm</strong> se esperan{' '}
                <strong className="ce-mono">{lineDynamics.goodBottlesPerHour.toLocaleString('es-419')}</strong>{' '}
                botellas buenas/h y{' '}
                <strong className="ce-mono text-[#63EDFF]">
                  {formatMoney(lineDynamics.netMarginCopPerHour, currency, true)}
                </strong>{' '}
                de margen neto/h. Subir a 440 bpm dispara el rechazo por espumado y choca con el límite térmico de la sopladora.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)]">
                  <div className="text-[10.5px] text-[var(--ce-text-muted)]">Botellas buenas / h</div>
                  <div className="ce-mono text-[18px] font-semibold mt-0.5">
                    {lineDynamics.goodBottlesPerHour.toLocaleString('es-419')}
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[#0866FF]/45">
                  <div className="text-[10.5px] text-[var(--ce-text-muted)]">Margen neto / h</div>
                  <div className="ce-mono text-[17px] font-semibold text-[#63EDFF] mt-0.5">
                    {formatMoney(lineDynamics.netMarginCopPerHour, currency, true)}
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)]">
                  <div className="text-[10.5px] text-[var(--ce-text-muted)]">Microparadas llenadora</div>
                  <div className="ce-mono text-[16px] font-semibold mt-0.5">
                    {lineDynamics.microstopsPerHour.toLocaleString('es-419', { minimumFractionDigits: 1 })} /h
                  </div>
                </div>
                <div className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)]">
                  <div className="text-[10.5px] text-[var(--ce-text-muted)]">Rechazo por espumado</div>
                  <div className="ce-mono text-[16px] font-semibold mt-0.5">
                    {lineDynamics.foamingRejectPct.toLocaleString('es-419', { minimumFractionDigits: 2 })} %
                  </div>
                </div>
              </div>
            </div>

            {/* Simulator Interactive Sliders ("Consola del Simulador") */}
            <div className="pt-3 border-t border-[var(--ce-border-subtle)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="ce-overline text-[#63EDFF] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> CONSOLA DEL SIMULADOR
                </span>
                <span className="text-[11px] text-[var(--ce-text-muted)]">tú mandas</span>
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Velocidad objetivo llenadora</span>
                  <span className="ce-mono font-semibold">{targetSpeedBpm} bpm</span>
                </div>
                <input
                  type="range"
                  min={280}
                  max={455}
                  value={targetSpeedBpm}
                  onChange={(e) => setTargetSpeedBpm(Number(e.target.value))}
                  className="w-full accent-[#0866FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Desgaste válvula 23 (tubo gas)</span>
                  <span className="ce-mono font-semibold">{Math.round(wearValve23Pct)} %</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(wearValve23Pct)}
                  onChange={(e) => setWearValve23Pct(Number(e.target.value))}
                  className="w-full accent-[#0866FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Desgaste etiquetadora (vibración)</span>
                  <span className="ce-mono font-semibold">{wearLabelerPct} %</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={wearLabelerPct}
                  onChange={(e) => setWearLabelerPct(Number(e.target.value))}
                  className="w-full accent-[#0866FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Setpoint manual de llenado</span>
                  <span className="ce-mono font-semibold">
                    +{manualSetpointMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={0.5}
                  value={manualSetpointMl}
                  onChange={(e) => setManualSetpointMl(Number(e.target.value))}
                  className="w-full accent-[#0866FF] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[12px] mb-1">
                  <span>Capacidad del pulmón (ocupado: {bufferBottles} bot)</span>
                  <span className="ce-mono font-semibold">{bufferCapacity} bot</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={1000}
                  step={50}
                  value={bufferCapacity}
                  onChange={(e) => setBufferCapacity(Number(e.target.value))}
                  className="w-full accent-[#0866FF] cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 text-[12px] text-[var(--ce-text-primary)] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={operatorCompensatesSetpoint}
                  onChange={(e) => setOperatorCompensates(e.target.checked)}
                  className="w-4 h-4 accent-[#0866FF] rounded cursor-pointer"
                />
                <span>El operador compensa el bajo nivel subiendo el setpoint (+5 ml)</span>
              </label>
            </div>

            {/* Operational Event Injectors */}
            <div className="pt-3 border-t border-[var(--ce-border-subtle)]">
              <div className="ce-overline text-[var(--ce-text-muted)] mb-2">
                INYECTAR EVENTOS DE OPERACIÓN
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => injectOperationalEvent('blower_jam')}
                  className="py-2 px-2.5 rounded-[8px] text-[11.5px] font-medium bg-[var(--ce-bg-card-elevated)] border border-[var(--ce-border-subtle)] hover:border-[#0866FF] transition cursor-pointer"
                >
                  Atasco en sopladora · 5 min
                </button>
                <button
                  onClick={() => injectOperationalEvent('missing_caps')}
                  className="py-2 px-2.5 rounded-[8px] text-[11.5px] font-medium bg-[var(--ce-bg-card-elevated)] border border-[var(--ce-border-subtle)] hover:border-[#0866FF] transition cursor-pointer"
                >
                  Falta de tapas · 4 min
                </button>
                <button
                  onClick={() => injectOperationalEvent('format_change')}
                  className="py-2 px-2.5 rounded-[8px] text-[11.5px] font-medium bg-[var(--ce-bg-card-elevated)] border border-[var(--ce-border-subtle)] hover:border-[#0866FF] transition cursor-pointer"
                >
                  Cambio de formato
                </button>
                <button
                  onClick={() => injectOperationalEvent('advance_30m')}
                  className="py-2 px-2.5 rounded-[8px] text-[11.5px] font-medium bg-[var(--ce-bg-card-elevated)] border border-[#63EDFF]/40 text-[#63EDFF] hover:border-[#63EDFF] transition cursor-pointer"
                >
                  Avanzar 30 min →
                </button>
              </div>
            </div>

            {/* HSE Event Injectors */}
            <div className="pt-3 border-t border-[var(--ce-border-subtle)]">
              <div className="ce-overline text-[var(--ce-text-muted)] mb-2">
                INYECTAR EVENTOS HSE (SEGURIDAD Y AMBIENTE)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => toggleHseEvent('intrusion')}
                  className={`py-2 px-2.5 rounded-[8px] text-[11.5px] font-semibold border transition cursor-pointer ${
                    activeHseEvents.includes('intrusion')
                      ? 'bg-[#F04438] text-white border-[#F04438]'
                      : 'bg-[#F04438]/10 text-[#FCA5A5] border-[#F04438]/40 hover:border-[#F04438]'
                  }`}
                >
                  Intrusión en celda del robot
                </button>
                <button
                  onClick={() => toggleHseEvent('co2_leak')}
                  className={`py-2 px-2.5 rounded-[8px] text-[11.5px] font-semibold border transition cursor-pointer ${
                    activeHseEvents.includes('co2_leak')
                      ? 'bg-[#F04438] text-white border-[#F04438]'
                      : 'bg-[#F04438]/10 text-[#FCA5A5] border-[#F04438]/40 hover:border-[#F04438]'
                  }`}
                >
                  Fuga de CO₂
                </button>
                <button
                  onClick={() => toggleHseEvent('floor_spill')}
                  className={`py-2 px-2.5 rounded-[8px] text-[11.5px] font-semibold border transition cursor-pointer ${
                    activeHseEvents.includes('floor_spill')
                      ? 'bg-[#F79009] text-[#050D1F] border-[#F79009]'
                      : 'bg-[#F79009]/10 text-[#FDE68A] border-[#F79009]/40 hover:border-[#F79009]'
                  }`}
                >
                  Derrame en piso
                </button>
                <button
                  onClick={clearAllEvents}
                  className="py-2 px-2.5 rounded-[8px] text-[11.5px] font-semibold bg-[#12B76A]/15 text-[#12B76A] border border-[#12B76A]/50 hover:bg-[#12B76A]/25 transition cursor-pointer"
                >
                  Limpiar eventos
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 3: DATOS MAESTROS (CAPA 1) ================= */}
        {rightTab === 'maestros' && (
          <>
            <div className="p-3 rounded-[8px] bg-[#0866FF]/12 border border-[#0866FF]/45">
              <div className="ce-overline text-[#63EDFF]">CAPA 1 DE 4 · GOBIERNO DEL DATO</div>
              <div className="ce-heading text-[14.5px] mt-0.5">
                Datos maestros únicos (vs. 40 Excel rotos)
              </div>
              <p className="text-[12px] text-[var(--ce-text-secondary)] mt-1 leading-relaxed">
                Cada activo, subconjunto, repuesto BOM y receta comparte un identificador gobernado entre PLC, Calidad, SAP PM y Finanzas.
              </p>
              <button
                onClick={() => setFortyExcelsModalOpen(true)}
                className="mt-2.5 px-3 py-1.5 rounded-[8px] bg-[#0866FF] text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Abrir comparador: 40 Excel vs. Gemelo</span>
              </button>
            </div>

            {/* Material Master Card */}
            <div className="p-3 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/60 border border-[var(--ce-border-subtle)] space-y-1.5 text-[12px]">
              <div className="ce-overline text-[var(--ce-text-muted)]">MAESTRO DE MATERIAL ACTIVO</div>
              <div className="flex justify-between">
                <span className="text-[var(--ce-text-secondary)]">Código SKU</span>
                <span className="ce-mono font-semibold text-[#63EDFF]">{MATERIAL_MASTER.sku}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ce-text-secondary)]">Descripción</span>
                <span className="font-medium">{MATERIAL_MASTER.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ce-text-secondary)]">Contenido neto / Corte HF</span>
                <span className="ce-mono">
                  {MATERIAL_MASTER.nominalVolumeMl} ml / {MATERIAL_MASTER.legalMinCutoffMl} ml
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ce-text-secondary)]">Especificación fisicoquímica</span>
                <span className="ce-mono">
                  {MATERIAL_MASTER.brixTarget} °Brix · {MATERIAL_MASTER.co2VolumesTarget} vol CO₂
                </span>
              </div>
            </div>

            {/* SAP PM Technical Locations & BOM Catalog */}
            <div>
              <div className="ce-overline text-[var(--ce-text-muted)] mb-2 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#0866FF]" /> JERARQUÍA UBICACIONES TÉCNICAS SAP PM + BOM
              </div>
              <div className="space-y-2">
                {ASSETS_CATALOG.map((asset) => (
                  <div
                    key={asset.id}
                    className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/50 border border-[var(--ce-border-subtle)]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => selectMachine(asset.id, true)}
                        className="text-left font-semibold text-[12.5px] text-[var(--ce-text-primary)] hover:text-[#63EDFF] cursor-pointer"
                      >
                        {asset.orderIndex} · {asset.name}
                      </button>
                      <span className="ce-mono text-[10px] px-1.5 py-0.5 rounded bg-[#0866FF]/20 text-[#8AB3FF]">
                        Crit. {asset.criticality}
                      </span>
                    </div>
                    <div className="ce-mono text-[10.5px] text-[#63EDFF] mt-0.5">
                      {asset.sapLocation} · {asset.equipmentClassIso}
                    </div>
                    <div className="mt-2 space-y-1">
                      {asset.bomParts.map((part) => (
                        <div
                          key={part.materialCode}
                          className="text-[11px] p-1.5 rounded bg-[var(--ce-bg-page)]/50 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <span className="ce-mono text-[10px] text-[var(--ce-text-muted)] block">
                              {part.materialCode} · Stock: {part.stockAvailable} u · MTTR {part.mttrMinutes}m
                            </span>
                            <span className="text-[var(--ce-text-secondary)] truncate block">
                              {part.description}
                            </span>
                          </div>
                          <span className="ce-mono text-[11px] font-semibold shrink-0">
                            {formatMoney(part.unitCostCop, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 4: IoT SENSORES CON PRECISIÓN CONOCIDA (CAPA 2) ================= */}
        {rightTab === 'iot' && (
          <>
            <div className="p-3 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border border-[var(--ce-border-subtle)] space-y-2">
              <div className="ce-overline text-[#63EDFF] flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" /> CAPA 2 DE 4 · SENSORES CON PRECISIÓN CONOCIDA
              </div>
              <p className="text-[12px] text-[var(--ce-text-secondary)] leading-relaxed">
                Un sensor sin incertidumbre conocida (±σ) convierte ruido en falsas alarmas. Prueba degradar la calibración del inspector HF para observar cómo impacta la certeza del FMEA.
              </p>
              <button
                onClick={toggleSensorDrift}
                className={`w-full py-2 px-3 rounded-[8px] text-[12px] font-semibold border transition cursor-pointer ${
                  sensorDriftSimulated
                    ? 'bg-[#F79009] text-[#050D1F] border-[#F79009]'
                    : 'bg-[var(--ce-bg-page)] text-[var(--ce-text-primary)] border-[var(--ce-border-strong)] hover:border-[#63EDFF]'
                }`}
              >
                {sensorDriftSimulated
                  ? '! Calibración vencida activa en LI-401 (±3,2 ml) · Clic para restaurar'
                  : 'Simular pérdida de calibración en sensor LI-401'}
              </button>
            </div>

            {/* OfficialBrand Manual §7.4 Table style */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="ce-table-head text-[var(--ce-text-muted)] border-b border-[var(--ce-border-strong)]">
                    <th className="py-2 pr-2">TAG</th>
                    <th className="py-2 px-2 text-right">LECTURA</th>
                    <th className="py-2 px-2 text-right">PRECISIÓN ±σ</th>
                    <th className="py-2 pl-2 text-right">3D</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--ce-border-subtle)]">
                  {sensorReadings.map((sr) => (
                    <tr key={sr.tag} className="h-[44px] text-[12px]">
                      <td className="pr-2">
                        <div className="ce-mono font-semibold text-[var(--ce-text-primary)] flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              sr.status === 'critical'
                                ? 'bg-[#F04438]'
                                : sr.status === 'warning'
                                  ? 'bg-[#F79009]'
                                  : 'bg-[#12B76A]'
                            }`}
                          />
                          {sr.tag}
                        </div>
                        <div className="text-[10.5px] text-[var(--ce-text-muted)] truncate max-w-[125px]">
                          {sr.name}
                        </div>
                      </td>
                      <td className="ce-mono px-2 text-right font-semibold text-[var(--ce-text-primary)]">
                        {sr.formattedValue}
                      </td>
                      <td className="ce-mono px-2 text-right text-[11px] text-[#63EDFF]">
                        <div>{sr.knownPrecision}</div>
                        <div className="text-[9.5px] text-[var(--ce-text-muted)]">
                          Conf. {sr.reliabilityPct}%
                        </div>
                      </td>
                      <td className="pl-2 text-right">
                        <button
                          onClick={() =>
                            focusCamera(
                              [sr.position3D[0] + 2.2, sr.position3D[1] + 2.0, sr.position3D[2] + 5.2],
                              sr.position3D
                            )
                          }
                          className="p-1.5 rounded bg-[var(--ce-bg-card-elevated)] hover:bg-[#0866FF] hover:text-white text-[var(--ce-text-secondary)] cursor-pointer"
                          title={`Enfocar cámara 3D en ${sr.tag}`}
                        >
                          <Crosshair className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= TAB 5: INSIGHTS (CAPA 3 · PROBLEMA -> SOLUCIÓN -> RESULTADO) ================= */}
        {rightTab === 'insights' && (
          <>
            {/* Brand Manual §8.1 Problem -> Solution -> Result Cards */}
            <div className="space-y-2">
              <div className="p-3 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border-l-[3px] border-l-[#F04438] border border-[var(--ce-border-subtle)]">
                <div className="ce-overline text-[#F04438]">01 · PROBLEMA DETECTADO</div>
                <p className="text-[12px] text-[var(--ce-text-primary)] mt-1 leading-relaxed">
                  Obstrucción progresiva del tubo de retorno de gas en <strong>Válvula 23</strong> concentra el{' '}
                  <span className="ce-mono font-semibold">{fillerResult.v23ShareOfRejectsPct}%</span> del rechazo. Compensar subiendo el setpoint regala{' '}
                  <span className="ce-mono font-semibold text-[#F79009]">
                    {formatMoney(businessImpact.overfillGiveawayCopPerHour, currency)}/h
                  </span>{' '}
                  invisible en el OEE.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-[#0866FF]/14 border-l-[3px] border-l-[#0866FF] border border-[#0866FF]/40">
                <div className="ce-overline text-[#63EDFF]">02 · SOLUCIÓN PRESCRITA POR EL MODELO</div>
                <p className="text-[12px] text-[var(--ce-text-primary)] mt-1 leading-relaxed">
                  Aplicar <strong>Opción B (Bypass electrónico de V23 en HMI)</strong>, retornar setpoint a 1.500 ml nominales, ajustar ritmo al óptimo económico (<strong>404 bpm</strong>) y liberar Aviso M2 en SAP PM para cambio físico durante el CIP.
                </p>
              </div>

              <div className="p-3 rounded-[8px] bg-[#12B76A]/10 border-l-[3px] border-l-[#12B76A] border border-[#12B76A]/40">
                <div className="ce-overline text-[#12B76A]">03 · RESULTADO MEDIBLE</div>
                <p className="text-[12px] text-[var(--ce-text-primary)] mt-1 leading-relaxed">
                  Ahorro directo de{' '}
                  <span className="ce-mono font-bold text-[#12B76A]">
                    {formatMoney(businessImpact.sapSavingsVsStopNowCop, currency, true)}
                  </span>{' '}
                  frente a paro no programado en un turno de 4 h y eliminación del riesgo regulatorio de contenido neto.
                </p>
              </div>
            </div>

            {/* Chronological Decision Audit Log */}
            <div className="pt-2 border-t border-[var(--ce-border-subtle)]">
              <div className="ce-overline text-[var(--ce-text-muted)] mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#63EDFF]" /> BITÁCORA AUDITABLE DE DECISIONES
              </div>
              <div className="space-y-2">
                {decisionLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/50 border border-[var(--ce-border-subtle)] text-[11.5px]"
                  >
                    <div className="flex items-center justify-between">
                      <span className="ce-mono text-[10.5px] text-[#63EDFF] font-semibold">
                        Turno A · {entry.timeLabel}
                      </span>
                    </div>
                    <div className="text-[var(--ce-text-primary)] font-medium mt-0.5">{entry.action}</div>
                    <div className="text-[var(--ce-text-secondary)] text-[11px] mt-0.5">
                      {entry.financialEffect}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Institutional Attribution Footer */}
        <div className="pt-3 border-t border-[var(--ce-border-subtle)] text-[10.5px] text-[var(--ce-text-muted)] leading-relaxed">
          <strong className="text-[var(--ce-text-secondary)]">Canal Ejecutivo</strong> · Tecnología que se aprende, se aplica y se mide. Simulador industrial con física estocástica de 40 válvulas, balance de masa, Curva V, inferencia FMEA × Señales e integración SAP PM.
        </div>
      </div>
    </aside>
  );
}
