import { AnimationStep, OperationExplanation } from '../types/dsa';
import {
  GraphEdge,
  GraphEdgeState,
  GraphStateSnapshot,
  GraphVertex,
  GraphVertexState,
} from '../types/graph';
import { finalizeSteps } from '../utils/steps';

export interface GraphRunResult {
  steps: AnimationStep<GraphStateSnapshot>[];
  explanation: OperationExplanation;
}

class DisjointSet {
  private parent: Map<string, string> = new Map();
  private rank: Map<string, number> = new Map();

  constructor(ids: string[]) {
    for (const id of ids) {
      this.parent.set(id, id);
      this.rank.set(id, 0);
    }
  }

  public find(x: string): string {
    const p = this.parent.get(x)!;
    if (p !== x) {
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return x;
  }

  public union(a: string, b: string): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;

    const rankA = this.rank.get(ra) ?? 0;
    const rankB = this.rank.get(rb) ?? 0;
    if (rankA < rankB) {
      this.parent.set(ra, rb);
    } else if (rankA > rankB) {
      this.parent.set(rb, ra);
    } else {
      this.parent.set(rb, ra);
      this.rank.set(ra, rankA + 1);
    }
    return true;
  }
}

export class Graph {
  private vertices: GraphVertex[] = [];
  private edges: GraphEdge[] = [];
  private directed = false;
  private weighted = true;
  private presetName = 'default';
  private nextVertexNum = 1;
  private nextEdgeNum = 1;

  constructor(preset: 'default' | 'directed' | 'campus' = 'default') {
    this.loadPreset(preset);
  }

  public loadPreset(preset: 'default' | 'directed' | 'campus'): void {
    this.vertices = [];
    this.edges = [];
    this.nextVertexNum = 1;
    this.nextEdgeNum = 1;
    this.presetName = preset;

    if (preset === 'campus') {
      this.directed = false;
      this.weighted = true;
      const buildings: [string, string, number, number][] = [
        ['gate', 'Main Gate', 95, 210],
        ['admin', 'Admin Block', 235, 115],
        ['lib', 'Central Library', 410, 95],
        ['cse', 'CSE Lab Block', 585, 115],
        ['cafe', 'Cafeteria', 255, 295],
        ['aud', 'Auditorium', 425, 230],
        ['sports', 'Sports Complex', 645, 265],
        ['hostel', 'Hostel Complex', 475, 355],
      ];
      for (const [id, label, x, y] of buildings) {
        this.vertices.push({ id, label, x, y });
      }
      const paths: [string, string, number][] = [
        ['gate', 'admin', 120],
        ['gate', 'cafe', 140],
        ['admin', 'lib', 110],
        ['admin', 'cafe', 130],
        ['lib', 'cse', 150],
        ['lib', 'aud', 95],
        ['cafe', 'aud', 125],
        ['cafe', 'hostel', 210],
        ['aud', 'cse', 135],
        ['aud', 'hostel', 115],
        ['cse', 'sports', 165],
        ['hostel', 'sports', 180],
      ];
      for (const [from, to, w] of paths) {
        this.edges.push({ id: `e-${this.nextEdgeNum++}`, from, to, weight: w, blocked: false });
      }
      this.nextVertexNum = buildings.length + 1;
      return;
    }

    if (preset === 'directed') {
      this.directed = true;
      this.weighted = true;
      const nodes: [string, string, number, number][] = [
        ['S', 'S', 110, 210],
        ['A', 'A', 260, 105],
        ['B', 'B', 260, 315],
        ['C', 'C', 455, 105],
        ['D', 'D', 455, 315],
        ['T', 'T', 625, 210],
      ];
      for (const [id, label, x, y] of nodes) {
        this.vertices.push({ id, label, x, y });
      }
      const edges: [string, string, number][] = [
        ['S', 'A', 4],
        ['S', 'B', 2],
        ['A', 'C', 5],
        ['B', 'A', 1],
        ['B', 'D', 8],
        ['A', 'D', 10],
        ['C', 'D', 2],
        ['C', 'T', 6],
        ['D', 'T', 3],
      ];
      for (const [from, to, w] of edges) {
        this.edges.push({ id: `e-${this.nextEdgeNum++}`, from, to, weight: w, blocked: false });
      }
      this.nextVertexNum = nodes.length + 1;
      return;
    }

    this.directed = false;
    this.weighted = true;
    const nodes: [string, string, number, number][] = [
      ['A', 'A', 125, 155],
      ['B', 'B', 285, 85],
      ['C', 'C', 285, 295],
      ['D', 'D', 465, 125],
      ['E', 'E', 465, 315],
      ['F', 'F', 625, 210],
    ];
    for (const [id, label, x, y] of nodes) {
      this.vertices.push({ id, label, x, y });
    }
    const edges: [string, string, number][] = [
      ['A', 'B', 4],
      ['A', 'C', 2],
      ['B', 'C', 1],
      ['B', 'D', 5],
      ['C', 'D', 8],
      ['C', 'E', 10],
      ['D', 'E', 2],
      ['D', 'F', 6],
      ['E', 'F', 3],
    ];
    for (const [from, to, w] of edges) {
      this.edges.push({ id: `e-${this.nextEdgeNum++}`, from, to, weight: w, blocked: false });
    }
    this.nextVertexNum = nodes.length + 1;
  }

