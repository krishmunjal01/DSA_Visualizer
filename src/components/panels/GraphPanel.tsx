import React, { useEffect, useState } from 'react';
import { GraphVertex } from '../../types/graph';
import { sound } from '../common/SoundEffects';
import { Play, Plus, Route, Network, Settings2, Database } from 'lucide-react';

interface GraphPanelProps {
  vertices: GraphVertex[];
  directed: boolean;
  weighted: boolean;
  isAnimating: boolean;
  onRunBFS: (startId: string) => void;
  onRunDFS: (startId: string) => void;
  onRunDijkstra: (sourceId: string, targetId?: string) => void;
  onRunPrim: (startId: string) => void;
  onRunKruskal: () => void;
  onSetDirected: (directed: boolean) => void;
  onSetWeighted: (weighted: boolean) => void;
  onAddVertex: (label?: string) => void;
  onAddEdge: (from: string, to: string, weight: number) => void;
  onLoadPreset: (preset: 'default' | 'directed' | 'campus') => void;
}

export const GraphPanel: React.FC<GraphPanelProps> = ({
  vertices,
  directed,
  weighted,
  isAnimating,
  onRunBFS,
  onRunDFS,
  onRunDijkstra,
  onRunPrim,
  onRunKruskal,
  onSetDirected,
  onSetWeighted,
  onAddVertex,
  onAddEdge,
  onLoadPreset,
}) => {
  const [sourceId, setSourceId] = useState(vertices[0]?.id ?? '');
  const [targetId, setTargetId] = useState(vertices[vertices.length - 1]?.id ?? '');
  const [edgeFrom, setEdgeFrom] = useState(vertices[0]?.id ?? '');
  const [edgeTo, setEdgeTo] = useState(vertices[1]?.id ?? '');
  const [edgeWeight, setEdgeWeight] = useState('5');
  const [vertexLabel, setVertexLabel] = useState('');

  useEffect(() => {
    if (vertices.length === 0) return;
    if (!vertices.some((v) => v.id === sourceId)) setSourceId(vertices[0].id);
    if (!vertices.some((v) => v.id === targetId)) setTargetId(vertices[vertices.length - 1].id);
    if (!vertices.some((v) => v.id === edgeFrom)) setEdgeFrom(vertices[0].id);
    if (!vertices.some((v) => v.id === edgeTo)) setEdgeTo(vertices[Math.min(1, vertices.length - 1)].id);
  }, [vertices, sourceId, targetId, edgeFrom, edgeTo]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-brand-600" />
            Traversals & Shortest Path
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Start / Source</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              disabled={isAnimating || vertices.length === 0}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} ({v.label})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 block mb-1">Target (Dijkstra)</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              disabled={isAnimating || vertices.length === 0}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {vertices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} ({v.label})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={() => {
              sound.playClick();
              onRunBFS(sourceId);
            }}
            disabled={isAnimating || !sourceId}
            className="py-1.5 px-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium disabled:opacity-40"
          >
            BFS
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRunDFS(sourceId);
            }}
            disabled={isAnimating || !sourceId}
            className="py-1.5 px-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium disabled:opacity-40"
          >
            DFS
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRunDijkstra(sourceId, targetId);
            }}
            disabled={isAnimating || !sourceId}
            className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <Route className="w-3 h-3" /> Dijkstra
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-emerald-600" />
            Minimum Spanning Tree
          </span>
          {directed && (
            <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Undirected only
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onRunPrim(sourceId);
            }}
            disabled={isAnimating || directed || !sourceId}
            className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium disabled:opacity-40"
          >
            Prim MST
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onRunKruskal();
            }}
            disabled={isAnimating || directed || vertices.length === 0}
            className="py-1.5 px-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium disabled:opacity-40"
          >
            Kruskal MST
          </button>
        </div>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5 text-slate-600" />
          Edit Vertices & Edges
        </span>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={vertexLabel}
            onChange={(e) => setVertexLabel(e.target.value)}
            placeholder="Vertex label (optional)"
            disabled={isAnimating}
            className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            onClick={() => {
              sound.playClick();
              onAddVertex(vertexLabel.trim() || undefined);
              setVertexLabel('');
            }}
            disabled={isAnimating || vertices.length >= 10}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-medium disabled:opacity-40"
          >
            + Node
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <select
            value={edgeFrom}
            onChange={(e) => setEdgeFrom(e.target.value)}
            disabled={isAnimating || vertices.length < 2}
            className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
          >
            {vertices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id}
              </option>
            ))}
          </select>
          <select
            value={edgeTo}
            onChange={(e) => setEdgeTo(e.target.value)}
            disabled={isAnimating || vertices.length < 2}
            className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
          >
            {vertices.map((v) => (
              <option key={v.id} value={v.id}>
                {v.id}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            value={edgeWeight}
            onChange={(e) => setEdgeWeight(e.target.value)}
            disabled={isAnimating || !weighted}
            className="px-2 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-lg"
            title="Edge weight"
          />
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onAddEdge(edgeFrom, edgeTo, Math.max(1, Number(edgeWeight) || 1));
          }}
          disabled={isAnimating || !edgeFrom || !edgeTo || edgeFrom === edgeTo}
          className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium disabled:opacity-40"
        >
          Add / Update Edge
        </button>
      </div>

      <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
          <Settings2 className="w-3.5 h-3.5 text-slate-500" />
          Graph Properties & Presets
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onSetDirected(!directed);
            }}
            disabled={isAnimating}
            className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              directed
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {directed ? 'Directed' : 'Undirected'}
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onSetWeighted(!weighted);
            }}
            disabled={isAnimating}
            className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              weighted
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-slate-700 border-slate-200'
            }`}
          >
            {weighted ? 'Weighted' : 'Unweighted'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {(['default', 'directed', 'campus'] as const).map((preset) => (
            <button
              key={preset}
              onClick={() => {
                sound.playClick();
                onLoadPreset(preset);
              }}
              disabled={isAnimating}
              className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <Database className="w-3 h-3 text-brand-600" />
              {preset === 'default' ? 'Weighted' : preset === 'directed' ? 'DAG' : 'Campus'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

