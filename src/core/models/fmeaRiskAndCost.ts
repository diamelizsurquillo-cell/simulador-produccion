import { ASSETS_CATALOG } from '../masterData/linePet2Catalog';

export interface FmeaInferenceItem {
  id: string;
  cause: string;
  probabilityPct: number;
  componentRef: string;
  bomMaterialCode: string;
  isoCode: string;
}

export type DecisionOptionId = 'A' | 'B' | 'C';

export interface DecisionOptionEvaluation {
  id: DecisionOptionId;
  title: string;
  subtitle: string;
  totalCostHorizonCop: number;
  isRecommended: boolean;
  tagLabel: string;
}

export interface BusinessImpactAndDecisions {
  oeeGapPts: number;
  unproducedBottlesPerHour: number;
  overfillGiveawayCopPerHour: number;
  overfillLitersPerHour: number;
  monthlyProjectedLossCop: number;
  fmeaRanking: FmeaInferenceItem[];
  fmeaConfidenceNote: string;
  options: DecisionOptionEvaluation[];
  recommendedOption: DecisionOptionId;
  sapSavingsVsStopNowCop: number;
}

export interface RiskCostModelInput {
  oeePct: number;
  targetOeePct: number;
  effectiveFillerBpm: number;
  goodBottlesPerHour: number;
  totalLineRejectPct: number;
  v23ShareOfRejectsPct: number;
  averageOverfillMl: number;
  wearValve23Pct: number;
  valve23Bypassed: boolean;
  sensorDriftSimulated: boolean;
  horizonHoursToCip: number; // default 4 h
  marginPerBottleCop: number;
  liquidCostPerMlCop: number;
  variableCostPerBottleCop: number;
  monthlyOperatingHours: number;
}

