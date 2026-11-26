import Papa from 'papaparse';
import type { AdverseEventRow, ChecklistStep, DrugEventAggregate } from '../types';

export const REQUIRED_STEPS: ChecklistStep[] = [
  {
    id: 'clean-fields',
    number: 1,
    label: 'Clean drug, reaction, severity, age group, and outcome fields.',
    hint: 'Standardize casing, trim whitespace, harmonize severity labels, and verify missing age-group values.',
  },
  {
    id: 'calculate-metrics',
    number: 2,
    label: 'Calculate reporting frequency and serious-report proportions.',
    hint: 'Compute report counts per drug-event pair alongside serious_count / report_count percentages.',
  },
  {
    id: 'visualize-combinations',
    number: 3,
    label: 'Visualize high-frequency drug-event combinations.',
    hint: 'Plot the leading drug-reaction pairs with clear caveats distinguishing reporting patterns from causation.',
  },
];

/**
 * Synthetic aggregate dataset representing de-identified spontaneous adverse-event counts.
 * Includes minor raw formatting inconsistencies (e.g. casing and whitespace) so learners
 * can practice Step 1 field standardization and verify their cleaning pipeline.
 */
export const ADVERSE_EVENT_CSV = `report_batch_id,drug_name,reaction_term,severity,age_group,outcome,report_count,serious_count,reporting_quarter
AE-1001,Atorvastatin,Myalgia,Non-serious,45-64,Recovered,148,19,2025-Q1
AE-1002, atorvastatin ,Myalgia,Serious,65+,Hospitalized,64,64,2025-Q1
AE-1003,Atorvastatin,Elevated liver enzymes,Serious,65+,Recovering,42,36,2025-Q1
AE-1004,Metformin,Gastrointestinal distress,Non-serious,45-64,Recovered,186,14,2025-Q1
AE-1005,metformin,Lactic acidosis,serious,65+,Hospitalized,28,27,2025-Q1
AE-1006,Lisinopril,Persistent dry cough,Non-serious,45-64,Recovered,162,9,2025-Q1
AE-1007,Lisinopril,Angioedema,Serious,65+,Hospitalized,51,49,2025-Q1
AE-1008,Apixaban,Gastrointestinal hemorrhage,Serious,65+,Hospitalized,94,91,2025-Q1
AE-1009,Apixaban,Epistaxis,Non-serious,65+,Recovered,78,12,2025-Q1
AE-1010,Semaglutide,Nausea and vomiting,Non-serious,18-44,Recovered,214,21,2025-Q2
AE-1011,Semaglutide,Acute pancreatitis,Serious,45-64,Hospitalized,39,37,2025-Q2
AE-1012,Amoxicillin,Maculopapular rash,Non-serious,18-44,Recovered,134,11,2025-Q2
AE-1013,Amoxicillin,Anaphylactic reaction,Serious,18-44,Life-threatening,33,33,2025-Q2
AE-1014,Sertraline,Insomnia,Non-serious,18-44,Recovered,118,8,2025-Q2
AE-1015,Sertraline,Hyponatremia,Serious,65+,Hospitalized,37,34,2025-Q2
AE-1016,Warfarin,Intracranial hemorrhage,Serious,65+,Life-threatening,46,46,2025-Q2
AE-1017,Warfarin,Elevated INR,Serious,65+,Recovering,88,67,2025-Q2
AE-1018,Omeprazole,Hypomagnesemia,Serious,65+,Hospitalized,44,35,2025-Q3
AE-1019,Omeprazole,Headache,Non-serious,45-64,Recovered,92,6,2025-Q3
AE-1020,Ibuprofen,Acute kidney injury,Serious,65+,Hospitalized,73,69,2025-Q3
AE-1021,Ibuprofen ,Gastric ulcer,Serious,45-64,Hospitalized,61,55,2025-Q3
AE-1022,Clopidogrel,Gastrointestinal hemorrhage,Serious,65+,Hospitalized,68,64,2025-Q3
AE-1023,Clopidogrel,Ecchymosis,Non-serious,65+,Recovered,83,9,2025-Q3
AE-1024,Empagliflozin,Urinary tract infection,Non-serious,45-64,Recovered,129,18,2025-Q4
AE-1025,Empagliflozin,Diabetic ketoacidosis,Serious,45-64,Hospitalized,41,40,2025-Q4
AE-1026,Amlodipine,Peripheral edema,Non-serious,65+,Recovered,141,11,2025-Q4
AE-1027,Atorvastatin,Rhabdomyolysis,Serious,65+,Hospitalized,29,29,2025-Q4
AE-1028,Semaglutide,Nausea and vomiting,non-serious,45-64,Recovered,112,13,2025-Q4`;

function toTitleCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return 'Unknown';
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
}

function normalizeSeverity(value: string): string {
  const cleaned = value.trim().toLowerCase();
  if (cleaned === 'serious') return 'Serious';
  if (cleaned === 'non-serious' || cleaned === 'non serious') return 'Non-serious';
  return toTitleCase(value);
}

function normalizeAgeGroup(value: string): string {
  const cleaned = value.trim();
  return cleaned || 'Unknown';
}

export interface ParsedDatasetResult {
  rows: AdverseEventRow[];
  rawIssuesFound: number;
  error: string | null;
}

