import React from 'react';
import { motion } from 'framer-motion';
import { HashTableSnapshot, HashItemState } from '../../types/hashTable';
import { Hash, ArrowRight } from 'lucide-react';

interface HashTableVisualizerProps {
  snapshot: HashTableSnapshot;
}

const STATE_BADGE_MAP: Record<HashItemState, string> = {
  default: 'bg-white border-slate-200 text-slate-800',
  probing: 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-200',
  collision: 'bg-orange-50 border-orange-400 text-orange-900 ring-2 ring-orange-200',
  inserted: 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200',
  found: 'bg-violet-50 border-violet-500 text-violet-900 ring-2 ring-violet-200',
  deleting: 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-200',
};

export const HashTableVisualizer: React.FC<HashTableVisualizerProps> = ({ snapshot }) => {
  const { buckets, mode, capacity, size, loadFactor, formulaText } = snapshot;

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-brand-600" />
            {mode === 'chaining' ? 'Separate Chaining' : 'Linear Probing'}
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            m = <strong className="text-brand-700">{capacity}</strong>
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            n = <strong className="text-brand-700">{size}</strong>
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            load = <strong className="text-brand-700">{loadFactor.toFixed(2)}</strong>
          </span>
        </div>

        {formulaText && (
          <div className="font-mono text-[11px] bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-0.5 rounded-md">
            {formulaText}
          </div>
        )}
      </div>

      {mode === 'chaining' ? (
        <div className="flex flex-col gap-2">
          {buckets.map((bucket) => {
            const bucketState = bucket.slotState ?? 'default';
            const indexTone =
              bucketState === 'probing'
                ? 'bg-amber-500 text-white border-amber-600'
                : bucketState === 'collision'
                ? 'bg-orange-500 text-white border-orange-600'
                : bucketState === 'inserted'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : bucketState === 'found'
                ? 'bg-violet-600 text-white border-violet-700'
                : 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={bucket.index}
                className="flex items-center gap-2 bg-slate-50/50 border border-slate-200/70 rounded-xl p-2 overflow-x-auto"
              >
                <div
                  className={`w-10 h-9 shrink-0 rounded-lg border font-mono text-xs font-bold flex items-center justify-center transition-colors ${indexTone}`}
                >
                  [{bucket.index}]
                </div>

                <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

                {bucket.entries.length === 0 ? (
                  <span className="text-xs font-mono text-slate-400 px-2 py-1">null</span>
                ) : (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {bucket.entries.map((entry, idx) => {
                      const cls = STATE_BADGE_MAP[entry.state ?? 'default'];
                      return (
                        <React.Fragment key={entry.id}>
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.92 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold shadow-sm flex items-center gap-1.5 ${cls}`}
                          >
                            <span>{entry.key}</span>
                            {entry.value && (
                              <span className="text-[10px] font-normal text-slate-500">
                                ({entry.value})
                              </span>
                            )}
                          </motion.div>
                          {idx < bucket.entries.length - 1 && (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          )}
                        </React.Fragment>
                      );
                    })}
                    <span className="text-[11px] font-mono text-slate-400 ml-1">null</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {buckets.map((bucket) => {
            const entry = bucket.entries[0];
            const slotCls = STATE_BADGE_MAP[bucket.slotState ?? 'default'];
            const isDeleted = bucket.probeStatus === 'deleted';

            return (
              <motion.div
                key={bucket.index}
                layout
                className={`rounded-xl border p-3 flex flex-col justify-between min-h-[76px] transition-all ${slotCls}`}
              >
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="font-bold text-slate-500">idx {bucket.index}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      bucket.probeStatus === 'occupied'
                        ? 'bg-brand-50 text-brand-700'
                        : isDeleted
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDeleted ? 'tombstone' : bucket.probeStatus ?? 'empty'}
                  </span>
                </div>

                <div className="mt-2 font-mono text-sm font-bold text-center">
                  {entry ? (
                    <span>
                      {entry.key}
                      {entry.value ? (
                        <span className="block text-[10px] font-normal text-slate-500 truncate">
                          {entry.value}
                        </span>
                      ) : null}
                    </span>
                  ) : isDeleted ? (
                    <span className="text-xs text-rose-500 font-medium">DEL marker</span>
                  ) : (
                    <span className="text-xs text-slate-300 font-normal">---</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Probing
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" /> Collision
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Inserted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 inline-block" /> Found
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Deleted / Tombstone
        </span>
      </div>
    </div>
  );
};

