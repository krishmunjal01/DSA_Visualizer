import {
  ArrayBarItem,
  BarState,
  BenchmarkEntry,
  DatasetPattern,
  SortAlgorithmId,
  SortStepSnapshot,
} from '../types/algorithms';
import { AnimationStep, ComplexityInfo, OperationExplanation } from '../types/dsa';
import { finalizeSteps } from '../utils/steps';

export interface SortMeta {
  id: SortAlgorithmId;
  label: string;
  pseudocode: string[];
  complexity: ComplexityInfo;
  summary: string;
}

export const SORT_META: Record<SortAlgorithmId, SortMeta> = {
  bubble: {
    id: 'bubble',
    label: 'Bubble Sort',
    summary: 'Repeatedly compares adjacent items and swaps them when out of order.',
    pseudocode: [
      'for i = 0 to n - 2:',
      '  swapped = false',
      '  for j = 0 to n - i - 2:',
      '    if arr[j] > arr[j + 1]: swap(arr[j], arr[j + 1])',
      '  if not swapped: break',
    ],
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n^2)',
      timeWorst: 'O(n^2)',
      auxiliarySpace: 'O(1)',
    },
  },
  selection: {
    id: 'selection',
    label: 'Selection Sort',
    summary: 'Finds the minimum element in the unsorted suffix and swaps it into position.',
    pseudocode: [
      'for i = 0 to n - 2:',
      '  minIdx = i',
      '  for j = i + 1 to n - 1:',
      '    if arr[j] < arr[minIdx]: minIdx = j',
      '  swap(arr[i], arr[minIdx])',
    ],
    complexity: {
      timeBest: 'O(n^2)',
      timeAverage: 'O(n^2)',
      timeWorst: 'O(n^2)',
      auxiliarySpace: 'O(1)',
    },
  },
  insertion: {
    id: 'insertion',
    label: 'Insertion Sort',
    summary: 'Builds the sorted prefix one item at a time by shifting larger items right.',
    pseudocode: [
      'for i = 1 to n - 1:',
      '  key = arr[i]; j = i - 1',
      '  while j >= 0 and arr[j] > key:',
      '    arr[j + 1] = arr[j]; j--',
      '  arr[j + 1] = key',
    ],
    complexity: {
      timeBest: 'O(n)',
      timeAverage: 'O(n^2)',
      timeWorst: 'O(n^2)',
      auxiliarySpace: 'O(1)',
    },
  },
  merge: {
    id: 'merge',
    label: 'Merge Sort',
    summary: 'Divides the array into halves, sorts recursively, and merges sorted runs.',
    pseudocode: [
      'if left >= right: return',
      'mid = floor((left + right) / 2)',
      'mergeSort(arr, left, mid)',
      'mergeSort(arr, mid + 1, right)',
      'merge(arr, left, mid, right)',
    ],
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      auxiliarySpace: 'O(n)',
    },
  },
  quick: {
    id: 'quick',
    label: 'Quick Sort',
    summary: 'Partitions around a pivot so smaller values sit left and larger values sit right.',
    pseudocode: [
      'if low >= high: return',
      'pivot = arr[high]; i = low - 1',
      'for j = low to high - 1: if arr[j] <= pivot: swap(++i, j)',
      'swap(i + 1, high)',
      'quickSort(low, p - 1); quickSort(p + 1, high)',
    ],
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n^2)',
      auxiliarySpace: 'O(log n)',
    },
  },
  heap: {
    id: 'heap',
    label: 'Heap Sort',
    summary: 'Builds a max-heap in place and extracts the largest element to the sorted tail.',
    pseudocode: [
      'buildMaxHeap(arr, n)',
      'for end = n - 1 down to 1:',
      '  swap(arr[0], arr[end])',
      '  siftDown(arr, 0, end)',
    ],
    complexity: {
      timeBest: 'O(n log n)',
      timeAverage: 'O(n log n)',
      timeWorst: 'O(n log n)',
      auxiliarySpace: 'O(1)',
    },
  },
};

export function generateDataset(size: number, pattern: DatasetPattern): number[] {
  const arr = Array.from({ length: size }, (_, i) => Math.floor(((i + 1) / size) * 85) + 10);
  if (pattern === 'reversed') return arr.reverse();
  if (pattern === 'nearly-sorted') {
    const swaps = Math.max(1, Math.floor(size * 0.12));
    for (let s = 0; s < swaps; s++) {
      const i = Math.floor(Math.random() * (size - 1));
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
    }
    return arr;
  }
  return Array.from({ length: size }, () => Math.floor(Math.random() * 88) + 10);
}

