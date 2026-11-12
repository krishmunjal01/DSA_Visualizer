import React, { useState } from 'react';
import {
  PlusCircle,
  Trash2,
  Search,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface LinkedListPanelProps {
  onInsertBeginning: (val: number) => void;
  onInsertEnd: (val: number) => void;
  onInsertPosition: (val: number, pos: number) => void;
  onDeleteBeginning: () => void;
  onDeleteEnd: () => void;
  onDeleteValue: (val: number) => void;
  onSearch: (val: number) => void;
  onTraverse: () => void;
  onReverse: () => void;
  onClear: () => void;
  onLoadSample: (sampleKey: string) => void;
  isAnimating: boolean;
  listSize: number;
}

export const LinkedListPanel: React.FC<LinkedListPanelProps> = ({
  onInsertBeginning,
  onInsertEnd,
  onInsertPosition,
  onDeleteBeginning,
  onDeleteEnd,
  onDeleteValue,
  onSearch,
  onTraverse,
  onReverse,
  onClear,
  onLoadSample,
  isAnimating,
  listSize,
}) => {
  const [insertVal, setInsertVal] = useState<string>('25');
  const [insertPos, setInsertPos] = useState<string>('1');
  const [deleteVal, setDeleteVal] = useState<string>('20');
  const [searchVal, setSearchVal] = useState<string>('30');

  const handleInsertBeginning = () => {
    const val = parseInt(insertVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onInsertBeginning(val);
  };

  const handleInsertEnd = () => {
    const val = parseInt(insertVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onInsertEnd(val);
  };

  const handleInsertPosition = () => {
    const val = parseInt(insertVal, 10);
    const pos = parseInt(insertPos, 10);
    if (isNaN(val) || isNaN(pos)) return;
    sound.playClick();
    onInsertPosition(val, pos);
  };

  const handleDeleteValue = () => {
    const val = parseInt(deleteVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onDeleteValue(val);
  };

  const handleSearch = () => {
    const val = parseInt(searchVal, 10);
    if (isNaN(val)) return;
    sound.playClick();
    onSearch(val);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Insertion Operations</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <label className="text-[11px] font-medium text-slate-500">Value</label>
            <input
              type="number"
              value={insertVal}
              onChange={(e) => setInsertVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsertEnd()}
              placeholder="Value"
              disabled={isAnimating}
              className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500">Position (0-indexed)</label>
            <input
              type="number"
              value={insertPos}
              min="0"
              max={listSize}
              onChange={(e) => setInsertPos(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleInsertPosition()}
              placeholder={`0 to ${listSize}`}
              disabled={isAnimating}
              className="w-full mt-0.5 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
          <button
            onClick={handleInsertBeginning}
            disabled={isAnimating || !insertVal}
            className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Insert Beginning
          </button>
          <button
            onClick={handleInsertEnd}
            disabled={isAnimating || !insertVal}
            className="px-2 py-1.5 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Insert End
          </button>
          <button
            onClick={handleInsertPosition}
            disabled={isAnimating || !insertVal || !insertPos}
            className="px-2 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Insert at Pos
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Deletion Operations</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onDeleteBeginning();
            }}
            disabled={isAnimating || listSize === 0}
            className="px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Delete Beginning
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onDeleteEnd();
            }}
            disabled={isAnimating || listSize === 0}
            className="px-2.5 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Delete End
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={deleteVal}
            onChange={(e) => setDeleteVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleDeleteValue()}
            placeholder="Target value"
            disabled={isAnimating || listSize === 0}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <button
            onClick={handleDeleteValue}
            disabled={isAnimating || listSize === 0 || !deleteVal}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Delete by Value
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          <Search className="w-3.5 h-3.5 text-brand-600" />
          <span>Search & Traversal</span>
        </div>

        <div className="flex items-center gap-1.5 mb-2">
          <input
            type="number"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search key"
            disabled={isAnimating || listSize === 0}
            className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleSearch}
            disabled={isAnimating || listSize === 0 || !searchVal}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            Search
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onTraverse();
            }}
            disabled={isAnimating || listSize === 0}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Eye className="w-3 h-3 text-brand-600" />
            Traverse
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onReverse();
            }}
            disabled={isAnimating || listSize === 0}
            className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-slate-700 hover:text-purple-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3 h-3 text-purple-600" />
            Reverse List
          </button>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onLoadSample('default')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-brand-700 hover:bg-brand-50 px-2 py-1 rounded-md border border-brand-200"
          >
            Sample [10→20→30→40]
          </button>
          <button
            onClick={() => onLoadSample('random')}
            disabled={isAnimating}
            className="text-[11px] font-medium text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-200"
          >
            Random 5
          </button>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClear();
          }}
          disabled={isAnimating || listSize === 0}
          className="text-[11px] font-medium text-rose-600 hover:bg-rose-50 px-2 py-1 rounded-md border border-rose-200 disabled:opacity-40"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};
