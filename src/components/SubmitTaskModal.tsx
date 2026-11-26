import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ExternalLink, Link2, X } from 'lucide-react';
import type { SubmissionRecord } from '../types';

interface SubmitTaskModalProps {
  existingSubmission: SubmissionRecord | null;
  completedStepCount: number;
  totalStepCount: number;
  onSubmit: (url: string) => void;
  onClose: () => void;
}

function validateSubmissionUrl(rawValue: string): string | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return 'Please enter a public or view-only URL for your project.';
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return 'Enter a valid web address starting with https:// (for example, https://github.com/username/safety-signal-report).';
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return 'URL must begin with https:// or http://.';
  }

  if (!parsed.hostname.includes('.') || parsed.hostname.length < 4) {
    return 'Please enter a complete public domain name (such as github.com, colab.research.google.com, or drive.google.com).';
  }

  return null;
}

export function SubmitTaskModal({
  existingSubmission,
  completedStepCount,
  totalStepCount,
  onSubmit,
  onClose,
}: SubmitTaskModalProps) {
  const [url, setUrl] = useState(existingSubmission?.url ?? '');
  const [error, setError] = useState<string | null>(null);
  const [justSubmittedUrl, setJustSubmittedUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateSubmissionUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    const cleanedUrl = url.trim();
    setError(null);
    onSubmit(cleanedUrl);
    setJustSubmittedUrl(cleanedUrl);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F2140]/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[#D8E5F8] bg-white shadow-[0_24px_60px_-20px_rgba(15,33,64,0.28)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#E6EEF9] px-6 py-5">
          <div>
            <p className="text-xs font-medium text-[#2563EB]">Task 04 · Submission</p>
            <h2 id="submit-modal-title" className="mt-1 text-lg font-bold text-[#0F2140]">
              Adverse Event Signal Exploration
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close submission modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-[#5B6E8A] transition-colors hover:border-[#DCE7F7] hover:bg-[#F5F9FF] hover:text-[#0F2140] cursor-pointer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {justSubmittedUrl ? (
          <div className="px-6 py-6">
            <div className="rounded-2xl border border-[#C6EFD7] bg-[#ECFDF3] p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#0F3F22]">
                    Submission recorded locally
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#166534]">
                    Your proof link for Adverse Event Signal Exploration has been saved. You can
                    update it anytime before final review.
                  </p>
                  <a
                    href={justSubmittedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#BCE8CE] bg-white px-3 py-1.5 text-xs font-medium text-[#14532D] hover:bg-[#F7FDF9]"
                  >
                    <span className="truncate">{justSubmittedUrl}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setJustSubmittedUrl(null)}
                className="rounded-xl border border-[#DCE7F7] bg-white px-4 py-2 text-sm font-semibold text-[#334663] transition-colors hover:bg-[#F5F9FF] cursor-pointer"
              >
                Edit link
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1D4ED8] cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} noValidate className="px-6 py-6">
            <p className="text-sm leading-relaxed text-[#526581]">
              Submit one public or view-only link containing your reproducible notebook,
              safety-signal exploration report, and supporting files.
            </p>

            {completedStepCount < totalStepCount && (
              <div className="mt-4 rounded-xl border border-[#E1ECFC] bg-[#F4F8FF] px-3.5 py-2.5 text-xs text-[#334E73]">
                Checklist progress:{' '}
                <span className="font-semibold tabular-nums text-[#0F2140]">
                  {completedStepCount} of {totalStepCount} steps completed
                </span>
                . Make sure all required steps are included in your link.
              </div>
            )}

            <div className="mt-5">
              <label
                htmlFor="submission-url-input"
                className="block text-xs font-semibold text-[#0F2140]"
              >
                Public or view-only project URL
              </label>
              <div className="relative mt-2">
                <Link2
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7C8EA8]"
                  aria-hidden="true"
                />
                <input
                  ref={inputRef}
                  id="submission-url-input"
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://github.com/your-handle/adverse-event-signal-exploration"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'submission-url-error' : 'submission-url-help'}
                  className={`w-full rounded-xl border bg-white py-2.5 pl-10 pr-3.5 text-sm text-[#0F2140] placeholder:text-[#94A3B8] transition-colors focus:outline-none focus:ring-2 ${
                    error
                      ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#FEE2E2]'
                      : 'border-[#CEDEF4] focus:border-[#2563EB] focus:ring-[#DBEAFE]'
                  }`}
                />
              </div>

              {error ? (
                <p
                  id="submission-url-error"
                  role="alert"
                  className="mt-2 flex items-start gap-1.5 text-xs font-medium text-[#DC2626]"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>{error}</span>
                </p>
              ) : (
                <p id="submission-url-help" className="mt-2 text-xs text-[#64748B]">
                  Accepts GitHub, Google Colab, Kaggle, Notion, or view-only cloud folder links.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[#DCE7F7] bg-white px-4 py-2.5 text-sm font-semibold text-[#334663] transition-colors hover:bg-[#F5F9FF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] cursor-pointer"
              >
                Submit link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