function makeBars(values: number[], states?: Map<number, BarState>): ArrayBarItem[] {
  return values.map((value, idx) => ({
    id: `bar-${idx}`,
    value,
    state: states?.get(idx) ?? 'default',
  }));
}

export function runSortWithTrace(
  algo: SortAlgorithmId,
  input: number[]
): {
  steps: AnimationStep<SortStepSnapshot>[];
  explanation: OperationExplanation;
  comparisons: number;
  swaps: number;
} {
  const arr = [...input];
  const n = arr.length;
  const steps: AnimationStep<SortStepSnapshot>[] = [];
  let comparisons = 0;
  let swaps = 0;
  const sortedSet = new Set<number>();

  const pushFrame = (
    title: string,
    description: string,
    activeLineIndex: number,
    overrides?: Map<number, BarState>
  ) => {
    const map = new Map<number, BarState>();
    for (const idx of sortedSet) map.set(idx, 'sorted');
    if (overrides) {
      for (const [k, v] of overrides.entries()) map.set(k, v);
    }
    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title,
      description,
      activeLineIndex,
      stateSnapshot: {
        bars: makeBars(arr, map),
        comparisons,
        swaps,
        note: description,
      },
    });
  };

  pushFrame('Initial Array', `Starting ${SORT_META[algo].label} on ${n} items.`, 0);

  if (algo === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        pushFrame(
          `Compare [${j}] (${arr[j]}) & [${j + 1}] (${arr[j + 1]})`,
          `Checking if ${arr[j]} > ${arr[j + 1]}.`,
          3,
          new Map([
            [j, 'comparing'],
            [j + 1, 'comparing'],
          ])
        );
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          swapped = true;
          pushFrame(
            `Swap [${j}] <-> [${j + 1}]`,
            `Swapped ${arr[j + 1]} and ${arr[j]}.`,
            3,
            new Map([
              [j, 'swapping'],
              [j + 1, 'swapping'],
            ])
          );
        }
      }
      sortedSet.add(n - 1 - i);
      if (!swapped) {
        for (let k = 0; k < n; k++) sortedSet.add(k);
        break;
      }
    }
    if (n > 0) sortedSet.add(0);
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        pushFrame(
          `Scan Min: [${j}] (${arr[j]}) vs min [${minIdx}] (${arr[minIdx]})`,
          `Current minimum is ${arr[minIdx]} at index [${minIdx}].`,
          3,
          new Map([
            [minIdx, 'pivot'],
            [j, 'comparing'],
          ])
        );
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        pushFrame(
          `Place Min at [${i}]`,
          `Swapped minimum value ${arr[i]} into index [${i}].`,
          4,
          new Map([
            [i, 'swapping'],
            [minIdx, 'swapping'],
          ])
        );
      }
      sortedSet.add(i);
    }
    if (n > 0) sortedSet.add(n - 1);
  } else if (algo === 'insertion') {
    if (n > 0) sortedSet.add(0);
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      pushFrame(`Pick Key ${key} at [${i}]`, `Inserting ${key} into sorted prefix [0..${i - 1}].`, 1, new Map([[i, 'pivot']]));
      while (j >= 0) {
        comparisons++;
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          swaps++;
          pushFrame(
            `Shift ${arr[j]} Right`,
            `${arr[j]} > ${key}, shifted right to [${j + 1}].`,
            3,
            new Map([
              [j, 'comparing'],
              [j + 1, 'swapping'],
            ])
          );
          j--;
        } else {
          break;
        }
      }
      arr[j + 1] = key;
      sortedSet.add(i);
      pushFrame(`Insert ${key} at [${j + 1}]`, `Placed key ${key} into position [${j + 1}].`, 4, new Map([[j + 1, 'sorted']]));
    }
  } else if (algo === 'merge') {
    const mergeSort = (l: number, r: number) => {
      if (l >= r) return;
      const mid = Math.floor((l + r) / 2);
      mergeSort(l, mid);
      mergeSort(mid + 1, r);

      const left = arr.slice(l, mid + 1);
      const right = arr.slice(mid + 1, r + 1);
      let i = 0;
      let j = 0;
      let k = l;
      while (i < left.length && j < right.length) {
        comparisons++;
        if (left[i] <= right[j]) {
          arr[k] = left[i++];
        } else {
          arr[k] = right[j++];
        }
        swaps++;
        pushFrame(
          `Merge Into [${k}] = ${arr[k]}`,
          `Merged smaller front element ${arr[k]} into slice [${l}..${r}].`,
          4,
          new Map([[k, 'swapping']])
        );
        k++;
      }
      while (i < left.length) {
        arr[k] = left[i++];
        swaps++;
        pushFrame(`Copy Left Remainder [${k}]`, `Copied ${arr[k]} into [${k}].`, 4, new Map([[k, 'swapping']]));
        k++;
      }
      while (j < right.length) {
        arr[k] = right[j++];
        swaps++;
        pushFrame(`Copy Right Remainder [${k}]`, `Copied ${arr[k]} into [${k}].`, 4, new Map([[k, 'swapping']]));
        k++;
      }
      if (l === 0 && r === n - 1) {
        for (let idx = 0; idx < n; idx++) sortedSet.add(idx);
      }
    };
    mergeSort(0, n - 1);
  } else if (algo === 'quick') {
    const quickSort = (low: number, high: number) => {
      if (low >= high) {
        if (low === high) sortedSet.add(low);
        return;
      }
      const pivotVal = arr[high];
      let i = low - 1;
      pushFrame(
        `Partition [${low}..${high}] Pivot = ${pivotVal}`,
        `Chosen pivot ${pivotVal} at index [${high}].`,
        1,
        new Map([[high, 'pivot']])
      );
      for (let j = low; j < high; j++) {
        comparisons++;
        pushFrame(
          `Compare [${j}] (${arr[j]}) <= Pivot (${pivotVal})`,
          `Checking ${arr[j]} against pivot ${pivotVal}.`,
          2,
          new Map([
            [high, 'pivot'],
            [j, 'comparing'],
          ])
        );
        if (arr[j] <= pivotVal) {
          i++;
          if (i !== j) {
            [arr[i], arr[j]] = [arr[j], arr[i]];
            swaps++;
            pushFrame(
              `Swap [${i}] <-> [${j}]`,
              `Moved ${arr[i]} into <= pivot region.`,
              2,
              new Map([
                [high, 'pivot'],
                [i, 'swapping'],
                [j, 'swapping'],
              ])
            );
          }
        }
      }
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;
      const pIdx = i + 1;
      sortedSet.add(pIdx);
      pushFrame(
        `Pivot Settled at [${pIdx}]`,
        `Placed pivot ${pivotVal} at final sorted index [${pIdx}].`,
        3,
        new Map([[pIdx, 'sorted']])
      );

      quickSort(low, pIdx - 1);
      quickSort(pIdx + 1, high);
    };
    quickSort(0, n - 1);
  } else if (algo === 'heap') {
    const siftDown = (size: number, root: number) => {
      let curr = root;
      while (true) {
        const left = 2 * curr + 1;
        const right = 2 * curr + 2;
        let largest = curr;
        if (left < size) {
          comparisons++;
          if (arr[left] > arr[largest]) largest = left;
        }
        if (right < size) {
          comparisons++;
          if (arr[right] > arr[largest]) largest = right;
        }
        if (largest === curr) break;
        [arr[curr], arr[largest]] = [arr[largest], arr[curr]];
        swaps++;
        pushFrame(
          `Heapify Swap [${curr}] <-> [${largest}]`,
          `Sifted ${arr[largest]} down in max-heap.`,
          3,
          new Map([
            [curr, 'swapping'],
            [largest, 'swapping'],
          ])
        );
        curr = largest;
      }
    };

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      siftDown(n, i);
    }
    pushFrame('Max-Heap Built', 'Largest value is now at root index [0].', 0, new Map([[0, 'pivot']]));

    for (let end = n - 1; end > 0; end--) {
      [arr[0], arr[end]] = [arr[end], arr[0]];
      swaps++;
      sortedSet.add(end);
      pushFrame(
        `Extract Max ${arr[end]} -> [${end}]`,
        `Swapped root maximum to sorted tail [${end}].`,
        2,
        new Map([
          [0, 'swapping'],
          [end, 'sorted'],
        ])
      );
      siftDown(end, 0);
    }
    if (n > 0) sortedSet.add(0);
  }

  for (let k = 0; k < n; k++) sortedSet.add(k);
  pushFrame(
    `${SORT_META[algo].label} Complete`,
    `Sorted ${n} items with ${comparisons} comparisons and ${swaps} swaps/writes.`,
    SORT_META[algo].pseudocode.length - 1
  );

  const meta = SORT_META[algo];
  return {
    steps: finalizeSteps(steps),
    comparisons,
    swaps,
    explanation: {
      operationName: `${algo.toUpperCase()}_SORT(n=${n})`,
      displayName: meta.label,
      whatHappens: meta.summary,
      pseudocode: meta.pseudocode,
      complexity: meta.complexity,
      resultMessage: `Sorted ${n} items (${comparisons} comparisons, ${swaps} swaps/writes).`,
      status: 'success',
    },
  };
}

