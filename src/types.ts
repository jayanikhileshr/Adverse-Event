export type TaskStatus = 'not_started' | 'in_progress' | 'completed';

export interface ChecklistStep {
  id: string;
  number: number;
  label: string;
  hint: string;
}

export interface SubmissionRecord {
  url: string;
  submittedAt: string;
}

export interface TaskProgressState {
  status: TaskStatus;
  completedStepIds: string[];
  submission: SubmissionRecord | null;
  guideExpanded: boolean;
  portfolioExpanded: boolean;
}

export type ActiveModal =
  | null
  | 'task-guide'
  | 'governance-pack'
  | 'dataset-explorer'
  | 'submit-task';

export interface AdverseEventRow {
  report_batch_id: string;
  drug_name: string;
  reaction_term: string;
  severity: string;
  age_group: string;
  outcome: string;
  report_count: number;
  serious_count: number;
  reporting_quarter: string;
}

export interface DrugEventAggregate {
  pairLabel: string;
  drugName: string;
  reactionTerm: string;
  totalReports: number;
  seriousReports: number;
  seriousProportion: number;
  reportingShare: number;
}
