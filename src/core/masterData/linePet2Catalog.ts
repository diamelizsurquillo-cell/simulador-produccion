import {
  AssetMaster,
  BrokenExcelSilo,
  CurrencyCode,
  HseMasterDefinition,
  MaterialMaster
} from './types';

export const MATERIAL_MASTER: MaterialMaster = {
  sku: 'MAT-BEB-COLA-1500',
  name: 'Gaseosa Cola Carbonatada PET 1,5 L',
  nominalVolumeMl: 1500,
  legalMinCutoffMl: 1488, // -12 ml corte inspector HF
  brixTarget: 10.8,
  co2VolumesTarget: 3.8,
  defaultMarginPerBottleCop: 680,
  defaultLiquidCostPerMlCop: 0.9,
  defaultVariableCostPerBottleCop: 1650
};

export const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { code: CurrencyCode; symbol: string; rateFromCop: number; decimalsCompact: number; label: string }
> = {
  COP: { code: 'COP', symbol: 'COP ', rateFromCop: 1, decimalsCompact: 1, label: 'COP · Peso Colombiano' },
  USD: { code: 'USD', symbol: 'USD ', rateFromCop: 1 / 4000, decimalsCompact: 1, label: 'USD · Dólar EE. UU.' },
  PEN: { code: 'PEN', symbol: 'S/ ', rateFromCop: 3.75 / 4000, decimalsCompact: 1, label: 'PEN · Sol Peruano' },
  MXN: { code: 'MXN', symbol: 'MXN ', rateFromCop: 20 / 4000, decimalsCompact: 1, label: 'MXN · Peso Mexicano' }
};

export function formatMoney(amountCop: number, currency: CurrencyCode, compact = false): string {
  const cfg = CURRENCY_CONFIG[currency];
  const converted = amountCop * cfg.rateFromCop;
  const abs = Math.abs(converted);

  if (compact) {
    if (currency === 'COP' && abs >= 1_000_000) {
      return `${cfg.symbol}${(converted / 1_000_000).toLocaleString('es-419', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })} M`;
    }
    if (currency !== 'COP' && abs >= 1_000) {
      return `${cfg.symbol}${(converted / 1_000).toLocaleString('es-419', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })} k`;
    }
  }

  const maxFrac = currency === 'COP' ? 0 : abs < 100 ? 2 : 0;
  return `${cfg.symbol}${converted.toLocaleString('es-419', {
    minimumFractionDigits: maxFrac,
    maximumFractionDigits: maxFrac
  })}`;
}

