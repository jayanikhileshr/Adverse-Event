import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Circle, Clock } from 'lucide-react';
import type { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
  onChange: (nextStatus: TaskStatus) => void;
}

const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    badgeClass: string;
    icon: typeof Circle;
    description: string;
  }
> = {
  not_started: {
    label: 'Not started',
    badgeClass:
      'bg-[#F1F5F9] text-[#475569] border-[#DFE6F0] hover:bg-[#E8EEF6]',
    icon: Circle,
    description: 'Task has not been started yet',
  },
  in_progress: {
    label: 'In progress',
    badgeClass:
      'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE] hover:bg-[#E0EEFF]',
    icon: Clock,
    description: 'Currently cleaning or analyzing data',
  },
  completed: {
    label: 'Completed',
    badgeClass:
      'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] hover:bg-[#DCFCE7]',
    icon: Check,
    description: 'All required steps finished',
  },
};

const STATUS_OPTIONS: TaskStatus[] = ['not_started', 'in_progress', 'completed'];

export function StatusBadge({ status, onChange }: StatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const current = STATUS_CONFIG[status];

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Task status: ${current.label}. Click to change status.`}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] whitespace-nowrap shrink-0 cursor-pointer ${current.badgeClass}`}
      >
        <span>{current.label}</span>
        <ChevronDown
          className={`h-3 w-3 opacity-70 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Select task status"
          className="absolute left-0 z-30 mt-2 w-56 rounded-xl border border-[#DCE7F7] bg-white p-1.5 shadow-[0_12px_32px_-12px_rgba(15,33,64,0.18)]"
        >
          <div className="px-2.5 py-1.5 text-[11px] font-medium text-[#64748B]">
            Update task status
          </div>
          {STATUS_OPTIONS.map((optionKey) => {
            const option = STATUS_CONFIG[optionKey];
            const Icon = option.icon;
            const isSelected = optionKey === status;
            return (
              <button
                key={optionKey}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(optionKey);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[#F4F8FF] text-[#0F2140]'
                    : 'text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon
                  className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                    optionKey === 'completed'
                      ? 'text-[#059669]'
                      : optionKey === 'in_progress'
                        ? 'text-[#2563EB]'
                        : 'text-[#64748B]'
                  }`}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 text-xs font-semibold">
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden="true" />
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-snug text-[#64748B]">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
