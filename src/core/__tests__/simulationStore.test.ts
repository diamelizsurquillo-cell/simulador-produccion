import { beforeEach, describe, expect, it } from 'vitest';
import { useSimulationStore } from '../../store/simulationStore';
import { formatMoney } from '../masterData/linePet2Catalog';

describe('Simulation Store v2 — Minimalist & Direct 3D Interactivity', () => {
  beforeEach(() => {
    useSimulationStore.getState().resetSimulation();
  });

  it('starts uncluttered with right analytics drawer closed and 0 selected machine cards', () => {
    const s = useSimulationStore.getState();
    expect(s.rightDrawerOpen).toBe(false);
    expect(s.selectedMachineId).toBeNull();
    expect(s.missionsCompleted).toEqual([false, false, false]);
  });

  it('completes all 3 playable Executive Challenge missions via direct 3D actions', () => {
    const store = useSimulationStore.getState();

    // Mission 1: Click directly on Valve 23 in 3D
    store.selectValve(23);
    expect(useSimulationStore.getState().missionsCompleted[0]).toBe(true);

    // Mission 2: Sample/weigh a bottle in 3D on the reject table
    store.sampleBottleIn3D(23);
    const sample = useSimulationStore.getState().sampledBottle!;
    expect(sample).not.toBeNull();
    expect(sample.valveNumber).toBe(23);
    expect(sample.verdict).toBe('underfill_reject');
    expect(useSimulationStore.getState().missionsCompleted[1]).toBe(true);

    // Mission 3: Apply Bypass to V23 + confirm SAP PM order -> opens Victory Scorecard!
    store.applyDecisionOption('B');
    store.confirmSapNotification();
    const finalState = useSimulationStore.getState();
    expect(finalState.missionsCompleted).toEqual([true, true, true]);
    expect(finalState.challengeScorecardOpen).toBe(true);
    expect(finalState.valve23Bypassed).toBe(true);
    expect(finalState.fillerResult.activeValveCount).toBe(39);
  });

  it('tracks live money bleed before Bypass and live money saved after Bypass on tick()', () => {
    const lossBefore = useSimulationStore.getState().sessionMoneyLostCop;
    useSimulationStore.getState().tick(0.1);
    expect(useSimulationStore.getState().sessionMoneyLostCop).toBeGreaterThan(lossBefore);

    useSimulationStore.getState().applyDecisionOption('B');
    const savedBefore = useSimulationStore.getState().sessionMoneySavedCop;
    useSimulationStore.getState().tick(0.1);
    expect(useSimulationStore.getState().sessionMoneySavedCop).toBeGreaterThan(savedBefore);
  });

  it('spawns and resolves HSE emergencies directly via resolveHseIn3D()', () => {
    useSimulationStore.getState().toggleHseEvent('co2_leak');
    expect(useSimulationStore.getState().activeHseEvents).toContain('co2_leak');

    useSimulationStore.getState().resolveHseIn3D('co2_leak');
    expect(useSimulationStore.getState().activeHseEvents).not.toContain('co2_leak');
  });

  it('degrades FMEA certainty when LI-401 sensor loses calibration (Layer 2 verification)', () => {
    const cleanFalseRejectProb = useSimulationStore
      .getState()
      .businessImpact.fmeaRanking.find((f) => f.id === 'hf-false-reject')!.probabilityPct;

    useSimulationStore.getState().toggleSensorDrift();
    const driftedFalseRejectProb = useSimulationStore
      .getState()
      .businessImpact.fmeaRanking.find((f) => f.id === 'hf-false-reject')!.probabilityPct;

    expect(driftedFalseRejectProb).toBeGreaterThan(cleanFalseRejectProb + 15);
  });

  it('formats multicurrency values accurately across COP, USD, PEN, and MXN', () => {
    expect(formatMoney(4_900_000, 'COP', true)).toContain('COP');
    expect(formatMoney(4_000_000, 'USD', true)).toContain('USD');
    expect(formatMoney(4_000_000, 'PEN', false)).toContain('S/');
    expect(formatMoney(4_000_000, 'MXN', false)).toContain('MXN');
  });
});
