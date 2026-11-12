import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HistoryItem } from '../../types/dsa';
import { History, Undo2, CheckCircle2, XCircle, Trash2, Clock } from 'lucide-react';

interface HistoryDrawerProps {
  history: HistoryItem[];
  onUndo: () => void;
  onClearHistory: () => void;
  canUndo: boolean;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onUndo,
  onClearHistory,
  canUndo,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-brand-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Operation History ({history.length})
          </h4>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo last mutating operation"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 disabled:opacity-40 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear history log"
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 text-center">No operations recorded yet.</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {history.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="flex items-start gap-2 min-w-0">
                  {item.success ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 text-rose-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-mono font-bold text-slate-800 text-[11px] truncate">
                      {item.operationName}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{item.description}</div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5 shrink-0">
                  <Clock className="w-2.5 h-2.5" />
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
