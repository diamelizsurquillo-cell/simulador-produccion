import React from 'react';
import { ValveTelemetry } from '../../core/models/fillingPhysics';
import { SpeedCurvePoint, VCurveMachinePoint } from '../../core/models/lineDynamics';
import { CurrencyCode } from '../../core/masterData/types';
import { formatMoney } from '../../core/masterData/linePet2Catalog';

export function OeeGaugeRing({ oeePct, targetPct }: { oeePct: number; targetPct: number }) {
  const r = 23;
  const circ = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, oeePct));
  const offset = circ - (clamped / 100) * circ;
  const strokeColor =
    oeePct >= targetPct ? '#12B76A' : oeePct >= targetPct - 5 ? '#0866FF' : '#F79009';

  return (
    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
      <svg width="56" height="56" className="-rotate-90">
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke="var(--ce-border-strong)"
          strokeWidth="5"
        />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <span className="ce-mono absolute text-[13px] font-semibold text-[var(--ce-text-primary)]">
        {oeePct.toLocaleString('es-419', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
      </span>
    </div>
  );
}

export function SparklineCard({
  label,
  valueText,
  subLabel,
  series,
  alertState = 'normal'
}: {
  label: string;
  valueText: string;
  subLabel: string;
  series: number[];
  alertState?: 'normal' | 'warning' | 'critical';
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(0.2, max - min);
  const w = 96;
  const h = 22;

  const pts = series
    .map((v, idx) => {
      const x = (idx / Math.max(1, series.length - 1)) * w;
      const y = h - 3 - ((v - min) / span) * (h - 6);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const stroke =
    alertState === 'critical'
      ? '#F04438'
      : alertState === 'warning'
        ? '#F79009'
        : '#0866FF';

  const borderClass =
    alertState === 'critical'
      ? 'border-[#F04438]'
      : alertState === 'warning'
        ? 'border-[#F79009]'
        : 'border-[var(--ce-border-subtle)]';

  return (
    <div
      className={`p-2 rounded-[8px] bg-[var(--ce-bg-card-elevated)]/65 border ${borderClass} flex flex-col justify-between`}
    >
      <div className="text-[11px] text-[var(--ce-text-secondary)] truncate">{label}</div>
      <div className="ce-mono text-[17px] font-semibold text-[var(--ce-text-primary)] leading-tight mt-0.5">
        {valueText}
      </div>
      <div className="text-[10px] text-[var(--ce-text-muted)] mb-1">{subLabel}</div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={stroke} strokeWidth="1.75" points={pts} />
      </svg>
    </div>
  );
}

export function Radial40ValvesChart({
  valves,
  worstValve
}: {
  valves: ValveTelemetry[];
  worstValve: ValveTelemetry;
}) {
  const cx = 62;
  const cy = 62;
  const v23 = valves[22];
  const topValves = [...valves]
    .sort((a, b) => Math.abs(b.meanDeviationMl) - Math.abs(a.meanDeviationMl))
    .slice(0, 4);

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-[124px] h-[124px] shrink-0">
        <svg width="124" height="124" viewBox="0 0 124 124">
          {valves.map((v, i) => {
            const angle = (i / 40) * Math.PI * 2 - Math.PI / 2;
            const innerR = v.valveNumber === 23 && v.status === 'critical' ? 28 : 35;
            const outerR = 56;
            const x1 = cx + Math.cos(angle) * innerR;
            const y1 = cy + Math.sin(angle) * innerR;
            const x2 = cx + Math.cos(angle) * outerR;
            const y2 = cy + Math.sin(angle) * outerR;

            const color =
              v.status === 'bypass'
                ? '#F79009'
                : v.status === 'critical'
                  ? '#F04438'
                  : v.status === 'warning'
                    ? '#F79009'
                    : '#1FD3F0';

            return (
              <line
                key={v.valveNumber}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={color}
                strokeWidth={v.valveNumber === 23 ? 5.2 : 3.6}
              />
            );
          })}
          <circle cx={cx} cy={cy} r="28" fill="var(--ce-bg-section)" stroke="var(--ce-border-strong)" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[9px] text-[var(--ce-text-muted)] leading-none">
            {v23.status === 'bypass' ? 'En bypass' : 'Peor válvula'}
          </span>
          <span className="ce-mono text-[14px] font-bold text-[var(--ce-text-primary)] mt-0.5">
            {v23.status === 'bypass' ? 'V23' : worstValve.label}
          </span>
          <span
            className={`ce-mono text-[10px] ${
              v23.status === 'bypass' ? 'text-[#F79009]' : 'text-[#F04438]'
            }`}
          >
            {v23.status === 'bypass'
              ? '39/40 act.'
              : `${worstValve.meanDeviationMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml`}
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="ce-table-head text-[10px] text-[var(--ce-text-muted)] flex justify-between pb-1 border-b border-[var(--ce-border-subtle)]">
          <span>Válvula</span>
          <span>Desvío</span>
          <span>Rechazo</span>
        </div>
        <div className="divide-y divide-[var(--ce-border-subtle)]">
          {topValves.map((v) => {
            const isCrit = v.status === 'critical';
            const isByp = v.status === 'bypass';
            return (
              <div key={v.valveNumber} className="ce-mono text-[11.5px] py-1 flex justify-between items-center">
                <span className="font-semibold text-[var(--ce-text-primary)]">{v.label}</span>
                <span
                  className={
                    isByp
                      ? 'text-[#F79009]'
                      : isCrit
                        ? 'text-[#F04438] font-semibold'
                        : 'text-[var(--ce-text-secondary)]'
                  }
                >
                  {isByp
                    ? 'BYPASS'
                    : `${v.meanDeviationMl > 0 ? '+' : ''}${v.meanDeviationMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml`}
                </span>
                <span className={isCrit ? 'text-[#F04438] font-semibold' : 'text-[var(--ce-text-secondary)]'}>
                  {v.rejectPct.toLocaleString('es-419', { minimumFractionDigits: 1 })} %
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function VCurveChart({ points }: { points: VCurveMachinePoint[] }) {
  const w = 340;
  const h = 92;
  const padX = 24;
  const minY = 75;
  const maxY = 132;

  const mapPt = (idx: number, val: number) => {
    const x = padX + (idx / (points.length - 1)) * (w - padX * 2);
    const clamped = Math.max(minY, Math.min(maxY, val));
    const y = h - 22 - ((clamped - minY) / (maxY - minY)) * (h - 34);
    return { x, y };
  };

  const designPoly = points
    .map((p, idx) => {
      const { x, y } = mapPt(idx, p.designPctOfFiller);
      return `${x},${y}`;
    })
    .join(' ');

  const effPoly = points
    .map((p, idx) => {
      const { x, y } = mapPt(idx, p.effectivePctOfFiller);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div>
      <div className="flex items-center gap-4 text-[10.5px] text-[var(--ce-text-secondary)] mb-1">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-0.5 bg-[#94A3B8]" /> Diseño (nominal)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2.5 h-0.5 bg-[#0866FF]" /> Real · cap. efectiva 60 min
        </span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Horizontal grid lines only (§5.5) */}
        {[85, 100, 115].map((gv) => {
          const { y } = mapPt(0, gv);
          return (
            <line
              key={gv}
              x1={padX}
              y1={y}
              x2={w - padX}
              y2={y}
              stroke="var(--ce-grid-line)"
              strokeDasharray={gv === 100 ? '3 3' : undefined}
              strokeWidth="1"
            />
          );
        })}

        <polyline fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" points={designPoly} />
        <polyline fill="none" stroke="#0866FF" strokeWidth="2.2" points={effPoly} />

        {points.map((p, idx) => {
          const dPt = mapPt(idx, p.designPctOfFiller);
          const ePt = mapPt(idx, p.effectivePctOfFiller);
          return (
            <g key={p.machineShort}>
              <circle cx={dPt.x} cy={dPt.y} r="2.5" fill="#94A3B8" />
              <circle
                cx={ePt.x}
                cy={ePt.y}
                r="3.2"
                fill={p.machineShort === 'Llenadora' ? '#63EDFF' : '#0866FF'}
              />
              <text
                x={ePt.x}
                y={ePt.y - 6}
                textAnchor="middle"
                fill="var(--ce-text-secondary)"
                fontSize="8.5"
                className="ce-mono"
              >
                {p.effectivePctOfFiller}%
              </text>
              <text
                x={ePt.x}
                y={h - 5}
                textAnchor="middle"
                fill="var(--ce-text-muted)"
                fontSize="9"
              >
                {p.machineShort}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SpeedVsMarginChart({
  curve,
  currentSpeedBpm,
  optimalPoint,
  currency
}: {
  curve: SpeedCurvePoint[];
  currentSpeedBpm: number;
  optimalPoint: SpeedCurvePoint;
  currency: CurrencyCode;
}) {
  const w = 348;
  const h = 128;
  const padL = 16;
  const padR = 16;
  const minS = 280;
  const maxS = 460;

  const margins = curve.map((c) => c.netMarginCopPerHour);
  const minM = Math.min(...margins) * 0.92;
  const maxM = Math.max(...margins) * 1.06;

  const bottles = curve.map((c) => c.goodBottlesPerHour);
  const minB = Math.min(...bottles) * 0.92;
  const maxB = Math.max(...bottles) * 1.06;

  const xOf = (s: number) => padL + ((s - minS) / (maxS - minS)) * (w - padL - padR);
  const yMargin = (m: number) => h - 24 - ((m - minM) / Math.max(1, maxM - minM)) * (h - 42);
  const yBottles = (b: number) => h - 24 - ((b - minB) / Math.max(1, maxB - minB)) * (h - 42);

  const marginPts = curve.map((c) => `${xOf(c.speedBpm).toFixed(1)},${yMargin(c.netMarginCopPerHour).toFixed(1)}`).join(' ');
  const bottlePts = curve.map((c) => `${xOf(c.speedBpm).toFixed(1)},${yBottles(c.goodBottlesPerHour).toFixed(1)}`).join(' ');

  const optX = xOf(optimalPoint.speedBpm);
  const optY = yMargin(optimalPoint.netMarginCopPerHour);
  const curX = xOf(Math.max(minS, Math.min(maxS, currentSpeedBpm)));
  const blowerX = xOf(422);

  return (
    <div>
      <div className="flex items-center justify-between text-[10.5px] text-[var(--ce-text-secondary)] mb-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-[#0866FF]" /> Margen neto / h
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-0.5 bg-[#94A3B8]" /> Botellas buenas / h
          </span>
        </div>
        <span className="ce-mono text-[#12B76A]">
          Óptimo: {optimalPoint.speedBpm} bpm ({formatMoney(optimalPoint.netMarginCopPerHour, currency, true)}/h)
        </span>
      </div>

      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`}>
        {[0.25, 0.55, 0.85].map((f, i) => (
          <line
            key={i}
            x1={padL}
            y1={h - 24 - f * (h - 42)}
            x2={w - padR}
            y2={h - 24 - f * (h - 42)}
            stroke="var(--ce-grid-line)"
          />
        ))}

        {/* Blower physical ceiling at 422 bpm */}
        <line
          x1={blowerX}
          y1={14}
          x2={blowerX}
          y2={h - 22}
          stroke="#F04438"
          strokeDasharray="3 3"
          strokeWidth="1.2"
        />
        <text x={blowerX + 3} y={22} fill="#F04438" fontSize="8.5" className="ce-mono">
          límite sopladora
        </text>

        {/* Current Speed Marker */}
        <line x1={curX} y1={16} x2={curX} y2={h - 22} stroke="#F1F5F9" strokeOpacity="0.45" strokeWidth="1.2" />

        {/* Curves */}
        <polyline fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 3" points={bottlePts} />
        <polyline fill="none" stroke="#0866FF" strokeWidth="2.5" points={marginPts} />

        {/* Economic Optimum Marker */}
        <circle cx={optX} cy={optY} r="4.5" fill="#12B76A" stroke="#050D1F" strokeWidth="1.5" />
        <text x={optX - 4} y={optY - 7} textAnchor="end" fill="#12B76A" fontSize="9" className="ce-mono font-semibold">
          óptimo {optimalPoint.speedBpm}
        </text>

        {[280, 320, 360, 404, 440].map((tick) => (
          <text
            key={tick}
            x={xOf(tick)}
            y={h - 7}
            textAnchor="middle"
            fill={Math.abs(currentSpeedBpm - tick) <= 6 ? '#63EDFF' : 'var(--ce-text-muted)'}
            fontSize="9.5"
            className="ce-mono"
          >
            {tick}
          </text>
        ))}
      </svg>
    </div>
  );
}
