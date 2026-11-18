import { describe, expect, it } from 'vitest';
import { simulateFillerValves } from '../models/fillingPhysics';
import { computeLineDynamics } from '../models/lineDynamics';
import { evaluateRiskAndBusinessCost } from '../models/fmeaRiskAndCost';
import { ASSETS_CATALOG, MATERIAL_MASTER } from '../masterData/linePet2Catalog';

describe('Canal Ejecutivo Digital Twin Core (Layers 1–3)', () => {
  it('Layer 1: governs all 8 industrial assets with unique SAP PM Technical Locations', () => {
    expect(ASSETS_CATALOG).toHaveLength(8);
    const sapCodes = new Set(ASSETS_CATALOG.map((a) => a.sapLocation));
    expect(sapCodes.size).toBe(8);
    expect(MATERIAL_MASTER.nominalVolumeMl).toBe(1500);
  });

  it('Layer 3 (Physics): concentrates >90% of low-level rejects on Valve 23 when V23 wear is 85%', () => {
    const res = simulateFillerValves({
      wearValve23Pct: 85,
      setpointOffsetMl: 0,
      valve23Bypassed: false,
      targetSpeedBpm: 365
    });

    expect(res.activeValveCount).toBe(40);
    expect(res.worstValve.valveNumber).toBe(23);
    expect(res.worstValve.meanDeviationMl).toBeLessThan(-15);
    expect(res.v23ShareOfRejectsPct).toBeGreaterThanOrEqual(90);
  });

  it('Layer 3 (Hidden Overfill): raising setpoint +5.0 ml inflates giveaway cost across healthy valves', () => {
    const nominalRes = simulateFillerValves({
      wearValve23Pct: 85,
      setpointOffsetMl: 0,
      valve23Bypassed: false,
      targetSpeedBpm: 365
    });
    const compensatedRes = simulateFillerValves({
      wearValve23Pct: 85,
      setpointOffsetMl: 5.0,
      valve23Bypassed: false,
      targetSpeedBpm: 365
    });

    expect(compensatedRes.averageOverfillMl).toBeGreaterThan(nominalRes.averageOverfillMl + 3.5);

    const econ = evaluateRiskAndBusinessCost({
      oeePct: 82.0,
      targetOeePct: 85,
      effectiveFillerBpm: 360,
      goodBottlesPerHour: 20_500,
      totalLineRejectPct: compensatedRes.totalLineRejectPct,
      v23ShareOfRejectsPct: compensatedRes.v23ShareOfRejectsPct,
      averageOverfillMl: compensatedRes.averageOverfillMl,
      wearValve23Pct: 85,
      valve23Bypassed: false,
      sensorDriftSimulated: false,
      horizonHoursToCip: 4,
      marginPerBottleCop: 680,
      liquidCostPerMlCop: 0.9,
      variableCostPerBottleCop: 1650,
      monthlyOperatingHours: 520
    });

    expect(econ.overfillGiveawayCopPerHour).toBeGreaterThan(70_000);
    expect(econ.recommendedOption).toBe('B');
  });

  it('Layer 3 (Bypass & Speed Optimization): HMI Bypass switches to 39/40 valves and net margin peaks near 404 bpm', () => {
    const bypassRes = simulateFillerValves({
      wearValve23Pct: 85,
      setpointOffsetMl: 0,
      valve23Bypassed: true,
      targetSpeedBpm: 404
    });

    expect(bypassRes.activeValveCount).toBe(39);
    expect(bypassRes.totalLineRejectPct).toBeLessThan(0.4);

    const dyn = computeLineDynamics({
      targetSpeedBpm: 404,
      totalLineRejectPct: bypassRes.totalLineRejectPct,
      wearValve23Pct: 85,
      valve23Bypassed: true,
      wearLabelerPct: 5,
      setpointOffsetMl: 0,
      activeOperationalStop: false,
      activeHseIntrusion: false,
      marginPerBottleCop: 680,
      variableCostPerBottleCop: 1650,
      liquidCostPerMlCop: 0.9
    });

    expect(dyn.optimalSpeedPoint.speedBpm).toBeGreaterThanOrEqual(396);
    expect(dyn.optimalSpeedPoint.speedBpm).toBeLessThanOrEqual(412);
    const forced440 = dyn.speedOptimizationCurve.find((p) => p.speedBpm === 440)!;
    expect(dyn.optimalSpeedPoint.netMarginCopPerHour).toBeGreaterThan(forced440.netMarginCopPerHour);
  });
});
