import { create } from 'zustand';
import {
  ASSETS_CATALOG,
  MATERIAL_MASTER
} from '../core/masterData/linePet2Catalog';
import {
  CurrencyCode,
  HseEventId,
  MachineId,
  ViewMode3D
} from '../core/masterData/types';
import {
  FillerAnalysisResult,
  simulateFillerValves
} from '../core/models/fillingPhysics';
import {
  computeLineDynamics,
  LineDynamicsSnapshot,
  SixBigLosses
} from '../core/models/lineDynamics';
import {
  BusinessImpactAndDecisions,
  DecisionOptionId,
  evaluateRiskAndBusinessCost
} from '../core/models/fmeaRiskAndCost';
import {
  computeLiveSensorReadings,
  LiveSensorReading
} from '../core/sensors/sensorRegistry';
import { GUIDED_CASE_STEPS, RightDrawerTab } from '../core/guidedCaseSteps';
import {
  playAlertBeep,
  playClickChime,
  playSuccessChord
} from '../core/soundEffects';

export type ScenarioPresetId =
  | 'v23_wear'
  | 'hidden_overfill'
  | 'optimal_nominal'
  | 'labeler_wear'
  | 'overspeed_foam';

export interface ActiveAlarm {
  id: string;
  severity: 'critical' | 'warning';
  title: string;
  detail: string;
  timestamp: string;
  machineId?: MachineId;
  hseId?: HseEventId;
}

export interface DecisionLogEntry {
  timeLabel: string;
  action: string;
  financialEffect: string;
}

export interface SampledBottleReading {
  sampleId: number;
  valveNumber: number;
  volumeMl: number;
  deviationMl: number;
  verdict: 'ok' | 'underfill_reject' | 'overfill_giveaway';
}

export interface SimulationState {
  // UI & Minimalist Preferences
  theme: 'dark' | 'light';
  currency: CurrencyCode;
  soundEnabled: boolean;
  viewMode: ViewMode3D;
  rightDrawerOpen: boolean;
  rightTab: RightDrawerTab;
  showIotTags: boolean;
  showDimensions: boolean;
  fortyExcelsModalOpen: boolean;
  sapModalOpen: boolean;
  sapNotificationCreated: boolean;
  sapNotificationNumber: string;

  // Interactive 3-Mission Challenge ("Reto Ejecutivo")
  challengeMinimized: boolean;
  missionsCompleted: [boolean, boolean, boolean];
  challengeScorecardOpen: boolean;

  // Legacy Guided Tour compatibility
  guidedActive: boolean;
  guidedStepIndex: number;
  showZyroMentor: boolean;

  // Direct 3D Hover, Selection & In-Scene Inspections
  hoveredMachineId: MachineId | null;
  selectedMachineId: MachineId | null;
  hoveredValveNumber: number | null;
  selectedValveNumber: number | null;
  selectedHseId: HseEventId | null;
  sampledBottle: SampledBottleReading | null;

  cameraTargetPose: {
    position: [number, number, number];
    target: [number, number, number];
    nonce: number;
  };

  // Clock, Transport & Live Financial Bleed Ticker
  scenarioId: ScenarioPresetId;
  simSpeedMultiplier: 1 | 6 | 30;
  paused: boolean;
  simSecondsElapsed: number;
  totalBottlesShift: number;
  bufferBottles: number;
  bufferCapacity: number;
  sessionMoneyLostCop: number;
  sessionMoneySavedCop: number;
  currentBleedRateCopPerHour: number;

  // Process & Operator Controls
  targetSpeedBpm: number;
  wearValve23Pct: number;
  wearLabelerPct: number;
  manualSetpointMl: number;
  operatorCompensatesSetpoint: boolean;
  valve23Bypassed: boolean;
  appliedDecision: DecisionOptionId | null;
  appliedDecisionTime: string | null;
  sensorDriftSimulated: boolean;

  // Operational & HSE Injected Events
  operationalEventBanner: string | null;
  operationalStopRemainingSec: number;
  activeHseEvents: HseEventId[];

  // Editable Financial Assumptions
  marginPerBottleCop: number;
  liquidCostPerMlCop: number;
  variableCostPerBottleCop: number;
  targetOeePct: number;
  monthlyOperatingHours: number;

  // Historical Sparklines
  historyOee: number[];
  historyAvailability: number[];
  historyPerformance: number[];
  historyQuality: number[];
  historyRejectPct: number[];
  historyOverfillMl: number[];

  // Computed Snapshots
  sixBigLosses: SixBigLosses;
  fillerResult: FillerAnalysisResult;
  lineDynamics: LineDynamicsSnapshot;
  businessImpact: BusinessImpactAndDecisions;
  sensorReadings: LiveSensorReading[];
  activeAlarms: ActiveAlarm[];
  decisionLog: DecisionLogEntry[];

  // Actions
  tick: (realDeltaSec: number) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setCurrency: (currency: CurrencyCode) => void;
  toggleSound: () => void;
  setViewMode: (mode: ViewMode3D) => void;
  setRightDrawerOpen: (open: boolean) => void;
  setRightTab: (tab: RightDrawerTab) => void;
  toggleIotTags: () => void;
  toggleDimensions: () => void;
  setFortyExcelsModalOpen: (open: boolean) => void;
  setSapModalOpen: (open: boolean) => void;
  confirmSapNotification: () => void;

  // Direct 3D Interactions
  setHoveredMachine: (id: MachineId | null) => void;
  selectMachine: (id: MachineId | null, flyCamera?: boolean) => void;
  setHoveredValve: (valveNum: number | null) => void;
  selectValve: (valveNum: number | null) => void;
  sampleBottleIn3D: (preferredValve?: number) => void;
  closeBottleSample: () => void;
  selectHseEvent: (id: HseEventId | null, flyCamera?: boolean) => void;
  resolveHseIn3D: (id: HseEventId) => void;
  focusCamera: (position: [number, number, number], target: [number, number, number]) => void;
  resetCameraOverview: () => void;

