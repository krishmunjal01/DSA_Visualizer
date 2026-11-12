export type HeapOrder = 'min' | 'max';
export type HeapMode = 'heap' | 'priority-queue';
export type HeapItemState = 'default' | 'active' | 'comparing' | 'swapping' | 'inserted' | 'extracting';

export interface HeapNodeItem {
  id: string;
  priority: number;
  label?: string;
  state?: HeapItemState;
  x?: number;
  y?: number;
}

export interface HeapStateSnapshot {
  items: HeapNodeItem[];
  order: HeapOrder;
  mode: HeapMode;
  size: number;
}

