# SIMULADOR 3D · Línea de Embotellado PET 2 — Canal Ejecutivo

Simulador 3D interactivo de una planta industrial construido bajo la arquitectura real de un Gemelo Digital (**Datos Maestros Gobernados → Sensores con Precisión Conocida → Modelos de Riesgo/Costo → 3D PBR en Vivo**) y el sistema de identidad visual corporativa de **Canal Ejecutivo**.

## Características principales

- **4 Capas del Gemelo Digital:** Taxonomía ISO 14224 / Ubicaciones Técnicas SAP PM, 12 sensores IIoT con incertidumbre conocida (±σ), inferencia FMEA × Señales, cálculo de pérdida oculta por sobrellenado y comparador ejecutivo **«40 Excel Rotos vs. Gemelo»**.
- **Escena 3D PBR e Interactividad en Planta:** Iluminación industrial HDRI, botellas PET torneadas con llenado progresivo real en las 40 válvulas, modos *Operación / Corte / Despiece / Rayos X*, pesaje de botellas en vivo, resolución física de eventos HSE y emisión de Aviso SAP PM (`IW21`).
- **Reto Ejecutivo Jugable:** 3 misiones interactivas guiadas por **Zyro** con taxímetro financiero en tiempo real y multimoneda (`COP`, `USD`, `PEN`, `MXN`).

## Ejecución local

```bash
npm install
npm run dev
```

## Pruebas y compilación

```bash
npm run test -- --run
npm run build
```
