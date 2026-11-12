export type DSAType =
  | 'linked-list'
  | 'stack'
  | 'queue'
  | 'bst'
  | 'hash-table'
  | 'heap'
  | 'priority-queue'
  | 'graph';

export type AppView = 'home' | DSAType | 'algorithms' | 'compare' | 'campus';

export interface ComplexityInfo {
  timeBest: string;
  timeAverage: string;
  timeWorst: string;
  auxiliarySpace: string;
  notes?: string;
}

export interface AnimationStep<TState = unknown> {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  activeLineIndex?: number;
  stateSnapshot: TState;
  isComplete?: boolean;
}

export interface OperationExplanation {
  operationName: string;
  displayName: string;
  whatHappens: string;
  pseudocode: string[];
  complexity: ComplexityInfo;
  resultMessage: string;
  status: 'idle' | 'success' | 'warning' | 'error';
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  dsType: string;
  operationName: string;
  description: string;
  success: boolean;
}