  // Playable Challenge & Guided Tour Actions
  setChallengeMinimized: (min: boolean) => void;
  setChallengeScorecardOpen: (open: boolean) => void;
  startGuidedCase: () => void;
  closeGuidedCase: () => void;
  setGuidedStep: (index: number) => void;
  toggleZyroMentor: () => void;

  // Simulation Controls
  setScenario: (id: ScenarioPresetId) => void;
  setSimSpeed: (mult: 1 | 6 | 30) => void;
  togglePause: () => void;
  resetSimulation: () => void;
  setTargetSpeedBpm: (bpm: number) => void;
  setWearValve23Pct: (pct: number) => void;
  setWearLabelerPct: (pct: number) => void;
  setManualSetpointMl: (ml: number) => void;
  setOperatorCompensates: (enabled: boolean) => void;
  setBufferCapacity: (cap: number) => void;
  toggleSensorDrift: () => void;
  applyDecisionOption: (option: DecisionOptionId) => void;
  updateFinancialAssumption: (
    field:
      | 'marginPerBottleCop'
      | 'liquidCostPerMlCop'
      | 'variableCostPerBottleCop'
      | 'targetOeePct'
      | 'monthlyOperatingHours',
    value: number
  ) => void;

  // Event Injectors
  injectOperationalEvent: (type: 'blower_jam' | 'missing_caps' | 'format_change' | 'advance_30m') => void;
  toggleHseEvent: (id: HseEventId) => void;
  clearAllEvents: () => void;
}

export function formatShiftClock(simSecondsElapsed: number): { clock: string; shiftMinute: number } {
  const totalMinutes = 6 * 60 + Math.floor(simSecondsElapsed / 60);
  const hh = Math.floor(totalMinutes / 60) % 24;
  const mm = totalMinutes % 60;
  return {
    clock: `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`,
    shiftMinute: Math.floor(simSecondsElapsed / 60)
  };
}

function computeDerivedState(state: {
  wearValve23Pct: number;
  wearLabelerPct: number;
  manualSetpointMl: number;
  operatorCompensatesSetpoint: boolean;
  valve23Bypassed: boolean;
  targetSpeedBpm: number;
  operationalStopRemainingSec: number;
  activeHseEvents: HseEventId[];
  sensorDriftSimulated: boolean;
  simSecondsElapsed: number;
  totalBottlesShift: number;
  marginPerBottleCop: number;
  liquidCostPerMlCop: number;
  variableCostPerBottleCop: number;
  targetOeePct: number;
  monthlyOperatingHours: number;
}) {
  const effectiveSetpointMl = state.valve23Bypassed
    ? state.manualSetpointMl
    : state.operatorCompensatesSetpoint
      ? Math.max(state.manualSetpointMl, Number(((state.wearValve23Pct / 85) * 5.0).toFixed(1)))
      : state.manualSetpointMl;

  const fillerResult = simulateFillerValves({
    wearValve23Pct: state.wearValve23Pct,
    setpointOffsetMl: effectiveSetpointMl,
    valve23Bypassed: state.valve23Bypassed,
    targetSpeedBpm: state.targetSpeedBpm,
    sensorHfSigmaMl: state.sensorDriftSimulated ? 3.2 : 0.8,
    microJitterPhase: state.simSecondsElapsed * 0.08
  });

  const activeIntrusion = state.activeHseEvents.includes('intrusion');
  const activeCo2 = state.activeHseEvents.includes('co2_leak');
  const activeStop = state.operationalStopRemainingSec > 0;

  const lineDynamics = computeLineDynamics({
    targetSpeedBpm: state.targetSpeedBpm,
    totalLineRejectPct: fillerResult.totalLineRejectPct,
    wearValve23Pct: state.wearValve23Pct,
    valve23Bypassed: state.valve23Bypassed,
    wearLabelerPct: state.wearLabelerPct,
    setpointOffsetMl: effectiveSetpointMl,
    activeOperationalStop: activeStop,
    activeHseIntrusion: activeIntrusion,
    marginPerBottleCop: state.marginPerBottleCop,
    variableCostPerBottleCop: state.variableCostPerBottleCop,
    liquidCostPerMlCop: state.liquidCostPerMlCop
  });

  const businessImpact = evaluateRiskAndBusinessCost({
    oeePct: lineDynamics.oeePct,
    targetOeePct: state.targetOeePct,
    effectiveFillerBpm: lineDynamics.effectiveFillerBpm,
    goodBottlesPerHour: lineDynamics.goodBottlesPerHour,
    totalLineRejectPct: fillerResult.totalLineRejectPct,
    v23ShareOfRejectsPct: fillerResult.v23ShareOfRejectsPct,
    averageOverfillMl: fillerResult.averageOverfillMl,
    wearValve23Pct: state.wearValve23Pct,
    valve23Bypassed: state.valve23Bypassed,
    sensorDriftSimulated: state.sensorDriftSimulated,
    horizonHoursToCip: 4,
    marginPerBottleCop: state.marginPerBottleCop,
    liquidCostPerMlCop: state.liquidCostPerMlCop,
    variableCostPerBottleCop: state.variableCostPerBottleCop,
    monthlyOperatingHours: state.monthlyOperatingHours
  });

  // Live bleed rate (COP/hour wasted due to excess rejects + overfill + emergency stop)
  const excessRejectFrac = Math.max(0, (fillerResult.totalLineRejectPct - 0.15) / 100);
  const grossBph = Math.max(lineDynamics.goodBottlesPerHour, lineDynamics.effectiveFillerBpm * 60);
  const rejectBleedCopPerHour =
    excessRejectFrac * grossBph * (state.variableCostPerBottleCop + state.marginPerBottleCop * 0.4);
  const stopBleedCopPerHour =
    activeStop || activeIntrusion ? 400 * 60 * 0.9 * state.marginPerBottleCop : 0;

  const currentBleedRateCopPerHour = Math.round(
    businessImpact.overfillGiveawayCopPerHour + rejectBleedCopPerHour + stopBleedCopPerHour
  );

  const sensorReadings = computeLiveSensorReadings({
    effectiveSpeedBpm: lineDynamics.effectiveFillerBpm,
    rejectRatePct: fillerResult.totalLineRejectPct,
    wearValve23Pct: state.wearValve23Pct,
    wearLabelerPct: state.wearLabelerPct,
    totalBottlesShift: state.totalBottlesShift,
    activeHseCo2Leak: activeCo2,
    activeHseIntrusion: activeIntrusion,
    sensorDriftSimulated: state.sensorDriftSimulated,
    simTimeSec: state.simSecondsElapsed
  });

  const { clock } = formatShiftClock(state.simSecondsElapsed);
  const activeAlarms: ActiveAlarm[] = [];

  if (fillerResult.totalLineRejectPct >= 0.8) {
    activeAlarms.push({
      id: 'alm-reject',
      severity: fillerResult.totalLineRejectPct >= 1.5 ? 'critical' : 'warning',
      title: 'Rechazo por bajo nivel',
      detail: `${fillerResult.totalLineRejectPct.toLocaleString('es-419', { minimumFractionDigits: 2 })} % · límite 0,80 % · Inspector HF`,
      timestamp: clock,
      machineId: 'inspector'
    });
  }

  if (!state.valve23Bypassed && state.wearValve23Pct >= 45) {
    const v23 = fillerResult.valves[22];
    activeAlarms.push({
      id: 'alm-v23',
      severity: state.wearValve23Pct >= 70 ? 'critical' : 'warning',
      title: 'Desvío de llenado válvula 23',
      detail: `${v23.meanDeviationMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml vs. 1.500 ml · ${fillerResult.v23ShareOfRejectsPct} % del rechazo`,
      timestamp: clock,
      machineId: 'llenadora'
    });
  } else if (state.valve23Bypassed) {
    activeAlarms.push({
      id: 'alm-v23-bypass',
      severity: 'warning',
      title: 'Válvula 23 en Bypass electrónico (HMI)',
      detail: 'Operando 39/40 válvulas · pendiente cambio tubo retorno en CIP',
      timestamp: clock,
      machineId: 'llenadora'
    });
  }

  if (effectiveSetpointMl >= 1.8) {
    activeAlarms.push({
      id: 'alm-overfill',
      severity: 'critical',
      title: 'Setpoint de llenado elevado (sobrellenado)',
      detail: `+${effectiveSetpointMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml en carrusel · fuga oculta de producto`,
      timestamp: clock,
      machineId: 'llenadora'
    });
  }

  if (state.sensorDriftSimulated) {
    activeAlarms.push({
      id: 'alm-sensor-drift',
      severity: 'warning',
      title: 'Deriva metrológica detectada en LI-401',
      detail: 'Incertidumbre subió de ±0,8 ml a ±3,2 ml · verificar calibración',
      timestamp: clock,
      machineId: 'inspector'
    });
  }

  for (const hseId of state.activeHseEvents) {
    activeAlarms.push({
      id: `alm-hse-${hseId}`,
      severity: hseId === 'floor_spill' ? 'warning' : 'critical',
      title:
        hseId === 'intrusion'
          ? 'HSE · Parada segura STO en celda paletizador'
          : hseId === 'co2_leak'
            ? 'HSE · Fuga de CO₂ en sala de llenado (AT-901)'
            : 'HSE · Derrame de producto en piso (riesgo caída)',
      detail: 'Haz clic en la escena 3D para ejecutar protocolo de control',
      timestamp: clock,
      hseId
    });
  }

  return {
    fillerResult,
    lineDynamics,
    businessImpact,
    currentBleedRateCopPerHour,
    sensorReadings,
    activeAlarms
  };
}

