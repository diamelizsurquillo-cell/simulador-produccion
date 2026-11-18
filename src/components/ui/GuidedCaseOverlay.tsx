import { ChevronLeft, ChevronRight, FileCheck2, Sparkles, X } from 'lucide-react';
import { GUIDED_CASE_STEPS } from '../../core/guidedCaseSteps';
import { useSimulationStore } from '../../store/simulationStore';

export function GuidedCaseOverlay() {
  const guidedActive = useSimulationStore((s) => s.guidedActive);
  const guidedStepIndex = useSimulationStore((s) => s.guidedStepIndex);
  const setGuidedStep = useSimulationStore((s) => s.setGuidedStep);
  const closeGuidedCase = useSimulationStore((s) => s.closeGuidedCase);
  const showZyroMentor = useSimulationStore((s) => s.showZyroMentor);
  const toggleZyroMentor = useSimulationStore((s) => s.toggleZyroMentor);
  const setSapModalOpen = useSimulationStore((s) => s.setSapModalOpen);

  if (!guidedActive) return null;

  const step = GUIDED_CASE_STEPS[guidedStepIndex];
  const progressPct = ((guidedStepIndex + 1) / GUIDED_CASE_STEPS.length) * 100;
  const isLast = guidedStepIndex === GUIDED_CASE_STEPS.length - 1;
  const isSapStep = step.stepNumber === 7;

  return (
    <div className="pointer-events-auto w-full max-w-[560px] ce-chamfer-md bg-[var(--ce-bg-card)] backdrop-blur-md border border-[#0866FF]/65 shadow-2xl overflow-hidden">
      {/* Official 4px Signal Progress Bar (§5.2 & §8.1: #0866FF -> #63EDFF) */}
      <div className="w-full h-[4px] bg-[var(--ce-border-subtle)]">
        <div
          className="h-full ce-signal-bar transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="p-4 flex gap-3.5 items-start">
        {/* Zyro Official Mentor Avatar in Onboarding/Tutorial Context (§6.4 Brand Manual) */}
        {showZyroMentor && (
          <div className="hidden sm:flex flex-col items-center shrink-0 w-[68px] pt-0.5">
            <div className="w-[62px] h-[68px] rounded-[8px] bg-[#050D1F] border border-[#12213F] flex items-end justify-center overflow-hidden">
              <img
                src="/brand/zyro-pose-01-pulgar-arriba.png"
                alt=""
                className="w-[58px] h-auto object-contain select-none"
              />
            </div>
            <span className="ce-overline text-[9px] text-[#63EDFF] mt-1">ZYRO · GUÍA</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="ce-overline text-[#63EDFF]">{step.overline}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleZyroMentor}
                className="text-[10.5px] text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)] cursor-pointer hidden sm:inline"
                title="Mostrar u ocultar asistente de recorrido Zyro"
              >
                {showZyroMentor ? 'Ocultar guía' : 'Mostrar Zyro'}
              </button>
              <button
                onClick={closeGuidedCase}
                className="text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)] cursor-pointer"
                aria-label="Cerrar caso guiado"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="ce-heading text-[16.5px] text-[var(--ce-text-primary)] mt-1">
            {step.title}
          </h3>

          <p className="text-[12.5px] text-[var(--ce-text-secondary)] leading-relaxed mt-1.5">
            {step.body}
          </p>

          <div className="mt-2 flex items-start gap-1.5 text-[11.5px] text-[#8AB3FF]">
            <Sparkles className="w-3.5 h-3.5 text-[#63EDFF] shrink-0 mt-0.5" />
            <span>{step.zyroTip}</span>
          </div>

          {/* Step Indicators & Primary Navigation */}
          <div className="mt-3.5 pt-2.5 border-t border-[var(--ce-border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {GUIDED_CASE_STEPS.map((s, idx) => (
                <button
                  key={s.stepNumber}
                  onClick={() => setGuidedStep(idx)}
                  aria-label={`Ir al paso ${s.stepNumber}`}
                  className={`h-1.5 transition-all cursor-pointer ${
                    idx === guidedStepIndex
                      ? 'w-5 bg-[#0866FF]'
                      : idx < guidedStepIndex
                        ? 'w-2.5 bg-[#63EDFF]/70'
                        : 'w-2.5 bg-[var(--ce-border-strong)]'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={closeGuidedCase}
                className="px-2.5 py-1 rounded-[8px] text-[12px] font-semibold text-[var(--ce-text-muted)] hover:text-[var(--ce-text-primary)] cursor-pointer"
              >
                Salir
              </button>

              <button
                onClick={() => setGuidedStep(guidedStepIndex - 1)}
                disabled={guidedStepIndex === 0}
                className="px-2.5 py-1 rounded-[8px] text-[12px] font-semibold bg-[var(--ce-bg-card-elevated)] text-[var(--ce-text-primary)] border border-[var(--ce-border-strong)] disabled:opacity-40 flex items-center gap-0.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              {isSapStep && (
                <button
                  onClick={() => setSapModalOpen(true)}
                  className="px-2.5 py-1 rounded-[8px] text-[12px] font-semibold bg-[var(--ce-bg-card-elevated)] text-[#63EDFF] border border-[#63EDFF]/50 flex items-center gap-1 cursor-pointer"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Ver aviso</span>
                </button>
              )}

              <button
                onClick={() => (isLast ? closeGuidedCase() : setGuidedStep(guidedStepIndex + 1))}
                className="px-3.5 py-1 rounded-[8px] text-[12px] font-semibold bg-[#0866FF] hover:bg-[var(--ce-brand-hover)] text-white flex items-center gap-0.5 cursor-pointer"
              >
                <span>{isLast ? 'Explorar libre' : 'Siguiente'}</span>
                {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
