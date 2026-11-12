import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LLStateSnapshot } from '../../types/linkedList';
import { ArrowDown, Link2 } from 'lucide-react';

interface LinkedListVisualizerProps {
  snapshot: LLStateSnapshot;
}

export const LinkedListVisualizer: React.FC<LinkedListVisualizerProps> = ({ snapshot }) => {
  const { nodes, headId, tailId } = snapshot;

  if (nodes.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3">
          <Link2 className="w-6 h-6 text-purple-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Linked List is Empty</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          HEAD points to <span className="font-mono font-semibold text-slate-700">null</span>.
          Use the operations panel to insert items or load a sample dataset.
        </p>
      </div>
    );
  }

  // State color mapping
  const getStateClasses = (state?: string) => {
    switch (state) {
      case 'active':
        return 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-100 ring-2 ring-brand-400';
      case 'comparing':
        return 'border-amber-500 bg-amber-50/60 shadow-md shadow-amber-100 ring-2 ring-amber-400 animate-pulse';
      case 'found':
        return 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-200 ring-2 ring-purple-500';
      case 'deleting':
        return 'border-rose-500 bg-rose-50 shadow-md shadow-rose-100 ring-2 ring-rose-400';
      case 'inserted':
        return 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100 ring-2 ring-emerald-400 animate-bounce-subtle';
      case 'secondary':
        return 'border-sky-400 bg-sky-50/50 ring-1 ring-sky-300';
      default:
        return 'border-slate-200 bg-white hover:border-slate-300 shadow-sm';
    }
  };

  return (
    <div className="w-full overflow-x-auto py-8 px-4">
      <div className="inline-flex items-center min-w-full justify-start sm:justify-center gap-3">
        <AnimatePresence mode="popLayout">
          {nodes.map((node, index) => {
            const isHead = node.id === headId;
            const isTail = node.id === tailId;
            const nextNode = index < nodes.length - 1 ? nodes[index + 1] : null;
            const pointsForward = Boolean(nextNode && node.nextId === nextNode.id);
            const pointsBackward = Boolean(nextNode && nextNode.nextId === node.id);

            return (
              <motion.div
                key={node.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                className="flex items-center gap-3"
              >
                <div className="flex flex-col items-center">
                  <div className="h-9 flex flex-col items-center justify-end mb-1">
                    {node.highlightLabel && (
                      <div className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce-subtle">
                        <span>{node.highlightLabel}</span>
                      </div>
                    )}
                    {isHead && !node.highlightLabel?.includes('HEAD') && (
                      <div className="flex items-center gap-0.5 text-[10px] font-mono font-bold bg-brand-700 text-white px-2 py-0.5 rounded-md shadow-sm">
                        <ArrowDown className="w-2.5 h-2.5" />
                        <span>HEAD</span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex rounded-xl border-2 transition-all duration-300 overflow-hidden ${getStateClasses(
                      node.state
                    )}`}
                  >
                    <div className="px-3 py-2.5 min-w-[54px] text-center font-mono font-bold text-slate-800 text-base flex flex-col items-center justify-center border-r border-inherit">
                      <span>{node.value}</span>
                      <span className="text-[9px] font-sans font-normal text-slate-400">val</span>
                    </div>

                    <div className="px-2.5 py-2.5 bg-slate-50/70 flex flex-col items-center justify-center min-w-[36px]">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-600 ring-2 ring-brand-200"></div>
                      <span className="text-[9px] font-sans font-medium text-slate-400 mt-1">next</span>
                    </div>
                  </div>

                  <div className="mt-1.5 flex flex-col items-center">
                    <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      [{index}]
                    </span>
                    {isTail && (
                      <span className="mt-1 text-[9px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                        TAIL
                      </span>
                    )}
                  </div>
                </div>

                {nextNode ? (
                  pointsForward ? (
                    <div className="flex items-center text-brand-500 px-1">
                      <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                        <line
                          x1="2"
                          y1="12"
                          x2="24"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <polyline
                          points="18,6 25,12 18,18"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : pointsBackward ? (
                    <div className="flex items-center text-indigo-600 px-1">
                      <svg className="w-8 h-6" viewBox="0 0 32 24" fill="none">
                        <line
                          x1="30"
                          y1="12"
                          x2="8"
                          y2="12"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                        <polyline
                          points="14,6 7,12 14,18"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ) : node.nextId === null ? (
                    <div className="flex items-center px-1">
                      <span className="px-2 py-1 bg-slate-200/90 text-slate-600 rounded-md text-[10px] font-mono font-bold border border-slate-300">
                        NULL
                      </span>
                    </div>
                  ) : (
                    <div className="w-6 flex items-center justify-center">
                      <div className="h-6 border-l-2 border-dashed border-slate-300" />
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1 pl-1">
                    <svg className="w-6 h-6 text-slate-400" viewBox="0 0 24 24" fill="none">
                      <line x1="2" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <polyline points="12,8 16,12 12,16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="px-2.5 py-1.5 bg-slate-200/90 text-slate-600 rounded-lg text-xs font-mono font-bold border border-slate-300 shadow-inner">
                      NULL
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
