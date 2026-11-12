import { BarState, SearchAlgorithmId, SearchStepSnapshot } from '../types/algorithms';
import { AnimationStep, OperationExplanation } from '../types/dsa';
import { finalizeSteps } from '../utils/steps';

export function runSearchWithTrace(
  algo: SearchAlgorithmId,
  input: number[],
  target: number
): { steps: AnimationStep<SearchStepSnapshot>[]; explanation: OperationExplanation } {
  const arr = algo === 'binary' ? [...input].sort((a, b) => a - b) : [...input];
  const steps: AnimationStep<SearchStepSnapshot>[] = [];
  let comparisons = 0;

  const snapshot = (
    states: Map<number, BarState>,
    opts?: { low?: number; mid?: number; high?: number; currentIndex?: number; foundIndex?: number | null }
  ): SearchStepSnapshot => ({
    items: arr.map((value, idx) => ({
      id: `s-${idx}`,
      value,
      state: states.get(idx) ?? 'default',
    })),
    target,
    low: opts?.low,
    mid: opts?.mid,
    high: opts?.high,
    currentIndex: opts?.currentIndex,
    foundIndex: opts?.foundIndex ?? null,
    comparisons,
  });

  if (algo === 'linear') {
    const pseudocode = [
      'for i = 0 to n - 1:',
      '  if arr[i] == target: return i',
      'return -1',
    ];

    for (let i = 0; i < arr.length; i++) {
      comparisons++;
      if (arr[i] === target) {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Match Found at [${i}]`,
          description: `arr[${i}] == ${target}. Returned index [${i}] after ${comparisons} comparison(s).`,
          activeLineIndex: 1,
          stateSnapshot: snapshot(new Map([[i, 'found']]), { currentIndex: i, foundIndex: i }),
        });

        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `LINEAR_SEARCH(${target})`,
            displayName: 'Linear Search',
            whatHappens: `Scans array elements sequentially from index 0 until ${target} is matched.`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(n)',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Found ${target} at index [${i}] in ${comparisons} comparison(s).`,
            status: 'success',
          },
        };
      }

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Check Index [${i}] (${arr[i]})`,
        description: `${arr[i]} != ${target}; advancing to index [${i + 1}].`,
        activeLineIndex: 0,
        stateSnapshot: snapshot(new Map([[i, 'comparing']]), { currentIndex: i }),
      });
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: `Target ${target} Not Found`,
      description: `Checked all ${arr.length} elements without matching ${target}.`,
      activeLineIndex: 2,
      stateSnapshot: snapshot(new Map()),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `LINEAR_SEARCH(${target})`,
        displayName: 'Linear Search',
        whatHappens: `Checked all elements sequentially; ${target} is absent.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Target ${target} not found (${comparisons} comparisons).`,
        status: 'warning',
      },
    };
  }

  const pseudocode = [
    'low = 0; high = n - 1',
    'while low <= high:',
    '  mid = floor((low + high) / 2)',
    '  if arr[mid] == target: return mid',
    '  else if arr[mid] < target: low = mid + 1; else high = mid - 1',
  ];

  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    comparisons++;
    const states = new Map<number, BarState>();
    for (let i = 0; i < arr.length; i++) {
      if (i < low || i > high) states.set(i, 'discarded');
    }
    states.set(mid, 'comparing');

    if (arr[mid] === target) {
      states.set(mid, 'found');
      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Found ${target} at Mid [${mid}]`,
        description: `arr[${mid}] == ${target}. Binary search succeeded in ${comparisons} comparison(s).`,
        activeLineIndex: 3,
        stateSnapshot: snapshot(states, { low, mid, high, foundIndex: mid }),
      });
      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `BINARY_SEARCH(${target})`,
          displayName: 'Binary Search (Sorted)',
          whatHappens: `Halves the active sorted range [low..high] each step until arr[mid] matches ${target}.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(log n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Found ${target} at sorted index [${mid}] in ${comparisons} comparison(s).`,
          status: 'success',
        },
      };
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: `Probe Mid [${mid}] = ${arr[mid]}`,
      description:
        arr[mid] < target
          ? `${arr[mid]} < ${target}: discarding left half, moving low = ${mid + 1}.`
          : `${arr[mid]} > ${target}: discarding right half, moving high = ${mid - 1}.`,
      activeLineIndex: 4,
      stateSnapshot: snapshot(states, { low, mid, high }),
    });

    if (arr[mid] < target) low = mid + 1;
    else high = mid - 1;
  }

  const discarded = new Map<number, BarState>();
  for (let i = 0; i < arr.length; i++) discarded.set(i, 'discarded');
  steps.push({
    stepNumber: steps.length + 1,
    totalSteps: 1,
    title: `Target ${target} Not Found`,
    description: `Search window closed (low > high). ${target} is not in the array.`,
    activeLineIndex: 1,
    stateSnapshot: snapshot(discarded),
  });

  return {
    steps: finalizeSteps(steps),
    explanation: {
      operationName: `BINARY_SEARCH(${target})`,
      displayName: 'Binary Search (Sorted)',
      whatHappens: `Sorted range narrowed to empty without finding ${target}.`,
      pseudocode,
      complexity: {
        timeBest: 'O(1)',
        timeAverage: 'O(log n)',
        timeWorst: 'O(log n)',
        auxiliarySpace: 'O(1)',
      },
      resultMessage: `Target ${target} not found (${comparisons} comparisons).`,
      status: 'warning',
    },
  };
}

