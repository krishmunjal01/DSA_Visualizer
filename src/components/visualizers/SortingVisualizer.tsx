import React from 'react';
import { SortStepSnapshot, BarState } from '../../types/algorithms';

interface SortingVisualizerProps {
  snapshot: SortStepSnapshot;
  title?: string;
  compact?: boolean;
}

const BAR_COLORS: Record<BarState, string> = {
  default: 'bg-brand-500 border-brand-600',
  comparing: 'bg-amber-400 border-amber-500',
  swapping: 'bg-rose-500 border-rose-600',
  pivot: 'bg-violet-500 border-violet-600',
  sorted: 'bg-emerald-500 border-emerald-600',
  found: 'bg-emerald-500 border-emerald-600',
  discarded: 'bg-slate-200 border-slate-300',
};

export const SortingVisualizer: React.FC<SortingVisualizerProps> = ({
  snapshot,
  title,
  compact = false,
}) => {
  const { bars, comparisons, swaps, note } = snapshot;
  const maxVal = Math.max(1, ...bars.map((b) => b.value));

  return (
    <div className="w-full flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          {title && <span className="font-semibold text-slate-800">{title}</span>}
          {note && !compact && (
            <span className="text-slate-500 font-mono text-[11px] truncate max-w-md">{note}</span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-700">
            Comparisons: <strong className="text-brand-700">{comparisons}</strong>
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-700">
            Swaps/Writes: <strong className="text-rose-600">{swaps}</strong>
          </span>
        </div>
      </div>

      <div
        className={`w-full bg-slate-50/50 border border-slate-200/70 rounded-xl px-3 pt-6 pb-3 flex items-end justify-center gap-1.5 overflow-x-auto ${
          compact ? 'h-52' : 'h-64'
        }`}
      >
        {bars.map((bar, idx) => {
          const heightPct = Math.max(10, Math.round((bar.value / maxVal) * 100));
          const barColor = BAR_COLORS[bar.state];
          return (
            <div
              key={`${bar.id}-${idx}`}
              className="flex-1 min-w-[16px] max-w-[44px] h-full flex flex-col items-center justify-end gap-1"
            >
              <span className="text-[10px] font-mono font-semibold text-slate-600 select-none">
                {bar.value}
              </span>
              <div
                className={`w-full rounded-t-md border transition-all duration-150 ${barColor}`}
                style={{ height: `${heightPct}%` }}
              />
            </div>
          );
        })}
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-brand-500 inline-block" /> Unsorted
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Comparing
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" /> Swapping / Write
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block" /> Pivot
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Sorted
          </span>
        </div>
      )}
    </div>
  );
};

