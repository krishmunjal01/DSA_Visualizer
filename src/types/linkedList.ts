export interface LLNodeData {
  id: string;
  value: number | string;
  nextId: string | null;
  state?: 'default' | 'active' | 'comparing' | 'found' | 'deleting' | 'inserted' | 'secondary';
  highlightLabel?: string; // e.g. "curr", "prev", "new"
}

export interface LLStateSnapshot {
  nodes: LLNodeData[];
  headId: string | null;
  tailId: string | null;
  size: number;
  message?: string;
}