export function parseAdverseEventCsv(
  csvText: string,
  applyCleaning: boolean
): ParsedDatasetResult {
  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return {
      rows: [],
      rawIssuesFound: 0,
      error: parsed.errors[0]?.message || 'Could not parse CSV file.',
    };
  }

  let rawIssuesFound = 0;

  const rows: AdverseEventRow[] = parsed.data
    .map((record, index) => {
      const rawDrug = record.drug_name ?? '';
      const rawReaction = record.reaction_term ?? '';
      const rawSeverity = record.severity ?? '';
      const rawAge = record.age_group ?? '';
      const rawOutcome = record.outcome ?? '';

      const cleanDrug = toTitleCase(rawDrug);
      const cleanReaction = rawReaction.trim()
        ? rawReaction.trim().charAt(0).toUpperCase() + rawReaction.trim().slice(1)
        : 'Unspecified';
      const cleanSeverity = normalizeSeverity(rawSeverity);
      const cleanAge = normalizeAgeGroup(rawAge);
      const cleanOutcome = rawOutcome.trim() ? rawOutcome.trim() : 'Unknown';

      if (
        rawDrug !== cleanDrug ||
        rawSeverity !== cleanSeverity ||
        rawReaction !== cleanReaction ||
        rawAge !== cleanAge ||
        rawOutcome !== cleanOutcome
      ) {
        rawIssuesFound += 1;
      }

      const reportCount = Math.max(0, Number.parseInt(String(record.report_count ?? '0'), 10) || 0);
      const seriousCount = Math.min(
        reportCount,
        Math.max(0, Number.parseInt(String(record.serious_count ?? '0'), 10) || 0)
      );

      return {
        report_batch_id: (record.report_batch_id || `ROW-${index + 1}`).trim(),
        drug_name: applyCleaning ? cleanDrug : rawDrug,
        reaction_term: applyCleaning ? cleanReaction : rawReaction,
        severity: applyCleaning ? cleanSeverity : rawSeverity,
        age_group: applyCleaning ? cleanAge : rawAge,
        outcome: applyCleaning ? cleanOutcome : rawOutcome,
        report_count: reportCount,
        serious_count: seriousCount,
        reporting_quarter: (record.reporting_quarter || 'Unknown').trim(),
      };
    })
    .filter((row) => row.drug_name.trim().length > 0 || row.reaction_term.trim().length > 0);

  return { rows, rawIssuesFound, error: null };
}

export function aggregateDrugEventPairs(rows: AdverseEventRow[]): DrugEventAggregate[] {
  const totalReportsAll = rows.reduce((sum, r) => sum + r.report_count, 0);
  const map = new Map<
    string,
    { drugName: string; reactionTerm: string; totalReports: number; seriousReports: number }
  >();

  for (const row of rows) {
    const key = `${row.drug_name}__${row.reaction_term}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalReports += row.report_count;
      existing.seriousReports += row.serious_count;
    } else {
      map.set(key, {
        drugName: row.drug_name,
        reactionTerm: row.reaction_term,
        totalReports: row.report_count,
        seriousReports: row.serious_count,
      });
    }
  }

  return Array.from(map.values())
    .map((entry) => ({
      pairLabel: `${entry.drugName} · ${entry.reactionTerm}`,
      drugName: entry.drugName,
      reactionTerm: entry.reactionTerm,
      totalReports: entry.totalReports,
      seriousReports: entry.seriousReports,
      seriousProportion:
        entry.totalReports > 0 ? (entry.seriousReports / entry.totalReports) * 100 : 0,
      reportingShare:
        totalReportsAll > 0 ? (entry.totalReports / totalReportsAll) * 100 : 0,
    }))
    .sort((a, b) => b.totalReports - a.totalReports);
}

export function buildStarterChecklistMarkdown(completedStepIds: string[]): string {
  const mark = (id: string) => (completedStepIds.includes(id) ? 'x' : ' ');
  return `# Task 04: Adverse Event Signal Exploration — Starter Checklist

Objective: Use cautious descriptive analysis and distinguish a reporting signal from proof of causation.
Deliverable: Reproducible notebook and safety-signal exploration report.
Estimated time: 90–120 minutes

## Required Steps to Pass

- [${mark('clean-fields')}] Step 1: Clean drug, reaction, severity, age group, and outcome fields.
  - Trim leading/trailing spaces and standardize drug name capitalization.
  - Harmonize severity categories ("Serious" vs. "Non-serious").
  - Document any missing or merged records in a brief cleaning log.

- [${mark('calculate-metrics')}] Step 2: Calculate reporting frequency and serious-report proportions.
  - Compute total report count per drug-reaction pair.
  - Compute serious-report proportion: serious_count / report_count.
  - Note overall reporting share without claiming true clinical incidence rates.

- [${mark('visualize-combinations')}] Step 3: Visualize high-frequency drug-event combinations.
  - Create a clear horizontal bar or stacked chart of top drug-event pairs.
  - Annotate charts to remind readers that spontaneous reports indicate reporting patterns, not proven causation.

## Governance & Safe-Use Reminders

- [ ] Verify dataset is strictly de-identified aggregate data (no patient-level PHI).
- [ ] State limitations clearly (reporting bias, missing prescription denominators, stimulated reporting).
- [ ] Frame top signals as candidates for expert pharmacovigilance review—not medical advice.

## Submission Check

- [ ] Put notebook, report, and supporting figures in one public or view-only folder/repository.
- [ ] Verify the shared link opens cleanly in an incognito browser window.
- [ ] Submit the single proof link on the task page.
`;
}

export function triggerFileDownload(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
