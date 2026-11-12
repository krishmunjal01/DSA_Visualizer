import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BenchmarkEntry,
  DatasetPattern,
  SearchAlgorithmId,
  SearchStepSnapshot,
  SortAlgorithmId,
  SortStepSnapshot,
} from '../../types/algorithms';
import { GraphStateSnapshot } from '../../types/graph';
import { AnimationStep } from '../../types/dsa';
import { Graph } from '../../core/Graph';
import {
  SORT_META,
  benchmarkSort,
  generateDataset,
  runSortWithTrace,
} from '../../core/Sorting';
import { runSearchWithTrace } from '../../core/Searching';
import { useStepPlayer } from '../../hooks/useStepPlayer';
import { AnimationControls } from '../common/AnimationControls';
import { ExplanationPanel } from '../common/ExplanationPanel';
import { sound } from '../common/SoundEffects';
import { SortingVisualizer } from '../visualizers/SortingVisualizer';
import { SearchingVisualizer } from '../visualizers/SearchingVisualizer';
import { GraphVisualizer } from '../visualizers/GraphVisualizer';
import {
  ArrowLeft,
  BarChart3,
  GitCompare,
  Play,
  RefreshCw,
  Search,
  Share2,
} from 'lucide-react';

interface AlgorithmLabViewProps {
  initialMode?: 'lab' | 'compare';
  onBackToHome: () => void;
}

type LabCategory = 'sorting' | 'searching' | 'graph';
type GraphAlgoId = 'bfs' | 'dfs' | 'dijkstra' | 'prim' | 'kruskal';

const SORT_IDS: SortAlgorithmId[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

function buildInitialSortSnapshot(arr: number[]): SortStepSnapshot {
  return {
    bars: arr.map((value, idx) => ({ id: `init-${idx}`, value, state: 'default' })),
    comparisons: 0,
    swaps: 0,
    note: 'Ready to run',
  };
}

function buildInitialSearchSnapshot(arr: number[], target: number): SearchStepSnapshot {
  return {
    items: arr.map((value, idx) => ({ id: `s-${idx}`, value, state: 'default' })),
    target,
    foundIndex: null,
    comparisons: 0,
  };
}

function formatRuntimePair(msA: number, msB: number): [string, string] {
  if (Math.max(msA, msB) < 1) {
    return [`${(msA * 1000).toFixed(1)} µs`, `${(msB * 1000).toFixed(1)} µs`];
  }
  return [`${msA.toFixed(3)} ms`, `${msB.toFixed(3)} ms`];
}

function parseCustomArray(raw: string): number[] {
  return raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n))
    .map((n) => Math.max(1, Math.min(999, Math.trunc(n))))
    .slice(0, 28);
}