const INITIAL_BASE = {
  wearValve23Pct: 82,
  wearLabelerPct: 8,
  manualSetpointMl: 0,
  operatorCompensatesSetpoint: false,
  valve23Bypassed: false,
  targetSpeedBpm: 365,
  operationalStopRemainingSec: 0,
  activeHseEvents: [] as HseEventId[],
  sensorDriftSimulated: false,
  simSecondsElapsed: 308 * 60,
  totalBottlesShift: 112_480,
  marginPerBottleCop: MATERIAL_MASTER.defaultMarginPerBottleCop,
  liquidCostPerMlCop: MATERIAL_MASTER.defaultLiquidCostPerMlCop,
  variableCostPerBottleCop: MATERIAL_MASTER.defaultVariableCostPerBottleCop,
  targetOeePct: 85,
  monthlyOperatingHours: 520
};

const initialDerived = computeDerivedState(INITIAL_BASE);

export const useSimulationStore = create<SimulationState>((set, get) => ({
  theme: 'dark',
  currency: 'COP',
  soundEnabled: true,
  viewMode: 'operacion',
  // Minimalist by default: side drawer starts CLOSED so 85%+ of screen is interactive 3D!
  rightDrawerOpen: false,
  rightTab: 'diagnostico',
  showIotTags: false,
  showDimensions: false,
  fortyExcelsModalOpen: false,
  sapModalOpen: false,
  sapNotificationCreated: false,
  sapNotificationNumber: '10084921',

  challengeMinimized: false,
  missionsCompleted: [false, false, false],
  challengeScorecardOpen: false,

  guidedActive: false,
  guidedStepIndex: 0,
  showZyroMentor: true,

  hoveredMachineId: null,
  selectedMachineId: null,
  hoveredValveNumber: null,
  selectedValveNumber: null,
  selectedHseId: null,
  sampledBottle: null,

  cameraTargetPose: {
    position: [-2.2, 6.2, 11.4],
    target: [-3.2, 1.7, -0.8],
    nonce: 1
  },

  scenarioId: 'v23_wear',
  simSpeedMultiplier: 1,
  paused: false,
  simSecondsElapsed: INITIAL_BASE.simSecondsElapsed,
  totalBottlesShift: INITIAL_BASE.totalBottlesShift,
  bufferBottles: 210,
  bufferCapacity: 500,
  sessionMoneyLostCop: 148_200,
  sessionMoneySavedCop: 0,

  targetSpeedBpm: INITIAL_BASE.targetSpeedBpm,
  wearValve23Pct: INITIAL_BASE.wearValve23Pct,
  wearLabelerPct: INITIAL_BASE.wearLabelerPct,
  manualSetpointMl: INITIAL_BASE.manualSetpointMl,
  operatorCompensatesSetpoint: INITIAL_BASE.operatorCompensatesSetpoint,
  valve23Bypassed: INITIAL_BASE.valve23Bypassed,
  appliedDecision: null,
  appliedDecisionTime: null,
  sensorDriftSimulated: false,

  operationalEventBanner: null,
  operationalStopRemainingSec: 0,
  activeHseEvents: [],

  marginPerBottleCop: INITIAL_BASE.marginPerBottleCop,
  liquidCostPerMlCop: INITIAL_BASE.liquidCostPerMlCop,
  variableCostPerBottleCop: INITIAL_BASE.variableCostPerBottleCop,
  targetOeePct: INITIAL_BASE.targetOeePct,
  monthlyOperatingHours: INITIAL_BASE.monthlyOperatingHours,

  historyOee: [86.4, 86.1, 85.8, 85.4, 84.9, 84.3, 83.8, 83.2, 82.7, 82.3],
  historyAvailability: [97.1, 97.0, 96.8, 96.7, 96.6, 96.5, 96.4, 96.5, 96.3, 96.2],
  historyPerformance: [89.8, 89.5, 89.2, 89.0, 88.9, 88.7, 88.5, 88.8, 88.6, 88.4],
  historyQuality: [99.6, 99.5, 99.3, 99.1, 98.9, 98.7, 98.5, 98.4, 98.3, 98.2],
  historyRejectPct: [0.38, 0.49, 0.65, 0.82, 1.04, 1.25, 1.44, 1.58, 1.71, 1.82],
  historyOverfillMl: [1.1, 1.1, 1.2, 1.2, 1.3, 1.3, 1.4, 1.4, 1.5, 1.5],

  sixBigLosses: {
    reducedSpeedMin: 28.5,
    changeoverAdjustMin: 15.0,
    microstopsMin: 8.3,
    breakdownsMin: 5.0,
    processRejectsMin: 1.8,
    startupRejectsMin: 0.4
  },

  ...initialDerived,

  decisionLog: [
    {
      timeLabel: '11:06',
      action: 'Detección automática desvío local en V23 por cruce LI-401 × codificador carrusel.',
      financialEffect: 'Aísla 1/40 boquillas antes de muestreo manual de Calidad.'
    }
  ],

  tick: (realDeltaSec) => {
    const s = get();
    if (s.paused) return;

    const dtSim = Math.min(realDeltaSec, 0.1) * s.simSpeedMultiplier;
    const nextSimSec = s.simSecondsElapsed + dtSim;

    const nextStopRem = Math.max(0, s.operationalStopRemainingSec - dtSim);
    const nextBanner = nextStopRem === 0 ? null : s.operationalEventBanner;

    const nextWearV23 =
      !s.valve23Bypassed && s.wearValve23Pct > 30 && s.wearValve23Pct < 92
        ? Math.min(92, s.wearValve23Pct + dtSim * 0.018)
        : s.wearValve23Pct;

    const bottlesAdded = (s.lineDynamics.effectiveFillerBpm / 60) * dtSim;
    const nextTotalBottles = s.totalBottlesShift + bottlesAdded;

    const labelerFactor = 1 - (s.wearLabelerPct / 100) * 0.25;
    const bufferDelta = s.activeHseEvents.includes('intrusion')
      ? dtSim * 2.2
      : Math.sin(nextSimSec * 0.05) * dtSim * 0.8 + (1 - labelerFactor) * dtSim * 1.1;
    const nextBuffer = Math.max(0, Math.min(s.bufferCapacity, s.bufferBottles + bufferDelta));

    // Real-time financial bleed / savings ticker (visceral feedback!)
    const bleedThisTick = (s.currentBleedRateCopPerHour / 3600) * Math.max(dtSim, realDeltaSec * 12);
    const baselineBlindBleedRate = 785_000; // COP/h lost in 40-Excel blind operation
    const savedThisTick = s.valve23Bypassed
      ? (Math.max(0, baselineBlindBleedRate - s.currentBleedRateCopPerHour) / 3600) *
        Math.max(dtSim, realDeltaSec * 15)
      : 0;

    const nextLosses: SixBigLosses = {
      reducedSpeedMin: Number(
        (s.sixBigLosses.reducedSpeedMin + Math.max(0, (400 - s.lineDynamics.effectiveFillerBpm) / 400) * (dtSim / 60)).toFixed(1)
      ),
      changeoverAdjustMin: s.sixBigLosses.changeoverAdjustMin,
      microstopsMin: Number((s.sixBigLosses.microstopsMin + (dtSim / 60) * 0.06).toFixed(1)),
      breakdownsMin: Number(
        (s.sixBigLosses.breakdownsMin + (nextStopRem > 0 ? dtSim / 60 : 0)).toFixed(1)
      ),
      processRejectsMin: Number(
        (s.sixBigLosses.processRejectsMin + (s.fillerResult.totalLineRejectPct / 100) * (dtSim / 60)).toFixed(1)
      ),
      startupRejectsMin: s.sixBigLosses.startupRejectsMin
    };

    const derived = computeDerivedState({
      wearValve23Pct: nextWearV23,
      wearLabelerPct: s.wearLabelerPct,
      manualSetpointMl: s.manualSetpointMl,
      operatorCompensatesSetpoint: s.operatorCompensatesSetpoint,
      valve23Bypassed: s.valve23Bypassed,
      targetSpeedBpm: s.targetSpeedBpm,
      operationalStopRemainingSec: nextStopRem,
      activeHseEvents: s.activeHseEvents,
      sensorDriftSimulated: s.sensorDriftSimulated,
      simSecondsElapsed: nextSimSec,
      totalBottlesShift: nextTotalBottles,
      marginPerBottleCop: s.marginPerBottleCop,
      liquidCostPerMlCop: s.liquidCostPerMlCop,
      variableCostPerBottleCop: s.variableCostPerBottleCop,
      targetOeePct: s.targetOeePct,
      monthlyOperatingHours: s.monthlyOperatingHours
    });

    const prevBucket = Math.floor(s.simSecondsElapsed / 12);
    const nextBucket = Math.floor(nextSimSec / 12);
    const pushHist = (arr: number[], v: number) => [...arr.slice(-19), v];

    set({
      simSecondsElapsed: nextSimSec,
      operationalStopRemainingSec: nextStopRem,
      operationalEventBanner: nextBanner,
      wearValve23Pct: nextWearV23,
      totalBottlesShift: nextTotalBottles,
      bufferBottles: Math.round(nextBuffer),
      sessionMoneyLostCop: s.sessionMoneyLostCop + bleedThisTick,
      sessionMoneySavedCop: s.sessionMoneySavedCop + savedThisTick,
      sixBigLosses: nextLosses,
      ...derived,
      ...(nextBucket > prevBucket
        ? {
            historyOee: pushHist(s.historyOee, derived.lineDynamics.oeePct),
            historyAvailability: pushHist(s.historyAvailability, derived.lineDynamics.availabilityPct),
            historyPerformance: pushHist(s.historyPerformance, derived.lineDynamics.performancePct),
            historyQuality: pushHist(s.historyQuality, derived.lineDynamics.qualityPct),
            historyRejectPct: pushHist(s.historyRejectPct, derived.fillerResult.totalLineRejectPct),
            historyOverfillMl: pushHist(s.historyOverfillMl, derived.fillerResult.averageOverfillMl)
          }
        : {})
    });
  },

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  setCurrency: (currency) => set({ currency }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

  setViewMode: (viewMode) => {
    const s = get();
    playClickChime(s.soundEnabled);
    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    if (viewMode === 'rayos_x') {
      nextMissions[0] = true; // Mission 1: inspected internal valves with X-Ray!
    }

    if ((viewMode === 'rayos_x' || viewMode === 'despiece') && s.selectedMachineId !== 'llenadora') {
      const filler = ASSETS_CATALOG.find((a) => a.id === 'llenadora')!;
      set({
        viewMode,
        selectedMachineId: 'llenadora',
        selectedValveNumber: viewMode === 'rayos_x' ? 23 : s.selectedValveNumber,
        missionsCompleted: nextMissions,
        cameraTargetPose: {
          position: [-5.6, 3.8, 2.5],
          target: filler.cameraFocus.target,
          nonce: s.cameraTargetPose.nonce + 1
        }
      });
      return;
    }
    set({ viewMode, missionsCompleted: nextMissions });
  },

  setRightDrawerOpen: (rightDrawerOpen) => set({ rightDrawerOpen }),
  setRightTab: (rightTab) => set({ rightTab, rightDrawerOpen: true }),
  toggleIotTags: () => {
    playClickChime(get().soundEnabled);
    set((s) => ({ showIotTags: !s.showIotTags }));
  },
  toggleDimensions: () => {
    playClickChime(get().soundEnabled);
    set((s) => ({ showDimensions: !s.showDimensions }));
  },
  setFortyExcelsModalOpen: (fortyExcelsModalOpen) => set({ fortyExcelsModalOpen }),
  setSapModalOpen: (sapModalOpen) => set({ sapModalOpen }),

  confirmSapNotification: () => {
    const s = get();
    playSuccessChord(s.soundEnabled);
    const { clock } = formatShiftClock(s.simSecondsElapsed);
    const nextMissions: [boolean, boolean, boolean] = [true, true, true];
    set({
      sapNotificationCreated: true,
      missionsCompleted: nextMissions,
      challengeScorecardOpen: true,
      sapModalOpen: false,
      decisionLog: [
        {
          timeLabel: clock,
          action: `Aviso SAP PM #${s.sapNotificationNumber} liberado para ventana CIP (UT CO02-EMB-L2-LLE-001 · VALV-023).`,
          financialEffect: 'Reserva automática de tubo retorno REP-LLE-TRG-023 en almacén.'
        },
        ...s.decisionLog
      ]
    });
  },

  setHoveredMachine: (hoveredMachineId) => set({ hoveredMachineId }),

  selectMachine: (id, flyCamera = true) => {
    const s = get();
    if (!id) {
      set({ selectedMachineId: null, selectedValveNumber: null });
      return;
    }
    playClickChime(s.soundEnabled);
    const asset = ASSETS_CATALOG.find((a) => a.id === id);
    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    if (id === 'llenadora' && s.viewMode === 'rayos_x') {
      nextMissions[0] = true;
    }
    set({
      selectedMachineId: id,
      selectedHseId: null,
      missionsCompleted: nextMissions,
      ...(flyCamera && asset
        ? {
            cameraTargetPose: {
              position: asset.cameraFocus.position,
              target: asset.cameraFocus.target,
              nonce: s.cameraTargetPose.nonce + 1
            }
          }
        : {})
    });
  },

  setHoveredValve: (hoveredValveNumber) => set({ hoveredValveNumber }),

  selectValve: (valveNum) => {
    const s = get();
    if (valveNum === null) {
      set({ selectedValveNumber: null });
      return;
    }
    playClickChime(s.soundEnabled);
    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    if (valveNum === 23) {
      nextMissions[0] = true;
    }
    set({
      selectedMachineId: 'llenadora',
      selectedValveNumber: valveNum,
      missionsCompleted: nextMissions,
      cameraTargetPose: {
        position: [-5.4, 3.6, 2.2],
        target: [-7.5, 2.2, -1.8],
        nonce: s.cameraTargetPose.nonce + 1
      }
    });
  },

  sampleBottleIn3D: (preferredValve) => {
    const s = get();
    playClickChime(s.soundEnabled);
    const valves = s.fillerResult.valves;
    // Alternate intelligently so the user sees V23 underfill AND healthy/overfilled valves!
    const pickV23 =
      preferredValve === 23 ||
      (!s.valve23Bypassed && (!s.sampledBottle || s.sampledBottle.valveNumber !== 23));
    const chosen = pickV23
      ? valves[22]
      : valves[Math.floor((s.simSecondsElapsed * 7) % 39)];

    const jitter = (Math.sin(s.simSecondsElapsed * 3.1) * chosen.sigmaMl) * 0.45;
    const volumeMl = Number((chosen.meanVolumeMl + jitter).toFixed(1));
    const deviationMl = Number((volumeMl - 1500).toFixed(1));

    const verdict: SampledBottleReading['verdict'] =
      volumeMl < 1488
        ? 'underfill_reject'
        : volumeMl > 1502.5
          ? 'overfill_giveaway'
          : 'ok';

    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    nextMissions[1] = true; // Weighed/inspected real bottle impact!

    set({
      sampledBottle: {
        sampleId: (s.sampledBottle?.sampleId ?? 0) + 1,
        valveNumber: chosen.valveNumber,
        volumeMl,
        deviationMl,
        verdict
      },
      missionsCompleted: nextMissions,
      cameraTargetPose: {
        position: [-0.7, 2.8, 3.6],
        target: [-1.4, 1.35, 0.4],
        nonce: s.cameraTargetPose.nonce + 1
      }
    });
  },

  closeBottleSample: () => set({ sampledBottle: null }),

  selectHseEvent: (id, flyCamera = true) => {
    const s = get();
    if (!id) {
      set({ selectedHseId: null });
      return;
    }
    const poses: Record<HseEventId, { position: [number, number, number]; target: [number, number, number] }> = {
      intrusion: { position: [14.5, 5.8, 11.4], target: [16.8, 1.8, 4.0] },
      co2_leak: { position: [-7.8, 7.6, 3.8], target: [-2.8, 3.6, -6.2] },
      floor_spill: { position: [-0.2, 3.8, 5.2], target: [-1.4, 0.3, 1.1] }
    };
    set({
      selectedHseId: id,
      selectedMachineId: null,
      ...(flyCamera
        ? {
            cameraTargetPose: {
              position: poses[id].position,
              target: poses[id].target,
              nonce: s.cameraTargetPose.nonce + 1
            }
          }
        : {})
    });
  },

  resolveHseIn3D: (id) => {
    const s = get();
    playSuccessChord(s.soundEnabled);
    const nextHse = s.activeHseEvents.filter((e) => e !== id);
    const { clock } = formatShiftClock(s.simSecondsElapsed);
    const derived = computeDerivedState({ ...s, activeHseEvents: nextHse });
    set({
      activeHseEvents: nextHse,
      selectedHseId: s.selectedHseId === id ? null : s.selectedHseId,
      decisionLog: [
        {
          timeLabel: clock,
          action: `Protocolo HSE ejecutado en escena 3D (${id}). Zona asegurada.`,
          financialEffect: 'Continuidad operacional restablecida con riesgo controlado.'
        },
        ...s.decisionLog
      ],
      ...derived
    });
  },

  focusCamera: (position, target) =>
    set((s) => ({
      cameraTargetPose: { position, target, nonce: s.cameraTargetPose.nonce + 1 }
    })),

  resetCameraOverview: () =>
    set((s) => ({
      selectedMachineId: null,
      selectedValveNumber: null,
      selectedHseId: null,
      viewMode: 'operacion',
      cameraTargetPose: {
        position: [0.5, 11.2, 18.5],
        target: [0.5, 1.5, 0.2],
        nonce: s.cameraTargetPose.nonce + 1
      }
    })),

  setChallengeMinimized: (challengeMinimized) => set({ challengeMinimized }),
  setChallengeScorecardOpen: (challengeScorecardOpen) => set({ challengeScorecardOpen }),

  startGuidedCase: () => {
    get().setGuidedStep(0);
    set({ guidedActive: true, challengeMinimized: true });
  },

  closeGuidedCase: () => set({ guidedActive: false }),

  setGuidedStep: (index) => {
    const clamped = Math.max(0, Math.min(GUIDED_CASE_STEPS.length - 1, index));
    const step = GUIDED_CASE_STEPS[clamped];
    const s = get();

    const nextWearV23 = step.presetState?.wearValve23Pct ?? s.wearValve23Pct;
    const nextComp = step.presetState?.operatorCompensatesSetpoint ?? s.operatorCompensatesSetpoint;
    const nextManualSp = step.presetState?.manualSetpointMl ?? s.manualSetpointMl;
    const nextBypass = step.presetState?.valve23Bypassed ?? s.valve23Bypassed;
    const nextSpeed = step.presetState?.targetSpeedBpm ?? s.targetSpeedBpm;

    const derived = computeDerivedState({
      wearValve23Pct: nextWearV23,
      wearLabelerPct: s.wearLabelerPct,
      manualSetpointMl: nextManualSp,
      operatorCompensatesSetpoint: nextComp,
      valve23Bypassed: nextBypass,
      targetSpeedBpm: nextSpeed,
      operationalStopRemainingSec: s.operationalStopRemainingSec,
      activeHseEvents: s.activeHseEvents,
      sensorDriftSimulated: s.sensorDriftSimulated,
      simSecondsElapsed: s.simSecondsElapsed,
      totalBottlesShift: s.totalBottlesShift,
      marginPerBottleCop: s.marginPerBottleCop,
      liquidCostPerMlCop: s.liquidCostPerMlCop,
      variableCostPerBottleCop: s.variableCostPerBottleCop,
      targetOeePct: s.targetOeePct,
      monthlyOperatingHours: s.monthlyOperatingHours
    });

    set({
      guidedActive: true,
      guidedStepIndex: clamped,
      viewMode: step.viewMode,
      rightTab: step.rightTab,
      selectedMachineId: step.selectedMachine,
      selectedHseId: null,
      showIotTags: step.showIotTags ?? s.showIotTags,
      wearValve23Pct: nextWearV23,
      operatorCompensatesSetpoint: nextComp,
      manualSetpointMl: nextManualSp,
      valve23Bypassed: nextBypass,
      appliedDecision: nextBypass ? 'B' : s.appliedDecision,
      targetSpeedBpm: nextSpeed,
      cameraTargetPose: {
        position: step.camera.position,
        target: step.camera.target,
        nonce: s.cameraTargetPose.nonce + 1
      },
      ...derived
    });
  },

  toggleZyroMentor: () => set((s) => ({ showZyroMentor: !s.showZyroMentor })),

  setScenario: (scenarioId) => {
    const s = get();
    playClickChime(s.soundEnabled);
    let patch = {
      wearValve23Pct: 82,
      wearLabelerPct: 8,
      manualSetpointMl: 0,
      operatorCompensatesSetpoint: false,
      valve23Bypassed: false,
      targetSpeedBpm: 365,
      activeHseEvents: [] as HseEventId[]
    };

    if (scenarioId === 'hidden_overfill') {
      patch = {
        ...patch,
        wearValve23Pct: 85,
        operatorCompensatesSetpoint: true,
        targetSpeedBpm: 365
      };
    } else if (scenarioId === 'optimal_nominal') {
      patch = {
        ...patch,
        wearValve23Pct: 6,
        wearLabelerPct: 4,
        targetSpeedBpm: 404
      };
    } else if (scenarioId === 'labeler_wear') {
      patch = {
        ...patch,
        wearValve23Pct: 12,
        wearLabelerPct: 78,
        targetSpeedBpm: 396
      };
    } else if (scenarioId === 'overspeed_foam') {
      patch = {
        ...patch,
        wearValve23Pct: 15,
        wearLabelerPct: 12,
        targetSpeedBpm: 440
      };
    }

    const derived = computeDerivedState({
      ...patch,
      operationalStopRemainingSec: 0,
      sensorDriftSimulated: s.sensorDriftSimulated,
      simSecondsElapsed: s.simSecondsElapsed,
      totalBottlesShift: s.totalBottlesShift,
      marginPerBottleCop: s.marginPerBottleCop,
      liquidCostPerMlCop: s.liquidCostPerMlCop,
      variableCostPerBottleCop: s.variableCostPerBottleCop,
      targetOeePct: s.targetOeePct,
      monthlyOperatingHours: s.monthlyOperatingHours
    });

    set({
      scenarioId,
      ...patch,
      appliedDecision: null,
      operationalStopRemainingSec: 0,
      operationalEventBanner: null,
      ...derived
    });
  },

  setSimSpeed: (simSpeedMultiplier) => set({ simSpeedMultiplier, paused: false }),
  togglePause: () => set((s) => ({ paused: !s.paused })),

  resetSimulation: () => {
    const derived = computeDerivedState(INITIAL_BASE);
    set((s) => ({
      scenarioId: 'v23_wear',
      paused: false,
      simSpeedMultiplier: 1,
      viewMode: 'operacion',
      rightDrawerOpen: false,
      simSecondsElapsed: INITIAL_BASE.simSecondsElapsed,
      totalBottlesShift: INITIAL_BASE.totalBottlesShift,
      sessionMoneyLostCop: 148_200,
      sessionMoneySavedCop: 0,
      wearValve23Pct: INITIAL_BASE.wearValve23Pct,
      wearLabelerPct: INITIAL_BASE.wearLabelerPct,
      manualSetpointMl: 0,
      operatorCompensatesSetpoint: false,
      valve23Bypassed: false,
      appliedDecision: null,
      appliedDecisionTime: null,
      sensorDriftSimulated: false,
      targetSpeedBpm: INITIAL_BASE.targetSpeedBpm,
      activeHseEvents: [],
      selectedMachineId: null,
      selectedValveNumber: null,
      selectedHseId: null,
      sampledBottle: null,
      operationalStopRemainingSec: 0,
      operationalEventBanner: null,
      sapNotificationCreated: false,
      missionsCompleted: [false, false, false],
      challengeScorecardOpen: false,
      cameraTargetPose: {
        position: [-2.2, 6.2, 11.4],
        target: [-3.2, 1.7, -0.8],
        nonce: s.cameraTargetPose.nonce + 1
      },
      ...derived
    }));
  },

  setTargetSpeedBpm: (targetSpeedBpm) => {
    const s = get();
    const derived = computeDerivedState({ ...s, targetSpeedBpm });
    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    if (s.valve23Bypassed && targetSpeedBpm >= 398 && targetSpeedBpm <= 410) {
      nextMissions[2] = true;
    }
    set({ targetSpeedBpm, missionsCompleted: nextMissions, ...derived });
  },

  setWearValve23Pct: (wearValve23Pct) => {
    const s = get();
    const derived = computeDerivedState({ ...s, wearValve23Pct });
    set({ wearValve23Pct, ...derived });
  },

  setWearLabelerPct: (wearLabelerPct) => {
    const s = get();
    const derived = computeDerivedState({ ...s, wearLabelerPct });
    set({ wearLabelerPct, ...derived });
  },

  setManualSetpointMl: (manualSetpointMl) => {
    const s = get();
    const derived = computeDerivedState({
      ...s,
      manualSetpointMl,
      operatorCompensatesSetpoint: false
    });
    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    if (manualSetpointMl >= 3.5) nextMissions[1] = true;
    set({ manualSetpointMl, operatorCompensatesSetpoint: false, missionsCompleted: nextMissions, ...derived });
  },

  setOperatorCompensates: (operatorCompensatesSetpoint) => {
    const s = get();
    if (operatorCompensatesSetpoint) playAlertBeep(s.soundEnabled);
    else playClickChime(s.soundEnabled);
    const derived = computeDerivedState({ ...s, operatorCompensatesSetpoint });
    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];
    if (operatorCompensatesSetpoint) nextMissions[1] = true;
    set({ operatorCompensatesSetpoint, missionsCompleted: nextMissions, ...derived });
  },

  setBufferCapacity: (bufferCapacity) =>
    set((s) => ({
      bufferCapacity,
      bufferBottles: Math.min(s.bufferBottles, bufferCapacity)
    })),

  toggleSensorDrift: () => {
    const s = get();
    playAlertBeep(s.soundEnabled);
    const sensorDriftSimulated = !s.sensorDriftSimulated;
    const derived = computeDerivedState({ ...s, sensorDriftSimulated });
    set({ sensorDriftSimulated, ...derived });
  },

  applyDecisionOption: (option) => {
    const s = get();
    const { clock } = formatShiftClock(s.simSecondsElapsed);

    let nextWearV23 = s.wearValve23Pct;
    let nextBypass = s.valve23Bypassed;
    let nextComp = s.operatorCompensatesSetpoint;
    let nextManualSp = s.manualSetpointMl;
    let nextSimSec = s.simSecondsElapsed;
    let logText = '';
    let effectText = '';

    const nextMissions: [boolean, boolean, boolean] = [...s.missionsCompleted];

    if (option === 'A') {
      playClickChime(s.soundEnabled);
      nextWearV23 = 2;
      nextBypass = false;
      nextComp = false;
      nextManualSp = 0;
      nextSimSec += 25 * 60;
      logText = 'Opción A ejecutada: paro inmediato de 25 min y cambio físico de tubo en V23.';
      effectText = 'Falla eliminada con alto costo por lucro cesante en cuello de botella.';
    } else if (option === 'B') {
      playSuccessChord(s.soundEnabled);
      nextBypass = true;
      nextComp = false;
      nextManualSp = 0;
      nextMissions[0] = true;
      nextMissions[2] = true;
      logText = 'Opción B aplicada: Bypass electrónico de V23 en HMI (39/40 válvulas) y setpoint devuelto a nominal.';
      effectText = 'Elimina sobrellenado y rechazo de V23 al instante; programar cambio en CIP.';
    } else {
      playAlertBeep(s.soundEnabled);
      nextBypass = false;
      nextComp = true;
      nextMissions[1] = true;
      logText = 'Opción C seleccionada: continúa operación con setpoint compensado (+5,0 ml).';
      effectText = 'Advertencia: persiste pérdida financiera por producto regalado en 39 válvulas.';
    }

    const derived = computeDerivedState({
      ...s,
      wearValve23Pct: nextWearV23,
      valve23Bypassed: nextBypass,
      operatorCompensatesSetpoint: nextComp,
      manualSetpointMl: nextManualSp,
      simSecondsElapsed: nextSimSec
    });

    set({
      wearValve23Pct: nextWearV23,
      valve23Bypassed: nextBypass,
      operatorCompensatesSetpoint: nextComp,
      manualSetpointMl: nextManualSp,
      simSecondsElapsed: nextSimSec,
      appliedDecision: option,
      appliedDecisionTime: clock,
      missionsCompleted: nextMissions,
      decisionLog: [{ timeLabel: clock, action: logText, financialEffect: effectText }, ...s.decisionLog],
      ...derived
    });
  },

  updateFinancialAssumption: (field, value) => {
    if (!Number.isFinite(value) || value < 0) return;
    const s = get();
    const nextState = { ...s, [field]: value };
    const derived = computeDerivedState(nextState);
    set({ [field]: value, ...derived });
  },

  injectOperationalEvent: (type) => {
    const s = get();
    playAlertBeep(s.soundEnabled);
    const { clock } = formatShiftClock(s.simSecondsElapsed);

    if (type === 'advance_30m') {
      const nextSimSec = s.simSecondsElapsed + 30 * 60;
      const nextBottles = s.totalBottlesShift + s.lineDynamics.effectiveFillerBpm * 30;
      const nextWear = !s.valve23Bypassed ? Math.min(96, s.wearValve23Pct + 6) : s.wearValve23Pct;
      const derived = computeDerivedState({
        ...s,
        simSecondsElapsed: nextSimSec,
        totalBottlesShift: nextBottles,
        wearValve23Pct: nextWear
      });
      set({
        simSecondsElapsed: nextSimSec,
        totalBottlesShift: nextBottles,
        wearValve23Pct: nextWear,
        decisionLog: [
          {
            timeLabel: clock,
            action: 'Avance rápido de simulación (+30 min de turno).',
            financialEffect: `Acumulado actualizado a ${Math.round(nextBottles).toLocaleString('es-419')} botellas.`
          },
          ...s.decisionLog
        ],
        ...derived
      });
      return;
    }

    const stopMap = {
      blower_jam: { sec: 5 * 60, label: 'Atasco de preformas en sopladora · Paro 5 min activo', machine: 'sopladora' as MachineId },
      missing_caps: { sec: 4 * 60, label: 'Falta de tapas en tolva de roscadora · Paro 4 min activo', machine: 'roscadora' as MachineId },
      format_change: { sec: 12 * 60, label: 'Cambio de formato SKU en curso · Ajuste de guías', machine: 'llenadora' as MachineId }
    }[type];

    const asset = ASSETS_CATALOG.find((a) => a.id === stopMap.machine)!;
    const derived = computeDerivedState({
      ...s,
      operationalStopRemainingSec: stopMap.sec
    });

    set({
      operationalStopRemainingSec: stopMap.sec,
      operationalEventBanner: stopMap.label,
      selectedMachineId: stopMap.machine,
      cameraTargetPose: {
        position: asset.cameraFocus.position,
        target: asset.cameraFocus.target,
        nonce: s.cameraTargetPose.nonce + 1
      },
      ...derived
    });
  },

  toggleHseEvent: (id) => {
    const s = get();
    const exists = s.activeHseEvents.includes(id);
    if (!exists) playAlertBeep(s.soundEnabled);
    else playClickChime(s.soundEnabled);

    const nextHse = exists ? s.activeHseEvents.filter((e) => e !== id) : [...s.activeHseEvents, id];
    const derived = computeDerivedState({ ...s, activeHseEvents: nextHse });
    set({
      activeHseEvents: nextHse,
      ...derived
    });
    if (!exists) {
      get().selectHseEvent(id, true);
    } else if (s.selectedHseId === id) {
      set({ selectedHseId: null });
    }
  },

  clearAllEvents: () => {
    const s = get();
    playSuccessChord(s.soundEnabled);
    const derived = computeDerivedState({
      ...s,
      activeHseEvents: [],
      operationalStopRemainingSec: 0
    });
    set({
      activeHseEvents: [],
      selectedHseId: null,
      operationalStopRemainingSec: 0,
      operationalEventBanner: null,
      ...derived
    });
  }
}));