export const ASSETS_CATALOG: AssetMaster[] = [
  {
    id: 'sopladora',
    orderIndex: '01',
    name: 'Sopladora rotativa PET',
    shortName: 'Sopladora',
    sapLocation: 'CO02-EMB-L2-SOP-001',
    equipmentClassIso: 'ISO-14224 · BLOW-MOLD-ROT',
    criticality: 'A',
    designSpeedBpm: 420,
    position3D: [-15.5, 0, -2.5],
    cameraFocus: {
      position: [-14.5, 5.2, 7.2],
      target: [-15.5, 2.0, -2.5]
    },
    bomParts: [
      {
        materialCode: 'REP-SOP-IR-302',
        description: 'Lámpara infrarroja halógena 2.5 kW horno zona 3',
        stockAvailable: 14,
        unitCostCop: 420_000,
        mttrMinutes: 18
      },
      {
        materialCode: 'REP-SOP-VAL-40',
        description: 'Válvula neumática de soplado alta presión 40 bar',
        stockAvailable: 4,
        unitCostCop: 1_850_000,
        mttrMinutes: 35
      }
    ],
    fmeaModes: [
      {
        id: 'sop-ir',
        cause: 'Deriva térmica en banco IR zona 3 (perfil de preforma)',
        basePrior: 0.58,
        componentRef: 'Horno IR Z3',
        bomMaterialCode: 'REP-SOP-IR-302',
        isoCode: 'OTH · Desviación térmica',
        technicalNote: 'Sobre 420 bpm el tiempo de residencia en horno cae bajo el umbral cristalino.'
      },
      {
        id: 'sop-pinza',
        cause: 'Desgaste en pinza de transferencia estrella salida',
        basePrior: 0.42,
        componentRef: 'Estrella transferencia',
        bomMaterialCode: 'REP-SOP-VAL-40',
        isoCode: 'WRE · Desgaste mecánico',
        technicalNote: 'Genera microatascos de preforma cuando el ritmo supera el nominal.'
      }
    ]
  },
  {
    id: 'llenadora',
    orderIndex: '02',
    name: 'Llenadora isobárica',
    shortName: 'Llenadora',
    sapLocation: 'CO02-EMB-L2-LLE-001',
    equipmentClassIso: 'ISO-14224 · FILL-ISOB-40V',
    criticality: 'A',
    designSpeedBpm: 400,
    isBottleneck: true,
    position3D: [-7.5, 0, -1.8],
    cameraFocus: {
      position: [-6.4, 4.3, 4.9],
      target: [-7.5, 2.2, -1.8]
    },
    bomParts: [
      {
        materialCode: 'REP-LLE-TRG-023',
        description: 'Tubo de retorno de gas AISI 316L calibrado (válvula isobárica)',
        stockAvailable: 6,
        unitCostCop: 310_000,
        mttrMinutes: 25
      },
      {
        materialCode: 'REP-LLE-EPD-019',
        description: 'Kit juntas obturador líquido y centrado EPDM grado alimenticio',
        stockAvailable: 22,
        unitCostCop: 95_000,
        mttrMinutes: 20
      }
    ],
    fmeaModes: [
      {
        id: 'v23-gas-tube',
        cause: 'Tubo de retorno de gas obstruido o deformado (válv. 23)',
        basePrior: 0.56,
        componentRef: 'Subactivo VALV-023',
        bomMaterialCode: 'REP-LLE-TRG-023',
        isoCode: 'PLU · Obstrucción / restricción',
        technicalNote:
          'En el llenado isobárico la altura de llenado la define el tubo de retorno de gas: cuando se obstruye, el gas no evacúa y el líquido se corta antes. Un desvío negativo concentrado en una válvula apunta ahí primero.'
      },
      {
        id: 'v23-liquid-seal',
        cause: 'Junta del obturador de líquido desgastada (válv. 23)',
        basePrior: 0.29,
        componentRef: 'Subactivo VALV-023',
        bomMaterialCode: 'REP-LLE-EPD-019',
        isoCode: 'WRE · Desgaste de sello',
        technicalNote: 'Produce goteo o cierre prematuro acompañado de mayor varianza σ.'
      },
      {
        id: 'v23-centering-seal',
        cause: 'Junta de centrado de botella · pérdida de contrapresión',
        basePrior: 0.11,
        componentRef: 'Tulipa centrado V23',
        bomMaterialCode: 'REP-LLE-EPD-019',
        isoCode: 'ELP · Fuga externa gas',
        technicalNote: 'Pérdida parcial de presurización CO₂ genera turbulencia y espuma.'
      },
      {
        id: 'hf-false-reject',
        cause: 'Inspector de nivel descalibrado (falso rechazo)',
        basePrior: 0.04,
        componentRef: 'Puente HF LI-401',
        bomMaterialCode: 'REP-LLE-TRG-023',
        isoCode: 'INR · Deriva instrumental',
        technicalNote: 'Descartado cuando el patrón de rechazo es periódico cada 40 botellas.'
      }
    ]
  },
  {
    id: 'roscadora',
    orderIndex: '03',
    name: 'Roscadora rotativa 12 cabezales',
    shortName: 'Roscadora',
    sapLocation: 'CO02-EMB-L2-ROS-001',
    equipmentClassIso: 'ISO-14224 · CAP-MAG-12H',
    criticality: 'A',
    designSpeedBpm: 430,
    position3D: [-4.2, 0, -1.2],
    cameraFocus: {
      position: [-3.5, 4.0, 5.2],
      target: [-4.2, 1.9, -1.2]
    },
    bomParts: [
      {
        materialCode: 'REP-ROS-MAG-12',
        description: 'Embrague magnético histéresis cabezal roscador 1.9 N·m',
        stockAvailable: 3,
        unitCostCop: 1_450_000,
        mttrMinutes: 22
      }
    ],
    fmeaModes: [
      {
        id: 'ros-torque',
        cause: 'Pérdida de par en cabezal magnético o falta de tapas en tolva',
        basePrior: 0.72,
        componentRef: 'Cabezal magnético',
        bomMaterialCode: 'REP-ROS-MAG-12',
        isoCode: 'TOR · Torque fuera de rango',
        technicalNote: 'Monitoreado continuamente por puente extensométrico TQ-301.'
      }
    ]
  },
  {
    id: 'inspector',
    orderIndex: '04',
    name: 'Inspector de nivel por alta frecuencia',
    shortName: 'Inspector de nivel',
    sapLocation: 'CO02-EMB-L2-INS-001',
    equipmentClassIso: 'ISO-14224 · INSP-HF-LVL',
    criticality: 'A',
    designSpeedBpm: 480,
    position3D: [-1.4, 0, -0.4],
    cameraFocus: {
      position: [-0.8, 3.3, 4.8],
      target: [-1.4, 1.5, -0.4]
    },
    bomParts: [
      {
        materialCode: 'REP-INS-HF-01',
        description: 'Transductor capacitivo HF + cilindro eyector neumático rápido',
        stockAvailable: 2,
        unitCostCop: 2_900_000,
        mttrMinutes: 15
      }
    ],
    fmeaModes: [
      {
        id: 'ins-upstream',
        cause: 'Rechazo legítimo por bajo nivel originado aguas arriba (Llenadora V23)',
        basePrior: 0.94,
        componentRef: 'Puente HF LI-401',
        bomMaterialCode: 'REP-INS-HF-01',
        isoCode: 'PRO · Desvío de proceso',
        technicalNote: 'Precisión metrológica verificada ±0,8 ml: el sensor actúa correctamente.'
      }
    ]
  },
  {
    id: 'etiquetadora',
    orderIndex: '05',
    name: 'Etiquetadora rotativa OPP hot-melt',
    shortName: 'Etiquetadora',
    sapLocation: 'CO02-EMB-L2-ETI-001',
    equipmentClassIso: 'ISO-14224 · LAB-ROT-OPP',
    criticality: 'B',
    designSpeedBpm: 440,
    position3D: [4.2, 0, 1.2],
    cameraFocus: {
      position: [5.0, 4.4, 7.5],
      target: [4.2, 1.8, 1.2]
    },
    bomParts: [
      {
        materialCode: 'REP-ETI-CUT-08',
        description: 'Juego cuchillas tambor de corte carburo de tungsteno',
        stockAvailable: 5,
        unitCostCop: 1_180_000,
        mttrMinutes: 30
      }
    ],
    fmeaModes: [
      {
        id: 'eti-blade',
        cause: 'Desgaste en cuchilla de tambor de corte / acumulación adhesivo',
        basePrior: 0.78,
        componentRef: 'Tambor de corte',
        bomMaterialCode: 'REP-ETI-CUT-08',
        isoCode: 'VIB · Vibración elevada VI-501',
        technicalNote: 'Incrementa microparadas por empalme y absorbe el pulmón acumulador.'
      }
    ]
  },
  {
    id: 'empacadora',
    orderIndex: '06',
    name: 'Empacadora termoencogible ×6',
    shortName: 'Empacadora',
    sapLocation: 'CO02-EMB-L2-EMP-001',
    equipmentClassIso: 'ISO-14224 · PCK-SHRINK-6X',
    criticality: 'B',
    designSpeedBpm: 460,
    position3D: [10.4, 0, 2.6],
    cameraFocus: {
      position: [11.2, 4.8, 9.2],
      target: [10.4, 1.7, 2.6]
    },
    bomParts: [
      {
        materialCode: 'REP-EMP-RES-18',
        description: 'Resistencia blindada túnel termoencogido 4.0 kW',
        stockAvailable: 8,
        unitCostCop: 390_000,
        mttrMinutes: 25
      }
    ],
    fmeaModes: [
      {
        id: 'emp-film',
        cause: 'Variación tensión film LDPE en barra de corte',
        basePrior: 0.65,
        componentRef: 'Túnel térmico',
        bomMaterialCode: 'REP-EMP-RES-18',
        isoCode: 'MEC · Ajuste tensión',
        technicalNote: 'Capacidad de sobremarcha +15% permite drenar pulmón tras microparadas.'
      }
    ]
  },
  {
    id: 'paletizador',
    orderIndex: '07',
    name: 'Celda robótica paletizadora',
    shortName: 'Paletizador',
    sapLocation: 'CO02-EMB-L2-PAL-001',
    equipmentClassIso: 'ISO-14224 · ROB-PAL-4AX',
    criticality: 'B',
    designSpeedBpm: 480,
    position3D: [16.8, 0, 4.0],
    cameraFocus: {
      position: [17.5, 6.2, 11.5],
      target: [16.8, 2.0, 4.0]
    },
    bomParts: [
      {
        materialCode: 'REP-PAL-STO-04',
        description: 'Barrera optoelectrónica seguridad Cat. 4 PLe IEC 61496',
        stockAvailable: 2,
        unitCostCop: 3_600_000,
        mttrMinutes: 15
      }
    ],
    fmeaModes: [
      {
        id: 'pal-sto',
        cause: 'Activación parada segura STO por intrusión en cortina de luz',
        basePrior: 0.85,
        componentRef: 'Perímetro seguridad Cat. 4',
        bomMaterialCode: 'REP-PAL-STO-04',
        isoCode: 'SAF · Interlock seguridad',
        technicalNote: 'Tiempo de respuesta < 20 ms para protección absoluta del operador.'
      }
    ]
  },
  {
    id: 'mixer',
    orderIndex: '08',
    name: 'Mixer - Carbonatador isobárico',
    shortName: 'Mixer - carbonatador',
    sapLocation: 'CO02-EMB-L2-MIX-001',
    equipmentClassIso: 'ISO-14224 · MIX-CARB-SKID',
    criticality: 'A',
    designSpeedBpm: 450,
    position3D: [-3.0, 0, -7.2],
    cameraFocus: {
      position: [-1.5, 6.5, 1.5],
      target: [-3.0, 3.0, -7.2]
    },
    bomParts: [
      {
        materialCode: 'REP-MIX-CO2-09',
        description: 'Sello válvula moduladora alimentación CO₂ grado alimenticio',
        stockAvailable: 4,
        unitCostCop: 780_000,
        mttrMinutes: 30
      }
    ],
    fmeaModes: [
      {
        id: 'mix-co2',
        cause: 'Fuga en brida de línea CO₂ hacia tanque de saturación',
        basePrior: 0.7,
        componentRef: 'Colector CO₂ AT-901',
        bomMaterialCode: 'REP-MIX-CO2-09',
        isoCode: 'ELP · Fuga gas proceso',
        technicalNote: 'Detectado inmediatamente por analizador ambiental infrarrojo AT-901.'
      }
    ]
  }
];