export const AlgorithmLabView: React.FC<AlgorithmLabViewProps> = ({
  initialMode = 'lab',
  onBackToHome,
}) => {
  const [mode, setMode] = useState<'lab' | 'compare'>(initialMode);
  const [category, setCategory] = useState<LabCategory>('sorting');

  const [sortAlgo, setSortAlgo] = useState<SortAlgorithmId>('merge');
  const [searchAlgo, setSearchAlgo] = useState<SearchAlgorithmId>('binary');
  const [graphAlgo, setGraphAlgo] = useState<GraphAlgoId>('dijkstra');

  const [arraySize, setArraySize] = useState(12);
  const [pattern, setPattern] = useState<DatasetPattern>('random');
  const [dataset, setDataset] = useState<number[]>(() => generateDataset(12, 'random'));
  const [customInput, setCustomInput] = useState('');
  const [searchTarget, setSearchTarget] = useState('42');

  const graphRef = useRef(new Graph('default'));
  const [graphSourceId, setGraphSourceId] = useState('A');
  const [graphTargetId, setGraphTargetId] = useState('F');
  const [graphBaseSnapshot, setGraphBaseSnapshot] = useState<GraphStateSnapshot>(() =>
    graphRef.current.getSnapshot()
  );

  const player = useStepPlayer<SortStepSnapshot | SearchStepSnapshot | GraphStateSnapshot>(1);

  const [leftAlgo, setLeftAlgo] = useState<SortAlgorithmId>('merge');
  const [rightAlgo, setRightAlgo] = useState<SortAlgorithmId>('quick');
  const [compareStepsA, setCompareStepsA] = useState<AnimationStep<SortStepSnapshot>[]>([]);
  const [compareStepsB, setCompareStepsB] = useState<AnimationStep<SortStepSnapshot>[]>([]);
  const [compareCursor, setCompareCursor] = useState(0);
  const [comparePlaying, setComparePlaying] = useState(false);
  const [compareSpeed, setCompareSpeed] = useState(1.2);
  const [benchPair, setBenchPair] = useState<[BenchmarkEntry, BenchmarkEntry] | null>(null);
  const [scaleRows, setScaleRows] = useState<
    Array<{ n: number; left: BenchmarkEntry; right: BenchmarkEntry }>
  >([]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!comparePlaying) return;
    const maxLen = Math.max(compareStepsA.length, compareStepsB.length);
    if (maxLen === 0 || compareCursor >= maxLen - 1) {
      setComparePlaying(false);
      sound.playSuccess();
      return;
    }

    const delay = Math.max(80, Math.round(700 / compareSpeed));
    const timer = window.setTimeout(() => {
      setCompareCursor((prev) => Math.min(prev + 1, maxLen - 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [comparePlaying, compareCursor, compareStepsA.length, compareStepsB.length, compareSpeed]);

  const regenerateArray = (nextSize = arraySize, nextPattern = pattern) => {
    sound.playClick();
    const fresh = generateDataset(nextSize, nextPattern);
    setDataset(fresh);
    setCustomInput(fresh.join(', '));
    setSearchTarget(String(fresh[Math.floor(fresh.length / 2)] ?? 42));
    player.clearPlayback();
    setComparePlaying(false);
    setCompareStepsA([]);
    setCompareStepsB([]);
    setCompareCursor(0);
    setBenchPair(null);
    setScaleRows([]);
  };

  const applyCustomArray = () => {
    const parsed = parseCustomArray(customInput);
    if (parsed.length < 3) return;
    sound.playClick();
    setDataset(parsed);
    setArraySize(parsed.length);
    player.clearPlayback();
    setComparePlaying(false);
    setCompareStepsA([]);
    setCompareStepsB([]);
    setCompareCursor(0);
    setBenchPair(null);
    setScaleRows([]);
  };

  const runLabStepAlgorithm = () => {
    sound.playClick();
    if (category === 'sorting') {
      const res = runSortWithTrace(sortAlgo, dataset);
      player.startPlayback(res.steps, res.explanation, true);
      return;
    }

    if (category === 'searching') {
      const parsedTarget = Number(searchTarget.trim());
      const targetVal = Number.isFinite(parsedTarget)
        ? Math.trunc(parsedTarget)
        : dataset[0] ?? 10;
      const res = runSearchWithTrace(searchAlgo, dataset, targetVal);
      player.startPlayback(res.steps, res.explanation, true);
      return;
    }

    const g = graphRef.current;
    const res =
      graphAlgo === 'bfs'
        ? g.bfs(graphSourceId)
        : graphAlgo === 'dfs'
        ? g.dfs(graphSourceId)
        : graphAlgo === 'dijkstra'
        ? g.dijkstra(graphSourceId, graphTargetId)
        : graphAlgo === 'prim'
        ? g.prim(graphSourceId)
        : g.kruskal();

    player.startPlayback(res.steps, res.explanation, true);
  };

  const runComparison = () => {
    sound.playClick();
    const resA = runSortWithTrace(leftAlgo, dataset);
    const resB = runSortWithTrace(rightAlgo, dataset);
    const benchA = benchmarkSort(leftAlgo, dataset);
    const benchB = benchmarkSort(rightAlgo, dataset);

    setCompareStepsA(resA.steps);
    setCompareStepsB(resB.steps);
    setCompareCursor(0);
    setBenchPair([benchA, benchB]);
    setComparePlaying(true);

    const rows = [100, 500, 2000].map((n) => {
      const sample = generateDataset(n, pattern);
      return {
        n,
        left: benchmarkSort(leftAlgo, sample),
        right: benchmarkSort(rightAlgo, sample),
      };
    });
    setScaleRows(rows);
  };

  const compareMaxSteps = Math.max(compareStepsA.length, compareStepsB.length);
  const compareComplete = compareMaxSteps > 0 && compareCursor >= compareMaxSteps - 1;
  const trackADone = compareStepsA.length > 0 && compareCursor >= compareStepsA.length - 1;
  const trackBDone = compareStepsB.length > 0 && compareCursor >= compareStepsB.length - 1;
  const currentLeftSnapshot: SortStepSnapshot = useMemo(() => {
    if (compareStepsA.length === 0) return buildInitialSortSnapshot(dataset);
    const idx = Math.min(compareCursor, compareStepsA.length - 1);
    return compareStepsA[idx].stateSnapshot;
  }, [compareStepsA, compareCursor, dataset]);

  const currentRightSnapshot: SortStepSnapshot = useMemo(() => {
    if (compareStepsB.length === 0) return buildInitialSortSnapshot(dataset);
    const idx = Math.min(compareCursor, compareStepsB.length - 1);
    return compareStepsB[idx].stateSnapshot;
  }, [compareStepsB, compareCursor, dataset]);

  const activeLabSnapshot = player.currentStep?.stateSnapshot;
  const searchInputPreview =
    searchAlgo === 'binary' ? [...dataset].sort((a, b) => a - b) : dataset;

  const winnerSummary = useMemo(() => {
    if (!benchPair) return null;
    const [a, b] = benchPair;
    if (a.algorithm === b.algorithm) {
      return `Both tracks ran ${a.label} on the same ${dataset.length}-element dataset.`;
    }
    const aOps = a.comparisons + a.swaps;
    const bOps = b.comparisons + b.swaps;
    if (aOps === bOps) {
      return `${a.label} and ${b.label} performed the exact same total operations (${aOps}).`;
    }
    const winner = aOps < bOps ? a : b;
    const loser = aOps < bOps ? b : a;
    const savingsPct = Math.round(((Math.max(1, loser.comparisons + loser.swaps) - (winner.comparisons + winner.swaps)) / Math.max(1, loser.comparisons + loser.swaps)) * 100);
    return `${winner.label} performed better on this ${pattern} dataset (${winner.comparisons} comparisons, ${winner.swaps} swaps — ${savingsPct}% fewer total operations than ${loser.label}).`;
  }, [benchPair, dataset.length, pattern]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHome();
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Back to Homepage"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900">
              {mode === 'compare' ? 'Algorithm Comparison Workspace' : 'Algorithm Laboratory'}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === 'compare'
                ? 'Execute two sorting algorithms on identical input to compare operations and runtime.'
                : 'Step-by-step execution across sorting, searching, traversal, shortest path, and MST.'}
            </p>
          </div>
        </div>

        <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => {
              sound.playClick();
              setMode('lab');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mode === 'lab'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Step Visualizer
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setMode('compare');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              mode === 'compare'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            Algorithm Compare
          </button>
        </div>
      </motion.div>

      {(mode === 'compare' || category !== 'graph') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-end gap-3 justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Dataset Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => {
                  const next = e.target.value as DatasetPattern;
                  setPattern(next);
                  regenerateArray(arraySize, next);
                }}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="random">Random</option>
                <option value="nearly-sorted">Nearly Sorted</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Size ({arraySize})
              </label>
              <input
                type="range"
                min={6}
                max={20}
                value={arraySize}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setArraySize(next);
                  regenerateArray(next, pattern);
                }}
                className="w-28 accent-brand-600"
              />
            </div>

            <button
              onClick={() => regenerateArray(arraySize, pattern)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Array
            </button>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-md">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Custom CSV e.g. 42, 17, 89, 12, 55"
              className="flex-1 px-3 py-1.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              onClick={applyCustomArray}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {mode === 'lab' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between min-h-[380px]">
              <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {(
                    [
                      { id: 'sorting', label: 'Sorting', icon: BarChart3 },
                      { id: 'searching', label: 'Searching', icon: Search },
                      { id: 'graph', label: 'Graph Algorithms', icon: Share2 },
                    ] as const
                  ).map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          sound.playClick();
                          setCategory(tab.id);
                          player.clearPlayback();
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          category === tab.id
                            ? 'bg-brand-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {player.currentStep && (
                  <span className="text-xs font-mono font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                    {player.currentStep.title}
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex items-center justify-center">
                {category === 'sorting' && (
                  <SortingVisualizer
                    title={SORT_META[sortAlgo].label}
                    snapshot={
                      activeLabSnapshot && 'bars' in activeLabSnapshot
                        ? activeLabSnapshot
                        : buildInitialSortSnapshot(dataset)
                    }
                  />
                )}

                {category === 'searching' && (
                  <SearchingVisualizer
                    snapshot={
                      activeLabSnapshot && 'items' in activeLabSnapshot
                        ? activeLabSnapshot
                        : buildInitialSearchSnapshot(
                            searchInputPreview,
                            Number(searchTarget) || dataset[0] || 0
                          )
                    }
                  />
                )}

                {category === 'graph' && (
                  <GraphVisualizer
                    snapshot={
                      activeLabSnapshot && 'vertices' in activeLabSnapshot
                        ? activeLabSnapshot
                        : graphBaseSnapshot
                    }
                    onToggleEdgeBlock={(edgeId) => {
                      graphRef.current.toggleBlockEdge(edgeId);
                      setGraphBaseSnapshot(graphRef.current.getSnapshot());
                      player.clearPlayback();
                    }}
                  />
                )}
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/40">
                <AnimationControls
                  currentStep={player.steps.length > 0 ? player.currentStepIndex + 1 : 0}
                  totalSteps={player.steps.length}
                  isPlaying={player.isPlaying}
                  speed={player.speed}
                  operationStatus={player.explanation?.status}
                  onPlayToggle={player.handlePlayToggle}
                  onReplay={player.handleReplay}
                  onNextStep={player.handleNextStep}
                  onPrevStep={player.handlePrevStep}
                  onResetAnimation={player.handleResetAnimation}
                  onSpeedChange={player.setSpeed}
                />
              </div>
            </div>

            <ExplanationPanel
              explanation={player.explanation}
              currentStepData={player.currentStep}
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Algorithm Configuration
                </h3>
              </div>

              {category === 'sorting' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {SORT_IDS.map((id) => (
                      <button
                        key={id}
                        onClick={() => {
                          sound.playClick();
                          setSortAlgo(id);
                          player.clearPlayback();
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-colors ${
                          sortAlgo === id
                            ? 'bg-brand-50 text-brand-700 border-brand-300'
                            : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {SORT_META[id].label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">{SORT_META[sortAlgo].summary}</p>
                </div>
              )}

              {category === 'searching' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'linear', label: 'Linear Search' },
                        { id: 'binary', label: 'Binary Search' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          setSearchAlgo(opt.id);
                          player.clearPlayback();
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                          searchAlgo === opt.id
                            ? 'bg-brand-50 text-brand-700 border-brand-300'
                            : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Target Value</label>
                    <input
                      type="number"
                      value={searchTarget}
                      onChange={(e) => setSearchTarget(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Binary Search sorts a copy of the array first so mid-point halving always holds.
                  </p>
                </div>
              )}

              {category === 'graph' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'bfs', label: 'BFS Traversal' },
                        { id: 'dfs', label: 'DFS Traversal' },
                        { id: 'dijkstra', label: 'Dijkstra Path' },
                        { id: 'prim', label: 'Prim MST' },
                        { id: 'kruskal', label: 'Kruskal MST' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          sound.playClick();
                          setGraphAlgo(opt.id);
                          player.clearPlayback();
                        }}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors ${
                          graphAlgo === opt.id
                            ? 'bg-brand-50 text-brand-700 border-brand-300'
                            : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Start Vertex</label>
                      <select
                        value={graphSourceId}
                        onChange={(e) => setGraphSourceId(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                      >
                        {graphBaseSnapshot.vertices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.id} ({v.label})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Target Vertex</label>
                      <select
                        value={graphTargetId}
                        onChange={(e) => setGraphTargetId(e.target.value)}
                        disabled={graphAlgo !== 'dijkstra'}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg disabled:opacity-45"
                      >
                        {graphBaseSnapshot.vertices.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.id} ({v.label})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={runLabStepAlgorithm}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Step-by-Step Trace
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Algorithm A
                </label>
                <select
                  value={leftAlgo}
                  onChange={(e) => setLeftAlgo(e.target.value as SortAlgorithmId)}
                  className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
                >
                  {SORT_IDS.map((id) => (
                    <option key={id} value={id}>
                      {SORT_META[id].label}
                    </option>
                  ))}
                </select>
              </div>

              <span className="text-xs font-bold text-slate-400 pb-2">vs</span>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Algorithm B
                </label>
                <select
                  value={rightAlgo}
                  onChange={(e) => setRightAlgo(e.target.value as SortAlgorithmId)}
                  className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-lg"
                >
                  {SORT_IDS.map((id) => (
                    <option key={id} value={id}>
                      {SORT_META[id].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="text-[11px] text-slate-500">Speed</span>
                {[1, 1.5, 2.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setCompareSpeed(spd)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border ${
                      compareSpeed === spd
                        ? 'bg-brand-50 text-brand-700 border-brand-300 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <button
                onClick={runComparison}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Simultaneous Compare
              </button>

              {compareMaxSteps > 0 && !compareComplete && (
                <>
                  <button
                    onClick={() => setComparePlaying((p) => !p)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {comparePlaying ? 'Pause' : 'Resume'} ({compareCursor + 1}/{compareMaxSteps})
                  </button>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setComparePlaying(false);
                      setCompareCursor(compareMaxSteps - 1);
                    }}
                    className="px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    Skip to End
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <SortingVisualizer
                title={`Track A: ${SORT_META[leftAlgo].label}`}
                snapshot={currentLeftSnapshot}
                compact
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  {compareStepsA.length === 0
                    ? 'Ready'
                    : trackADone
                    ? `Completed in ${compareStepsA.length} steps`
                    : `Sorting (step ${Math.min(compareCursor + 1, compareStepsA.length)}/${compareStepsA.length})`}
                </span>
                <span className="font-mono">
                  Avg: {SORT_META[leftAlgo].complexity.timeAverage} | Space:{' '}
                  {SORT_META[leftAlgo].complexity.auxiliarySpace}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
              <SortingVisualizer
                title={`Track B: ${SORT_META[rightAlgo].label}`}
                snapshot={currentRightSnapshot}
                compact
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>
                  {compareStepsB.length === 0
                    ? 'Ready'
                    : trackBDone
                    ? `Completed in ${compareStepsB.length} steps`
                    : `Sorting (step ${Math.min(compareCursor + 1, compareStepsB.length)}/${compareStepsB.length})`}
                </span>
                <span className="font-mono">
                  Avg: {SORT_META[rightAlgo].complexity.timeAverage} | Space:{' '}
                  {SORT_META[rightAlgo].complexity.auxiliarySpace}
                </span>
              </div>
            </div>
          </div>

          {benchPair && !compareComplete && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <span>
                Running comparison: <strong>{SORT_META[leftAlgo].label}</strong>{' '}
                {trackADone
                  ? `(done in ${compareStepsA.length} steps)`
                  : `(step ${compareCursor + 1}/${compareStepsA.length})`}{' '}
                vs <strong>{SORT_META[rightAlgo].label}</strong>{' '}
                {trackBDone
                  ? `(done in ${compareStepsB.length} steps)`
                  : `(step ${compareCursor + 1}/${compareStepsB.length})`}
                . Final summary unlocks when both tracks finish.
              </span>
            </div>
          )}

          {benchPair && compareComplete && (() => {
            const [timeLabelA, timeLabelB] = formatRuntimePair(
              benchPair[0].timeMs,
              benchPair[1].timeMs
            );
            const timeLabels = [timeLabelA, timeLabelB];
            return (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                {winnerSummary && (
                  <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-medium text-emerald-900 space-y-1">
                    <div>{winnerSummary}</div>
                    {dataset.length <= 24 && (
                      <div className="text-[11px] font-normal text-emerald-800">
                        On tiny arrays (n={dataset.length}), microsecond constant factors (loop overhead, recursion, or temporary array slices) often outweigh comparison counts. Compare n=500 and n=2000 below to see asymptotic scaling.
                      </div>
                    )}
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                        <th className="py-2 pr-4">Algorithm</th>
                        <th className="py-2 px-4 font-mono">Comparisons</th>
                        <th className="py-2 px-4 font-mono">Swaps / Writes</th>
                        <th className="py-2 px-4 font-mono">Avg Runtime (n={dataset.length})</th>
                        <th className="py-2 pl-4 font-mono">Average Complexity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchPair.map((entry, idx) => (
                        <tr key={`${entry.algorithm}-${idx}`} className="border-b border-slate-100">
                          <td className="py-2.5 pr-4 font-semibold text-slate-900">
                            {idx === 0 ? 'Track A: ' : 'Track B: '}
                            {entry.label}
                          </td>
                          <td className="py-2.5 px-4 font-mono">{entry.comparisons}</td>
                          <td className="py-2.5 px-4 font-mono">{entry.swaps}</td>
                          <td className="py-2.5 px-4 font-mono">{timeLabels[idx]}</td>
                          <td className="py-2.5 pl-4 font-mono text-brand-700">
                            {entry.complexityAvg}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {scaleRows.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">
                      Scaling Check on {pattern} inputs (n = 100, 500, 2000)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {scaleRows.map((row) => {
                        const [scaleA, scaleB] = formatRuntimePair(row.left.timeMs, row.right.timeMs);
                        return (
                          <div
                            key={row.n}
                            className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 text-xs space-y-1.5"
                          >
                            <div className="font-mono font-bold text-slate-800">n = {row.n}</div>
                            <div className="flex justify-between text-slate-600">
                              <span>{row.left.label}</span>
                              <span className="font-mono">
                                {row.left.comparisons} cmp | {scaleA}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>{row.right.label}</span>
                              <span className="font-mono">
                                {row.right.comparisons} cmp | {scaleB}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