export function evaluateRiskAndBusinessCost(input: RiskCostModelInput): BusinessImpactAndDecisions {
  const fillerMaster = ASSETS_CATALOG.find((a) => a.id === 'llenadora')!;
  const oeeGapPts = Number((input.oeePct - input.targetOeePct).toFixed(1));

  // Nominal target bottles/h at target OEE (e.g., 400 bpm * 60 * 0.85 = 20,400 bot/h)
  const targetGoodBottlesPerHour = Math.round(400 * 60 * (input.targetOeePct / 100));
  const unproducedBottlesPerHour = Math.max(0, targetGoodBottlesPerHour - input.goodBottlesPerHour);

  // Overfill hidden cost ("El costo que el OEE no ve")
  const overfillLitersPerHour = Number(
    ((input.goodBottlesPerHour * input.averageOverfillMl) / 1000).toFixed(1)
  );
  const overfillGiveawayCopPerHour = Math.round(
    input.goodBottlesPerHour * input.averageOverfillMl * input.liquidCostPerMlCop
  );

  // Reject scrap cost/h
  const grossBph = Math.max(input.goodBottlesPerHour, input.effectiveFillerBpm * 60);
  const rejectedBottlesPerHour = grossBph * (input.totalLineRejectPct / 100);
  const rejectScrapCopPerHour =
    rejectedBottlesPerHour * (input.variableCostPerBottleCop + input.marginPerBottleCop * 0.35);

  const hourlyRecoverableLossCop = input.valve23Bypassed
    ? overfillGiveawayCopPerHour
    : overfillGiveawayCopPerHour + rejectScrapCopPerHour;

  const monthlyProjectedLossCop =
    input.valve23Bypassed && input.averageOverfillMl < 0.4
      ? 0
      : Math.round(hourlyRecoverableLossCop * input.monthlyOperatingHours);

  // Bayesian-style FMEA × Signals ranking
  let wGasTube = 56;
  let wLiquidSeal = 29;
  let wCentering = 11;
  let wSensorFalse = 4;

  if (input.sensorDriftSimulated) {
    // When sensor LI-401 loses calibration, uncertainty jumps!
    wGasTube = 38;
    wLiquidSeal = 22;
    wCentering = 10;
    wSensorFalse = 30;
  } else if (input.v23ShareOfRejectsPct >= 90) {
    wGasTube = 56;
    wLiquidSeal = 30;
    wCentering = 10;
    wSensorFalse = 4;
  } else if (input.wearValve23Pct < 20) {
    wGasTube = 34;
    wLiquidSeal = 33;
    wCentering = 21;
    wSensorFalse = 12;
  }

  const weights = [wGasTube, wLiquidSeal, wCentering, wSensorFalse];
  const totalW = weights.reduce((a, b) => a + b, 0);

  const fmeaRanking: FmeaInferenceItem[] = fillerMaster.fmeaModes.map((m, idx) => ({
    id: m.id,
    cause: m.cause,
    probabilityPct: Math.round((weights[idx] / totalW) * 100),
    componentRef: m.componentRef,
    bomMaterialCode: m.bomMaterialCode,
    isoCode: m.isoCode
  }));

  const fmeaConfidenceNote = input.sensorDriftSimulated
    ? 'Alerta Capa 2: LI-401 presenta calibración vencida. La incertidumbre instrumental eleva el riesgo de falso rechazo al 30 %.'
    : `${input.v23ShareOfRejectsPct} % del rechazo proviene de una sola válvula (V23). Presión PT-201 y T° TT-202 estables: patrón local en tubo de retorno de gas.`;

  // Decision Evaluator over Horizon (4 h until scheduled CIP)
  const H = input.horizonHoursToCip;
  // Option A: Stop line right now (25 min stop on bottleneck + spare part cost)
  const lostBottlesStopNow = (25 / 60) * 400 * 60 * 0.92;
  const costOptionA = Math.round(lostBottlesStopNow * input.marginPerBottleCop + 310_000);

  // Option B: Electronic HMI Bypass of V23 (-2.5% max speed for 4 h, return setpoint to 0, swap tube during CIP)
  const bypassBottlesDeltaPerHour = 400 * 60 * 0.025 * 0.72;
  const costOptionB = Math.round(bypassBottlesDeltaPerHour * H * input.marginPerBottleCop + 310_000);

  // Option C: Keep running as-is (with +5 ml compensated setpoint or elevated V23 rejects + net-content legal risk)
  const simulatedSetpointForC = Math.max(input.averageOverfillMl, 5.0);
  const cOverfillPerHour = 20_500 * simulatedSetpointForC * input.liquidCostPerMlCop;
  const cRejectsPerHour =
    (Math.max(1.6, input.totalLineRejectPct) / 100) *
    21_600 *
    (input.variableCostPerBottleCop + input.marginPerBottleCop * 0.5);
  const legalRiskExpectedCop = 680_000; // Net content audit exposure
  const costOptionC = Math.round((cOverfillPerHour + cRejectsPerHour) * H + legalRiskExpectedCop);

  const optionsRaw: DecisionOptionEvaluation[] = [
    {
      id: 'A',
      title: 'A · Parar ahora y cambiar componente',
      subtitle: '25 min de paro en el cuello de botella + arranque',
      totalCostHorizonCop: costOptionA,
      isRecommended: false,
      tagLabel: 'Alto lucro cesante'
    },
    {
      id: 'B',
      title: 'B · Bypass de V23 en HMI y cambio en CIP',
      subtitle: '39/40 válvulas (-2,5 % cap.) · setpoint vuelve a nominal',
      totalCostHorizonCop: costOptionB,
      isRecommended: false,
      tagLabel: 'Mínimo costo total'
    },
    {
      id: 'C',
      title: 'C · Seguir así (setpoint compensado)',
      subtitle: 'Rechazo (margen + materiales) + sobrellenado + riesgo legal',
      totalCostHorizonCop: costOptionC,
      isRecommended: false,
      tagLabel: 'Pérdida continua'
    }
  ];

  const minOption = optionsRaw.reduce((best, o) =>
    o.totalCostHorizonCop < best.totalCostHorizonCop ? o : best
  );

  const options = optionsRaw.map((o) => ({
    ...o,
    isRecommended: o.id === minOption.id
  }));

  return {
    oeeGapPts,
    unproducedBottlesPerHour,
    overfillGiveawayCopPerHour,
    overfillLitersPerHour,
    monthlyProjectedLossCop,
    fmeaRanking,
    fmeaConfidenceNote,
    options,
    recommendedOption: minOption.id,
    sapSavingsVsStopNowCop: Math.max(0, costOptionA - costOptionB)
  };
}