export const HSE_CATALOG: Record<string, HseMasterDefinition> = {
  intrusion: {
    id: 'intrusion',
    severity: 'critical',
    title: 'Intrusión en la celda del paletizador',
    locationLabel: 'Celda del robot paletizador · cortina de luz',
    sapLocation: 'CO02-EMB-L2-PAL-001',
    sensorTag: 'Cortina de luz categoría 4 · Tiempo reacción < 20 ms',
    probableCause:
      'Persona dentro del perímetro con el robot en ciclo: acceso para retirar un paquete caído o corregir una capa sin bloqueo previo.',
    effect:
      'El robot quedó en parada segura (STO). Es un evento de alto potencial (SIF): se reporta e investiga aunque nadie haya resultado herido.',
    recommendedActions: [
      'Confirmar que la persona salió y aplicar bloqueo y etiquetado (LOTO) antes de rearmar.',
      'Registrar el evento como casi-accidente de alto potencial en el sistema HSE.',
      'Atacar la causa raíz en la empacadora si hubo caída de paquetes.'
    ],
    cameraFocus: {
      position: [14.5, 6.0, 11.8],
      target: [16.8, 1.8, 4.0]
    }
  },
  co2_leak: {
    id: 'co2_leak',
    severity: 'critical',
    title: 'Fuga de CO₂ en la sala de llenado',
    locationLabel: 'Tanque de CO₂ y línea aérea al carbonatador',
    sapLocation: 'CO02-EMB-L2-CO2-001',
    sensorTag: 'AT-901 · 3.250 ppm (Alerta 2.500 / Límite 5.000 ppm)',
    probableCause:
      'Fuga en una unión o válvula de la línea de CO₂ hacia el carbonatador. El CO₂ es más pesado que el aire y se acumula en zonas bajas.',
    effect:
      'Riesgo de asfixia por desplazamiento de oxígeno para el personal y pérdida de gas que suma a la huella de carbono del turno.',
    recommendedActions: [
      'Activar extracción forzada y restringir de inmediato el acceso a la zona.',
      'Evacuar la nave si la lectura en AT-901 supera 5.000 ppm.',
      'Aislar la línea, detectar la fuga y reparar sello antes de reabrir.'
    ],
    cameraFocus: {
      position: [-8.5, 8.2, 4.5],
      target: [-3.5, 4.2, -6.5]
    }
  },
  floor_spill: {
    id: 'floor_spill',
    severity: 'warning',
    title: 'Derrame de producto en piso',
    locationLabel: 'Zona de la mesa de rechazo · tránsito de operadores',
    sapLocation: 'CO02-EMB-L2-INS-001',
    sensorTag: 'LI-401 / Conteo rechazos > 700 bot en mesa lateral',
    probableCause:
      'Botellas rechazadas que caen o revientan por saturación en la mesa de rechazo. Más rechazo en V23 significa más derrames.',
    effect:
      'Piso resbaloso por bebida azucarada: riesgo directo de caída a nivel para el operador y carga orgánica adicional al efluente.',
    recommendedActions: [
      'Señalizar perímetro y ejecutar limpieza húmeda inmediata.',
      'Revisar drenaje y guía contenedora de la mesa de rechazo.',
      'Eliminar el rechazo en la fuente (bypass de válvula 23) para evitar recurrencia.'
    ],
    cameraFocus: {
      position: [-0.2, 3.8, 5.4],
      target: [-1.4, 0.4, 0.8]
    }
  }
};

