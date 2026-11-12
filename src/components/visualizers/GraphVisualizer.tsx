import React from 'react';
import {
  GraphStateSnapshot,
  GraphVertexState,
  GraphEdgeState,
} from '../../types/graph';
import { Share2 } from 'lucide-react';

interface GraphVisualizerProps {
  snapshot: GraphStateSnapshot;
  onToggleEdgeBlock?: (edgeId: string) => void;
  weightUnit?: string;
}

const VERTEX_COLORS: Record<GraphVertexState, { fill: string; stroke: string; text: string }> = {
  default: { fill: '#ffffff', stroke: '#cbd5e1', text: '#0f172a' },
  source: { fill: '#2563eb', stroke: '#1d4ed8', text: '#ffffff' },
  target: { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff' },
  active: { fill: '#f59e0b', stroke: '#d97706', text: '#ffffff' },
  visiting: { fill: '#0ea5e9', stroke: '#0284c7', text: '#ffffff' },
  visited: { fill: '#06b6d4', stroke: '#0891b2', text: '#ffffff' },
  path: { fill: '#10b981', stroke: '#059669', text: '#ffffff' },
};

const EDGE_COLORS: Record<GraphEdgeState, { stroke: string; width: number; dash?: string }> = {
  default: { stroke: '#cbd5e1', width: 2.2 },
  considering: { stroke: '#f59e0b', width: 3.2 },
  relaxed: { stroke: '#2563eb', width: 3.2 },
  path: { stroke: '#10b981', width: 4 },
  mst: { stroke: '#10b981', width: 4 },
  blocked: { stroke: '#ef4444', width: 2.5, dash: '6 5' },
};

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({
  snapshot,
  onToggleEdgeBlock,
  weightUnit = '',
}) => {
  const {
    vertices,
    edges,
    directed,
    weighted,
    visitedOrder,
    frontierTitle,
    frontierItems,
    mstTotalWeight,
    shortestDistance,
  } = snapshot;

  const vertexById = new Map(vertices.map((v) => [v.id, v]));

  if (vertices.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-3">
          <Share2 className="w-6 h-6 text-brand-500" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Graph is Empty</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Add vertices and edges or load a sample graph preset to run traversals, Dijkstra, Prim, or Kruskal.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-slate-50/80 border border-slate-200/70 rounded-xl text-xs text-slate-600">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-brand-600" />
            {directed ? 'Directed' : 'Undirected'} {weighted ? 'Weighted Graph' : 'Graph'}
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            |V| = <strong className="text-brand-700">{vertices.length}</strong>
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            |E| = <strong className="text-brand-700">{edges.length}</strong>
          </span>
          {shortestDistance !== null && shortestDistance !== undefined && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold">
              Shortest: {shortestDistance}
              {weightUnit}
            </span>
          )}
          {mstTotalWeight !== null && mstTotalWeight !== undefined && (
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold">
              MST Cost: {mstTotalWeight}
              {weightUnit}
            </span>
          )}
        </div>

        {onToggleEdgeBlock && (
          <span className="text-[11px] text-slate-500">
            Click any edge to toggle road/edge block
          </span>
        )}
      </div>

      <div className="w-full overflow-x-auto bg-slate-50/40 border border-slate-200/70 rounded-xl p-2">
        <svg viewBox="0 0 740 420" className="w-full h-auto min-w-[540px]">
          <defs>
            <marker
              id="graph-arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
            </marker>
            <marker
              id="graph-arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
            </marker>
          </defs>

          {edges.map((edge) => {
            const fromV = vertexById.get(edge.from);
            const toV = vertexById.get(edge.to);
            if (!fromV || !toV) return null;

            const dx = toV.x - fromV.x;
            const dy = toV.y - fromV.y;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const radius = 23;

            const x1 = fromV.x + ux * radius;
            const y1 = fromV.y + uy * radius;
            const x2 = toV.x - ux * (directed ? radius + 4 : radius);
            const y2 = toV.y - uy * (directed ? radius + 4 : radius);

            const midX = (fromV.x + toV.x) / 2;
            const midY = (fromV.y + toV.y) / 2;
            const normalX = -uy * 11;
            const normalY = ux * 11;

            const visualState: GraphEdgeState = edge.blocked ? 'blocked' : edge.state ?? 'default';
            const style = EDGE_COLORS[visualState];
            const marker =
              directed && !edge.blocked
                ? visualState === 'path' || visualState === 'mst'
                  ? 'url(#graph-arrow-active)'
                  : 'url(#graph-arrow-default)'
                : undefined;

            return (
              <g
                key={edge.id}
                onClick={() => onToggleEdgeBlock?.(edge.id)}
                className={onToggleEdgeBlock ? 'cursor-pointer' : undefined}
              >
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={14}
                />
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={style.stroke}
                  strokeWidth={style.width}
                  strokeDasharray={style.dash}
                  markerEnd={marker}
                />
                {(weighted || edge.blocked) && (
                  <g transform={`translate(${midX + normalX}, ${midY + normalY})`}>
                    <rect
                      x={edge.blocked ? -24 : -15}
                      y={-10}
                      width={edge.blocked ? 48 : 30}
                      height={20}
                      rx={6}
                      fill={edge.blocked ? '#fef2f2' : '#ffffff'}
                      stroke={edge.blocked ? '#fca5a5' : '#e2e8f0'}
                    />
                    <text
                      x={0}
                      y={4}
                      textAnchor="middle"
                      fill={edge.blocked ? '#dc2626' : '#334155'}
                      className="text-[10px] font-mono font-semibold select-none"
                    >
                      {edge.blocked ? 'BLOCK' : `${edge.weight}${weightUnit}`}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {vertices.map((v) => {
            const style = VERTEX_COLORS[v.state ?? 'default'];
            const shortLabel = v.label.length > 10 ? `${v.label.slice(0, 9)}..` : v.label;

            return (
              <g key={v.id}>
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={22}
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth={2.5}
                />
                <text
                  x={v.x}
                  y={v.y + 4}
                  textAnchor="middle"
                  fill={style.text}
                  className="text-xs font-mono font-bold select-none"
                >
                  {v.id}
                </text>
                {v.label !== v.id && (
                  <text
                    x={v.x}
                    y={v.y + 35}
                    textAnchor="middle"
                    fill="#334155"
                    className="text-[10px] font-medium select-none"
                  >
                    {shortLabel}
                  </text>
                )}
                {v.distance !== undefined && (
                  <text
                    x={v.x}
                    y={v.y - 27}
                    textAnchor="middle"
                    fill="#1d4ed8"
                    className="text-[10px] font-mono font-semibold select-none"
                  >
                    d={v.distance === null ? 'inf' : v.distance}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {(visitedOrder.length > 0 || (frontierItems && frontierItems.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              Visited Order
            </span>
            <div className="font-mono text-slate-700 break-words">
              {visitedOrder.length > 0 ? visitedOrder.join(' -> ') : '---'}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
              {frontierTitle ?? 'Frontier'}
            </span>
            <div className="font-mono text-slate-700 break-words">
              {frontierItems && frontierItems.length > 0 ? frontierItems.join(', ') : 'empty'}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-600 inline-block" /> Source
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Active
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" /> Visited
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Shortest Path / MST
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Blocked Edge
        </span>
      </div>
    </div>
  );
};
