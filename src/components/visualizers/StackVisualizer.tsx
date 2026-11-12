import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StackStateSnapshot } from '../../types/stack';
import { ArrowLeft, Layers, AlertCircle } from 'lucide-react';

interface StackVisualizerProps {
  snapshot: StackStateSnapshot;
}

export const StackVisualizer: React.FC<StackVisualizerProps> = ({ snapshot }) => {
  const { items, topIndex, capacity, isBounded } = snapshot;

  const totalSlots = isBounded
    ? Math.max(capacity, items.length)
    : Math.max(7, items.length + 1);

  // Array of indices from top capacity down to 0
  const slotIndices = Array.from({ length: totalSlots }, (_, i) => totalSlots - 1 - i);

  const getItemStateClass = (state?: string) => {
    switch (state) {
      case 'pushing':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-lg ring-2 ring-emerald-300 animate-bounce-subtle';
      case 'popping':
        return 'bg-rose-500 text-white border-rose-600 shadow-lg ring-2 ring-rose-300';
      case 'peeking':
        return 'bg-purple-600 text-white border-purple-700 shadow-lg ring-2 ring-purple-300 animate-pulse';
      case 'highlight':
        return 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300';
      case 'top':
        return 'bg-brand-600 text-white border-brand-700 shadow-md ring-2 ring-brand-300';
      default:
        return 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 shadow-sm';
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4">
      {/* Top Status & Capacity Pill */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Layers className="w-3.5 h-3.5 text-brand-600" />
          <span>LIFO Stack Structure</span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
            items.length >= capacity && isBounded
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-brand-50 text-brand-700 border-brand-200'
          }`}
        >
          {items.length} / {capacity} items {items.length >= capacity && isBounded ? '(FULL)' : ''}
        </div>
      </div>

      {/* Main Stack Container with U-shape */}
      <div className="relative flex items-center justify-center">
        {/* The Glass Cylinder / Stack Box */}
        <div className="w-64 border-x-4 border-b-4 border-slate-300 rounded-b-2xl p-2 bg-gradient-to-b from-slate-50/20 to-slate-100/60 flex flex-col justify-end min-h-[340px]">
          {/* Top opening indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
            Push / Pop (Top)
          </div>

          <div className="space-y-2 flex flex-col justify-end">
            {slotIndices.map((slotIdx) => {
              const item = items[slotIdx];
              const isTop = slotIdx === topIndex;

              return (
                <div key={slotIdx} className="relative flex items-center">
                  {/* Left Index Marker */}
                  <div className="w-8 text-right pr-2 font-mono text-[11px] font-semibold text-slate-400 select-none">
                    [{slotIdx}]
                  </div>

                  {/* Slot element or empty slot */}
                  {item ? (
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -18, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -16, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                        className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border-2 font-mono font-bold text-sm transition-colors duration-200 ${getItemStateClass(
                          item.state
                        )}`}
                      >
                        <span className="text-base">{item.value}</span>
                        {isTop && (
                          <span className="text-[10px] font-sans uppercase tracking-wider px-1.5 py-0.5 bg-black/20 rounded font-semibold">
                            TOP
                          </span>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <div className="flex-1 flex items-center justify-center py-2 rounded-xl border-2 border-dashed border-slate-200 text-slate-300 text-xs font-mono select-none">
                      Empty Slot
                    </div>
                  )}

                  {/* Right TOP Pointer Tag */}
                  <div className="w-24 pl-3 flex items-center">
                    {isTop && (
                      <motion.div
                        layoutId="stackTopPointer"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="flex items-center gap-1 bg-brand-600 text-white text-[11px] font-mono font-bold px-2 py-1 rounded-lg shadow-sm"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>TOP</span>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Solid Base Plate */}
          <div className="w-full h-2 bg-slate-400/80 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Underflow / Empty Notice if empty */}
      {items.length === 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>TOP = -1 (Stack is empty)</span>
        </div>
      )}
    </div>
  );
};
