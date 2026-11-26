import { useEffect, useState } from 'react';
import { Check, Copy, Printer, X } from 'lucide-react';

interface GuideModalProps {
  kind: 'task-guide' | 'governance-pack';
  onClose: () => void;
}

const DECISION_BRIEF_TEMPLATE = `# Safety-Signal Exploration Brief (Non-Causal)

**Prepared by:** [Your Name]
**Dataset:** adverse_reaction_aggregates.csv (de-identified synthetic aggregate counts)
**Review Status:** Exploratory descriptive analysis — requires clinical pharmacovigilance review

## 1. Scope & Non-Causal Boundary
This summary examines spontaneous adverse-event reporting counts and serious-report proportions. Because spontaneous reporting lacks true prescription denominators and is subject to reporting biases, these findings identify reporting signals—not proof of causation.

## 2. Data Cleaning Summary
- Standardized drug names (trimmed whitespace and harmonized capitalization).
- Normalized severity labels into "Serious" and "Non-serious".
- Verified age group and outcome completeness across all reporting quarters.

## 3. Top Candidate Signals for Expert Review
| Drug | Reaction | Total Reports | Serious Reports | Serious Proportion | Review Note |
| :--- | :--- | ---: | ---: | ---: | :--- |
| Apixaban | Gastrointestinal hemorrhage | 94 | 91 | 96.8% | High serious share; review bleeding risk profile |
| Semaglutide | Nausea and vomiting | 326 | 34 | 10.4% | High volume, predominantly non-serious |

## 4. Limitations & Recommended Next Steps
- Missing exposure denominators prevent incidence-rate calculation.
- Recommend clinical pharmacist triage on high-serious-proportion pairs before any external communication.
`;

