import { AssetStatus, MachineId } from '../masterData/types';

export interface SensorDefinition {
  tag: string;
  name: string;
  machineId: MachineId;
  sapEquipment: string;
  unit: string;
  knownPrecision: string;
  sigmaNumeric: number;
  samplingHz: number;
  calibrationStatus: 'vigente' | 'deriva_leve' | 'vencida';
  reliabilityPct: number;
  position3D: [number, number, number];
  normalRange: [number, number];
}

export interface LiveSensorReading extends SensorDefinition {
  value: number;
  formattedValue: string;
  status: AssetStatus;
  driftOffset: number;
}

export const SENSORS_REGISTRY: SensorDefinition[] = [
  {
    tag: 'TT-101',
    name: 'Temperatura horno IR zona 3',
    machineId: 'sopladora',
    sapEquipment: 'EQ-10048101',
    unit: '°C',
    knownPrecision: '±0,4 °C',
    sigmaNumeric: 0.4,
    samplingHz: 10,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.4,
    position3D: [-15.5, 3.1, -2.5],
    normalRange: [104, 114]
  },
  {
    tag: 'PT-201',
    name: 'Presión isobárica anillo llenadora',
    machineId: 'llenadora',
    sapEquipment: 'EQ-10048201',
    unit: 'bar',
    knownPrecision: '±0,02 bar',
    sigmaNumeric: 0.02,
    samplingHz: 50,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.8,
    position3D: [-7.5, 4.3, -1.8],
    normalRange: [4.05, 4.35]
  },
  {
    tag: 'TT-202',
    name: 'Temperatura bebida en carrusel',
    machineId: 'llenadora',
    sapEquipment: 'EQ-10048202',
    unit: '°C',
    knownPrecision: '±0,10 °C',
    sigmaNumeric: 0.1,
    samplingHz: 20,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.6,
    position3D: [-6.4, 3.2, -2.4],
    normalRange: [3.8, 5.2]
  },
  {
    tag: 'NO-203',
    name: 'Nivel acústico accionamiento principal',
    machineId: 'llenadora',
    sapEquipment: 'EQ-10048203',
    unit: 'dB(A)',
    knownPrecision: '±0,5 dB',
    sigmaNumeric: 0.5,
    samplingHz: 100,
    calibrationStatus: 'vigente',
    reliabilityPct: 98.9,
    position3D: [-8.6, 2.2, -0.9],
    normalRange: [80, 87]
  },
  {
    tag: 'CT-204',
    name: 'Contador acumulado turno llenadora',
    machineId: 'llenadora',
    sapEquipment: 'EQ-10048204',
    unit: 'bot',
    knownPrecision: 'Exacto (±0)',
    sigmaNumeric: 0,
    samplingHz: 200,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.9,
    position3D: [-5.7, 1.9, -1.3],
    normalRange: [0, 999999]
  },
  {
    tag: 'TQ-301',
    name: 'Torque medio cabezales roscadora',
    machineId: 'roscadora',
    sapEquipment: 'EQ-10048301',
    unit: 'N·m',
    knownPrecision: '±0,04 N·m',
    sigmaNumeric: 0.04,
    samplingHz: 100,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.3,
    position3D: [-4.2, 2.9, -1.2],
    normalRange: [1.75, 2.08]
  },
  {
    tag: 'LI-401',
    name: 'Inspector alta frecuencia nivel neto',
    machineId: 'inspector',
    sapEquipment: 'EQ-10048401',
    unit: '% rech.',
    knownPrecision: '±0,8 ml (HF)',
    sigmaNumeric: 0.8,
    samplingHz: 500,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.7,
    position3D: [-1.4, 2.7, -0.4],
    normalRange: [0, 0.8]
  },
  {
    tag: 'VI-501',
    name: 'Vibración RMS tambor etiquetadora',
    machineId: 'etiquetadora',
    sapEquipment: 'EQ-10048501',
    unit: 'mm/s',
    knownPrecision: '±0,08 mm/s',
    sigmaNumeric: 0.08,
    samplingHz: 1000,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.1,
    position3D: [4.2, 2.8, 1.2],
    normalRange: [0.8, 3.2]
  },
  {
    tag: 'CT-601',
    name: 'Flujo salida paquetes ×6 termoencogido',
    machineId: 'empacadora',
    sapEquipment: 'EQ-10048601',
    unit: 'paq/min',
    knownPrecision: '±0,2 paq/m',
    sigmaNumeric: 0.2,
    samplingHz: 20,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.5,
    position3D: [10.4, 2.7, 2.6],
    normalRange: [45, 80]
  },
  {
    tag: 'WT-701',
    name: 'Peso acumulado cama en paletizador',
    machineId: 'paletizador',
    sapEquipment: 'EQ-10048701',
    unit: 'kg',
    knownPrecision: '±0,5 kg',
    sigmaNumeric: 0.5,
    samplingHz: 10,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.2,
    position3D: [16.8, 1.6, 4.0],
    normalRange: [50, 950]
  },
  {
    tag: 'FT-801',
    name: 'Caudal másico bebida carbonatada',
    machineId: 'mixer',
    sapEquipment: 'EQ-10048801',
    unit: 'L/min',
    knownPrecision: '±0,15 %',
    sigmaNumeric: 0.8,
    samplingHz: 50,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.7,
    position3D: [-3.8, 4.1, -7.2],
    normalRange: [420, 720]
  },
  {
    tag: 'AT-901',
    name: 'Concentración CO₂ ambiente sala',
    machineId: 'mixer',
    sapEquipment: 'EQ-10048901',
    unit: 'ppm',
    knownPrecision: '±25 ppm',
    sigmaNumeric: 25,
    samplingHz: 5,
    calibrationStatus: 'vigente',
    reliabilityPct: 99.5,
    position3D: [-1.1, 2.4, -5.4],
    normalRange: [400, 1200]
  }
];