  public getSnapshot(options?: {
    vertexStates?: Map<string, GraphVertexState>;
    edgeStates?: Map<string, GraphEdgeState>;
    distances?: Map<string, number | null>;
    parents?: Map<string, string | null>;
    visitedOrder?: string[];
    frontierTitle?: string;
    frontierItems?: string[];
    mstTotalWeight?: number | null;
    shortestDistance?: number | null;
  }): GraphStateSnapshot {
    const vMap = new Map(this.vertices.map((v) => [v.id, v.label]));
    return {
      vertices: this.vertices.map((v) => {
        const parentId = options?.parents?.get(v.id) ?? null;
        return {
          ...v,
          state: options?.vertexStates?.get(v.id) ?? 'default',
          distance: options?.distances?.get(v.id) ?? null,
          parentLabel: parentId ? vMap.get(parentId) ?? parentId : null,
        };
      }),
      edges: this.edges.map((e) => ({
        ...e,
        state: e.blocked ? 'blocked' : options?.edgeStates?.get(e.id) ?? 'default',
      })),
      directed: this.directed,
      weighted: this.weighted,
      visitedOrder: options?.visitedOrder ?? [],
      frontierTitle: options?.frontierTitle,
      frontierItems: options?.frontierItems,
      mstTotalWeight: options?.mstTotalWeight ?? null,
      shortestDistance: options?.shortestDistance ?? null,
      presetName: this.presetName,
    };
  }

  public isDirected(): boolean {
    return this.directed;
  }

  public isWeighted(): boolean {
    return this.weighted;
  }

  public setDirected(directed: boolean): void {
    this.directed = directed;
  }

  public setWeighted(weighted: boolean): void {
    this.weighted = weighted;
  }

  public addVertex(label?: string): boolean {
    if (this.vertices.length >= 12) return false;
    const cleanLabel =
      label?.trim() || String.fromCharCode(64 + ((this.nextVertexNum - 1) % 26) + 1);
    const id = `v-${this.nextVertexNum++}`;
    const angle = (this.vertices.length * 137.5 * Math.PI) / 180;
    const radius = 110 + (this.vertices.length % 3) * 35;
    const x = Math.round(Math.max(85, Math.min(665, 375 + Math.cos(angle) * radius * 1.45)));
    const y = Math.round(Math.max(70, Math.min(340, 205 + Math.sin(angle) * radius * 0.85)));

    this.vertices.push({ id, label: cleanLabel, x, y });
    return true;
  }

