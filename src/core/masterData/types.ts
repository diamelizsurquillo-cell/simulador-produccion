export type AssetStatus = 'normal' | 'warning' | 'critical';

export type MachineId =
  | 'sopladora'
  | 'llenadora'
  | 'roscadora'
  | 'inspector'
  | 'etiquetadora'
  | 'empacadora'
  | 'paletizador'
  | 'mixer';

export type ViewMode3D = 'operacion' | 'corte' | 'despiece' | 'rayos_x';

export type CurrencyCode = 'COP' | 'USD' | 'PEN' | 'MXN';

export type HseEventId = 'intrusion' | 'co2_leak' | 'floor_spill';

export interface BomSparePart {
  materialCode: string;
  description: string;
  stockAvailable: number;
  unitCostCop: number;
  mttrMinutes: number;
}

export interface FmeaFailureMode {
  id: string;
  cause: string;
  basePrior: number;
  componentRef: string;
  bomMaterialCode: string;
  isoCode: string;
  technicalNote: string;
}

export interface AssetMaster {
  id: MachineId;
  orderIndex: string;
  name: string;
  shortName: string;
  sapLocation: string; // Ubicación Técnica SAP PM
  equipmentClassIso: string; // ISO 14224
  criticality: 'A' | 'B' | 'C';
  designSpeedBpm: number;
  isBottleneck?: boolean;
  position3D: [number, number, number];
  cameraFocus: {
    position: [number, number, number];
    target: [number, number, number];
  };
  bomParts: BomSparePart[];
  fmeaModes: FmeaFailureMode[];
}

export interface MaterialMaster {
  sku: string;
  name: string;
  nominalVolumeMl: number;
  legalMinCutoffMl: number; // Umbral de rechazo en inspector HF
  brixTarget: number;
  co2VolumesTarget: number;
  defaultMarginPerBottleCop: number;
  defaultLiquidCostPerMlCop: number;
  defaultVariableCostPerBottleCop: number;
}

export interface HseMasterDefinition {
  id: HseEventId;
  severity: 'critical' | 'warning';
  title: string;
  locationLabel: string;
  sapLocation: string;
  sensorTag: string;
  probableCause: string;
  effect: string;
  recommendedActions: string[];
  cameraFocus: {
    position: [number, number, number];
    target: [number, number, number];
  };
}

export interface BrokenExcelSilo {
  id: string;
  fileName: string;
  ownerArea: string;
  lastUpdated: string;
  apparentMetric: string;
  blindSpot: string;
  contradiction: string;
  sampleRows: { col1: string; col2: string; col3: string }[];
}
