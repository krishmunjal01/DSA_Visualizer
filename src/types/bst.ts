export interface BSTNodeData {
  id: string;
  value: number;
  leftId: string | null;
  rightId: string | null;
  parentId: string | null;
  x?: number;
  y?: number;
  level?: number;
  state?: 'default' | 'active' | 'comparing' | 'found' | 'inserting' | 'deleting' | 'visited' | 'min-max';
  highlightLabel?: string;
}

export interface BSTStateSnapshot {
  nodes: Record<string, BSTNodeData>;
  rootId: string | null;
  size: number;
  height: number;
  message?: string;
}