export const BROKEN_EXCELS_SILOS: BrokenExcelSilo[] = [
  {
    id: 'excel-oee',
    fileName: 'OEE_TurnoA_Abril_FINAL_v4_ok.xlsx',
    ownerArea: 'Jefatura de Producción',
    lastUpdated: 'Hace 6 horas (cierre manual de turno)',
    apparentMetric: 'OEE reportado: 82,1 % («cerca de meta»)',
    blindSpot: 'No registra que el operador subió el setpoint +5,0 ml en las 40 válvulas para bajar alarmas.',
    contradiction: 'Celebra estabilidad aparente mientras esconde decenas de litros regalados por hora.',
    sampleRows: [
      { col1: 'Línea PET 2', col2: 'OEE: 82,1%', col3: 'Obs: Ajuste normal' },
      { col1: 'Velocidad media', col2: '360 bpm', col3: 'Sin código SAP' }
    ]
  },
  {
    id: 'excel-calidad',
    fileName: 'Control_Pesos_Laboratorio_PCC2.xlsx',
    ownerArea: 'Aseguramiento de Calidad',
    lastUpdated: 'Muestreo manual cada 2 h (5 botellas)',
    apparentMetric: 'Promedio muestra: 1.504,6 ml («Cumple»)',
    blindSpot: 'Con 5 botellas al azar cada 2 h, la probabilidad de capturar la Válvula 23 es solo 12,5 %.',
    contradiction: 'El lote aprueba en papel mientras el inspector HF expulsa cientos de botellas de V23.',
    sampleRows: [
      { col1: '10:00 M1..M5', col2: 'Media 1504,8 ml', col3: 'Estado: APROBADO' },
      { col1: 'Boquilla origen', col2: 'N/D (no trazado)', col3: 'Sin vínculo PLC' }
    ]
  },
  {
    id: 'excel-mtto',
    fileName: 'Pendientes_Mecanicos_Semana16.xlsx',
    ownerArea: 'Mantenimiento Planta',
    lastUpdated: 'Viernes pasado',
    apparentMetric: '«Revisar llenadora en parada mensual»',
    blindSpot: 'Sin código de subactivo (VALV-023) ni FMEA cruzado con señales: cambian sellos al azar.',
    contradiction: 'Pide parar 4 horas toda la línea cuando un bypass HMI + cambio en CIP cuesta 4 veces menos.',
    sampleRows: [
      { col1: 'Equipo: Llenadora', col2: 'Falla: Desnivel', col3: 'Repuesto: Por definir' },
      { col1: 'UT SAP', col2: '(Vacío)', col3: 'Prioridad: Media' }
    ]
  },
  {
    id: 'excel-finanzas',
    fileName: 'Variacion_Merma_Jarabe_ERP.xlsx',
    ownerArea: 'Contraloría y Costos',
    lastUpdated: 'Cierre contable del mes anterior',
    apparentMetric: 'Merma inexplicada de jarabe: -3,4 %',
    blindSpot: 'Descubre el dinero perdido en sobrellenado 30 días tarde, sin saber qué turno ni válvula lo causó.',
    contradiction: 'Asume costo estándar de 1.500 ml/botella mientras la planta despacha 1.505 ml.',
    sampleRows: [
      { col1: 'Jarabe terminado', col2: 'Desvío: -14.200 L', col3: 'Causa: «Ajuste inv.»' },
      { col1: 'Impacto mes', col2: 'Pérdida oculta', col3: 'Detectado post-cierre' }
    ]
  }
];
