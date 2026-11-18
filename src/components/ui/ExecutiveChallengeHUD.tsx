import { Award, CheckCircle2, ChevronDown, ChevronUp, Circle, Target, Trophy, X } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { formatMoney } from '../../core/masterData/linePet2Catalog';

export function ExecutiveChallengeHUD() {
  const challengeMinimized = useSimulationStore((s) => s.challengeMinimized);
  const setChallengeMinimized = useSimulationStore((s) => s.setChallengeMinimized);
  const missionsCompleted = useSimulationStore((s) => s.missionsCompleted);
  const challengeScorecardOpen = useSimulationStore((s) => s.challengeScorecardOpen);
  const setChallengeScorecardOpen = useSimulationStore((s) => s.setChallengeScorecardOpen);

  const setViewMode = useSimulationStore((s) => s.setViewMode);
  const sampleBottleIn3D = useSimulationStore((s) => s.sampleBottleIn3D);
  const selectMachine = useSimulationStore((s) => s.selectMachine);
  const setSapModalOpen = useSimulationStore((s) => s.setSapModalOpen);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const currency = useSimulationStore((s) => s.currency);
  const businessImpact = useSimulationStore((s) => s.businessImpact);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  const completedCount = missionsCompleted.filter(Boolean).length;

  const missions = [
    {
      idx: 0,
      done: missionsCompleted[0],
      title: '1. Caza la válvula dañada en 3D',
      hint: 'Toca la Llenadora y activa Rayos X para aislar la V23.',
      quickActionLabel: 'Ir a Rayos X',
      onQuickAction: () => setViewMode('rayos_x')
    },
    {
      idx: 1,
      done: missionsCompleted[1],
      title: '2. Descubre el costo oculto',
      hint: 'Pesa una botella en la mesa o prueba el +5 ml de sobrellenado.',
      quickActionLabel: 'Pesar botella',
      onQuickAction: () => sampleBottleIn3D()
    },
    {
      idx: 2,
      done: missionsCompleted[2],
      title: '3. Ejecuta el Bypass y orden SAP',
      hint: 'Haz Bypass a la V23 en 3D y emite el Aviso SAP PM para el CIP.',
      quickActionLabel: valve23Bypassed ? 'Emitir SAP' : 'Ir a Llenadora',
      onQuickAction: () => (valve23Bypassed ? setSapModalOpen(true) : selectMachine('llenadora', true))
    }
  ];

  return (
    <>
      {/* Compact Interactive Challenge Card */}
      <div className="pointer-events-auto w-[310px] ce-chamfer-sm bg-[var(--ce-bg-card)] backdrop-blur-md border border-[#0866FF]/55 shadow-xl overflow-hidden">
        <div className="w-full h-[3px] bg-[var(--ce-border-subtle)]">
          <div
            className="h-full ce-signal-bar transition-all duration-300"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>

        <button
          onClick={() => setChallengeMinimized(!challengeMinimized)}
          className="w-full px-3 py-2 flex items-center justify-between gap-2 text-left cursor-pointer hover:bg-[var(--ce-bg-card-elevated)]/40 transition"
        >
          <div className="flex items-center gap-2">
            <img
              src="/brand/zyro-pose-01-pulgar-arriba.png"
              alt=""
              className="w-6 h-7 object-contain shrink-0"
            />
            <div>
              <div className="ce-overline text-[9.5px] text-[#63EDFF]">
                RETO INTERACTIVO · {completedCount}/3
              </div>
              <div className="ce-heading text-[13px] text-[var(--ce-text-primary)] leading-tight">
                Resuelve la fuga en vivo
              </div>
            </div>
          </div>
          {challengeMinimized ? (
            <ChevronDown className="w-4 h-4 text-[var(--ce-text-muted)]" />
          ) : (
            <ChevronUp className="w-4 h-4 text-[var(--ce-text-muted)]" />
          )}
        </button>

        {!challengeMinimized && (
          <div className="px-3 pb-3 pt-1 space-y-2 border-t border-[var(--ce-border-subtle)]">
            {missions.map((m) => (
              <div
                key={m.idx}
                className={`p-2 rounded-[6px] border transition ${
                  m.done
                    ? 'bg-[#12B76A]/10 border-[#12B76A]/40'
                    : 'bg-[var(--ce-bg-card-elevated)]/65 border-[var(--ce-border-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[12px] font-semibold flex items-center gap-1.5 ${
                      m.done ? 'text-[#12B76A] line-through opacity-85' : 'text-[var(--ce-text-primary)]'
                    }`}
                  >
                    {m.done ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#12B76A] shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-[#0866FF] shrink-0" />
                    )}
                    {m.title}
                  </span>
                  {!m.done && (
                    <button
                      onClick={m.onQuickAction}
                      className="ce-mono text-[10px] px-2 py-0.5 rounded bg-[#0866FF] hover:bg-[#4D8EFF] text-white font-semibold shrink-0 cursor-pointer"
                    >
                      {m.quickActionLabel}
                    </button>
                  )}
                </div>
                {!m.done && (
                  <p className="text-[11px] text-[var(--ce-text-secondary)] mt-1 pl-5 leading-snug">
                    {m.hint}
                  </p>
                )}
              </div>
            ))}

            {completedCount === 3 && (
              <button
                onClick={() => setChallengeScorecardOpen(true)}
                className="w-full py-1.5 px-3 rounded-[6px] bg-[#12B76A] hover:bg-[#10B981] text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Ver Scorecard de Impacto</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Executive Scorecard Victory Modal */}
      {challengeScorecardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050D1F]/80 backdrop-blur-sm pointer-events-auto"
          onClick={() => setChallengeScorecardOpen(false)}
        >
          <div
            className="w-full max-w-[540px] ce-chamfer-md bg-[#0B1630] text-[#F1F5F9] border border-[#0866FF] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-[4px] ce-signal-bar" />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[10px] bg-[#050D1F] border border-[#12213F] flex items-end justify-center overflow-hidden shrink-0">
                    <img
                      src="/brand/zyro-pose-01-pulgar-arriba.png"
                      alt=""
                      className="w-11 h-auto object-contain"
                    />
                  </div>
                  <div>
                    <div className="ce-overline text-[#63EDFF]">
                      RETO COMPLETADO · CANAL EJECUTIVO
                    </div>
                    <h2 className="ce-display text-[22px] text-white mt-0.5">
                      El dato decidió antes del desastre
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setChallengeScorecardOpen(false)}
                  className="text-[#94A3B8] hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-[8px] bg-[#050D1F] border border-[#F04438]/40">
                  <div className="ce-overline text-[9.5px] text-[#F04438]">
                    OPERANDO CON 40 EXCEL
                  </div>
                  <div className="ce-mono text-[18px] font-bold text-[#FCA5A5] mt-1">
                    -{formatMoney(businessImpact.options[0].totalCostHorizonCop, currency, true)}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-snug">
                    Sobrellenado invisible o paro de emergencia de 25 min cambiando sellos a ciegas.
                  </p>
                </div>

                <div className="p-3.5 rounded-[8px] bg-[#12B76A]/12 border border-[#12B76A]">
                  <div className="ce-overline text-[9.5px] text-[#12B76A]">
                    TU DECISIÓN CON SIMULADOR 3D
                  </div>
                  <div className="ce-mono text-[18px] font-bold text-[#12B76A] mt-1">
                    Ahorro {formatMoney(businessImpact.sapSavingsVsStopNowCop, currency, true)}
                  </div>
                  <p className="text-[11px] text-[#B6C2D4] mt-1 leading-snug">
                    Válvula 23 en Bypass HMI, cero sobrellenado y repuesto REP-LLE-TRG-023 listo para el CIP.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-[#12213F]">
                <button
                  onClick={() => {
                    setChallengeScorecardOpen(false);
                    resetSimulation();
                  }}
                  className="px-3.5 py-2 rounded-[8px] bg-[#12213F] hover:bg-[#1E3158] text-[#B6C2D4] text-[12.5px] font-semibold cursor-pointer"
                >
                  Reiniciar reto
                </button>
                <button
                  onClick={() => setChallengeScorecardOpen(false)}
                  className="px-4 py-2 rounded-[8px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[13px] font-semibold cursor-pointer"
                >
                  Seguir operando libremente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
