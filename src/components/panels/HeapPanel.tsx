import React, { useState } from 'react';
import { HeapMode, HeapOrder } from '../../types/heap';
import { sound } from '../common/SoundEffects';
import { Plus, ArrowUpRight, Eye, Settings2, RotateCcw, Database } from 'lucide-react';

interface HeapPanelProps {
  mode: HeapMode;
  order: HeapOrder;
  size: number;
  isAnimating: boolean;
  onInsert: (priority: number, label?: string) => void;
  onExtractTop: () => void;
  onPeekTop: () => void;
  onOrderChange: (order: HeapOrder) => void;
  onLoadSample: () => void;
  onClear: () => void;
}

export const HeapPanel: React.FC<HeapPanelProps> = ({
  mode,
  order,
  size,
  isAnimating,
  onInsert,
  onExtractTop,
  onPeekTop,
  onOrderChange,
  onLoadSample,
  onClear,
}) => {
  const [priorityInput, setPriorityInput] = useState('15');
  const [taskLabel, setTaskLabel] = useState(mode === 'priority-queue' ? 'Batch Job' : '');

  const parsedPriority = Number(priorityInput.trim());
  const validPriority = priorityInput.trim() !== '' && Number.isFinite(parsedPriority);

  const handleInsert = () => {
    if (!validPriority) return;
    sound.playClick();
    onInsert(Math.trunc(parsedPriority), mode === 'priority-queue' ? taskLabel.trim() || undefined : undefined);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            {mode === 'priority-queue' ? 'Enqueue Priority Item' : 'Insert Value'}
          </span>
          <span className="text-[11px] font-mono text-slate-400">O(log n)</span>
        </div>

        {mode === 'priority-queue' ? (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={priorityInput}
              onChange={(e) => setPriorityInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
              placeholder="Priority"
              disabled={isAnimating}
              className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              type="text"
              value={taskLabel}
              onChange={(e) => setTaskLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
              placeholder="Task label"
              disabled={isAnimating}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ) : (
          <input
            type="number"
            value={priorityInput}
            onChange={(e) => setPriorityInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Integer value"
            disabled={isAnimating}
            className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        )}

        <button
          onClick={handleInsert}
          disabled={isAnimating || !validPriority}
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
        >
          {mode === 'priority-queue' ? 'Enqueue' : 'Insert & Sift Up'}
        </button>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Root Operations
          </span>
          <span className="text-[11px] font-mono text-slate-400">{size} items</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onExtractTop();
            }}
            disabled={isAnimating || size === 0}
            className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            {mode === 'priority-queue' ? 'Dequeue' : `Extract ${order === 'min' ? 'Min' : 'Max'}`}
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onPeekTop();
            }}
            disabled={isAnimating || size === 0}
            className="py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors disabled:opacity-40"
          >
            <Eye className="w-3.5 h-3.5" />
            Peek Top
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          Heap Order
        </div>

        <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
          {(['min', 'max'] as HeapOrder[]).map((ord) => (
            <button
              key={ord}
              onClick={() => {
                sound.playClick();
                onOrderChange(ord);
              }}
              disabled={isAnimating}
              className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                order === ord
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {ord === 'min' ? 'Min-Heap' : 'Max-Heap'}
            </button>
          ))}
        </div>
        {mode === 'priority-queue' && (
          <p className="text-[11px] text-slate-500">
            Min-Heap dispatches lowest priority number first (e.g. P1 critical); Max-Heap dispatches highest score first.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => {
            sound.playClick();
            onLoadSample();
          }}
          disabled={isAnimating}
          className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Database className="w-3.5 h-3.5 text-brand-600" />
          Sample Data
        </button>
        <button
          onClick={() => {
            sound.playClick();
            onClear();
          }}
          disabled={isAnimating}
          className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
    </div>
  );
};

