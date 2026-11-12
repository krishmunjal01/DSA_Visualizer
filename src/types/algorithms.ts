export type SortAlgorithmId = 'bubble' | 'selection' | 'insertion' | 'merge' | 'quick' | 'heap';
export type SearchAlgorithmId = 'linear' | 'binary';
export type DatasetPattern = 'random' | 'nearly-sorted' | 'reversed';

export type BarState = 'default' | 'comparing' | 'swapping' | 'pivot' | 'sorted' | 'found' | 'discarded';

export interface ArrayBarItem {
  id: string;
  value: number;
  state: BarState;
}

export interface SortStepSnapshot {
  bars: ArrayBarItem[];
  comparisons: number;
  swaps: number;
  note?: string;
}

export interface SearchStepSnapshot {
  items: ArrayBarItem[];
  target: number;
  low?: number;
  mid?: number;
  high?: number;
  currentIndex?: number;
  foundIndex: number | null;
  comparisons: number;
}

export interface BenchmarkEntry {
  algorithm: SortAlgorithmId;
  label: string;
  comparisons: number;
  swaps: number;
  timeMs: number;
  complexityAvg: string;
}