export interface TelemetryInputContext {
  effectiveSpeedBpm: number;
  rejectRatePct: number;
  wearValve23Pct: number;
  wearLabelerPct: number;
  totalBottlesShift: number;
  activeHseCo2Leak: boolean;
  activeHseIntrusion: boolean;
  sensorDriftSimulated: boolean;
  simTimeSec: number;
}

export function computeLiveSensorReadings(ctx: TelemetryInputContext): LiveSensorReading[] {
  const wave = (phase: number) => Math.sin(ctx.simTimeSec * 0.7 + phase);

  return SENSORS_REGISTRY.map((sensor, idx) => {
    const jitter = wave(idx * 1.37) * sensor.sigmaNumeric * 0.45;
    let value = 0;
    let status: AssetStatus = 'normal';
    let calibrationStatus = sensor.calibrationStatus;
    let reliabilityPct = sensor.reliabilityPct;
    let driftOffset = 0;

    switch (sensor.tag) {
      case 'TT-101': {
        const speedLoad = Math.max(0, ctx.effectiveSpeedBpm - 405) * 0.35;
        value = 108.8 + speedLoad + jitter;
        if (value > 113.5) status = 'warning';
        break;
      }
      case 'PT-201': {
        value = 4.2 + wave(2.1) * 0.018;
        break;
      }
      case 'TT-202': {
        value = 4.5 + wave(3.4) * 0.07;
        break;
      }
      case 'NO-203': {
        value = 83.6 + (ctx.effectiveSpeedBpm / 400) * 1.4 + ctx.wearValve23Pct * 0.012 + jitter;
        break;
      }
      case 'CT-204': {
        value = Math.round(ctx.totalBottlesShift);
        break;
      }
      case 'TQ-301': {
        value = 1.91 + wave(4.2) * 0.025;
        break;
      }
      case 'LI-401': {
        if (ctx.sensorDriftSimulated) {
          calibrationStatus = 'vencida';
          reliabilityPct = 74.2;
          driftOffset = 0.65;
        }
        value = Math.max(0, ctx.rejectRatePct + driftOffset);
        if (value >= 1.5) status = 'critical';
        else if (value >= 0.8) status = 'warning';
        break;
      }
      case 'VI-501': {
        value = 1.65 + (ctx.wearLabelerPct / 100) * 3.1 + jitter;
        if (value > 3.8) status = 'critical';
        else if (value > 2.9) status = 'warning';
        break;
      }
      case 'CT-601': {
        value = ctx.activeHseIntrusion ? 0 : Math.max(0, ctx.effectiveSpeedBpm / 6 + wave(1.1) * 0.4);
        break;
      }
      case 'WT-701': {
        const cycleProgress = ((ctx.totalBottlesShift % 480) / 480) * 720 + 65;
        value = Math.round(cycleProgress);
        break;
      }
      case 'FT-801': {
        value = (ctx.effectiveSpeedBpm * 1.5) + wave(0.9) * 1.5;
        break;
      }
      case 'AT-901': {
        value = ctx.activeHseCo2Leak
          ? Math.round(3250 + Math.sin(ctx.simTimeSec * 1.2) * 90)
          : Math.round(485 + wave(5.1) * 18);
        if (value >= 2500) status = 'critical';
        break;
      }
    }

    const formattedValue =
      sensor.tag === 'CT-204' || sensor.tag === 'WT-701' || sensor.tag === 'AT-901'
        ? `${Math.round(value).toLocaleString('es-419')} ${sensor.unit}`
        : `${value.toLocaleString('es-419', {
            minimumFractionDigits: sensor.tag === 'PT-201' || sensor.tag === 'TQ-301' || sensor.tag === 'LI-401' || sensor.tag === 'VI-501' ? 2 : 1,
            maximumFractionDigits: sensor.tag === 'PT-201' || sensor.tag === 'TQ-301' || sensor.tag === 'LI-401' || sensor.tag === 'VI-501' ? 2 : 1
          })} ${sensor.unit}`;

    return {
      ...sensor,
      calibrationStatus,
      reliabilityPct,
      driftOffset,
      value,
      formattedValue,
      status
    };
  });
}
