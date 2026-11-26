/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { DatasetModal } from './components/DatasetModal';
import { GuideModal } from './components/GuideModal';
import { PortfolioUpgrade } from './components/PortfolioUpgrade';
import { ResourceSection, type ResourceCardId } from './components/ResourceSection';
import { StatusBadge } from './components/StatusBadge';
import { StepByStepGuide } from './components/StepByStepGuide';
import { SubmitTaskModal } from './components/SubmitTaskModal';
import {
  buildStarterChecklistMarkdown,
  REQUIRED_STEPS,
  triggerFileDownload,
} from './data/syntheticDataset';
import type { ActiveModal, TaskProgressState, TaskStatus } from './types';

const STORAGE_KEY = 'healthcare_analytics_task_04_v1';

const DEFAULT_STATE: TaskProgressState = {
  status: 'not_started',
  completedStepIds: [],
  submission: null,
  guideExpanded: true,
  portfolioExpanded: false,
};

function loadInitialState(): TaskProgressState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<TaskProgressState>;
    const validStepIds = Array.isArray(parsed.completedStepIds)
      ? parsed.completedStepIds.filter((id) => REQUIRED_STEPS.some((step) => step.id === id))
      : [];
    const validStatus: TaskStatus =
      parsed.status === 'not_started' ||
      parsed.status === 'in_progress' ||
      parsed.status === 'completed'
        ? parsed.status
        : 'not_started';

    return {
      status: validStatus,
      completedStepIds: validStepIds,
      submission:
        parsed.submission && typeof parsed.submission.url === 'string'
          ? {
              url: parsed.submission.url,
              submittedAt: parsed.submission.submittedAt ?? new Date().toISOString(),
            }
          : null,
      guideExpanded: typeof parsed.guideExpanded === 'boolean' ? parsed.guideExpanded : true,
      portfolioExpanded:
        typeof parsed.portfolioExpanded === 'boolean' ? parsed.portfolioExpanded : false,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function App() {
  const [taskState, setTaskState] = useState<TaskProgressState>(loadInitialState);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(taskState));
    } catch {
      // Ignore storage quota errors in restricted iframe environments.
    }
  }, [taskState]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const handleStatusChange = (nextStatus: TaskStatus) => {
    setTaskState((prev) => ({
      ...prev,
      status: nextStatus,
    }));
  };

  const handleToggleStep = (stepId: string) => {
    setTaskState((prev) => {
      const alreadyDone = prev.completedStepIds.includes(stepId);
      const nextStepIds = alreadyDone
        ? prev.completedStepIds.filter((id) => id !== stepId)
        : [...prev.completedStepIds, stepId];

      let nextStatus: TaskStatus = prev.status;
      if (nextStepIds.length === REQUIRED_STEPS.length) {
        nextStatus = 'completed';
      } else if (nextStepIds.length > 0) {
        nextStatus = 'in_progress';
      } else if (prev.status === 'completed') {
        nextStatus = 'in_progress';
      }

      return {
        ...prev,
        completedStepIds: nextStepIds,
        status: nextStatus,
      };
    });
  };

  const handleSelectResource = (resourceId: ResourceCardId) => {
    if (resourceId === 'task-guide') {
      setActiveModal('task-guide');
      return;
    }

    if (resourceId === 'governance-pack') {
      setActiveModal('governance-pack');
      return;
    }

    if (resourceId === 'starter-checklist') {
      const content = buildStarterChecklistMarkdown(taskState.completedStepIds);
      triggerFileDownload(
        'adverse-event-starter-checklist.md',
        content,
        'text/markdown;charset=utf-8;'
      );
      showToast('Downloaded adverse-event-starter-checklist.md');
      return;
    }

    if (resourceId === 'adverse-csv') {
      setActiveModal('dataset-explorer');
    }
  };

  const handleSaveSubmission = (url: string) => {
    setTaskState((prev) => ({
      ...prev,
      submission: {
        url,
        submittedAt: new Date().toISOString(),
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[#F6F9FE] px-4 py-6 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
      <main className="mx-auto w-full max-w-[1160px]">
        <article className="rounded-[24px] border border-[#D8E5F8] bg-white p-5 shadow-[0_10px_32px_-16px_rgba(15,33,64,0.08)] sm:p-8 lg:p-10">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
            {/* Primary Task Content Column */}
            <div className="min-w-0 flex-1">
              {/* Task Header */}
              <header className="flex items-start gap-3.5 sm:gap-4">
                <div
                  className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D3E2FA] bg-[#EEF4FF] font-mono text-sm font-semibold text-[#1D4ED8] tabular-nums sm:h-10 sm:w-10"
                  aria-label="Task 04"
                >
                  04
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                    <h1 className="text-[20px] leading-tight font-bold tracking-tight text-[#0F2140] sm:text-[24px]">
                      Adverse Event Signal Exploration
                    </h1>
                    <StatusBadge status={taskState.status} onChange={handleStatusChange} />
                  </div>

                  <p className="mt-2 max-w-3xl text-[14.5px] leading-relaxed text-[#526581] sm:text-[15px]">
                    Explore de-identified adverse-event reports for reporting patterns and potential
                    signals that require expert review.
                  </p>
                </div>
              </header>

              {/* Step-by-step Guide Toggle + Expanded Panel */}
              <StepByStepGuide
                expanded={taskState.guideExpanded}
                onToggleExpanded={() =>
                  setTaskState((prev) => ({ ...prev, guideExpanded: !prev.guideExpanded }))
                }
                steps={REQUIRED_STEPS}
                completedStepIds={taskState.completedStepIds}
                onToggleStep={handleToggleStep}
              />

              {/* Optional Portfolio Upgrade */}
              <PortfolioUpgrade
                expanded={taskState.portfolioExpanded}
                onToggleExpanded={() =>
                  setTaskState((prev) => ({
                    ...prev,
                    portfolioExpanded: !prev.portfolioExpanded,
                  }))
                }
              />

              {/* Dataset Resource Section */}
              <ResourceSection onSelectResource={handleSelectResource} />
            </div>

            {/* Right-Side Submit Action (Desktop) / Bottom Full-Width (Mobile & Tablet) */}
            <aside className="w-full shrink-0 lg:sticky lg:top-10 lg:w-auto">
              <button
                type="button"
                onClick={() => setActiveModal('submit-task')}
                className="w-full rounded-2xl border border-[#C9DCF6] bg-white px-6 py-3.5 text-center text-[14.5px] font-bold text-[#0F2140] shadow-[0_6px_18px_-8px_rgba(15,33,64,0.14)] transition-all duration-150 hover:border-[#93B8F0] hover:bg-[#F8FBFF] hover:shadow-[0_10px_22px_-10px_rgba(37,99,235,0.2)] active:translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] whitespace-nowrap cursor-pointer lg:w-auto lg:min-w-[184px]"
              >
                Submit this task
              </button>

              {taskState.submission && (
                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-medium text-[#047857] lg:justify-end">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Link saved locally</span>
                </div>
              )}
            </aside>
          </div>
        </article>
      </main>

      {/* Modals */}
      {activeModal === 'task-guide' && (
        <GuideModal kind="task-guide" onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'governance-pack' && (
        <GuideModal kind="governance-pack" onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'dataset-explorer' && (
        <DatasetModal
          onClose={() => setActiveModal(null)}
          onDownloaded={() => showToast('Downloaded adverse_reaction_aggregates.csv')}
        />
      )}

      {activeModal === 'submit-task' && (
        <SubmitTaskModal
          existingSubmission={taskState.submission}
          completedStepCount={taskState.completedStepIds.length}
          totalStepCount={REQUIRED_STEPS.length}
          onSubmit={handleSaveSubmission}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Subtle Download Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-[#C6EFD7] bg-[#ECFDF3] px-4 py-2.5 text-xs font-semibold text-[#14532D] shadow-md"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#059669]" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
