import React from 'react';
import { motion } from 'framer-motion';
import { QueueStateSnapshot } from '../../types/queue';
import { ArrowLeft, ArrowDown, LogOut, LogIn, AlertCircle } from 'lucide-react';

interface QueueVisualizerProps {
  snapshot: QueueStateSnapshot;
}

export const QueueVisualizer: React.FC<QueueVisualizerProps> = ({ snapshot }) => {
  const { items, frontIndex, rearIndex, size, capacity, isBounded } = snapshot;

  const totalSlots = isBounded ? capacity : Math.max(6, size + 1);
  const slotIndices = Array.from({ length: totalSlots }, (_, i) => i);

  const getItemStateClass = (state?: string) => {
    switch (state) {
      case 'enqueueing':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-300 animate-bounce-subtle';
      case 'dequeueing':
        return 'bg-rose-500 text-white border-rose-600 shadow-lg ring-2 ring-rose-300';
      case 'highlight':
        return 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300';
      case 'front':
        return 'bg-brand-600 text-white border-brand-700 shadow-md ring-2 ring-brand-300';
      case 'rear':
        return 'bg-indigo-600 text-white border-indigo-700 shadow-md ring-2 ring-indigo-300';
      default:
        return 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm';
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* Top Status & Flow Description */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <span className="font-semibold text-brand-600">FIFO Queue</span>
          <span>(First-In First-Out)</span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
            size >= capacity && isBounded
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-brand-50 text-brand-700 border-brand-200'
          }`}
        >
          {size} / {capacity} items {size >= capacity && isBounded ? '(FULL)' : ''}
        </div>
      </div>

      {/* Conveyor / Queue Channel */}
      <div className="w-full max-w-4xl overflow-x-auto pb-4">
        <div className="flex items-center justify-center gap-2 min-w-max px-4">
          {/* Dequeue Exit Indicator (LEFT) */}
          <div className="flex flex-col items-center text-rose-600 pr-2 border-r-2 border-dashed border-slate-300">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
              <LogOut className="w-3.5 h-3.5" />
              <span>Dequeue</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-rose-500 mt-1 animate-pulse" />
          </div>

          {/* Queue Slot Grid */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-100 border-y-4 border-slate-300 shadow-inner">
            {slotIndices.map((slotIdx) => {
              const item = items[slotIdx] ?? null;
              const isFront = slotIdx === frontIndex && size > 0;
              const isRear = slotIdx === rearIndex && size > 0;

              return (
                <div key={slotIdx} className="flex flex-col items-center min-w-[70px]">
                  <div className="h-7 flex flex-col items-center justify-end mb-1">
                    {isFront && isRear ? (
                      <span className="text-[10px] font-mono font-bold bg-brand-700 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                        <ArrowDown className="w-2.5 h-2.5" />
                        FR / RR
                      </span>
                    ) : isFront ? (
                      <span className="text-[10px] font-mono font-bold bg-brand-600 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                        <ArrowDown className="w-2.5 h-2.5" />
                        FRONT
                      </span>
                    ) : isRear ? (
                      <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded shadow-sm flex items-center gap-0.5">
                        <ArrowDown className="w-2.5 h-2.5" />
                        REAR
                      </span>
                    ) : null}
                  </div>

                  {/* Slot Box */}
                  {item ? (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                      className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center font-mono font-bold text-base transition-colors duration-200 ${getItemStateClass(
                        item.state
                      )}`}
                    >
                      <span>{item.value}</span>
                      {isFront && isRear && (
                        <span className="text-[8px] font-sans uppercase font-bold tracking-tighter opacity-80">
                          FR & RR
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 bg-white/60 flex items-center justify-center text-slate-300 font-mono text-xs">
                      -
                    </div>
                  )}

                  {/* Bottom Index */}
                  <span className="mt-1.5 text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                    [{slotIdx}]
                  </span>
                </div>
              );
            })}
          </div>

          {/* Enqueue Entrance Indicator (RIGHT) */}
          <div className="flex flex-col items-center text-emerald-600 pl-2 border-l-2 border-dashed border-slate-300">
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
              <LogIn className="w-3.5 h-3.5" />
              <span>Enqueue</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-emerald-500 mt-1 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Empty Notice */}
      {size === 0 && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Queue is currently empty (Front = -1, Rear = -1)</span>
        </div>
      )}
    </div>
  );
};
