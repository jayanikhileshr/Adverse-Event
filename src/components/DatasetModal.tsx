import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  BarChart3,
  Download,
  FileSpreadsheet,
  RotateCcw,
  Sparkles,
  Table2,
  Upload,
  X,
} from 'lucide-react';
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
  triggerFileDownload,
} from '../data/syntheticDataset';

interface DatasetModalProps {
  onClose: () => void;
  onDownloaded: () => void;
}

type ExplorerTab = 'chart' | 'aggregates' | 'records';

export function DatasetModal({ onClose, onDownloaded }: DatasetModalProps) {
  const [csvText, setCsvText] = useState<string>(ADVERSE_EVENT_CSV);
  const [sourceName, setSourceName] = useState<string>('adverse_reaction_aggregates.csv');
  const [applyCleaning, setApplyCleaning] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ExplorerTab>('chart');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'Serious' | 'Non-serious'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const parsed = useMemo(
    () => parseAdverseEventCsv(csvText, applyCleaning),
    [csvText, applyCleaning]
  );

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return parsed.rows.filter((row) => {
      if (severityFilter !== 'all' && row.severity.trim().toLowerCase() !== severityFilter.toLowerCase()) {
        return false;
      }
      if (!q) return true;
      return (
        row.drug_name.toLowerCase().includes(q) ||
        row.reaction_term.toLowerCase().includes(q) ||
        row.outcome.toLowerCase().includes(q) ||
        row.age_group.toLowerCase().includes(q)
      );
    });
  }, [parsed.rows, severityFilter, searchQuery]);

  const aggregates = useMemo(() => aggregateDrugEventPairs(filteredRows), [filteredRows]);

  const summary = useMemo(() => {
    const totalReports = filteredRows.reduce((acc, r) => acc + r.report_count, 0);
    const totalSerious = filteredRows.reduce((acc, r) => acc + r.serious_count, 0);
    const seriousPct = totalReports > 0 ? (totalSerious / totalReports) * 100 : 0;
    const uniqueDrugs = new Set(filteredRows.map((r) => r.drug_name)).size;
    return { totalReports, totalSerious, seriousPct, uniqueDrugs };
  }, [filteredRows]);

  const chartData = useMemo(
    () =>
      aggregates.slice(0, 10).map((item) => ({
        shortLabel:
          item.pairLabel.length > 30 ? `${item.pairLabel.slice(0, 29)}…` : item.pairLabel,
        fullPair: item.pairLabel,
        nonSerious: Math.max(0, item.totalReports - item.seriousReports),
        serious: item.seriousReports,
        totalReports: item.totalReports,
        seriousProportion: Number(item.seriousProportion.toFixed(1)),
      })),
    [aggregates]
  );

  const handleDownloadCsv = () => {
    triggerFileDownload(sourceName, csvText, 'text/csv;charset=utf-8;');
    onDownloaded();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const testParse = parseAdverseEventCsv(content, true);
      if (testParse.error || testParse.rows.length === 0) {
        setUploadError(
          testParse.error ||
            'No valid rows found. Ensure headers include drug_name, reaction_term, severity, report_count, and serious_count.'
        );
        return;
      }
      setCsvText(content);
      setSourceName(file.name);
    };
    reader.onerror = () => {
      setUploadError('Could not read the selected CSV file.');
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetDataset = () => {
    setCsvText(ADVERSE_EVENT_CSV);
    setSourceName('adverse_reaction_aggregates.csv');
    setUploadError(null);
    setSeverityFilter('all');
    setSearchQuery('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2140]/40 p-3 sm:p-5 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dataset-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-[#D8E5F8] bg-white shadow-[0_24px_60px_-20px_rgba(15,33,64,0.28)]">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E6EEF9] px-6 py-5">
          <div>
            <p className="text-xs font-medium text-[#5B4BB7]">
              Dataset Resource · {sourceName}
            </p>
            <h2 id="dataset-modal-title" className="mt-1 text-lg font-bold text-[#0F2140]">
              Adverse-reaction aggregates · CSV Explorer
            </h2>
            <p className="mt-0.5 text-xs text-[#586A85]">
              Synthetic de-identified aggregate counts for non-causal safety-signal exploration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE7F7] bg-white px-3 py-2 text-xs font-semibold text-[#1E3354] transition-colors hover:bg-[#F5F9FF] cursor-pointer"
            >
              <Upload className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Test local CSV</span>
            </button>
            {sourceName !== 'adverse_reaction_aggregates.csv' && (
              <button
                type="button"
                onClick={handleResetDataset}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DCE7F7] bg-white px-3 py-2 text-xs font-semibold text-[#526581] transition-colors hover:bg-[#F5F9FF] cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Reset sample</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#1D4ED8] cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Download CSV</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dataset explorer"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[#5B6E8A] transition-colors hover:border-[#DCE7F7] hover:bg-[#F5F9FF] hover:text-[#0F2140] cursor-pointer"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {uploadError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-xs text-[#991B1B]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Summary KPI strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-[#E4ECF8] bg-[#FAFBFD] px-4 py-3">
              <div className="text-xs text-[#5B6E8A]">Total reports</div>
              <div className="mt-1 font-mono text-xl font-semibold text-[#0F2140] tabular-nums">
                {summary.totalReports.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-[#E4ECF8] bg-[#FAFBFD] px-4 py-3">
              <div className="text-xs text-[#5B6E8A]">Serious reports</div>
              <div className="mt-1 font-mono text-xl font-semibold text-[#1D4ED8] tabular-nums">
                {summary.totalSerious.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl border border-[#E4ECF8] bg-[#FAFBFD] px-4 py-3">
              <div className="text-xs text-[#5B6E8A]">Serious proportion</div>
              <div className="mt-1 font-mono text-xl font-semibold text-[#0F2140] tabular-nums">
                {summary.seriousPct.toFixed(1)}%
              </div>
            </div>
            <div className="rounded-2xl border border-[#E4ECF8] bg-[#FAFBFD] px-4 py-3">
              <div className="text-xs text-[#5B6E8A]">Distinct drug names</div>
              <div className="mt-1 font-mono text-xl font-semibold text-[#0F2140] tabular-nums">
                {summary.uniqueDrugs}
              </div>
            </div>
          </div>

          {/* Controls row: Tabs + Step 1 Cleaning toggle + Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-xl border border-[#DCE7F7] bg-[#F4F8FF] p-1">
              <button
                type="button"
                onClick={() => setActiveTab('chart')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'chart'
                    ? 'bg-white text-[#0F2140] shadow-xs'
                    : 'text-[#526581] hover:text-[#0F2140]'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Signal chart</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('aggregates')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'aggregates'
                    ? 'bg-white text-[#0F2140] shadow-xs'
                    : 'text-[#526581] hover:text-[#0F2140]'
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Pair metrics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('records')}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-white text-[#0F2140] shadow-xs'
                    : 'text-[#526581] hover:text-[#0F2140]'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Raw / clean rows ({filteredRows.length})</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setApplyCleaning((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  applyCleaning
                    ? 'border-[#C6EFD7] bg-[#ECFDF3] text-[#14532D]'
                    : 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>
                  {applyCleaning
                    ? `Step 1 cleaning applied (${parsed.rawIssuesFound} normalized)`
                    : `Showing raw CSV (${parsed.rawIssuesFound} field issues)`}
                </span>
              </button>

              <select
                aria-label="Filter by severity"
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value as 'all' | 'Serious' | 'Non-serious')
                }
                className="rounded-xl border border-[#DCE7F7] bg-white px-2.5 py-1.5 text-xs font-medium text-[#1E3354] focus:border-[#2563EB] focus:outline-none"
              >
                <option value="all">All severities</option>
                <option value="Serious">Serious only</option>
                <option value="Non-serious">Non-serious only</option>
              </select>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter drug or reaction…"
                aria-label="Filter drug or reaction"
                className="w-44 rounded-xl border border-[#DCE7F7] bg-white px-3 py-1.5 text-xs text-[#0F2140] placeholder:text-[#8495AE] focus:border-[#2563EB] focus:outline-none"
              />
            </div>
          </div>

          {/* Main Tab Content */}
          {activeTab === 'chart' && (
            <div className="rounded-2xl border border-[#E4ECF8] bg-[#FAFBFD] p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-sm font-bold text-[#0F2140]">
                  Top 10 reported drug-event combinations
                </h3>
                <div className="flex items-center gap-4 text-xs text-[#526581]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-[#2563EB]" aria-hidden="true" />
                    Serious reports
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-xs bg-[#93C5FD]" aria-hidden="true" />
                    Non-serious reports
                  </span>
                </div>
              </div>

              {chartData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-[#64748B]">
                  No records match the current filter.
                </div>
              ) : (
                <div className="mt-4 h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 4, right: 24, left: 10, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5EDF9" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: '#526581' }}
                        axisLine={{ stroke: '#D8E5F8' }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="shortLabel"
                        width={190}
                        tick={{ fontSize: 11, fill: '#1E3354' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: '#EEF4FF', opacity: 0.65 }}
                        contentStyle={{
                          backgroundColor: '#FFFFFF',
                          borderColor: '#D8E5F8',
                          borderRadius: '12px',
                          fontSize: '12px',
                          color: '#0F2140',
                        }}
                        formatter={(value, name) => [
                          `${value ?? 0} reports`,
                          name === 'serious' ? 'Serious reports' : 'Non-serious reports',
                        ]}
                        labelFormatter={(_label, payload) => {
                          const entry = payload?.[0]?.payload;
                          if (!entry) return '';
                          return `${entry.fullPair} (${entry.seriousProportion}% serious)`;
                        }}
                      />
                      <Bar dataKey="nonSerious" stackId="reports" fill="#93C5FD" name="nonSerious" />
                      <Bar
                        dataKey="serious"
                        stackId="reports"
                        fill="#2563EB"
                        radius={[0, 6, 6, 0]}
                        name="serious"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <p className="mt-3 text-xs leading-relaxed text-[#526581]">
                <strong className="text-[#0F2140]">Non-causal reminder:</strong> Reporting volume
                reflects spontaneous submissions and prescribing scale, not proven adverse-effect
                incidence. High serious-report proportions flag combinations for expert clinical
                review.
              </p>
            </div>
          )}

          {activeTab === 'aggregates' && (
            <div className="overflow-x-auto rounded-2xl border border-[#E4ECF8]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4ECF8] bg-[#F4F8FF] text-[#435674]">
                    <th className="px-4 py-3 font-semibold">Drug</th>
                    <th className="px-4 py-3 font-semibold">Reaction term</th>
                    <th className="px-4 py-3 text-right font-semibold">Total reports</th>
                    <th className="px-4 py-3 text-right font-semibold">Serious reports</th>
                    <th className="px-4 py-3 text-right font-semibold">Serious proportion</th>
                    <th className="px-4 py-3 text-right font-semibold">Reporting share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3FA] bg-white text-[#1E3354]">
                  {aggregates.map((item) => (
                    <tr key={item.pairLabel} className="hover:bg-[#F8FBFF]">
                      <td className="px-4 py-2.5 font-medium text-[#0F2140]">{item.drugName}</td>
                      <td className="px-4 py-2.5">{item.reactionTerm}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                        {item.totalReports}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                        {item.seriousReports}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">
                        <span
                          className={
                            item.seriousProportion >= 75
                              ? 'font-semibold text-[#B45309]'
                              : 'text-[#334663]'
                          }
                        >
                          {item.seriousProportion.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums text-[#526581]">
                        {item.reportingShare.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="overflow-x-auto rounded-2xl border border-[#E4ECF8]">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E4ECF8] bg-[#F4F8FF] text-[#435674]">
                    <th className="px-3.5 py-3 font-semibold">Batch ID</th>
                    <th className="px-3.5 py-3 font-semibold">Drug</th>
                    <th className="px-3.5 py-3 font-semibold">Reaction</th>
                    <th className="px-3.5 py-3 font-semibold">Severity</th>
                    <th className="px-3.5 py-3 font-semibold">Age group</th>
                    <th className="px-3.5 py-3 font-semibold">Outcome</th>
                    <th className="px-3.5 py-3 text-right font-semibold">Reports</th>
                    <th className="px-3.5 py-3 text-right font-semibold">Serious</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3FA] bg-white text-[#1E3354]">
                  {filteredRows.map((row) => (
                    <tr key={row.report_batch_id} className="hover:bg-[#F8FBFF]">
                      <td className="px-3.5 py-2.5 font-mono text-[11px] text-[#5B6E8A]">
                        {row.report_batch_id}
                      </td>
                      <td className="px-3.5 py-2.5 font-medium text-[#0F2140]">
                        {!applyCleaning && row.drug_name !== row.drug_name.trim() ? (
                          <span className="rounded bg-[#FEF3C7] px-1 font-mono text-[#92400E]">
                            &quot;{row.drug_name}&quot;
                          </span>
                        ) : (
                          row.drug_name
                        )}
                      </td>
                      <td className="px-3.5 py-2.5">{row.reaction_term}</td>
                      <td className="px-3.5 py-2.5">{row.severity}</td>
                      <td className="px-3.5 py-2.5 font-mono tabular-nums">{row.age_group}</td>
                      <td className="px-3.5 py-2.5">{row.outcome}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums">
                        {row.report_count}
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono tabular-nums">
                        {row.serious_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