  public removeVertex(id: string): boolean {
    const idx = this.vertices.findIndex((v) => v.id === id);
    if (idx === -1) return false;
    this.vertices.splice(idx, 1);
    this.edges = this.edges.filter((e) => e.from !== id && e.to !== id);
    return true;
  }

  public addEdge(from: string, to: string, weight = 1): boolean {
    if (from === to) return false;
    if (!this.vertices.some((v) => v.id === from) || !this.vertices.some((v) => v.id === to)) {
      return false;
    }
    const exists = this.edges.some((e) =>
      this.directed
        ? e.from === from && e.to === to
        : (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );
    if (exists) {
      const target = this.edges.find((e) =>
        this.directed
          ? e.from === from && e.to === to
          : (e.from === from && e.to === to) || (e.from === to && e.to === from)
      );
      if (target) target.weight = Math.max(1, weight);
      return true;
    }
    this.edges.push({
      id: `e-${this.nextEdgeNum++}`,
      from,
      to,
      weight: Math.max(1, weight),
      blocked: false,
    });
    return true;
  }

  public toggleBlockEdge(edgeId: string): boolean {
    const edge = this.edges.find((e) => e.id === edgeId);
    if (!edge) return false;
    edge.blocked = !edge.blocked;
    return true;
  }

  private getNeighbors(vertexId: string): { neighborId: string; edge: GraphEdge }[] {
    const result: { neighborId: string; edge: GraphEdge }[] = [];
    for (const edge of this.edges) {
      if (edge.blocked) continue;
      if (edge.from === vertexId) {
        result.push({ neighborId: edge.to, edge });
      } else if (!this.directed && edge.to === vertexId) {
        result.push({ neighborId: edge.from, edge });
      }
    }
    return result;
  }

  private getLabel(id: string): string {
    return this.vertices.find((v) => v.id === id)?.label ?? id;
  }

  public bfs(startId: string): GraphRunResult {
    const steps: AnimationStep<GraphStateSnapshot>[] = [];
    const pseudocode = [
      'queue = [start]; visited.add(start)',
      'while queue not empty:',
      '  u = queue.dequeue()',
      '  for each active neighbor v of u:',
      '    if v not visited: visited.add(v); queue.enqueue(v)',
    ];

    if (!this.vertices.some((v) => v.id === startId)) {
      return this.emptyError(`BFS(${startId})`, 'Start vertex does not exist.', pseudocode);
    }

    const visited = new Set<string>([startId]);
    const queue: string[] = [startId];
    const visitedOrder: string[] = [];
    const vertexStates = new Map<string, GraphVertexState>([[startId, 'visiting']]);
    const edgeStates = new Map<string, GraphEdgeState>();
    const distances = new Map<string, number | null>([[startId, 0]]);

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Initialize BFS at ${this.getLabel(startId)}`,
      description: `Marked ${this.getLabel(startId)} as visited (0 hops) and enqueued it.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        vertexStates,
        distances,
        visitedOrder: [...visitedOrder],
        frontierTitle: 'BFS Queue',
        frontierItems: queue.map((id) => this.getLabel(id)),
      }),
    });

    while (queue.length > 0) {
      const u = queue.shift()!;
      visitedOrder.push(this.getLabel(u));
      vertexStates.set(u, 'active');

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Dequeue ${this.getLabel(u)}`,
        description: `Exploring active neighbors of ${this.getLabel(u)}.`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot({
          vertexStates: new Map(vertexStates),
          edgeStates: new Map(edgeStates),
          distances: new Map(distances),
          visitedOrder: [...visitedOrder],
          frontierTitle: 'BFS Queue',
          frontierItems: queue.map((id) => this.getLabel(id)),
        }),
      });

      for (const { neighborId: v, edge } of this.getNeighbors(u)) {
        if (!visited.has(v)) {
          visited.add(v);
          queue.push(v);
          distances.set(v, (distances.get(u) ?? 0) + 1);
          vertexStates.set(v, 'visiting');
          edgeStates.set(edge.id, 'relaxed');

          steps.push({
            stepNumber: steps.length + 1,
            totalSteps: 1,
            title: `Discover ${this.getLabel(v)}`,
            description: `Discovered ${this.getLabel(v)} at hop distance ${distances.get(v)} via ${this.getLabel(u)}.`,
            activeLineIndex: 4,
            stateSnapshot: this.getSnapshot({
              vertexStates: new Map(vertexStates),
              edgeStates: new Map(edgeStates),
              distances: new Map(distances),
              visitedOrder: [...visitedOrder],
              frontierTitle: 'BFS Queue',
              frontierItems: queue.map((id) => this.getLabel(id)),
            }),
          });
        }
      }

      vertexStates.set(u, 'visited');
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: 'BFS Complete',
      description: `Reachable order: ${visitedOrder.join(' -> ')} (${visited.size}/${this.vertices.length} reachable).`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot({
        vertexStates: new Map(vertexStates),
        edgeStates: new Map(edgeStates),
        distances: new Map(distances),
        visitedOrder: [...visitedOrder],
        frontierTitle: 'BFS Queue',
        frontierItems: [],
      }),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `BFS(${this.getLabel(startId)})`,
        displayName: 'Breadth-First Search',
        whatHappens: `Explores the graph level by level from ${this.getLabel(startId)}, avoiding blocked edges.`,
        pseudocode,
        complexity: {
          timeBest: 'O(V + E)',
          timeAverage: 'O(V + E)',
          timeWorst: 'O(V + E)',
          auxiliarySpace: 'O(V)',
        },
        resultMessage: `Visited ${visited.size} of ${this.vertices.length} vertices: ${visitedOrder.join(' -> ')}`,
        status: 'success',
      },
    };
  }

  public dfs(startId: string): GraphRunResult {
    const steps: AnimationStep<GraphStateSnapshot>[] = [];
    const pseudocode = [
      'stack = [start]',
      'while stack not empty:',
      '  u = stack.pop()',
      '  if u not visited: mark visited; push unvisited neighbors',
    ];

    if (!this.vertices.some((v) => v.id === startId)) {
      return this.emptyError(`DFS(${startId})`, 'Start vertex does not exist.', pseudocode);
    }

    const visited = new Set<string>();
    const stack: string[] = [startId];
    const visitedOrder: string[] = [];
    const vertexStates = new Map<string, GraphVertexState>([[startId, 'visiting']]);
    const edgeStates = new Map<string, GraphEdgeState>();

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Push Start ${this.getLabel(startId)}`,
      description: `Initialized DFS stack with ${this.getLabel(startId)}.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        vertexStates,
        visitedOrder: [],
        frontierTitle: 'DFS Stack',
        frontierItems: stack.map((id) => this.getLabel(id)),
      }),
    });

    while (stack.length > 0) {
      const u = stack.pop()!;
      if (visited.has(u)) continue;
      visited.add(u);
      visitedOrder.push(this.getLabel(u));
      vertexStates.set(u, 'active');

      const neighbors = this.getNeighbors(u);
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const { neighborId: v, edge } = neighbors[i];
        if (!visited.has(v)) {
          stack.push(v);
          vertexStates.set(v, 'visiting');
          edgeStates.set(edge.id, 'considering');
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Visit ${this.getLabel(u)}`,
        description: `Popped ${this.getLabel(u)}, marked visited, and pushed unvisited neighbors onto stack.`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot({
          vertexStates: new Map(vertexStates),
          edgeStates: new Map(edgeStates),
          visitedOrder: [...visitedOrder],
          frontierTitle: 'DFS Stack',
          frontierItems: stack.map((id) => this.getLabel(id)),
        }),
      });

      vertexStates.set(u, 'visited');
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: 'DFS Complete',
      description: `Depth-first traversal order: ${visitedOrder.join(' -> ')}.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot({
        vertexStates: new Map(vertexStates),
        edgeStates: new Map(edgeStates),
        visitedOrder: [...visitedOrder],
        frontierTitle: 'DFS Stack',
        frontierItems: [],
      }),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `DFS(${this.getLabel(startId)})`,
        displayName: 'Depth-First Search',
        whatHappens: `Walks as deep as possible along active edges from ${this.getLabel(startId)} before backtracking.`,
        pseudocode,
        complexity: {
          timeBest: 'O(V + E)',
          timeAverage: 'O(V + E)',
          timeWorst: 'O(V + E)',
          auxiliarySpace: 'O(V)',
        },
        resultMessage: `DFS order: ${visitedOrder.join(' -> ')}`,
        status: 'success',
      },
    };
  }

  public dijkstra(sourceId: string, targetId?: string): GraphRunResult {
    const steps: AnimationStep<GraphStateSnapshot>[] = [];
    const pseudocode = [
      'dist[*] = Infinity; dist[source] = 0',
      'while unvisited nodes remain:',
      '  u = unvisited vertex with min dist[u]',
      '  for each active edge (u, v, w):',
      '    if dist[u] + w < dist[v]: dist[v] = dist[u] + w; prev[v] = u',
    ];

    if (!this.vertices.some((v) => v.id === sourceId)) {
      return this.emptyError('DIJKSTRA', 'Source vertex does not exist.', pseudocode);
    }

    const dist = new Map<string, number>();
    const prev = new Map<string, string | null>();
    const prevEdge = new Map<string, string | null>();
    const settled = new Set<string>();
    const visitedOrder: string[] = [];

    for (const v of this.vertices) {
      dist.set(v.id, Infinity);
      prev.set(v.id, null);
      prevEdge.set(v.id, null);
    }
    dist.set(sourceId, 0);

    const vertexStates = new Map<string, GraphVertexState>([[sourceId, 'source']]);
    const edgeStates = new Map<string, GraphEdgeState>();

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Initialize Distances from ${this.getLabel(sourceId)}`,
      description: `Set dist[${this.getLabel(sourceId)}] = 0 and all other distances to Infinity.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        vertexStates: new Map(vertexStates),
        distances: this.formatDistMap(dist),
        parents: new Map(prev),
        visitedOrder: [],
        frontierTitle: 'Unsettled Min-Dist',
        frontierItems: [`${this.getLabel(sourceId)}(0)`],
      }),
    });

    while (settled.size < this.vertices.length) {
      let u: string | null = null;
      let bestDist = Infinity;
      for (const v of this.vertices) {
        const d = dist.get(v.id)!;
        if (!settled.has(v.id) && d < bestDist) {
          bestDist = d;
          u = v.id;
        }
      }

      if (!u || bestDist === Infinity) break;

      settled.add(u);
      visitedOrder.push(this.getLabel(u));
      vertexStates.set(u, 'active');

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Settle Minimum Node ${this.getLabel(u)} (dist = ${bestDist})`,
        description: `Picked ${this.getLabel(u)} with lowest tentative distance ${bestDist}.`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot({
          vertexStates: new Map(vertexStates),
          edgeStates: new Map(edgeStates),
          distances: this.formatDistMap(dist),
          parents: new Map(prev),
          visitedOrder: [...visitedOrder],
          frontierTitle: 'Settled',
          frontierItems: [...visitedOrder],
        }),
      });

      if (targetId && u === targetId) break;

      for (const { neighborId: v, edge } of this.getNeighbors(u)) {
        if (settled.has(v)) continue;
        const weight = this.weighted ? edge.weight : 1;
        const candidate = bestDist + weight;
        edgeStates.set(edge.id, 'considering');

        if (candidate < dist.get(v)!) {
          dist.set(v, candidate);
          prev.set(v, u);
          prevEdge.set(v, edge.id);
          vertexStates.set(v, 'visiting');
          edgeStates.set(edge.id, 'relaxed');

          steps.push({
            stepNumber: steps.length + 1,
            totalSteps: 1,
            title: `Relax Edge ${this.getLabel(u)} -> ${this.getLabel(v)}`,
            description: `Improved dist[${this.getLabel(v)}] to ${candidate} (${bestDist} + ${weight}).`,
            activeLineIndex: 4,
            stateSnapshot: this.getSnapshot({
              vertexStates: new Map(vertexStates),
              edgeStates: new Map(edgeStates),
              distances: this.formatDistMap(dist),
              parents: new Map(prev),
              visitedOrder: [...visitedOrder],
              frontierTitle: 'Settled',
              frontierItems: [...visitedOrder],
            }),
          });
        }
      }

      vertexStates.set(u, u === sourceId ? 'source' : 'visited');
    }

    let shortestDist: number | null = null;
    const pathLabels: string[] = [];

    if (targetId && this.vertices.some((v) => v.id === targetId)) {
      const targetDist = dist.get(targetId)!;
      if (targetDist < Infinity) {
        shortestDist = targetDist;
        let curr: string | null = targetId;
        while (curr) {
          pathLabels.unshift(this.getLabel(curr));
          vertexStates.set(curr, curr === sourceId ? 'source' : curr === targetId ? 'target' : 'path');
          const eId = prevEdge.get(curr);
          if (eId) edgeStates.set(eId, 'path');
          curr = prev.get(curr) ?? null;
        }
      }

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title:
          shortestDist !== null
            ? `Shortest Route Found (${shortestDist})`
            : `No Active Path to ${this.getLabel(targetId)}`,
        description:
          shortestDist !== null
            ? `Shortest path: ${pathLabels.join(' -> ')} (total weight: ${shortestDist}).`
            : `${this.getLabel(targetId)} is unreachable from ${this.getLabel(sourceId)} with current active edges.`,
        activeLineIndex: 4,
        stateSnapshot: this.getSnapshot({
          vertexStates: new Map(vertexStates),
          edgeStates: new Map(edgeStates),
          distances: this.formatDistMap(dist),
          parents: new Map(prev),
          visitedOrder: [...visitedOrder],
          shortestDistance: shortestDist,
          frontierTitle: 'Shortest Path',
          frontierItems: pathLabels.length > 0 ? pathLabels : ['Unreachable'],
        }),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `DIJKSTRA(${this.getLabel(sourceId)} -> ${this.getLabel(targetId)})`,
          displayName: "Dijkstra's Shortest Path",
          whatHappens: `Greedily settles the closest unvisited vertex and relaxes outgoing active edges until reaching ${this.getLabel(targetId)}.`,
          pseudocode,
          complexity: {
            timeBest: 'O((V + E) log V)',
            timeAverage: 'O((V + E) log V)',
            timeWorst: 'O(V^2)',
            auxiliarySpace: 'O(V)',
          },
          resultMessage:
            shortestDist !== null
              ? `Path: ${pathLabels.join(' -> ')} (Cost: ${shortestDist})`
              : `No path to ${this.getLabel(targetId)}.`,
          status: shortestDist !== null ? 'success' : 'warning',
        },
      };
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `DIJKSTRA(${this.getLabel(sourceId)})`,
        displayName: "Dijkstra's Single-Source Paths",
        whatHappens: `Computed shortest distances from ${this.getLabel(sourceId)} to all reachable vertices.`,
        pseudocode,
        complexity: {
          timeBest: 'O((V + E) log V)',
          timeAverage: 'O((V + E) log V)',
          timeWorst: 'O(V^2)',
          auxiliarySpace: 'O(V)',
        },
        resultMessage: `Settled ${visitedOrder.length} reachable vertices.`,
        status: 'success',
      },
    };
  }

  public prim(startId: string): GraphRunResult {
    const steps: AnimationStep<GraphStateSnapshot>[] = [];
    const pseudocode = [
      'inMST = {start}; total = 0',
      'while edges remain connecting MST to outside vertex:',
      '  pick min-weight active edge (u, v) crossing the cut',
      '  add v and edge (u, v) to MST; total += weight',
    ];

    if (this.directed) {
      return this.emptyError(
        'PRIM_MST',
        "Prim's MST requires an undirected graph. Disable Directed mode first.",
        pseudocode
      );
    }
    if (!this.vertices.some((v) => v.id === startId)) {
      return this.emptyError('PRIM_MST', 'Start vertex does not exist.', pseudocode);
    }

    const inMST = new Set<string>([startId]);
    const vertexStates = new Map<string, GraphVertexState>([[startId, 'source']]);
    const edgeStates = new Map<string, GraphEdgeState>();
    const visitedOrder = [this.getLabel(startId)];
    let totalWeight = 0;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Seed Prim MST at ${this.getLabel(startId)}`,
      description: `Added ${this.getLabel(startId)} to the MST set.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        vertexStates: new Map(vertexStates),
        visitedOrder: [...visitedOrder],
        mstTotalWeight: 0,
        frontierTitle: 'MST Vertices',
        frontierItems: [...visitedOrder],
      }),
    });

    while (inMST.size < this.vertices.length) {
      let bestEdge: GraphEdge | null = null;
      let nextVertex: string | null = null;
      let bestWeight = Infinity;

      for (const edge of this.edges) {
        if (edge.blocked) continue;
        const w = this.weighted ? edge.weight : 1;
        const fromIn = inMST.has(edge.from);
        const toIn = inMST.has(edge.to);
        if (fromIn !== toIn && w < bestWeight) {
          bestWeight = w;
          bestEdge = edge;
          nextVertex = fromIn ? edge.to : edge.from;
        }
      }

      if (!bestEdge || !nextVertex) break;

      inMST.add(nextVertex);
      totalWeight += bestWeight;
      visitedOrder.push(this.getLabel(nextVertex));
      vertexStates.set(nextVertex, 'path');
      edgeStates.set(bestEdge.id, 'mst');

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Add Edge ${this.getLabel(bestEdge.from)} - ${this.getLabel(bestEdge.to)} (${bestWeight})`,
        description: `Selected minimum cut edge of weight ${bestWeight} connecting ${this.getLabel(nextVertex)}. Running total: ${totalWeight}.`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot({
          vertexStates: new Map(vertexStates),
          edgeStates: new Map(edgeStates),
          visitedOrder: [...visitedOrder],
          mstTotalWeight: totalWeight,
          frontierTitle: 'MST Vertices',
          frontierItems: [...visitedOrder],
        }),
      });
    }

    const spannedAll = inMST.size === this.vertices.length;
    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `PRIM_MST(${this.getLabel(startId)})`,
        displayName: "Prim's Minimum Spanning Tree",
        whatHappens: 'Grows a single tree by repeatedly picking the lightest active edge connecting an unvisited vertex.',
        pseudocode,
        complexity: {
          timeBest: 'O(E log V)',
          timeAverage: 'O(E log V)',
          timeWorst: 'O(V^2)',
          auxiliarySpace: 'O(V)',
        },
        resultMessage: spannedAll
          ? `Spanning tree total cost: ${totalWeight}`
          : `Spanning forest (${inMST.size}/${this.vertices.length} connected), cost: ${totalWeight}`,
        status: spannedAll ? 'success' : 'warning',
      },
    };
  }

  public kruskal(): GraphRunResult {
    const steps: AnimationStep<GraphStateSnapshot>[] = [];
    const pseudocode = [
      'sort all active edges ascending by weight',
      'initialize DisjointSet(V)',
      'for each edge (u, v, w) in sorted edges:',
      '  if find(u) != find(v): union(u, v); add edge to MST',
    ];

    if (this.directed) {
      return this.emptyError(
        'KRUSKAL_MST',
        "Kruskal's MST requires an undirected graph. Disable Directed mode first.",
        pseudocode
      );
    }

    const dsu = new DisjointSet(this.vertices.map((v) => v.id));
    const sortedEdges = [...this.edges]
      .filter((e) => !e.blocked)
      .sort((a, b) => (this.weighted ? a.weight : 1) - (this.weighted ? b.weight : 1));

    const vertexStates = new Map<string, GraphVertexState>();
    const edgeStates = new Map<string, GraphEdgeState>();
    const acceptedEdges: string[] = [];
    let totalWeight = 0;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Sorted ${sortedEdges.length} Active Edges`,
      description: 'Edges sorted ascending by weight. Starting Disjoint Set cycle checks.',
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        mstTotalWeight: 0,
        frontierTitle: 'MST Edges',
        frontierItems: [],
      }),
    });

    for (const edge of sortedEdges) {
      const w = this.weighted ? edge.weight : 1;
      const merged = dsu.union(edge.from, edge.to);

      if (merged) {
        totalWeight += w;
        edgeStates.set(edge.id, 'mst');
        vertexStates.set(edge.from, 'path');
        vertexStates.set(edge.to, 'path');
        acceptedEdges.push(`${this.getLabel(edge.from)}-${this.getLabel(edge.to)}(${w})`);

        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Accept ${this.getLabel(edge.from)} - ${this.getLabel(edge.to)} (${w})`,
          description: `No cycle formed. Added to MST (running cost: ${totalWeight}).`,
          activeLineIndex: 3,
          stateSnapshot: this.getSnapshot({
            vertexStates: new Map(vertexStates),
            edgeStates: new Map(edgeStates),
            mstTotalWeight: totalWeight,
            visitedOrder: [...acceptedEdges],
            frontierTitle: 'MST Edges',
            frontierItems: [...acceptedEdges],
          }),
        });

        if (acceptedEdges.length === Math.max(0, this.vertices.length - 1)) break;
      } else {
        const tempEdges = new Map(edgeStates);
        tempEdges.set(edge.id, 'considering');
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Skip ${this.getLabel(edge.from)} - ${this.getLabel(edge.to)} (Cycle)`,
          description: `${this.getLabel(edge.from)} and ${this.getLabel(edge.to)} already share a component; skipped to avoid cycle.`,
          activeLineIndex: 3,
          stateSnapshot: this.getSnapshot({
            vertexStates: new Map(vertexStates),
            edgeStates: tempEdges,
            mstTotalWeight: totalWeight,
            visitedOrder: [...acceptedEdges],
            frontierTitle: 'MST Edges',
            frontierItems: [...acceptedEdges],
          }),
        });
      }
    }

    const complete = acceptedEdges.length === Math.max(0, this.vertices.length - 1);
    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'KRUSKAL_MST()',
        displayName: "Kruskal's Minimum Spanning Tree",
        whatHappens: 'Processes edges globally from lightest to heaviest, using Union-Find to reject cycle-forming edges.',
        pseudocode,
        complexity: {
          timeBest: 'O(E log E)',
          timeAverage: 'O(E log E)',
          timeWorst: 'O(E log E)',
          auxiliarySpace: 'O(V)',
        },
        resultMessage: complete
          ? `Spanning tree total cost: ${totalWeight} (${acceptedEdges.length} edges)`
          : `Forest built (${acceptedEdges.length} edges), total cost: ${totalWeight}`,
        status: complete ? 'success' : 'warning',
      },
    };
  }

  private formatDistMap(dist: Map<string, number>): Map<string, number | null> {
    const out = new Map<string, number | null>();
    for (const [k, v] of dist.entries()) {
      out.set(k, v === Infinity ? null : v);
    }
    return out;
  }

  private emptyError(op: string, message: string, pseudocode: string[]): GraphRunResult {
    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Cannot Run Operation',
          description: message,
          activeLineIndex: 0,
          stateSnapshot: this.getSnapshot(),
        },
      ]),
      explanation: {
        operationName: op,
        displayName: 'Graph Operation Blocked',
        whatHappens: message,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: message,
        status: 'warning',
      },
    };
  }
}

