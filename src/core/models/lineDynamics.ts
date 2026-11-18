import { MATERIAL_MASTER } from '../masterData/linePet2Catalog';

export interface SpeedCurvePoint {
  speedBpm: number;
  goodBottlesPerHour: number;
  netMarginCopPerHour: number;
  foamingRejectPct: number;
  microstopsPerHour: number;
  blowerLimited: boolean;
}

export interface VCurveMachinePoint {
  machineShort: string;
  designPctOfFiller: number;
  effectivePctOfFiller: number;
  effectiveBpm: number;
}

export interface SixBigLosses {
  reducedSpeedMin: number;
  changeoverAdjustMin: number;
  microstopsMin: number;
  breakdownsMin: number;
  processRejectsMin: number;
  startupRejectsMin: number;
}

export interface LineDynamicsSnapshot {
  effectiveFillerBpm: number;
  availabilityPct: number;
  performancePct: number;
  qualityPct: number;
  oeePct: number;
  goodBottlesPerHour: number;
  netMarginCopPerHour: number;
  microstopsPerHour: number;
  foamingRejectPct: number;
  vCurve: VCurveMachinePoint[];
  speedOptimizationCurve: SpeedCurvePoint[];
  optimalSpeedPoint: SpeedCurvePoint;
}

export function evaluateSpeedPoint(
  targetSpeedBpm: number,
  wearValve23Pct: number,
  valve23Bypassed: boolean,
  wearLabelerPct: number,
  setpointOffsetMl: number,
  marginPerBottleCop = MATERIAL_MASTER.defaultMarginPerBottleCop,
  variableCostPerBottleCop = MATERIAL_MASTER.defaultVariableCostPerBottleCop,
  liquidCostPerMlCop = MATERIAL_MASTER.defaultLiquidCostPerMlCop
): SpeedCurvePoint {
  // Blower physical ceiling is 422 bpm
  const blowerCeiling = 422;
  const capacityFactor = valve23Bypassed ? 39 / 40 : 1.0;
  const rawCappedBpm = Math.min(targetSpeedBpm * capacityFactor, blowerCeiling);

  // Microstops grow slightly up to 404 bpm, then steeply above 408 bpm
  const speedStress = Math.max(0, targetSpeedBpm - 395);
  const microstopsPerHour =
    5.4 +
    (targetSpeedBpm - 280) * 0.015 +
    Math.pow(speedStress / 16, 2.2) * 3.1 +
    (wearLabelerPct / 100) * 5.5;

  const microstopLostMinPerHour = Math.min(22, microstopsPerHour * 0.42);
  const availabilityFrac = Math.max(0.62, (60 - microstopLostMinPerHour - 1.2) / 60);

  // Foaming reject surges above 404 bpm; plus residual V23 reject if not bypassed
  const foamStress = Math.max(0, targetSpeedBpm - 404);
  const foamingRejectPct = 0.05 + Math.pow(foamStress / 14, 2.35) * 0.95;

  const v23RejectPct = valve23Bypassed
    ? 0
    : Math.max(0, ((wearValve23Pct - 25) / 75) * 2.1 - setpointOffsetMl * 0.05);

  const totalRejectFrac = Math.min(0.18, (foamingRejectPct + v23RejectPct) / 100);

  const grossBottlesPerHour = rawCappedBpm * 60 * availabilityFrac;
  const rejectedBottlesPerHour = grossBottlesPerHour * totalRejectFrac;
  const goodBottlesPerHour = Math.round(grossBottlesPerHour - rejectedBottlesPerHour);

  const overfillMlPerBottle = Math.max(0, setpointOffsetMl);
  const overfillCostPerHour = goodBottlesPerHour * overfillMlPerBottle * liquidCostPerMlCop;
  const rejectScrapCostPerHour = rejectedBottlesPerHour * variableCostPerBottleCop;

  const netMarginCopPerHour =
    goodBottlesPerHour * marginPerBottleCop - rejectScrapCostPerHour - overfillCostPerHour;

  return {
    speedBpm: targetSpeedBpm,
    goodBottlesPerHour,
    netMarginCopPerHour: Math.round(netMarginCopPerHour),
    foamingRejectPct: Number(foamingRejectPct.toFixed(2)),
    microstopsPerHour: Number(microstopsPerHour.toFixed(1)),
    blowerLimited: targetSpeedBpm > blowerCeiling
  };
}

