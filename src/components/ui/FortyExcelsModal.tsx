import { ArrowRight, CheckCircle2, FileSpreadsheet, Layers, X } from 'lucide-react';
import { BROKEN_EXCELS_SILOS } from '../../core/masterData/linePet2Catalog';
import { useSimulationStore } from '../../store/simulationStore';

export function FortyExcelsModal() {
  const open = useSimulationStore((s) => s.fortyExcelsModalOpen);
  const setOpen = useSimulationStore((s) => s.setFortyExcelsModalOpen);
  const startGuidedCase = useSimulationStore((s) => s.startGuidedCase);

  if (!open) return null;

  const realLayers = [
    {
      num: '01',
      title: 'Datos maestros gobernados',
      desc: 'Activos ISO 14224, materiales, BOM de repuestos y ubicaciones técnicas SAP PM unificados. Una sola fuente de verdad.'
    },
    {
      num: '02',
      title: 'Sensores confiables con precisión conocida',
      desc: '12 tags IIoT con incertidumbre metrológica documentada (±0,8 ml HF, ±0,02 bar). Sabes cuándo habla el proceso y cuándo deriva el sensor.'
    },
    {
      num: '03',
      title: 'Modelos que traducen señal en riesgo y costo',
      desc: 'Cruce FMEA × Señales y cuantificación en vivo del dinero perdido en sobrellenado, rechazos y cuello de botella.'
    },
    {
      num: '04',
      title: 'Solo al final, el 3D vivo',
      desc: 'No es una maqueta estática: es la operación pensando en tiempo real para anticipar decisiones. El render convence. El dato decide.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050D1F]/78 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-[960px] max-h-[90vh] overflow-y-auto rounded-[12px] bg-[#0B1630] text-[#F1F5F9] border border-[#1E3158] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Hero Banner with Official Node Pattern (§5.3) */}
        <div className="ce-node-pattern relative p-6 border-b border-[#12213F] bg-[#050D1F]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/brand/ce-logo-horizontal-blanco.png"
                alt="Canal Ejecutivo"
                className="h-7 w-auto object-contain"
              />
              <span className="w-[3px] h-6 bg-[#0866FF]" />
              <span className="ce-overline text-[#63EDFF]">ARQUITECTURA DE GEMELO DIGITAL</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-[8px] text-[#94A3B8] hover:text-white hover:bg-[#12213F] cursor-pointer"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="ce-display text-[26px] sm:text-[30px] text-white mt-4 max-w-[760px]">
            Tu planta ya tiene un gemelo digital.{' '}
            <span className="text-[#63EDFF]">Solo que vive roto en 40 Excel.</span>
          </h2>
          <p className="text-[14px] text-[#B6C2D4] mt-2 max-w-[720px] leading-relaxed">
            Un gemelo 3D no es una maqueta: es la operación pensando en vivo. Detecta la válvula que falla antes que el operador y cuantifica cuánto dinero se fuga en sobrellenado.
          </p>
        </div>

        {/* Two-Column Executive Comparison */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: The 40 Broken Excels */}
          <div>
            <div className="ce-overline text-[#F04438] flex items-center gap-1.5 mb-3">
              <FileSpreadsheet className="w-4 h-4" /> ASÍ OPERAN LOS SILOS HOY (40 EXCEL ROTOS)
            </div>
            <div className="space-y-3">
              {BROKEN_EXCELS_SILOS.map((silo) => (
                <div
                  key={silo.id}
                  className="p-3.5 rounded-[8px] bg-[#050D1F]/80 border border-[#F04438]/30"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="ce-mono text-[11.5px] font-semibold text-[#FCA5A5] truncate">
                      {silo.fileName}
                    </span>
                    <span className="text-[10.5px] text-[#8FA0BD] shrink-0">{silo.ownerArea}</span>
                  </div>
                  <div className="text-[12px] font-semibold text-white mt-1.5">
                    {silo.apparentMetric}
                  </div>
                  <p className="text-[11.5px] text-[#B6C2D4] mt-1 leading-snug">
                    <strong className="text-[#F79009]">Punto ciego:</strong> {silo.blindSpot}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-1 ce-mono text-[10px] bg-[#0B1630] p-1.5 rounded border border-[#12213F] text-[#94A3B8]">
                    <span>{silo.sampleRows[0].col1}</span>
                    <span>{silo.sampleRows[0].col2}</span>
                    <span className="text-[#F79009]">{silo.sampleRows[0].col3}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Real 4-Layer Order */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="ce-overline text-[#63EDFF] flex items-center gap-1.5 mb-3">
                <Layers className="w-4 h-4" /> SU ORDEN REAL EN 4 CAPAS (CANAL EJECUTIVO)
              </div>
              <div className="space-y-3">
                {realLayers.map((layer) => (
                  <div
                    key={layer.num}
                    className="p-3.5 rounded-[8px] bg-[#12213F]/65 border-l-[4px] border-l-[#0866FF] border border-[#1E3158]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="ce-mono text-[12px] font-bold px-2 py-0.5 rounded bg-[#0866FF] text-white">
                        CAPA {layer.num}
                      </span>
                      <h3 className="ce-heading text-[15px] text-white">{layer.title}</h3>
                    </div>
                    <p className="text-[12px] text-[#B6C2D4] mt-1.5 leading-relaxed">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 p-4 ce-chamfer-sm bg-[#050D1F] border border-[#0866FF]/60 flex items-center justify-between gap-4">
              <div>
                <div className="ce-heading text-[15px] text-white">
                  «El render convence. El dato decide.»
                </div>
                <div className="text-[12px] text-[#8FA0BD] mt-0.5">
                  Recorre el caso real de la Válvula 23 paso a paso en vivo.
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  startGuidedCase();
                }}
                className="px-4 py-2.5 rounded-[8px] bg-[#0866FF] hover:bg-[#4D8EFF] text-white text-[13px] font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Iniciar caso en vivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