export function GuideModal({ kind, onClose }: GuideModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleCopyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(DECISION_BRIEF_TEMPLATE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const isTaskGuide = kind === 'task-guide';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2140]/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-[#D8E5F8] bg-white shadow-[0_24px_60px_-20px_rgba(15,33,64,0.28)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6EEF9] px-6 py-5">
          <div>
            <p className="text-xs font-medium text-[#5B4BB7]">
              {isTaskGuide ? 'Task 04 · Printable Guide' : 'Governance Reference · Guide'}
            </p>
            <h2 id="guide-modal-title" className="mt-1 text-lg font-bold text-[#0F2140]">
              {isTaskGuide ? 'Step-by-step task guide' : 'Healthcare analytics governance pack'}
            </h2>
          </div>

          <div className="no-print flex items-center gap-2 shrink-0">
            {!isTaskGuide && (
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE7F7] bg-white px-3 py-2 text-xs font-semibold text-[#1E3354] transition-colors hover:bg-[#F5F9FF] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#059669]" aria-hidden="true" />
                    <span>Template copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Copy brief template</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE7F7] bg-white px-3 py-2 text-xs font-semibold text-[#1E3354] transition-colors hover:bg-[#F5F9FF] cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close document"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[#5B6E8A] transition-colors hover:border-[#DCE7F7] hover:bg-[#F5F9FF] hover:text-[#0F2140] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-6 text-sm leading-relaxed text-[#334663]">
          {isTaskGuide ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-[#E1ECFC] bg-[#F4F8FF] p-4">
                <p>
                  <strong className="text-[#0F2140]">Objective: </strong>
                  Use cautious descriptive analysis and distinguish a reporting signal from proof of
                  causation.
                </p>
                <p className="mt-1.5">
                  <strong className="text-[#0F2140]">Deliverable: </strong>
                  Reproducible notebook and safety-signal exploration report shared via one public or
                  view-only link.
                </p>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#0F2140]">
                  1. Clean drug, reaction, severity, age group, and outcome fields
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[#435674]">
                  <li>
                    Trim leading/trailing spaces and apply consistent Title Case to{' '}
                    <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-xs text-[#0F2140]">
                      drug_name
                    </code>{' '}
                    (e.g., merging <code className="font-mono text-xs">&quot; atorvastatin &quot;</code>{' '}
                    with <code className="font-mono text-xs">&quot;Atorvastatin&quot;</code>).
                  </li>
                  <li>
                    Standardize{' '}
                    <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-xs text-[#0F2140]">
                      severity
                    </code>{' '}
                    values strictly to <strong>Serious</strong> and <strong>Non-serious</strong>.
                  </li>
                  <li>
                    Confirm that <code className="font-mono text-xs">serious_count &lt;= report_count</code>{' '}
                    and record all transformations in a brief cleaning log.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#0F2140]">
                  2. Calculate reporting frequency and serious-report proportions
                </h3>
                <p className="mt-1.5 text-[#435674]">
                  Group cleaned rows by{' '}
                  <code className="rounded bg-[#F1F5F9] px-1.5 py-0.5 font-mono text-xs text-[#0F2140]">
                    (drug_name, reaction_term)
                  </code>{' '}
                  and calculate:
                </p>
                <div className="mt-2.5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-3.5">
                    <div className="text-xs font-semibold text-[#0F2140]">Reporting frequency</div>
                    <p className="mt-1 font-mono text-xs text-[#1E40AF]">
                      total_reports = SUM(report_count)
                    </p>
                    <p className="mt-1 text-xs text-[#5B6E8A]">
                      Also report percentage share of all reports in the dataset.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-3.5">
                    <div className="text-xs font-semibold text-[#0F2140]">
                      Serious-report proportion
                    </div>
                    <p className="mt-1 font-mono text-xs text-[#1E40AF]">
                      serious_pct = SUM(serious_count) / SUM(report_count)
                    </p>
                    <p className="mt-1 text-xs text-[#5B6E8A]">
                      Highlights severity concentration—not clinical event risk.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#0F2140]">
                  3. Visualize high-frequency drug-event combinations
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[#435674]">
                  <li>
                    Build a clean horizontal bar chart or stacked severity chart showing the top
                    drug-reaction combinations.
                  </li>
                  <li>
                    Add a subtitle or footnote stating:{' '}
                    <em>
                      &ldquo;Spontaneous reporting counts indicate reporting patterns requiring
                      expert review, not confirmed causal risk.&rdquo;
                    </em>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#C6EFD7] bg-[#ECFDF3] p-4 text-[#14532D]">
                <div className="font-semibold text-[#0F3F22]">Passing submission example</div>
                <p className="mt-1 text-xs leading-relaxed">
                  A single public GitHub repository (or view-only Drive/Notion folder) containing:{' '}
                  <span className="font-mono">01_signal_exploration.ipynb</span>,{' '}
                  <span className="font-mono">safety_signal_report.pdf</span> (or{' '}
                  <span className="font-mono">README.md</span>), and exported chart images.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-[15px] font-bold text-[#0F2140]">
                  1. Safe-use boundaries (Signal vs. Causation)
                </h3>
                <p className="mt-1.5 text-[#435674]">
                  Spontaneous adverse-event reporting databases capture suspected reactions submitted
                  by clinicians, patients, and manufacturers. Analysts must never interpret a high
                  report count as proof that a medication caused a reaction.
                </p>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-3.5">
                    <div className="text-xs font-semibold text-[#0F2140]">Appropriate language</div>
                    <p className="mt-1 text-xs text-[#435674]">
                      &ldquo;Elevated reporting volume and serious-report proportion warrant
                      pharmacovigilance review.&rdquo;
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#FDE2E2] bg-[#FFF8F8] p-3.5">
                    <div className="text-xs font-semibold text-[#991B1B]">Avoid causal claims</div>
                    <p className="mt-1 text-xs text-[#7F1D1D]">
                      &ldquo;Drug X causes Reaction Y in 90% of patients.&rdquo; (Missing exposure
                      denominators and unverified causality.)
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#0F2140]">
                  2. De-identified data handling rules
                </h3>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[#435674]">
                  <li>
                    Work strictly with aggregated or properly de-identified records; never upload
                    patient identifiers, dates of birth, or clinical notes to public repositories.
                  </li>
                  <li>
                    Document confounding factors explicitly: stimulated media reporting, Weber
                    effect (higher reporting soon after launch), polypharmacy, and age-group
                    confounding.
                  </li>
                  <li>
                    Preserve auditability by keeping raw CSV files untouched and writing cleaning
                    transformations in reproducible code.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-[15px] font-bold text-[#0F2140]">
                  3. Decision-brief template
                </h3>
                <p className="mt-1 text-xs text-[#5B6E8A]">
                  Use this lightweight template for your safety-signal exploration report.
                </p>
                <pre className="mt-2.5 max-h-64 overflow-auto rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-4 font-mono text-xs leading-relaxed text-[#1E3354]">
                  {DECISION_BRIEF_TEMPLATE}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="no-print flex items-center justify-end border-t border-[#E6EEF9] bg-[#FAFBFD] px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#D4E2F7] bg-white px-4 py-2 text-sm font-semibold text-[#0F2140] transition-colors hover:bg-[#F3F8FF] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
