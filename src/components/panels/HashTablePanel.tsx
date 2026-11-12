import React, { useState } from 'react';
import { CollisionMode } from '../../types/hashTable';
import { sound } from '../common/SoundEffects';
import { Plus, Search, Trash2, Settings2, RotateCcw, Database } from 'lucide-react';

interface HashTablePanelProps {
  onInsert: (key: number, value?: string) => void;
  onSearch: (key: number) => void;
  onDelete: (key: number) => void;
  onReconfigure: (capacity: number, mode: CollisionMode) => void;
  onLoadSample: (key: string) => void;
  onClear: () => void;
  isAnimating: boolean;
  capacity: number;
  mode: CollisionMode;
  size: number;
}

export const HashTablePanel: React.FC<HashTablePanelProps> = ({
  onInsert,
  onSearch,
  onDelete,
  onReconfigure,
  onLoadSample,
  onClear,
  isAnimating,
  capacity,
  mode,
  size,
}) => {
  const [keyInput, setKeyInput] = useState('24');
  const [valInput, setValInput] = useState('');
  const [queryKey, setQueryKey] = useState('17');

  const parseKey = (raw: string): number | null => {
    const parsed = Number(raw.trim());
    if (!raw.trim() || !Number.isFinite(parsed)) return null;
    return Math.trunc(parsed);
  };

  const handleInsert = () => {
    const k = parseKey(keyInput);
    if (k === null) return;
    sound.playClick();
    onInsert(k, valInput.trim() || undefined);
  };

  const handleSearch = () => {
    const k = parseKey(queryKey);
    if (k === null) return;
    sound.playClick();
    onSearch(k);
  };

  const handleDelete = () => {
    const k = parseKey(queryKey);
    if (k === null) return;
    sound.playClick();
    onDelete(k);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-600" />
            Insert Key
          </span>
          <span className="text-[11px] font-mono text-slate-400">h(k) = k mod {capacity}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Integer key"
            disabled={isAnimating}
            className="px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <input
            type="text"
            value={valInput}
            onChange={(e) => setValInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleInsert()}
            placeholder="Value (optional)"
            disabled={isAnimating}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <button
          onClick={handleInsert}
          disabled={isAnimating || parseKey(keyInput) === null}
          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
        >
          Insert into Table
        </button>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand-600" />
            Lookup / Remove
          </span>
          <span className="text-[11px] font-mono text-slate-400">{size} stored</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={queryKey}
            onChange={(e) => setQueryKey(e.target.value)}
            placeholder="Key"
            disabled={isAnimating}
            className="flex-1 px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={handleSearch}
            disabled={isAnimating || parseKey(queryKey) === null}
            className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" /> Search
          </button>
          <button
            onClick={handleDelete}
            disabled={isAnimating || parseKey(queryKey) === null}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-40 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          Collision & Table Size
        </div>

        <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
          {(['chaining', 'linear-probing'] as CollisionMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                onReconfigure(capacity, m);
              }}
              disabled={isAnimating}
              className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === m
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {m === 'chaining' ? 'Chaining' : 'Linear Probing'}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-600">Buckets (m)</span>
          <div className="flex items-center gap-1.5">
            {[7, 11, 13].map((cap) => (
              <button
                key={cap}
                onClick={() => {
                  sound.playClick();
                  onReconfigure(cap, mode);
                }}
                disabled={isAnimating}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border transition-colors ${
                  capacity === cap
                    ? 'bg-brand-50 text-brand-700 border-brand-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cap}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => {
            sound.playClick();
            onLoadSample('collisions');
          }}
          disabled={isAnimating}
          className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <Database className="w-3.5 h-3.5 text-brand-600" />
          Collision Sample
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

