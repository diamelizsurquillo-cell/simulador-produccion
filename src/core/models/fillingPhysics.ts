import { MATERIAL_MASTER } from '../masterData/linePet2Catalog';

export interface ValveTelemetry {
  valveNumber: number; // 1..40
  label: string; // V01..V40
  active: boolean; // false when in HMI Bypass
  meanDeviationMl: number; // deviation vs 1500 ml nominal
  meanVolumeMl: number;
  sigmaMl: number;
  rejectPct: number; // % of bottles from THIS valve rejected (< 1488 ml)
  status: 'normal' | 'warning' | 'critical' | 'bypass';
}

export interface FillerAnalysisResult {
  valves: ValveTelemetry[];
  activeValveCount: number;
  worstValve: ValveTelemetry;
  totalLineRejectPct: number;
  v23ShareOfRejectsPct: number;
  averageFillMl: number;
  averageOverfillMl: number; // positive excess over 1500 ml
  effectiveCapacityFactor: number; // 1.0 for 40/40, 0.975 for 39/40
}

// Standard Normal CDF approximation (Abramowitz & Stegun 7.1.26, error < 1.5e-7)
export function normalCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * absX);
  const erf =
    1 -
    (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) *
      t) *
      Math.exp(-absX * absX);
  return 0.5 * (1 + sign * erf);
}

// Deterministic per-valve baseline offsets so all 39 healthy valves look realistic
const BASELINE_VALVE_OFFSETS_ML: number[] = Array.from({ length: 40 }, (_, i) => {
  const v = i + 1;
  if (v === 23) return 0;
  return Number((Math.sin(v * 2.17) * 1.15 + Math.cos(v * 0.83) * 0.45).toFixed(2));
});

export interface FillingPhysicsInput {
  wearValve23Pct: number; // 0..100
  setpointOffsetMl: number; // e.g., 0.0 ml nominal or +5.0 ml operator compensation
  valve23Bypassed: boolean;
  targetSpeedBpm: number;
  sensorHfSigmaMl?: number; // default 0.8 ml from LI-401
  microJitterPhase?: number;
}

export function simulateFillerValves(input: FillingPhysicsInput): FillerAnalysisResult {
  const nominal = MATERIAL_MASTER.nominalVolumeMl; // 1500 ml
  const cutoff = MATERIAL_MASTER.legalMinCutoffMl; // 1488 ml (-12 ml)
  const sensorSigma = input.sensorHfSigmaMl ?? 0.8;
  const phase = input.microJitterPhase ?? 0;

  // Foaming penalty when line is forced above 408 bpm
  const speedExcess = Math.max(0, input.targetSpeedBpm - 408);
  const foamingLossMl = Math.pow(speedExcess / 18, 1.85) * 2.4;
  const foamingSigmaExtra = (speedExcess / 35) * 1.1;

  const valves: ValveTelemetry[] = [];
  let sumRejectProb = 0;
  let sumVolume = 0;
  let activeCount = 0;

  for (let i = 0; i < 40; i++) {
    const valveNumber = i + 1;
    const label = `V${String(valveNumber).padStart(2, '0')}`;
    const isV23 = valveNumber === 23;

    if (isV23 && input.valve23Bypassed) {
      const virtualDrop = -(input.wearValve23Pct / 100) * 22.4;
      valves.push({
        valveNumber,
        label,
        active: false,
        meanDeviationMl: Number(virtualDrop.toFixed(1)),
        meanVolumeMl: Number((nominal + virtualDrop).toFixed(1)),
        sigmaMl: 2.2,
        rejectPct: 0,
        status: 'bypass'
      });
      continue;
    }

    activeCount++;
    const liveWave = Math.sin(phase + valveNumber * 0.7) * 0.15;

    let valveDefectDropMl = 0;
    let baseSigma = 1.65;

    if (isV23) {
      // Progressive gas-return tube obstruction: up to -22.4 ml at 100% wear (-19.0 ml at 85% wear)
      valveDefectDropMl = (input.wearValve23Pct / 100) * 22.35;
      baseSigma = 1.65 + (input.wearValve23Pct / 100) * 1.95;
    }

    const meanVolumeMl =
      nominal +
      BASELINE_VALVE_OFFSETS_ML[i] +
      input.setpointOffsetMl -
      valveDefectDropMl -
      foamingLossMl +
      liveWave;

    const combinedSigma = Math.sqrt(
      Math.pow(baseSigma + foamingSigmaExtra, 2) + Math.pow(sensorSigma, 2)
    );

    const z = (cutoff - meanVolumeMl) / combinedSigma;
    const rejectProb = Math.min(0.999, Math.max(0, normalCdf(z)));
    const rejectPct = rejectProb * 100;
    const meanDeviationMl = meanVolumeMl - nominal;

    let status: ValveTelemetry['status'] = 'normal';
    if (rejectPct >= 10 || meanDeviationMl <= -10) status = 'critical';
    else if (rejectPct >= 1.5 || meanDeviationMl <= -5.5) status = 'warning';

    valves.push({
      valveNumber,
      label,
      active: true,
      meanDeviationMl: Number(meanDeviationMl.toFixed(1)),
      meanVolumeMl: Number(meanVolumeMl.toFixed(1)),
      sigmaMl: Number(combinedSigma.toFixed(2)),
      rejectPct: Number(rejectPct.toFixed(1)),
      status
    });

    sumRejectProb += rejectProb;
    sumVolume += meanVolumeMl;
  }

  const totalLineRejectPct = activeCount > 0 ? (sumRejectProb / activeCount) * 100 : 0;
  const averageFillMl = activeCount > 0 ? sumVolume / activeCount : nominal;
  const averageOverfillMl = Math.max(0, averageFillMl - nominal);

  const v23 = valves[22];
  const v23RejectContribution = v23.active ? v23.rejectPct / 100 / activeCount : 0;
  const totalRejectFrac = totalLineRejectPct / 100;
  const v23ShareOfRejectsPct =
    totalRejectFrac > 0.0005 ? Math.min(99.5, (v23RejectContribution / totalRejectFrac) * 100) : 0;

  const activeValvesSorted = [...valves]
    .filter((v) => v.active)
    .sort((a, b) => a.meanDeviationMl - b.meanDeviationMl);

  const worstValve = activeValvesSorted[0] ?? valves[22];

  return {
    valves,
    activeValveCount: activeCount,
    worstValve,
    totalLineRejectPct: Number(totalLineRejectPct.toFixed(2)),
    v23ShareOfRejectsPct: Number(v23ShareOfRejectsPct.toFixed(0)),
    averageFillMl: Number(averageFillMl.toFixed(1)),
    averageOverfillMl: Number(averageOverfillMl.toFixed(1)),
    effectiveCapacityFactor: activeCount / 40
  };
}
