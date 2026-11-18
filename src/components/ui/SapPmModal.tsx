import { CheckCircle2, FileCheck2, Wrench, X } from 'lucide-react';
import { formatMoney } from '../../core/masterData/linePet2Catalog';
import { formatShiftClock, useSimulationStore } from '../../store/simulationStore';

export function SapPmModal() {
  const open = useSimulationStore((s) => s.sapModalOpen);
  const setOpen = useSimulationStore((s) => s.setSapModalOpen);
  const sapNotificationCreated = useSimulationStore((s) => s.sapNotificationCreated);
  const sapNotificationNumber = useSimulationStore((s) => s.sapNotificationNumber);
  const confirmSapNotification = useSimulationStore((s) => s.confirmSapNotification);
  const applyDecisionOption = useSimulationStore((s) => s.applyDecisionOption);
  const valve23Bypassed = useSimulationStore((s) => s.valve23Bypassed);
  const currency = useSimulationStore((s) => s.currency);
  const businessImpact = useSimulationStore((s) => s.businessImpact);
  const fillerResult = useSimulationStore((s) => s.fillerResult);
  const simSecondsElapsed = useSimulationStore((s) => s.simSecondsElapsed);

  if (!open) return null;

  const { clock } = formatShiftClock(simSecondsElapsed);
  const v23 = fillerResult.valves[22];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050D1F]/78 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[560px] rounded-[12px] bg-[#0B1630] text-[#F1F5F9] border border-[#1E3158] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-[4px] ce-signal-bar" />
        <div className="p-5 border-b border-[#12213F] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#0866FF]/20 border border-[#0866FF] flex items-center justify-center text-[#63EDFF]">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <div className="ce-overline text-[#63EDFF]">INTEGRACIÓN ERP · TRANSACCIÓN IW21</div>
              <h2 className="ce-heading text-[17px] text-white">
                Aviso de Avería SAP PM (Clase M2)
              </h2>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-[8px] text-[#94A3B8] hover:text-white cursor-pointer"
            aria-label="Cerrar modal SAP PM"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-3 text-[12.5px]">
          <div className="grid grid-cols-2 gap-2.5 p-3 rounded-[8px] bg-[#050D1F] border border-[#12213F]">
            <div>
              <span className="text-[10.5px] text-[#8FA0BD] block">N° Aviso SAP</span>
              <span className="ce-mono font-semibold text-[#63EDFF]">#{sapNotificationNumber}</span>
            </div>
            <div>
              <span className="text-[10.5px] text-[#8FA0BD] block">Hora de emisión</span>
              <span className="ce-mono font-semibold">Turno A · {clock}</span>
            </div>
            <div>
              <span className="text-[10.5px] text-[#8FA0BD] block">Ubicación Técnica</span>
              <span className="ce-mono font-semibold">CO02-EMB-L2-LLE-001</span>
            </div>
            <div>
              <span className="text-[10.5px] text-[#8FA0BD] block">Subconjunto / Posición</span>
              <span className="ce-mono font-semibold text-[#F79009]">VALV-023 (Boquilla 23/40)</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between py-1 border-b border-[#12213F]">
              <span className="text-[#8FA0BD]">Modo de falla ISO 14224</span>
              <span className="ce-mono">PLU · Tubo retorno de gas obstruido (56 %)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#12213F]">
              <span className="text-[#8FA0BD]">Evidencia metrológica</span>
              <span className="ce-mono">
                Desvío {v23.meanDeviationMl.toLocaleString('es-419', { minimumFractionDigits: 1 })} ml · Sensor LI-401 (±0,8 ml)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#12213F]">
              <span className="text-[#8FA0BD]">Repuesto BOM reservado</span>
              <span className="ce-mono text-[#63EDFF]">REP-LLE-TRG-023 (Stock: 6 u)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#12213F]">
              <span className="text-[#8FA0BD]">Ventana de ejecución</span>
              <span className="font-semibold text-[#12B76A]">
                Próximo CIP programado (Horizonte +4,0 h · MTTR 25 min)
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8FA0BD]">Ahorro documentado vs. paro inmediato</span>
              <span className="ce-mono font-bold text-[#12B76A]">
                {formatMoney(businessImpact.sapSavingsVsStopNowCop, currency)}
              </span>
            </div>
          </div>

          {sapNotificationCreated ? (
            <div className="p-3 rounded-[8px] bg-[#12B76A]/15 border border-[#12B76A] text-[#12B76A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                ✓ Aviso #{sapNotificationNumber} liberado en SAP PM y válvula 23 asegurada en Bypass HMI.
              </span>
            </div>
          ) : (
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-[8px] text-[13px] font-semibold text-[#B6C2D4] hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!valve23Bypassed) applyDecisionOption('B');
                  confirmSapNotification();
                }}
                className="px-4 py-2 rounded-[8px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[13px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Aplicar Bypass B + Liberar Aviso SAP</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
