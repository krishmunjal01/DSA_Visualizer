import React, { useState } from 'react';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Eye,
  Settings2,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface StackPanelProps {
  onPush: (val: number | string) => void;
  onPop: () => void;
  onPeek: () => void;
  onIsEmpty: () => void;
  onIsFull: () => void;
  onDisplay: () => void;
  onSetCapacity: (cap: number) => void;
  onClear: () => void;
  onLoadSample: (key: string) => void;
  isAnimating: boolean;
  stackSize: number;
  capacity: number;
}

export const StackPanel: React.FC<StackPanelProps> = ({
  onPush,
  onPop,
  onPeek,
  onIsEmpty,
  onIsFull,
  onDisplay,
  onSetCapacity,
  onClear,
  onLoadSample,
  isAnimating,
  stackSize,
  capacity,
}) => {
  const [pushVal, setPushVal] = useState<string>('45');

  const handlePush = () => {
    if (!pushVal.trim()) return;
    sound.playClick();
    onPush(isNaN(Number(pushVal)) ? pushVal : Number(pushVal));
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
            <ArrowDownToLine className="w-3.5 h-3.5 text-emerald-600" />
            Push Element
          </span>
          <span className="text-[11px] font-mono text-slate-400">LIFO Insertion</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={pushVal}
            onChange={(e) => setPushVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handlePush()}
            placeholder="Value to push"
            disabled={isAnimating}
            className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handlePush}
            disabled={isAnimating || !pushVal.trim()}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <span>Push</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <ArrowUpFromLine className="w-3.5 h-3.5 text-rose-600" />
            Pop & Inspect
          </span>
          <span className="text-[11px] font-mono text-slate-400">Access Top</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onPop();
            }}
            disabled={isAnimating || stackSize === 0}
            className="px-3 py-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <ArrowUpFromLine className="w-3.5 h-3.5" />
            <span>Pop()</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onPeek();
            }}
            disabled={isAnimating || stackSize === 0}
            className="px-3 py-2 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Peek() / Top</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Stack Status Queries
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
            disabled={isAnimating || stackSize === 0}
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
              disabled={isAnimating || cap < stackSize}
              className={`px-2 py-0.5 rounded text-xs font-mono font-semibold transition-colors disabled:opacity-40 ${capacity === cap
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
            Sample [10, 20, 30]
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
          disabled={isAnimating || stackSize === 0}
          className="text-[11px] font-medium text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md border border-rose-200 disabled:opacity-40"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
