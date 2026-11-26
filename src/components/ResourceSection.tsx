import { ArrowUpRight, Download, FileSpreadsheet, FileText, ShieldCheck } from 'lucide-react';

export type ResourceCardId =
  | 'task-guide'
  | 'starter-checklist'
  | 'governance-pack'
  | 'adverse-csv';

interface ResourceSectionProps {
  onSelectResource: (resourceId: ResourceCardId) => void;
}

interface ResourceItem {
  id: ResourceCardId;
  titlePrefix: string;
  typeLabel: string;
  description: string;
  icon: typeof FileText;
  actionHint: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: 'task-guide',
    titlePrefix: 'Step-by-step task guide',
    typeLabel: 'Guide',
    description:
      'A printable beginner guide with the exact passing checklist and submission example.',
    icon: FileText,
    actionHint: 'Open document',
  },
  {
    id: 'starter-checklist',
    titlePrefix: 'Starter checklist',
    typeLabel: 'Download',
    description:
      'Download this editable checklist and mark each required step as you finish it.',
    icon: Download,
    actionHint: 'Download .md file',
  },
  {
    id: 'governance-pack',
    titlePrefix: 'Healthcare analytics governance pack',
    typeLabel: 'Guide',
    description: 'Safe-use boundaries, data handling rules, and decision-brief template.',
    icon: ShieldCheck,
    actionHint: 'Open document',
  },
  {
    id: 'adverse-csv',
    titlePrefix: 'Adverse-reaction aggregates',
    typeLabel: 'CSV',
    description: 'Synthetic aggregate counts for non-causal signal exploration.',
    icon: FileSpreadsheet,
    actionHint: 'Explore & download CSV',
  },
];

export function ResourceSection({ onSelectResource }: ResourceSectionProps) {
  return (
    <section aria-labelledby="dataset-resource-heading" className="mt-7">
      <h2
        id="dataset-resource-heading"
        className="mb-2.5 text-xs font-semibold tracking-wide text-[#5B6E8A]"
      >
        Dataset resource
      </h2>

      <div className="rounded-[20px] border border-[#DDD6FE] bg-[#F5F3FF] p-5 sm:p-6">
        <div>
          <h3 className="text-[16px] font-bold text-[#142240]">
            Use these materials before starting
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-[#586480]">
            These are the supplied briefs, references, templates, or datasets required for this
            task.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          {RESOURCES.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectResource(item.id)}
                aria-label={`${item.titlePrefix} (${item.typeLabel}): ${item.description}`}
                className="group flex h-full flex-col justify-between rounded-2xl border border-[#E2DBFE] bg-white p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-[#B9A7FA] hover:shadow-[0_8px_20px_-10px_rgba(76,59,158,0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C3B9E] cursor-pointer"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="text-[14px] leading-snug font-semibold text-[#132445] group-hover:text-[#3B2B8C]">
                      <span>{item.titlePrefix}</span>
                      <span className="mx-1.5 font-normal text-[#8B82B8]" aria-hidden="true">
                        ·
                      </span>
                      <span className="font-medium text-[#5B4BB7]">{item.typeLabel}</span>
                    </div>
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#F5F3FF] text-[#614EC2] transition-colors duration-150 group-hover:bg-[#EAE5FF]"
                      aria-hidden="true"
                    >
                      {item.id === 'starter-checklist' ? (
                        <Download className="h-3.5 w-3.5" />
                      ) : item.id === 'adverse-csv' ? (
                        <Icon className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-[#566682]">
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