export function computeLineDynamics(params: {
  targetSpeedBpm: number;
  totalLineRejectPct: number;
  wearValve23Pct: number;
  valve23Bypassed: boolean;
  wearLabelerPct: number;
  setpointOffsetMl: number;
  activeOperationalStop: boolean;
  activeHseIntrusion: boolean;
  marginPerBottleCop: number;
  variableCostPerBottleCop: number;
  liquidCostPerMlCop: number;
}): LineDynamicsSnapshot {
  const curveSpeeds = [280, 300, 320, 340, 360, 380, 396, 404, 412, 420, 430, 440, 460];
  const speedOptimizationCurve = curveSpeeds.map((s) =>
    evaluateSpeedPoint(
      s,
      params.wearValve23Pct,
      params.valve23Bypassed,
      params.wearLabelerPct,
      params.setpointOffsetMl,
      params.marginPerBottleCop,
      params.variableCostPerBottleCop,
      params.liquidCostPerMlCop
    )
  );

  const optimalSpeedPoint = speedOptimizationCurve.reduce((best, pt) =>
    pt.netMarginCopPerHour > best.netMarginCopPerHour ? pt : best
  );

  const currentEval = evaluateSpeedPoint(
    params.targetSpeedBpm,
    params.wearValve23Pct,
    params.valve23Bypassed,
    params.wearLabelerPct,
    params.setpointOffsetMl,
    params.marginPerBottleCop,
    params.variableCostPerBottleCop,
    params.liquidCostPerMlCop
  );

  const halted = params.activeOperationalStop || params.activeHseIntrusion;
  const capacityFactor = params.valve23Bypassed ? 39 / 40 : 1.0;
  const effectiveFillerBpm = halted
    ? 0
    : Math.round(Math.min(420, params.targetSpeedBpm * capacityFactor * 0.985));

  const availabilityPct = halted
    ? 78.4
    : Number(Math.max(82, 97.2 - currentEval.microstopsPerHour * 0.34).toFixed(1));
  const performancePct = halted
    ? 0
    : Number(Math.min(104, (effectiveFillerBpm / 400) * 100).toFixed(1));
  const qualityPct = Number(Math.max(85, 100 - params.totalLineRejectPct).toFixed(1));
  const oeePct = halted
    ? 0
    : Number((((availabilityPct / 100) * (performancePct / 100) * (qualityPct / 100)) * 100).toFixed(1));

  // V-Curve around bottleneck (Filler = 100% nominal = 400 bpm)
  const labelerPenalty = (params.wearLabelerPct / 100) * 18;
  const vCurve: VCurveMachinePoint[] = [
    {
      machineShort: 'Sopladora',
      designPctOfFiller: 105,
      effectivePctOfFiller: Math.round(104 - Math.max(0, params.targetSpeedBpm - 410) * 0.4),
      effectiveBpm: 416
    },
    {
      machineShort: 'Llenadora',
      designPctOfFiller: 100,
      effectivePctOfFiller: Math.round((effectiveFillerBpm / 400) * 100),
      effectiveBpm: effectiveFillerBpm
    },
    {
      machineShort: 'Etiquetadora',
      designPctOfFiller: 112,
      effectivePctOfFiller: Math.round(110 - labelerPenalty),
      effectiveBpm: Math.round(440 - labelerPenalty * 4)
    },
    {
      machineShort: 'Empacadora',
      designPctOfFiller: 118,
      effectivePctOfFiller: 115,
      effectiveBpm: 460
    },
    {
      machineShort: 'Paletizador',
      designPctOfFiller: 124,
      effectivePctOfFiller: params.activeHseIntrusion ? 0 : 121,
      effectiveBpm: params.activeHseIntrusion ? 0 : 484
    }
  ];

  return {
    effectiveFillerBpm,
    availabilityPct,
    performancePct,
    qualityPct,
    oeePct,
    goodBottlesPerHour: halted ? 0 : currentEval.goodBottlesPerHour,
    netMarginCopPerHour: halted ? 0 : currentEval.netMarginCopPerHour,
    microstopsPerHour: currentEval.microstopsPerHour,
    foamingRejectPct: currentEval.foamingRejectPct,
    vCurve,
    speedOptimizationCurve,
    optimalSpeedPoint
  };
}
