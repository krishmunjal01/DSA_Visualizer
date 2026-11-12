export type GraphVertexState = 'default' | 'active' | 'visiting' | 'visited' | 'path' | 'source' | 'target';
export type GraphEdgeState = 'default' | 'considering' | 'relaxed' | 'path' | 'mst' | 'blocked';

export interface GraphVertex {
  id: string;
  label: string;
  x: number;
  y: number;
  state?: GraphVertexState;
  distance?: number | null;
  parentLabel?: string | null;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  blocked?: boolean;
  state?: GraphEdgeState;
}

export interface GraphStateSnapshot {
  vertices: GraphVertex[];
  edges: GraphEdge[];
  directed: boolean;
  weighted: boolean;
  visitedOrder: string[];
  frontierTitle?: string;
  frontierItems?: string[];
  mstTotalWeight?: number | null;
  shortestDistance?: number | null;
  presetName: string;
}

