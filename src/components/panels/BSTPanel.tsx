import React, { useState } from 'react';
import {
  PlusCircle,
  ArrowDown,
  ArrowUp,
  Maximize2,
  Eye,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface BSTPanelProps {
  onInsert: (val: number) => void;
  onDelete: (val: number) => void;
  onSearch: (val: number) => void;
  onInorder: () => void;
  onPreorder: () => void;
  onPostorder: () => void;
  onLevelOrder: () => void;
  onFindMin: () => void;
  onFindMax: () => void;
  onCalculateHeight: () => void;
  onClear: () => void;
  onLoadSample: (key: string) => void;
  onBulkInsert: (values: number[]) => void;
  isAnimating: boolean;
  treeSize: number;
}

export const BSTPanel: React.FC<BSTPanelProps> = ({
  onInsert,
  onDelete,
  onSearch,
  onInorder,
  onPreorder,
  onPostorder,
  onLevelOrder,
  onFindMin,
  onFindMax,
  onCalculateHeight,
  onClear,
  onLoadSample,
  onBulkInsert,
  isAnimating,
  treeSize,
}) => {
  const [insertVal, setInsertVal] = useState<string>('35');
  const [deleteVal, setDeleteVal] = useState<string>('20');
  const [searchVal, setSearchVal] = useState<string>('40');
  const [bulkInput, setBulkInput] = useState<string>('');

  const handleInsert = () => {
    const val = parseInt(insertVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onInsert(val);
  };

  const handleDelete = () => {
    const val = parseInt(deleteVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onDelete(val);
  };

  const handleSearch = () => {
    const val = parseInt(searchVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onSearch(val);
  };

  const handleBulkSubmit = () => {
    const numbers = bulkInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    if (numbers.length === 0) return;
    sound.playClick();
    onBulkInsert(numbers);
    setBulkInput('');
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Core Node Operations</span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={insertVal}
            onChange={(e) => setInsertVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Node value"
            disabled={isAnimating}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleInsert}
            disabled={isAnimating || !insertVal}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Insert Node
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={deleteVal}
            onChange={(e) => setDeleteVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDelete()}
            placeholder="Node to delete"
            disabled={isAnimating || treeSize === 0}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={handleDelete}
            disabled={isAnimating || treeSize === 0 || !deleteVal}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Delete Node
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Target key"
            disabled={isAnimating || treeSize === 0}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleSearch}
            disabled={isAnimating || treeSize === 0 || !searchVal}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Search Node
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            <Eye className="w-3.5 h-3.5 text-brand-600" />
            Tree Traversals
          </span>
          <span className="text-[10px] text-slate-500 font-mono">O(n) Time</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onInorder();
            }}
            disabled={isAnimating || treeSize === 0}
            title="Left -> Root -> Right (produces sorted order)"
            className="px-2.5 py-1.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 text-left"
          >
            <span className="font-semibold">In-order</span> (L-Ro-R)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onPreorder();
            }}
            disabled={isAnimating || treeSize === 0}
            title="Root -> Left -> Right"
            className="px-2.5 py-1.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 text-left"
          >
            <span className="font-semibold">Pre-order</span> (Ro-L-R)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onPostorder();
            }}
            disabled={isAnimating || treeSize === 0}
            title="Left -> Right -> Root"
            className="px-2.5 py-1.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 text-left"
          >
            <span className="font-semibold">Post-order</span> (L-R-Ro)
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onLevelOrder();
            }}
            disabled={isAnimating || treeSize === 0}
            title="Breadth-First Search level by level"
            className="px-2.5 py-1.5 bg-white hover:bg-brand-50 border border-slate-200 hover:border-brand-200 text-brand-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 text-left"
          >
            <span className="font-semibold">Level Order</span> (BFS)
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Tree Properties & Metrics
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onFindMin();
            }}
            disabled={isAnimating || treeSize === 0}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <ArrowDown className="w-3 h-3 text-emerald-600" />
            Find Min
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onFindMax();
            }}
            disabled={isAnimating || treeSize === 0}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <ArrowUp className="w-3 h-3 text-indigo-600" />
            Find Max
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onCalculateHeight();
            }}
            disabled={isAnimating || treeSize === 0}
            className="flex items-center justify-center gap-1 px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Maximize2 className="w-3 h-3 text-purple-600" />
            Height
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onLoadSample('balanced')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-md border border-brand-200"
          >
            Balanced [50, 30, 70, 20, 40, 60, 80]
          </button>
          <button
            onClick={() => onLoadSample('random')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
          >
            Random 7
          </button>
          <button
            onClick={() => onLoadSample('skewed')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-amber-700 hover:bg-amber-50 px-2 py-1 rounded-md border border-amber-200"
          >
            Skewed Chain
          </button>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleBulkSubmit()}
            placeholder="Custom: 45, 12, 88, 34"
            disabled={isAnimating}
            className="flex-1 px-2.5 py-1 text-xs font-mono bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          <button
            onClick={handleBulkSubmit}
            disabled={isAnimating || !bulkInput.trim()}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-medium disabled:opacity-40"
          >
            Build
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClear();
            }}
            disabled={isAnimating || treeSize === 0}
            className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-md text-xs font-medium border border-rose-200 disabled:opacity-40"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
