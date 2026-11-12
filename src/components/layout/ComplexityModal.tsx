import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Table, BookOpen } from 'lucide-react';

interface ComplexityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RowItem {
  op: string;
  best: string;
  avg: string;
  worst: string;
  auxSpace: string;
  notes: string;
}

export const ComplexityModal: React.FC<ComplexityModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'll' | 'stack' | 'queue' | 'bst'>('all');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const stackRows: RowItem[] = [
    { op: 'Push', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Direct index write at top' },
    { op: 'Pop', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Removes top element directly' },
    { op: 'Peek / Top', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Reads top without mutation' },
    { op: 'Is Empty', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Checks top == -1' },
    { op: 'Is Full', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Checks top == capacity - 1' },
    { op: 'Display', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Scans from top down to index 0' },
  ];

  const queueRows: RowItem[] = [
    { op: 'Enqueue', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Circular rear wrap: (rear + 1) % capacity' },
    { op: 'Dequeue', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Circular front wrap: (front + 1) % capacity' },
    { op: 'Front / Peek', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Inspects slot at front index' },
    { op: 'Rear', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Inspects slot at rear index' },
    { op: 'Is Empty / Full', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Checks size == 0 or size == capacity' },
    { op: 'Display', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Walks active circular slots from front to rear' },
  ];

  const llRows: RowItem[] = [
    { op: 'Insert Beginning', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Updates head pointer directly' },
    { op: 'Insert End (with tail)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'Tail pointer avoids full traversal' },
    { op: 'Insert End (no tail)', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Must walk to the last node' },
    { op: 'Insert at Position k', best: 'O(1)', avg: 'O(k)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Traverses k - 1 links, then O(1) splice' },
    { op: 'Delete Beginning', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', auxSpace: 'O(1)', notes: 'head = head.next' },
    { op: 'Delete End (Singly)', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Must find predecessor of tail' },
    { op: 'Delete by Value', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Linear scan for target and predecessor' },
    { op: 'Search / Traverse', best: 'O(1) / O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Sequential walk from head' },
    { op: 'Reverse (In-Place)', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Reverses next pointers using 3 pointers' },
  ];

  const bstRows: RowItem[] = [
    { op: 'Insert Node', best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'O(log n) when balanced, O(n) when skewed' },
    { op: 'Search Node', best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Follows left/right branch per comparison' },
    { op: 'Delete Node', best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Search + optional in-order successor splice' },
    { op: 'In-order Traversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(h)', notes: 'Left -> Node -> Right (sorted output)' },
    { op: 'Pre-order Traversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(h)', notes: 'Node -> Left -> Right' },
    { op: 'Post-order Traversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(h)', notes: 'Left -> Right -> Node' },
    { op: 'Level Order (BFS)', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(w)', notes: 'FIFO queue bounded by max tree width w' },
    { op: 'Find Min / Max', best: 'O(1)', avg: 'O(log n)', worst: 'O(n)', auxSpace: 'O(1)', notes: 'Walks strictly left or right spine' },
    { op: 'Calculate Height', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', auxSpace: 'O(h)', notes: 'Post-order recursion across all nodes' },
  ];

  const renderTableSection = (title: string, rows: RowItem[], accentColor: string) => (
    <div className="mb-6 last:mb-0">
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-2.5 h-2.5 rounded-full ${accentColor}`}></span>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
            <tr>
              <th className="py-2.5 px-3">Operation</th>
              <th className="py-2.5 px-3">Best Case</th>
              <th className="py-2.5 px-3">Average Case</th>
              <th className="py-2.5 px-3">Worst Case</th>
              <th className="py-2.5 px-3">Aux Space</th>
              <th className="py-2.5 px-3">Mechanism</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-slate-800 font-sans">{row.op}</td>
                <td className="py-2.5 px-3 text-emerald-600 font-bold">{row.best}</td>
                <td className="py-2.5 px-3 text-brand-600 font-bold">{row.avg}</td>
                <td className="py-2.5 px-3 text-rose-600 font-bold">{row.worst}</td>
                <td className="py-2.5 px-3 text-slate-700 font-medium">{row.auxSpace}</td>
                <td className="py-2.5 px-3 text-slate-500 font-sans text-[11px]">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-700">
                  <Table className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Complexity Reference</h2>
                  <p className="text-xs text-slate-500">
                    Time and auxiliary space bounds for all implemented operations
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All Structures' },
                { id: 'll', label: 'Linked List' },
                { id: 'stack', label: 'Stack' },
                { id: 'queue', label: 'Queue' },
                { id: 'bst', label: 'Binary Search Tree' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setActiveTab(tab.id as 'all' | 'll' | 'stack' | 'queue' | 'bst')
                    }
                    className={`relative px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="complexityTabPill"
                        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        className="absolute inset-0 bg-brand-600 rounded-lg shadow-sm"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="bg-brand-50/60 p-4 rounded-xl border border-brand-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-brand-900 font-semibold">
                  <BookOpen className="w-4 h-4 text-brand-600" />
                  <span>Growth Order:</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-xs">
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">O(1)</span>
                  <span className="text-slate-400">&lt;</span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">O(log n)</span>
                  <span className="text-slate-400">&lt;</span>
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">O(n)</span>
                  <span className="text-slate-400">&lt;</span>
                  <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded">O(n²)</span>
                </div>
              </div>

              {(activeTab === 'all' || activeTab === 'll') &&
                renderTableSection('Linked List (Singly)', llRows, 'bg-emerald-500')}

              {(activeTab === 'all' || activeTab === 'stack') &&
                renderTableSection('Stack (LIFO)', stackRows, 'bg-brand-500')}

              {(activeTab === 'all' || activeTab === 'queue') &&
                renderTableSection('Queue (FIFO Circular)', queueRows, 'bg-cyan-500')}

              {(activeTab === 'all' || activeTab === 'bst') &&
                renderTableSection('Binary Search Tree (BST)', bstRows, 'bg-indigo-600')}
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Storage: all structures hold <strong className="text-slate-700">O(n)</strong> total
                space for n items.
              </span>
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
