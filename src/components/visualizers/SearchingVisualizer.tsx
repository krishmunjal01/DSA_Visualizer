import React from 'react';
import { SearchStepSnapshot, BarState } from '../../types/algorithms';

interface SearchingVisualizerProps {
  snapshot: SearchStepSnapshot;
}

const CELL_COLORS: Record<BarState, string> = {
  default: 'bg-white border-slate-200 text-slate-800',
  comparing: 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-200',
  found: 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200',
  discarded: 'bg-slate-100 border-slate-200 text-slate-400 opacity-55',
  swapping: 'bg-rose-50 border-rose-400 text-rose-900',
  pivot: 'bg-violet-50 border-violet-400 text-violet-900',
  sorted: 'bg-emerald-50 border-emerald-400 text-emerald-900',
};

export const SearchingVisualizer: React.FC<SearchingVisualizerProps> = ({ snapshot }) => {
  const { items, target, low, mid, high, currentIndex, foundIndex, comparisons } = snapshot;

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-0.5 rounded-full font-semibold">
            Target = {target}
          </span>
          {low !== undefined && high !== undefined && (
            <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-600">
              Range [{low}..{high}]
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-white border border-slate-200 px-2.5 py-0.5 rounded-full text-slate-700">
            Comparisons: <strong className="text-brand-700">{comparisons}</strong>
          </span>
          {foundIndex !== null && (
            <span className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-emerald-700 font-semibold">
              Match at index {foundIndex}
            </span>
          )}
        </div>
      </div>

      <div className="w-full bg-slate-50/50 border border-slate-200/70 rounded-xl p-5 flex flex-wrap items-center justify-center gap-2.5">
        {items.map((item, idx) => {
          const tags: string[] = [];
          if (low === idx) tags.push('L');
          if (mid === idx) tags.push('MID');
          if (high === idx) tags.push('H');
          if (currentIndex === idx && mid !== idx) tags.push('CURR');

          return (
            <div key={`${item.id}-${idx}`} className="flex flex-col items-center gap-1.5">
              <div className="h-5 flex items-center gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      tag === 'MID' || tag === 'CURR'
                        ? 'bg-amber-500 text-white'
                        : 'bg-brand-600 text-white'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div
                className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center font-mono transition-all ${CELL_COLORS[item.state]}`}
              >
                <span className="text-sm font-bold">{item.value}</span>
                <span className="text-[10px] opacity-70">[{idx}]</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" /> Checking
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Target Found
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 inline-block" /> Eliminated Window
        </span>
      </div>
    </div>
  );
};