interface HeadlessStats {
  comparisons: number;
  swaps: number;
}

function quickSortHeadless(arr: number[], low: number, high: number, stats: HeadlessStats): void {
  if (low >= high) return;
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    stats.comparisons++;
    if (arr[j] <= pivot) {
      i++;
      if (i !== j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        stats.swaps++;
      }
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  stats.swaps++;
  const p = i + 1;
  quickSortHeadless(arr, low, p - 1, stats);
  quickSortHeadless(arr, p + 1, high, stats);
}

function mergeSortHeadless(arr: number[], l: number, r: number, stats: HeadlessStats): void {
  if (l >= r) return;
  const mid = (l + r) >> 1;
  mergeSortHeadless(arr, l, mid, stats);
  mergeSortHeadless(arr, mid + 1, r, stats);
  const left = arr.slice(l, mid + 1);
  const right = arr.slice(mid + 1, r + 1);
  let i = 0;
  let j = 0;
  let k = l;
  while (i < left.length && j < right.length) {
    stats.comparisons++;
    arr[k++] = left[i] <= right[j] ? left[i++] : right[j++];
    stats.swaps++;
  }
  while (i < left.length) {
    arr[k++] = left[i++];
    stats.swaps++;
  }
  while (j < right.length) {
    arr[k++] = right[j++];
    stats.swaps++;
  }
}

function siftDownHeadless(arr: number[], size: number, root: number, stats: HeadlessStats): void {
  let curr = root;
  while (true) {
    const left = 2 * curr + 1;
    const right = 2 * curr + 2;
    let largest = curr;
    if (left < size) {
      stats.comparisons++;
      if (arr[left] > arr[largest]) largest = left;
    }
    if (right < size) {
      stats.comparisons++;
      if (arr[right] > arr[largest]) largest = right;
    }
    if (largest === curr) break;
    [arr[curr], arr[largest]] = [arr[largest], arr[curr]];
    stats.swaps++;
    curr = largest;
  }
}

function executeHeadlessSort(algo: SortAlgorithmId, arr: number[]): HeadlessStats {
  const n = arr.length;
  const stats: HeadlessStats = { comparisons: 0, swaps: 0 };

  if (algo === 'bubble') {
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        stats.comparisons++;
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          stats.swaps++;
          swapped = true;
        }
      }
      if (!swapped) break;
    }
  } else if (algo === 'selection') {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        stats.comparisons++;
        if (arr[j] < arr[minIdx]) minIdx = j;
      }
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        stats.swaps++;
      }
    }
  } else if (algo === 'insertion') {
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0) {
        stats.comparisons++;
        if (arr[j] > key) {
          arr[j + 1] = arr[j];
          stats.swaps++;
          j--;
        } else break;
      }
      arr[j + 1] = key;
    }
  } else if (algo === 'merge') {
    mergeSortHeadless(arr, 0, n - 1, stats);
  } else if (algo === 'quick') {
    quickSortHeadless(arr, 0, n - 1, stats);
  } else if (algo === 'heap') {
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDownHeadless(arr, n, i, stats);
    for (let end = n - 1; end > 0; end--) {
      [arr[0], arr[end]] = [arr[end], arr[0]];
      stats.swaps++;
      siftDownHeadless(arr, end, 0, stats);
    }
  }

  return stats;
}

/**
 * Runs headless sorting over pre-allocated input copies so array-copy overhead and browser timer clamping do not skew timings.
 */
export function benchmarkSort(algo: SortAlgorithmId, input: number[]): BenchmarkEntry {
  const n = input.length;
  for (let w = 0; w < 5; w++) {
    executeHeadlessSort(algo, input.slice());
  }

  const batchSize = n <= 40 ? 2500 : n <= 300 ? 250 : 20;
  const copies = Array.from({ length: batchSize }, () => input.slice());
  let lastStats: HeadlessStats = { comparisons: 0, swaps: 0 };
  let completed = 0;
  const start = performance.now();

  for (let r = 0; r < batchSize; r++) {
    lastStats = executeHeadlessSort(algo, copies[r]);
    completed++;
    if (r >= 4 && performance.now() - start >= 40) break;
  }

  const totalElapsed = Math.max(0, performance.now() - start);
  const timeMs = Number((totalElapsed / Math.max(1, completed)).toFixed(4));

  return {
    algorithm: algo,
    label: SORT_META[algo].label,
    comparisons: lastStats.comparisons,
    swaps: lastStats.swaps,
    timeMs,
    complexityAvg: SORT_META[algo].complexity.timeAverage,
  };
}

