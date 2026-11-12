import React, { useState } from 'react';
import {
  LogIn,
  LogOut,
  Eye,
  Settings2,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface QueuePanelProps {
  onEnqueue: (val: number | string) => void;
  onDequeue: () => void;
  onFront: () => void;
  onRear: () => void;
  onIsEmpty: () => void;
  onIsFull: () => void;
  onDisplay: () => void;
  onSetCapacity: (cap: number) => void;
  onClear: () => void;
  onLoadSample: (key: string) => void;
  isAnimating: boolean;
  queueSize: number;
  capacity: number;
}

export const QueuePanel: React.FC<QueuePanelProps> = ({
  onEnqueue,
  onDequeue,
  onFront,
  onRear,
  onIsEmpty,
  onIsFull,
  onDisplay,
  onSetCapacity,
  onClear,
  onLoadSample,
  isAnimating,
  queueSize,
  capacity,
}) => {
  const [enqueueVal, setEnqueueVal] = useState<string>('50');

  const handleEnqueue = () => {
    if (!enqueueVal.trim()) return;
    sound.playClick();
    onEnqueue(isNaN(Number(enqueueVal)) ? enqueueVal : Number(enqueueVal));
  };

  const handleCapacityChange = (newCap: number) => {
    const val = Math.max(3, Math.min(10, newCap));
    sound.playClick();
    onSetCapacity(val);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
            Enqueue Element
          </span>
          <span className="text-[11px] font-mono text-slate-400">Append at Rear</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={enqueueVal}
            onChange={(e) => setEnqueueVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnqueue()}
            placeholder="Value to enqueue"
            disabled={isAnimating}
            className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleEnqueue}
            disabled={isAnimating || !enqueueVal.trim()}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <span>Enqueue</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            Dequeue & Inspect
          </span>
          <span className="text-[11px] font-mono text-slate-400">FIFO Removal</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onDequeue();
            }}
            disabled={isAnimating || queueSize === 0}
            className="px-2 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Dequeue()</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onFront();
            }}
            disabled={isAnimating || queueSize === 0}
            className="px-2 py-2 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-brand-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Front()</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRear();
            }}
            disabled={isAnimating || queueSize === 0}
            className="px-2 py-2 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-indigo-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Rear()</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Queue Status Queries
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onIsEmpty();
            }}
            disabled={isAnimating}
            className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Is Empty?
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onIsFull();
            }}
            disabled={isAnimating}
            className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            Is Full?
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onDisplay();
            }}
            disabled={isAnimating || queueSize === 0}
            className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Display
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Max Capacity:</span>
        </div>
        <div className="flex items-center gap-1.5">
          {[5, 7, 9].map((cap) => (
            <button
              key={cap}
              onClick={() => handleCapacityChange(cap)}
              disabled={isAnimating || cap < queueSize}
              className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-40 ${
                capacity === cap
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cap}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onLoadSample('sample')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-md border border-brand-200"
          >
            Sample [12, 24, 36]
          </button>
          <button
            onClick={() => onLoadSample('fill')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
          >
            Fill to Limit
          </button>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClear();
          }}
          disabled={isAnimating || queueSize === 0}
          className="text-[11px] font-medium text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md border border-rose-200 disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
