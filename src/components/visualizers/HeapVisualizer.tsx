import React from 'react';
import { motion } from 'framer-motion';
import { HeapStateSnapshot, HeapItemState } from '../../types/heap';
import { GitFork } from 'lucide-react';

interface HeapVisualizerProps {
  snapshot: HeapStateSnapshot;
}

const NODE_STYLE_MAP: Record<HeapItemState, { fill: string; stroke: string; text: string }> = {
  default: { fill: '#ffffff', stroke: '#cbd5e1', text: '#0f172a' },
  active: { fill: '#2563eb', stroke: '#1d4ed8', text: '#ffffff' },
  comparing: { fill: '#f59e0b', stroke: '#d97706', text: '#ffffff' },
  swapping: { fill: '#ea580c', stroke: '#c2410c', text: '#ffffff' },
  inserted: { fill: '#10b981', stroke: '#059669', text: '#ffffff' },
  extracting: { fill: '#f43f5e', stroke: '#e11d48', text: '#ffffff' },
};

const ARRAY_CHIP_MAP: Record<HeapItemState, string> = {
  default: 'bg-white border-slate-200 text-slate-800',
  active: 'bg-brand-600 border-brand-700 text-white',
  comparing: 'bg-amber-500 border-amber-600 text-white',
  swapping: 'bg-orange-500 border-orange-600 text-white',
  inserted: 'bg-emerald-600 border-emerald-700 text-white',
  extracting: 'bg-rose-600 border-rose-700 text-white',
};

export const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ snapshot }) => {
  const { items, order, mode, size } = snapshot;

  if (size === 0 || items.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-3">
          <GitFork className="w-6 h-6 text-brand-500" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">
          {mode === 'priority-queue' ? 'Priority Queue is Empty' : 'Binary Heap is Empty'}
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Insert elements on the right or load a sample to inspect both the complete binary tree and its backing array.
        </p>
      </div>
    );
  }

  const maxY = Math.max(...items.map((n) => n.y ?? 60)) + 56;
  const svgHeight = Math.max(250, maxY);

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-brand-600" />
            {mode === 'priority-queue' ? 'Priority Queue' : 'Binary Heap'}
          </span>
          <span className="bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold">
            {order === 'min' ? 'MIN-HEAP (Root = Min)' : 'MAX-HEAP (Root = Max)'}
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            Size: <strong className="text-brand-700">{size}</strong>
          </span>
        </div>

        <span className="text-[11px] font-mono text-slate-400">
          parent(i) = floor((i - 1) / 2)
        </span>
      </div>

      <div className="w-full overflow-x-auto bg-slate-50/40 border border-slate-200/70 rounded-xl p-2">
        <svg viewBox={`0 0 760 ${svgHeight}`} className="w-full h-auto min-w-[540px]">
          {items.map((item, idx) => {
            if (idx === 0) return null;
            const parentIdx = Math.floor((idx - 1) / 2);
            const parent = items[parentIdx];
            if (!parent) return null;

            return (
              <line
                key={`edge-${parent.id}-${item.id}`}
                x1={parent.x ?? 380}
                y1={parent.y ?? 50}
                x2={item.x ?? 380}
                y2={item.y ?? 120}
                stroke="#cbd5e1"
                strokeWidth="2"
              />
            );
          })}

          {items.map((item, idx) => {
            const x = item.x ?? 380;
            const y = item.y ?? 60;
            const style = NODE_STYLE_MAP[item.state ?? 'default'];

            return (
              <g key={item.id}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={22}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={2.5}
                  initial={false}
                  animate={{ cx: x, cy: y }}
                  transition={{ duration: 0.25 }}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fill={style.text}
                  className="text-xs font-mono font-bold select-none"
                >
                  {item.priority}
                </text>
                <text
                  x={x}
                  y={y - 27}
                  textAnchor="middle"
                  fill="#64748b"
                  className="text-[10px] font-mono select-none"
                >
                  [{idx}]
                </text>
                {item.label && (
                  <text
                    x={x}
                    y={y + 37}
                    textAnchor="middle"
                    fill="#334155"
                    className="text-[10px] font-medium select-none"
                  >
                    {item.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Backing Array Representation (Level-Order)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            left = 2i + 1 | right = 2i + 2
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => {
            const chipCls = ARRAY_CHIP_MAP[item.state ?? 'default'];
            return (
              <div
                key={`arr-${item.id}`}
                className={`px-2.5 py-1.5 rounded-lg border font-mono text-xs flex flex-col items-center min-w-[52px] transition-colors ${chipCls}`}
              >
                <span className="text-[10px] opacity-70">i={idx}</span>
                <span className="font-bold">{item.priority}</span>
                {item.label && <span className="text-[9px] truncate max-w-[74px]">{item.label}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Comparing
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" /> Swapping
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Inserted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Extracting Root
        </span>
      </div>
    </div>
  );
};

