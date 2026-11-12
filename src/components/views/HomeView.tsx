import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppView, DSAType } from '../../types/dsa';
import {
  Link2,
  Layers,
  ArrowRightLeft,
  GitBranch,
  Hash,
  GitFork,
  ListOrdered,
  Share2,
  BarChart3,
  GitCompare,
  MapPin,
  ArrowRight,
  Play,
  RotateCcw,
  Plus,
  Minus,
  Code2,
  Cpu,
  Table,
  ChevronRight,
} from 'lucide-react';
import { sound } from '../common/SoundEffects';

interface HomeViewProps {
  onSelectDS: (view: AppView) => void;
  onOpenComplexity: () => void;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export const HomeView: React.FC<HomeViewProps> = ({ onSelectDS, onOpenComplexity }) => {
  const [previewTab, setPreviewTab] = useState<'linked-list' | 'stack' | 'bst'>('linked-list');
  const [demoList, setDemoList] = useState<number[]>([10, 20, 30, 40]);
  const [listReversed, setListReversed] = useState(false);
  const [demoStack, setDemoStack] = useState<number[]>([15, 30, 45]);
  const [bstHighlightIdx, setBstHighlightIdx] = useState<number>(0);

  const inorderOrder = [20, 30, 40, 50, 60, 70, 80];

  const handleToggleReverseDemo = () => {
    sound.playClick();
    setDemoList((prev) => [...prev].reverse());
    setListReversed((prev) => !prev);
  };

  const handleStackPush = () => {
    if (demoStack.length >= 5) return;
    sound.playClick();
    const nextVal = (demoStack[demoStack.length - 1] ?? 0) + 15;
    setDemoStack((prev) => [...prev, nextVal]);
  };

  const handleStackPop = () => {
    if (demoStack.length === 0) return;
    sound.playClick();
    setDemoStack((prev) => prev.slice(0, -1));
  };

  const handleStepBstInorder = () => {
    sound.playClick();
    setBstHighlightIdx((prev) => (prev + 1) % inorderOrder.length);
  };

  const scrollToWorkspaces = () => {
    sound.playClick();
    document.getElementById('workspaces-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cards: {
    id: DSAType;
    title: string;
    tagline: string;
    description: string;
    icon: React.ReactNode;
    accentBorder: string;
    badgeBg: string;
    operations: string[];
    timeSummary: string;
    preview: React.ReactNode;
  }[] = [
    {
      id: 'linked-list',
      title: 'Linked List',
      tagline: 'Singly Linked Chain',
      description:
        'Nodes linked strictly through next references. Watch pointers rewire on insertion, deletion, and in-place reversal.',
      icon: <Link2 className="w-6 h-6 text-emerald-600" />,
      accentBorder: 'hover:border-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      operations: ['Insert Head/Tail/Pos', 'Delete Head/Tail/Val', 'Search', 'Reverse'],
      timeSummary: 'Head O(1) | Tail/Search O(n)',
      preview: (
        <div className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100">
          {[10, 20, 30].map((v, idx) => (
            <React.Fragment key={v}>
              <div className="flex items-center rounded-lg border border-emerald-200 bg-white shadow-sm overflow-hidden">
                <span className="px-2 py-1 text-[11px] font-mono font-bold text-slate-800">{v}</span>
                <span className="px-1.5 py-1 bg-emerald-50 border-l border-emerald-100 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </span>
              </div>
              {idx < 2 ? (
                <ArrowRight className="w-3 h-3 text-emerald-500 shrink-0" />
              ) : (
                <div className="flex items-center gap-1 text-[10px] font-mono font-semibold text-slate-400">
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-600">NULL</span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      id: 'stack',
      title: 'Stack',
      tagline: 'LIFO (Last-In First-Out)',
      description:
        'Bounded container operating at a single TOP index. Inspect overflow/underflow guards, peek reads, and capacity limits.',
      icon: <Layers className="w-6 h-6 text-brand-600" />,
      accentBorder: 'hover:border-brand-300',
      badgeBg: 'bg-brand-50 text-brand-700 border-brand-200',
      operations: ['Push', 'Pop', 'Peek / Top', 'Is Empty / Full', 'Display'],
      timeSummary: 'Push/Pop/Peek O(1) | Display O(n)',
      preview: (
        <div className="flex items-end justify-center gap-3 py-2.5 px-2 bg-slate-50/80 rounded-xl border border-slate-100">
          <div className="w-28 border-x-2 border-b-2 border-slate-300 rounded-b-lg p-1.5 space-y-1 bg-white/70">
            <div className="text-center py-0.5 rounded bg-brand-600 text-white text-[10px] font-mono font-bold">
              30 (TOP)
            </div>
            <div className="text-center py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold border border-slate-200">
              20
            </div>
            <div className="text-center py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-mono font-semibold border border-slate-200">
              10
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500 pb-1">
            <div>top = 2</div>
            <div>cap = 7</div>
          </div>
        </div>
      ),
    },
    {
      id: 'queue',
      title: 'Queue',
      tagline: 'Circular FIFO Buffer',
      description:
        'Fixed-capacity ring buffer with O(1) circular indexing. Watch FRONT and REAR wrap cleanly across buffer slots.',
      icon: <ArrowRightLeft className="w-6 h-6 text-cyan-600" />,
      accentBorder: 'hover:border-cyan-300',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      operations: ['Enqueue', 'Dequeue', 'Front / Rear', 'Circular Wrap'],
      timeSummary: 'Enqueue/Dequeue O(1) | Display O(n)',
      preview: (
        <div className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100">
          <span className="text-[9px] font-mono font-bold text-rose-600">OUT</span>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200/70">
            {[
              { label: '12', tag: 'F' },
              { label: '24', tag: '' },
              { label: '36', tag: 'R' },
              { label: '-', tag: '' },
            ].map((slot, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-md flex flex-col items-center justify-center font-mono text-[10px] font-bold border ${
                  slot.tag === 'F'
                    ? 'bg-brand-600 text-white border-brand-700'
                    : slot.tag === 'R'
                    ? 'bg-cyan-600 text-white border-cyan-700'
                    : slot.label === '-'
                    ? 'bg-white/60 text-slate-300 border-dashed border-slate-300'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                <span>{slot.label}</span>
              </div>
            ))}
          </div>
          <span className="text-[9px] font-mono font-bold text-emerald-600">IN</span>
        </div>
      ),
    },
    {
      id: 'bst',
      title: 'Binary Search Tree',
      tagline: 'Key-Ordered Binary Tree',
      description:
        'Trace insertion branches, all 3 delete cases, BFS/DFS traversals, min/max spines, and bottom-up subtree height.',
      icon: <GitBranch className="w-6 h-6 text-indigo-600" />,
      accentBorder: 'hover:border-indigo-300',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      operations: ['Insert & Delete', '4 Traversals', 'Min / Max / Height', 'Bulk Build'],
      timeSummary: 'Avg O(log n) | Worst Skewed O(n)',
      preview: (
        <div className="flex items-center justify-center py-2 px-2 bg-slate-50/80 rounded-xl border border-slate-100">
          <svg viewBox="0 0 180 62" className="w-40 h-14 overflow-visible">
            <line x1="90" y1="14" x2="48" y2="44" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="90" y1="14" x2="132" y2="44" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="90" cy="14" r="11" fill="#2563eb" />
            <text x="90" y="18" textAnchor="middle" fill="#fff" fontSize="9" fontFamily="monospace" fontWeight="bold">
              50
            </text>
            <circle cx="48" cy="44" r="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
            <text x="48" y="48" textAnchor="middle" fill="#1e293b" fontSize="9" fontFamily="monospace" fontWeight="bold">
              30
            </text>
            <circle cx="132" cy="44" r="11" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.8" />
            <text x="132" y="48" textAnchor="middle" fill="#1e293b" fontSize="9" fontFamily="monospace" fontWeight="bold">
              70
            </text>
          </svg>
        </div>
      ),
    },
    {
      id: 'hash-table',
      title: 'Hash Table',
      tagline: 'Chaining & Probing',
      description:
        'Map integer keys to fixed buckets via modulo arithmetic. Inspect chaining buckets, linear probe jumps, and tombstones.',
      icon: <Hash className="w-6 h-6 text-amber-600" />,
      accentBorder: 'hover:border-amber-300',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      operations: ['Insert Key', 'Search / Delete', 'Chaining', 'Linear Probing'],
      timeSummary: 'Average O(1) | Collision O(n)',
      preview: (
        <div className="flex items-center justify-center gap-2 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100 font-mono text-[11px]">
          <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-600">
            [3]
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-1 rounded bg-amber-50 border border-amber-300 text-amber-800 font-bold">
            10
          </span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="px-2 py-1 rounded bg-orange-50 border border-orange-300 text-orange-800 font-bold">
            17
          </span>
        </div>
      ),
    },
    {
      id: 'heap',
      title: 'Binary Heap',
      tagline: 'Min / Max Heap',
      description:
        'Switch between Min-Heap and Max-Heap order while viewing both the complete tree diagram and its backing array.',
      icon: <GitFork className="w-6 h-6 text-emerald-600" />,
      accentBorder: 'hover:border-emerald-300',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      operations: ['Insert & Sift-Up', 'Extract Root', 'Peek Root', 'Min/Max Mode'],
      timeSummary: 'Peek O(1) | Insert/Extract O(log n)',
      preview: (
        <div className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100 font-mono text-[11px]">
          {[12, 24, 18, 35].map((v, idx) => (
            <div
              key={v}
              className={`px-2 py-1 rounded border font-bold ${
                idx === 0
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              {v}
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'priority-queue',
      title: 'Priority Queue',
      tagline: 'Heap-Backed Queue',
      description:
        'Schedule labeled tasks by numeric priority. Enqueue new jobs and extract the highest-priority task deterministically.',
      icon: <ListOrdered className="w-6 h-6 text-rose-600" />,
      accentBorder: 'hover:border-rose-300',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      operations: ['Enqueue Priority', 'Dequeue Top', 'Peek Next Task'],
      timeSummary: 'Peek O(1) | Enqueue/Dequeue O(log n)',
      preview: (
        <div className="flex items-center justify-center gap-1.5 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100 font-mono text-[11px]">
          <span className="px-2 py-1 rounded bg-rose-50 border border-rose-300 text-rose-800 font-bold">
            P1: ER
          </span>
          <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700">
            P2: Router
          </span>
          <span className="px-2 py-1 rounded bg-white border border-slate-200 text-slate-700">
            P4: Lab
          </span>
        </div>
      ),
    },
    {
      id: 'graph',
      title: 'Graphs',
      tagline: 'Directed & Weighted',
      description:
        'Build directed or undirected weighted graphs, toggle blocked edges, and trace BFS, DFS, Dijkstra, Prim, and Kruskal.',
      icon: <Share2 className="w-6 h-6 text-brand-600" />,
      accentBorder: 'hover:border-brand-300',
      badgeBg: 'bg-brand-50 text-brand-700 border-brand-200',
      operations: ['BFS / DFS', 'Dijkstra Path', 'Prim & Kruskal', 'Block Edges'],
      timeSummary: 'Traversal O(V + E) | Shortest Path O((V+E) log V)',
      preview: (
        <div className="flex items-center justify-center gap-2 py-3 px-2 bg-slate-50/80 rounded-xl border border-slate-100 font-mono text-[11px]">
          <span className="w-6 h-6 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center">
            A
          </span>
          <span className="text-slate-400">--4--</span>
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">
            B
          </span>
          <span className="text-slate-400">--2--</span>
          <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center">
            F
          </span>
        </div>
      ),
    },
  ];

  const activeBstVal = inorderOrder[bstHighlightIdx];

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative bg-white border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Copy & Actions */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="lg:col-span-6 space-y-6"
            >
              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Step through pointers, stacks, and trees{' '}
                <span className="text-brand-600">line by line.</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Run operations directly on TypeScript linked list, stack, queue, BST, hash table,
                heap, priority queue, and graph models — plus compare sorting algorithms head-to-head
                or plan campus shortest paths.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    sound.playClick();
                    onSelectDS(previewTab);
                  }}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Open Sandbox</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToWorkspaces}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 rounded-xl text-sm font-semibold border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <span>Browse Workspaces</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </motion.button>

                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    sound.playClick();
                    onOpenComplexity();
                  }}
                  className="px-4 py-2.5 text-slate-600 hover:text-brand-700 text-sm font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Table className="w-4 h-4 text-brand-600" />
                  <span>Big-O Table</span>
                </motion.button>
              </div>

              <div className="pt-4 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-md">
                <div>
                  <div className="text-lg font-extrabold font-mono text-slate-900">8</div>
                  <div className="text-[11px] text-slate-500">Data Structures</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold font-mono text-slate-900">13</div>
                  <div className="text-[11px] text-slate-500">Traced Algorithms</div>
                </div>
                <div>
                  <div className="text-lg font-extrabold font-mono text-slate-900">100%</div>
                  <div className="text-[11px] text-slate-500">Client-Side TS</div>
                </div>
              </div>
            </motion.div>

            {/* Right Interactive Live Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT }}
              className="lg:col-span-6"
            >
              <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                {/* Preview Window Header */}
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                    <span className="ml-2 text-[11px] font-mono font-semibold text-slate-500">
                      live-preview
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-200/60 p-0.5 rounded-lg">
                    {(
                      [
                        { id: 'linked-list', label: 'Linked List' },
                        { id: 'stack', label: 'Stack' },
                        { id: 'bst', label: 'BST' },
                      ] as const
                    ).map((tab) => {
                      const active = previewTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            sound.playClick();
                            setPreviewTab(tab.id);
                          }}
                          className={`relative px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                            active ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {active && (
                            <motion.span
                              layoutId="heroPreviewTab"
                              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              className="absolute inset-0 bg-white rounded-md shadow-sm"
                            />
                          )}
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Stage */}
                <div className="p-5 min-h-[250px] flex flex-col justify-between bg-slate-50/40">
                  <AnimatePresence mode="wait">
                    {previewTab === 'linked-list' && (
                      <motion.div
                        key="preview-ll"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            {listReversed ? 'head -> 40 -> 30 -> 20 -> 10' : 'head -> 10 -> 20 -> 30 -> 40'}
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleToggleReverseDemo}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reverse()</span>
                          </motion.button>
                        </div>

                        <div className="flex items-center justify-center gap-2 py-6 overflow-x-auto">
                          {demoList.map((val, idx) => (
                            <React.Fragment key={val}>
                              <motion.div
                                layout
                                transition={{ type: 'spring', stiffness: 360, damping: 28 }}
                                className="flex flex-col items-center"
                              >
                                {idx === 0 ? (
                                  <span className="mb-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-brand-700 text-white">
                                    HEAD
                                  </span>
                                ) : (
                                  <span className="mb-1 text-[9px] font-mono text-transparent select-none">
                                    .
                                  </span>
                                )}
                                <div className="flex rounded-xl border-2 border-slate-200 bg-white shadow-sm overflow-hidden">
                                  <span className="px-3 py-2 font-mono font-bold text-sm text-slate-800">
                                    {val}
                                  </span>
                                  <span className="px-2 py-2 bg-slate-50 border-l border-slate-200 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-brand-600" />
                                  </span>
                                </div>
                              </motion.div>
                              {idx < demoList.length - 1 ? (
                                <ArrowRight className="w-4 h-4 text-brand-500 mt-4 shrink-0" />
                              ) : (
                                <div className="flex items-center gap-1 mt-4 shrink-0">
                                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="px-2 py-1 rounded-md bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                                    NULL
                                  </span>
                                </div>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {previewTab === 'stack' && (
                      <motion.div
                        key="preview-stack"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            size: {demoStack.length} / 5 (top = {demoStack.length - 1})
                          </span>
                          <div className="flex items-center gap-1.5">
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={handleStackPush}
                              disabled={demoStack.length >= 5}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold disabled:opacity-40"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Push</span>
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              onClick={handleStackPop}
                              disabled={demoStack.length === 0}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold disabled:opacity-40"
                            >
                              <Minus className="w-3 h-3" />
                              <span>Pop</span>
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex justify-center py-2">
                          <div className="w-56 border-x-4 border-b-4 border-slate-300 rounded-b-xl p-2 bg-white min-h-[172px] flex flex-col-reverse gap-1.5">
                            <AnimatePresence initial={false}>
                              {demoStack.map((val, idx) => {
                                const isTop = idx === demoStack.length - 1;
                                return (
                                  <motion.div
                                    key={`${idx}-${val}`}
                                    layout
                                    initial={{ opacity: 0, y: -18, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -16, scale: 0.95 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                                      isTop
                                        ? 'bg-brand-600 text-white border-brand-700 shadow-sm'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <span>[{idx}] {val}</span>
                                    {isTop && (
                                      <span className="text-[9px] uppercase tracking-wider bg-black/20 px-1.5 py-0.5 rounded">
                                        TOP
                                      </span>
                                    )}
                                  </motion.div>
                                );
                              })}
                            </AnimatePresence>
                            {demoStack.length === 0 && (
                              <div className="m-auto text-xs font-mono text-slate-400">
                                Empty (top = -1)
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {previewTab === 'bst' && (
                      <motion.div
                        key="preview-bst"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: EASE_OUT }}
                        className="space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono font-semibold text-slate-500">
                            In-order visit: <strong className="text-brand-700">{activeBstVal}</strong>
                          </span>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStepBstInorder}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
                          >
                            <span>Step In-Order</span>
                            <ArrowRight className="w-3 h-3" />
                          </motion.button>
                        </div>

                        <div className="flex justify-center py-1">
                          <svg viewBox="0 0 280 148" className="w-72 h-36 overflow-visible">
                            {[
                              [140, 22, 80, 66],
                              [140, 22, 200, 66],
                              [80, 66, 48, 114],
                              [80, 66, 112, 114],
                              [200, 66, 168, 114],
                              [200, 66, 232, 114],
                            ].map(([x1, y1, x2, y2], idx) => (
                              <line
                                key={idx}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke="#cbd5e1"
                                strokeWidth="2.2"
                              />
                            ))}

                            {[
                              { val: 50, x: 140, y: 22 },
                              { val: 30, x: 80, y: 66 },
                              { val: 70, x: 200, y: 66 },
                              { val: 20, x: 48, y: 114 },
                              { val: 40, x: 112, y: 114 },
                              { val: 60, x: 168, y: 114 },
                              { val: 80, x: 232, y: 114 },
                            ].map((n) => {
                              const isActive = n.val === activeBstVal;
                              return (
                                <g key={n.val}>
                                  {isActive && (
                                    <motion.circle
                                      cx={n.x}
                                      cy={n.y}
                                      r="21"
                                      fill="#2563eb"
                                      initial={{ opacity: 0.15, scale: 0.85 }}
                                      animate={{ opacity: 0.22, scale: 1 }}
                                      transition={{ duration: 0.25 }}
                                    />
                                  )}
                                  <motion.circle
                                    cx={n.x}
                                    cy={n.y}
                                    r="15"
                                    animate={{
                                      fill: isActive ? '#2563eb' : '#ffffff',
                                      stroke: isActive ? '#1d4ed8' : '#cbd5e1',
                                    }}
                                    transition={{ duration: 0.2 }}
                                    strokeWidth="2.2"
                                  />
                                  <text
                                    x={n.x}
                                    y={n.y + 4}
                                    textAnchor="middle"
                                    fill={isActive ? '#ffffff' : '#1e293b'}
                                    fontSize="11"
                                    fontFamily="monospace"
                                    fontWeight="bold"
                                  >
                                    {n.val}
                                  </text>
                                </g>
                              );
                            })}
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mini Code Footer inside Preview Card */}
                  <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono text-[11px] text-slate-600 truncate">
                      {previewTab === 'linked-list' && 'curr.next = prev; prev = curr;'}
                      {previewTab === 'stack' && 'if (top === capacity - 1) return Overflow;'}
                      {previewTab === 'bst' && 'inorder(node.left); visit(node); inorder(node.right);'}
                    </span>
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectDS(previewTab);
                      }}
                      className="shrink-0 text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-16">
        {/* Workspaces Grid */}
        <section id="workspaces-section" className="scroll-mt-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="flex flex-wrap items-end justify-between gap-3 mb-7"
          >
            <div>
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600">
                Workspaces
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Pick a data structure to inspect
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Every workspace includes step playback, synchronized pseudocode, undo snapshots,
                and preset test cases.
              </p>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onOpenComplexity();
              }}
              className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
            >
              <span>Compare All Complexities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: index * 0.06, ease: EASE_OUT }}
                whileHover={{ y: -4 }}
                className={`group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col justify-between ${card.accentBorder}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 group-hover:scale-105 transition-transform">
                      {card.icon}
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${card.badgeBg}`}
                    >
                      {card.tagline}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  {card.preview}

                  <div className="flex flex-wrap gap-1.5">
                    {card.operations.map((op, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200"
                      >
                        {op}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-slate-500">{card.timeSummary}</span>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      sound.playClick();
                      onSelectDS(card.id);
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Open {card.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Algorithms, Comparison & Campus Modules */}
        <section>
          <div className="mb-6">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600">
              Algorithm & Graph Modules
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Test algorithms, benchmark trade-offs, and solve campus routing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(
              [
                {
                  id: 'algorithms',
                  title: 'Algorithm Laboratory',
                  desc: 'Visualize Bubble, Selection, Insertion, Merge, Quick, Heap Sort, Linear/Binary Search, BFS, DFS, Dijkstra, Prim, and Kruskal.',
                  icon: <BarChart3 className="w-5 h-5 text-brand-600" />,
                  cta: 'Open Algorithm Lab',
                },
                {
                  id: 'compare',
                  title: 'Algorithm Compare',
                  desc: 'Run any two sorting algorithms simultaneously on identical datasets and compare comparisons, swaps, and execution time.',
                  icon: <GitCompare className="w-5 h-5 text-indigo-600" />,
                  cta: 'Compare Algorithms',
                },
                {
                  id: 'campus',
                  title: 'Campus Route Optimizer',
                  desc: 'Find shortest paths between campus buildings with Dijkstra, build minimum utility networks with Prim/Kruskal, and test walkway closures.',
                  icon: <MapPin className="w-5 h-5 text-emerald-600" />,
                  cta: 'Open Campus Map',
                },
              ] as const
            ).map((mod) => (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-brand-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="p-2.5 w-fit rounded-xl bg-slate-50 border border-slate-200">
                    {mod.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{mod.desc}</p>
                </div>

                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectDS(mod.id);
                  }}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>{mod.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* How Each Operation Executes */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="mb-6"
          >
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-brand-600">
              Execution Model
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              From algorithm state to visual frame
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: '01',
                icon: <Cpu className="w-5 h-5 text-brand-600" />,
                title: 'TypeScript Model Execution',
                body: 'Operations execute against linked nodes, index-tracked stacks, modular circular buffers, and parent-child binary tree objects.',
                code: 'newIdx = (rearIdx + 1) % cap;',
              },
              {
                step: '02',
                icon: <Code2 className="w-5 h-5 text-emerald-600" />,
                title: 'Line-Linked Step Trace',
                body: 'Each comparison, pointer change, and edge case captures an immutable visual snapshot tied directly to a pseudocode line.',
                code: 'activeLineIndex: 2 // pointer move',
              },
              {
                step: '03',
                icon: <Play className="w-5 h-5 text-indigo-600" />,
                title: 'Controlled Playback & Undo',
                body: 'Step backward or forward one frame at a time, adjust playback speed up to 2x, or revert mutations from the undo stack.',
                code: 'speed: 0.5x | 1x | 1.5x | 2x',
              },
            ].map((item, idx) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.4, delay: idx * 0.08, ease: EASE_OUT }}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                      {item.icon}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{item.step}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.body}</p>
                </div>

                <div className="px-3 py-2 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] truncate">
                  {item.code}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Bottom Summary CTA */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.45, ease: EASE_OUT }}
          className="bg-slate-900 rounded-2xl p-7 sm:p-9 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-md"
        >
          <div className="space-y-2 max-w-xl">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Need a quick Big-O refresher before running traces?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Review best, average, worst time, and auxiliary space across all implemented
              structures and algorithms side by side, then jump straight into any workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sound.playClick();
                onOpenComplexity();
              }}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Table className="w-3.5 h-3.5 text-brand-600" />
              <span>Open Big-O Cheat Sheet</span>
            </motion.button>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                sound.playClick();
                onSelectDS('bst');
              }}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Launch BST Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
