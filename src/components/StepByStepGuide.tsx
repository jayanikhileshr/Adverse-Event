import { Check, ChevronDown } from 'lucide-react';
import type { ChecklistStep } from '../types';

interface StepByStepGuideProps {
  expanded: boolean;
  onToggleExpanded: () => void;
  steps: ChecklistStep[];
  completedStepIds: string[];
  onToggleStep: (stepId: string) => void;
}

const GUIDE_BADGES = ['Beginner-friendly', '90–120 minutes', 'One proof link'];

export function StepByStepGuide({
  expanded,
  onToggleExpanded,
  steps,
  completedStepIds,
  onToggleStep,
}: StepByStepGuideProps) {
  const completedCount = completedStepIds.length;
  const totalCount = steps.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section aria-label="Step-by-step task guide" className="mt-5">
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls="step-by-step-guide-panel"
        className="group inline-flex items-center gap-1.5 rounded-lg py-1 pr-2 text-sm font-semibold text-[#2563EB] transition-colors duration-150 hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] cursor-pointer"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
            expanded ? 'rotate-0' : '-rotate-90'
          }`}
          aria-hidden="true"
        />
        <span>Open step-by-step guide</span>
      </button>

      <div
        id="step-by-step-guide-panel"
        className={`grid transition-[grid-template-rows,opacity,margin] duration-200 ease-out ${
          expanded ? 'mt-3 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-r-2xl rounded-l-md border border-[#E1ECFC] border-l-[3px] border-l-[#3B82F6] bg-[#F4F8FF] p-5 sm:p-6">
            {/* Objective & Deliverable */}
            <div className="space-y-2.5 text-[14.5px] leading-relaxed text-[#2C405E]">
              <p>
                <span className="font-semibold text-[#0F2140]">Objective: </span>
                Use cautious descriptive analysis and distinguish a reporting signal from proof of
                causation.
              </p>
              <p>
                <span className="font-semibold text-[#0F2140]">Deliverable: </span>
                Reproducible notebook and safety-signal exploration report.
              </p>
            </div>

            {/* Three rounded lavender badges */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {GUIDE_BADGES.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center rounded-full border border-[#DFD8FE] bg-[#F2EFFF] px-3 py-1 text-xs font-medium text-[#4C3B9E]"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Checklist Heading + Completion Progress */}
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-[15px] font-bold text-[#0F2140]">Do these steps to pass</h2>
                <span
                  className={`text-xs font-medium tabular-nums ${
                    completedCount === totalCount ? 'text-[#047857]' : 'text-[#526581]'
                  }`}
                >
                  {completedCount} of {totalCount} steps completed
                </span>
              </div>

              {/* Subtle slim progress bar */}
              <div
                className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#DCE8FA]"
                role="progressbar"
                aria-valuenow={completedCount}
                aria-valuemin={0}
                aria-valuemax={totalCount}
                aria-label="Checklist completion progress"
              >
                <div
                  className={`h-full rounded-full transition-[width,background-color] duration-200 ${
                    completedCount === totalCount ? 'bg-[#10B981]' : 'bg-[#2563EB]'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Numbered interactive checklist */}
              <ol className="mt-4 space-y-2.5">
                {steps.map((step) => {
                  const isCompleted = completedStepIds.includes(step.id);
                  return (
                    <li key={step.id}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isCompleted}
                        onClick={() => onToggleStep(step.id)}
                        className={`group flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] cursor-pointer ${
                          isCompleted
                            ? 'border-[#C6EBD7] bg-[#F7FDF9] hover:border-[#A7DFC0]'
                            : 'border-[#DCE7F7] bg-white/85 hover:border-[#B9D1F5] hover:bg-white'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-150 ${
                            isCompleted
                              ? 'bg-[#10B981] text-white'
                              : 'border border-[#CBD9F0] bg-[#EEF4FF] text-[#1E40AF] group-hover:border-[#93B4EB]'
                          }`}
                          aria-hidden="true"
                        >
                          {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[2.5]" /> : step.number}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-[14.5px] leading-snug font-medium transition-colors duration-150 ${
                              isCompleted
                                ? 'text-[#2D5944] line-through decoration-[#86CBA5]'
                                : 'text-[#142747]'
                            }`}
                          >
                            {step.label}
                          </span>
                          <span className="mt-1 block text-xs leading-relaxed text-[#5E718D]">
                            {step.hint}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Pale green submission instruction banner */}
            <div className="mt-5 rounded-xl border border-[#C6EFD7] bg-[#ECFDF3] px-4 py-3.5 text-[14px] leading-relaxed text-[#14532D]">
              <strong className="font-semibold text-[#0F3F22]">Submit:</strong> Submit one public or
              view-only link. Put supporting files in the same repository, folder, or project page
              so one link is enough.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
