import { MachineId, ViewMode3D } from './masterData/types';

export type RightDrawerTab = 'diagnostico' | 'control' | 'maestros' | 'iot' | 'insights';

export interface GuidedStepConfig {
  stepNumber: number;
  overline: string;
  title: string;
  body: string;
  zyroTip: string;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
  };
  viewMode: ViewMode3D;
  rightTab: RightDrawerTab;
  selectedMachine: MachineId | null;
  showIotTags?: boolean;
  presetState?: {
    wearValve23Pct?: number;
    operatorCompensatesSetpoint?: boolean;
    manualSetpointMl?: number;
    valve23Bypassed?: boolean;
    targetSpeedBpm?: number;
  };
}

export const GUIDED_CASE_STEPS: GuidedStepConfig[] = [
  {
    stepNumber: 1,
    overline: 'CASO GUIADO · 1/8 · DIAGNÓSTICO DE BASE',
    title: 'Tu gemelo ya existe: vive roto en 40 Excel',
    body: 'En una planta típica, Producción mira OEE en una hoja, Calidad anota 5 pesos manuales cada 2 horas y Finanzas descubre la merma de jarabe a fin de mes. Un gemelo digital une operación, riesgo y dinero en tiempo real.',
    zyroTip: 'Haz clic en «40 Excel vs. Gemelo» arriba cuando quieras comparar los silos desconectados frente a las 4 capas.',
    camera: {
      position: [-2.5, 11.5, 17.5],
      target: [0.5, 1.8, 0.0]
    },
    viewMode: 'operacion',
    rightTab: 'diagnostico',
    selectedMachine: null,
    showIotTags: false,
    presetState: {
      wearValve23Pct: 68,
      operatorCompensatesSetpoint: false,
      manualSetpointMl: 0,
      valve23Bypassed: false,
      targetSpeedBpm: 365
    }
  },
  {
    stepNumber: 2,
    overline: 'CASO GUIADO · 2/8 · CAPAS 1 Y 2',
    title: 'Datos maestros gobernados y sensores confiables',
    body: 'Antes del 3D van los cimientos: 8 ubicaciones técnicas bajo norma ISO 14224 / SAP PM y 12 sensores IIoT con incertidumbre conocida (como ±0,8 ml en el inspector HF). Sin precisión conocida, cualquier modelo miente.',
    zyroTip: 'Observa las etiquetas flotantes sobre la línea: cada tag reporta lectura viva y estado metrológico.',
    camera: {
      position: [-5.5, 8.2, 12.8],
      target: [-4.0, 2.0, -1.0]
    },
    viewMode: 'operacion',
    rightTab: 'iot',
    selectedMachine: null,
    showIotTags: true
  },
  {
    stepNumber: 3,
    overline: 'CASO GUIADO · 3/8 · DETECCIÓN TEMPRANA',
    title: 'Aparece la señal en el inspector de nivel',
    body: 'El puente de alta frecuencia (LI-401) empieza a expulsar botellas por bajo nivel por encima del límite de 0,8 %. Las botellas se acumulan en la mesa lateral. En piso, el operador solo percibe rechazo creciente.',
    zyroTip: 'Mira cómo el cilindro neumático desvía las botellas defectuosas hacia la mesa de rechazo frente al operador.',
    camera: {
      position: [-0.9, 3.3, 4.9],
      target: [-2.2, 1.5, -0.6]
    },
    viewMode: 'operacion',
    rightTab: 'diagnostico',
    selectedMachine: 'inspector',
    showIotTags: false,
    presetState: {
      wearValve23Pct: 82,
      operatorCompensatesSetpoint: false,
      manualSetpointMl: 0,
      valve23Bypassed: false
    }
  },
  {
    stepNumber: 4,
    overline: 'CASO GUIADO · 4/8 · CAPA 3 + RAYOS X',
    title: 'Rayos X y FMEA: aislando la válvula 23',
    body: 'En el llenado isobárico, el tubo de retorno de gas fija el corte de líquido. Al cruzar el patrón periódico (más del 95 % del rechazo sale de 1 de las 40 boquillas) con el FMEA maestro, el modelo apunta directo al tubo de la Válvula 23 (56 %).',
    zyroTip: 'En modo Rayos X ves las 40 válvulas internas en vivo: la V23 resalta en rojo crítico dentro del carrusel.',
    camera: {
      position: [-5.6, 3.9, 2.3],
      target: [-7.5, 2.1, -1.8]
    },
    viewMode: 'rayos_x',
    rightTab: 'diagnostico',
    selectedMachine: 'llenadora',
    showIotTags: false,
    presetState: {
      wearValve23Pct: 85,
      operatorCompensatesSetpoint: false
    }
  },
  {
    stepNumber: 5,
    overline: 'CASO GUIADO · 5/8 · FUGA FINANCIERA SILENCIOSA',
    title: 'El costo que el OEE tradicional no ve',
    body: 'Para contener el rechazo sin parar, se sube el setpoint +5,0 ml en todo el carrusel. El OEE apenas cambia, pero ahora las 39 válvulas buenas regalan producto en el 100 % de las botellas despachadas: dinero directo que ningún Excel de OEE alerta.',
    zyroTip: 'Revisa en el panel derecho la tarjeta «Producto regalado / h (sobrellenado)» y su proyección mensual.',
    camera: {
      position: [-4.8, 4.3, 5.8],
      target: [-6.8, 2.0, -1.5]
    },
    viewMode: 'corte',
    rightTab: 'diagnostico',
    selectedMachine: 'llenadora',
    presetState: {
      wearValve23Pct: 85,
      operatorCompensatesSetpoint: true,
      valve23Bypassed: false
    }
  },
  {
    stepNumber: 6,
    overline: 'CASO GUIADO · 6/8 · PRESCRIPCIÓN ECONÓMICA',
    title: 'Decisión e impacto a 4 h del próximo CIP',
    body: 'El modelo evalúa 3 decisiones: A) parar ahora 25 min en el cuello de botella; B) activar Bypass electrónico en V23 desde el HMI (39/40 válvulas) y volver el setpoint a nominal hasta el CIP; C) seguir regalando bebida. La opción B minimiza el costo total.',
    zyroTip: 'Haz clic sobre la Opción B en el panel derecho o presiona Siguiente para ver el efecto inmediato en planta.',
    camera: {
      position: [-5.2, 4.5, 5.4],
      target: [-7.5, 2.3, -1.8]
    },
    viewMode: 'despiece',
    rightTab: 'diagnostico',
    selectedMachine: 'llenadora'
  },
  {
    stepNumber: 7,
    overline: 'CASO GUIADO · 7/8 · EJECUCIÓN TRAZABLE',
    title: 'Bypass activo y Aviso SAP PM gobernado',
    body: 'Con V23 en bypass desaparece el sobrellenado y el rechazo cae al mínimo sin detener la línea. El dato cierra el ciclo generando un Aviso M2 en SAP PM con ubicación técnica CO02-EMB-L2-LLE-001 y repuesto BOM reservado para el CIP.',
    zyroTip: 'Pulsa «Crear aviso SAP PM» en el tablero derecho para inspeccionar la orden técnica lista para mantenimiento.',
    camera: {
      position: [-5.4, 4.2, 5.2],
      target: [-7.5, 2.1, -1.8]
    },
    viewMode: 'operacion',
    rightTab: 'diagnostico',
    selectedMachine: 'llenadora',
    presetState: {
      valve23Bypassed: true,
      operatorCompensatesSetpoint: false,
      manualSetpointMl: 0
    }
  },
  {
    stepNumber: 8,
    overline: 'CASO GUIADO · 8/8 · OPTIMIZACIÓN Y SEGURIDAD HSE',
    title: '¿Y si cambiamos el ritmo? El render convence, el dato decide',
    body: 'En la pestaña Control verás que el óptimo económico está en 404 bpm: forzar a 440 bpm da más velocidad bruta pero destruye margen neto por espumado y límite de sopladora. Prueba mover los controles o inyectar eventos HSE en vivo.',
    zyroTip: '¡Has completado el recorrido! Ahora tienes el mando total en la consola del simulador.',
    camera: {
      position: [1.5, 13.5, 20.5],
      target: [1.0, 1.5, 0.5]
    },
    viewMode: 'operacion',
    rightTab: 'control',
    selectedMachine: null,
    showIotTags: true,
    presetState: {
      valve23Bypassed: true,
      targetSpeedBpm: 404
    }
  }
];
