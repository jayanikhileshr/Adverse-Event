import { useMemo } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ADVERSE_EVENT_CSV,
  aggregateDrugEventPairs,
  parseAdverseEventCsv,
} from '../data/syntheticDataset';

interface PortfolioUpgradeProps {
  expanded: boolean;
  onToggleExpanded: () => void;
}

const REPO_TREE = `adverse-event-signal-exploration/
├── README.md
├── data/
│   └── adverse_reaction_aggregates.csv
├── notebooks/
│   └── 01_signal_exploration.ipynb
├── reports/
│   └── safety_signal_exploration_report.md
└── figures/
    └── top_drug_event_combinations.png`;

export function PortfolioUpgrade({ expanded, onToggleExpanded }: PortfolioUpgradeProps) {
  const sampleChartData = useMemo(() => {
    const parsed = parseAdverseEventCsv(ADVERSE_EVENT_CSV, true);
    return aggregateDrugEventPairs(parsed.rows)
      .slice(0, 5)
      .map((item) => ({
        label: `${item.drugName} (${item.reactionTerm.split(' ')[0]})`,
        fullPair: item.pairLabel,
        nonSerious: item.totalReports - item.seriousReports,
        serious: item.seriousReports,
        seriousPct: Number(item.seriousProportion.toFixed(1)),
      }));
  }, []);

  return (
    <section
      aria-label="Optional portfolio upgrade"
      className="mt-4 rounded-2xl border border-[#DCE7F7] bg-white transition-colors duration-150"
    >
      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        aria-controls="portfolio-upgrade-panel"
        className="flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-[14.5px] font-semibold text-[#1E3354] transition-colors duration-150 hover:bg-[#F8FBFF] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2563EB] cursor-pointer"
      >
        <span className="inline-flex items-center gap-2">
          <ChevronRight
            className={`h-4 w-4 shrink-0 text-[#526581] transition-transform duration-200 ${
              expanded ? 'rotate-90 text-[#2563EB]' : ''
            }`}
            aria-hidden="true"
          />
          <span>Optional portfolio upgrade</span>
        </span>
        <span className="text-xs font-normal text-[#6B7D99]">Optional</span>
      </button>

      <div
        id="portfolio-upgrade-panel"
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-[#EAF1FB] px-5 pb-5 pt-4 text-sm text-[#435674]">
            <p className="leading-relaxed text-[#526581]">
              Already finished the required steps? Package your work into a concise, hiring-ready
              healthcare analytics repository that demonstrates methodological rigor and safe-use
              judgment.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Suggested GitHub Repository Structure */}
              <div className="rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-4">
                <h3 className="text-xs font-semibold tracking-wide text-[#0F2140]">
                  Suggested GitHub repository structure
                </h3>
                <pre className="mt-2.5 overflow-x-auto rounded-lg border border-[#E6EDF7] bg-white p-3 font-mono text-xs leading-relaxed text-[#1E3354]">
                  {REPO_TREE}
                </pre>
              </div>

              {/* Deliverables Checklist */}
              <div className="space-y-3 rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-4">
                <h3 className="text-xs font-semibold tracking-wide text-[#0F2140]">
                  Portfolio-ready components
                </h3>
                <ul className="space-y-2.5 text-[13px] leading-relaxed text-[#3F5370]">
                  <li>
                    <span className="font-semibold text-[#0F2140]">Reproducible notebook: </span>
                    Run cleanly top-to-bottom with explicit field cleaning assertions and pinned
                    package versions.
                  </li>
                  <li>
                    <span className="font-semibold text-[#0F2140]">Professional README: </span>
                    Summarize clinical context, dataset provenance, non-causal limitations, and
                    quick-run steps.
                  </li>
                  <li>
                    <span className="font-semibold text-[#0F2140]">
                      Short safety-signal exploration report:{' '}
                    </span>
                    1–2 page summary prioritizing top drug-event combinations for expert
                    pharmacovigilance review.
                  </li>
                </ul>
              </div>
            </div>

            {/* Sample Visualization */}
            <div className="mt-4 rounded-xl border border-[#E4ECF8] bg-[#FAFBFD] p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-xs font-semibold tracking-wide text-[#0F2140]">
                  Sample visualization · Top 5 reported drug-event combinations
                </h3>
                <span className="text-[11px] text-[#64748B]">
                  Stacked counts (Non-serious vs. Serious) · Non-causal signal view
                </span>
              </div>

              <div className="mt-3 h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sampleChartData}
                    layout="vertical"
                    margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5EDF9" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: '#5B6E8A' }}
                      axisLine={{ stroke: '#D8E5F8' }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={145}
                      tick={{ fontSize: 11, fill: '#1E3354' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: '#EEF4FF', opacity: 0.6 }}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderColor: '#D8E5F8',
                        borderRadius: '10px',
                        fontSize: '12px',
                        color: '#0F2140',
                      }}
                      formatter={(value, name) => [
                        `${value ?? 0} reports`,
                        name === 'serious' ? 'Serious reports' : 'Non-serious reports',
                      ]}
                      labelFormatter={(_label, payload) =>
                        payload?.[0]?.payload?.fullPair ?? ''
                      }
                    />
                    <Bar
                      dataKey="nonSerious"
                      stackId="a"
                      fill="#93C5FD"
                      radius={[0, 0, 0, 0]}
                      name="nonSerious"
                    />
                    <Bar
                      dataKey="serious"
                      stackId="a"
                      fill="#2563EB"
                      radius={[0, 6, 6, 0]}
                      name="serious"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
