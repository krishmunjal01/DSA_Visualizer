import { AnimationStep } from '../types/dsa';

/**
 * Stamps 1-based stepNumber, totalSteps, and marks the final frame complete.
 */
export function finalizeSteps<T>(steps: AnimationStep<T>[]): AnimationStep<T>[] {
  const total = steps.length;
  return steps.map((step, idx) => ({
    ...step,
    stepNumber: idx + 1,
    totalSteps: total,
    isComplete: idx === total - 1,
  }));
}

