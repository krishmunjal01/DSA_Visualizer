import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BSTStateSnapshot, BSTNodeData } from '../../types/bst';
import { GitBranch, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface BSTVisualizerProps {
  snapshot: BSTStateSnapshot;
}

export const BSTVisualizer: React.FC<BSTVisualizerProps> = ({ snapshot }) => {
  const { nodes, rootId, size, height } = snapshot;
  const [zoom, setZoom] = useState(1);

  if (size === 0 || !rootId) {
    return (
      <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-3">
          <GitBranch className="w-6 h-6 text-purple-400" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700">Binary Search Tree is Empty</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          ROOT is currently <span className="font-mono font-semibold text-slate-700">null</span>.
          Insert elements using the operations panel or click "Sample Tree" to load examples.
        </p>
      </div>
    );
  }

  // Calculate dynamic SVG bounding box based on node positions
  const nodeList = Object.values(nodes);
  const minX = Math.min(...nodeList.map((n) => n.x || 0)) - 60;
  const maxX = Math.max(...nodeList.map((n) => n.x || 0)) + 60;
  const maxY = Math.max(...nodeList.map((n) => n.y || 0)) + 80;

  const width = Math.max(750, maxX - minX);
  const heightSvg = Math.max(380, maxY);

  const getNodeFill = (state?: BSTNodeData['state']) => {
    switch (state) {
      case 'active':
        return { fill: '#2563eb', stroke: '#1d4ed8', text: '#ffffff' };
      case 'comparing':
        return { fill: '#f59e0b', stroke: '#d97706', text: '#ffffff' };
      case 'found':
        return { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff' };
      case 'inserting':
        return { fill: '#10b981', stroke: '#059669', text: '#ffffff' };
      case 'deleting':
        return { fill: '#f43f5e', stroke: '#e11d48', text: '#ffffff' };
      case 'visited':
        return { fill: '#06b6d4', stroke: '#0891b2', text: '#ffffff' };
      case 'min-max':
        return { fill: '#ec4899', stroke: '#db2777', text: '#ffffff' };
      default:
        return { fill: '#ffffff', stroke: '#cbd5e1', text: '#1e293b' };
    }
  };

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center">
      {/* Top Tree Stats Bar */}
      <div className="w-full flex items-center justify-between px-4 py-2 bg-slate-50/80 border-b border-slate-200/60 rounded-t-xl text-xs text-slate-600 mb-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-800 flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-brand-600" />
            BST Canvas
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            Size: <strong className="text-brand-700">{size}</strong> nodes
          </span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-full font-mono text-[11px]">
            Height: <strong className="text-brand-700">{height}</strong> levels
          </span>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            title="Zoom Out"
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono px-1.5 text-slate-600">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
            title="Zoom In"
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            title="Reset Zoom"
            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full overflow-auto max-h-[460px] p-4">
        <svg
          width={Math.round(width * zoom)}
          height={Math.round(heightSvg * zoom)}
          viewBox={`0 0 ${width} ${heightSvg}`}
          className="mx-auto block overflow-visible select-none"
        >
          {/* Draw Connecting Edges First */}
          {nodeList.map((node) => {
            const currentX = node.x || 0;
            const currentY = node.y || 0;

            return (
              <g key={`edges-${node.id}`}>
                {/* Left Edge */}
                {node.leftId && nodes[node.leftId] && (
                  <g>
                    <line
                      x1={currentX}
                      y1={currentY}
                      x2={nodes[node.leftId].x || 0}
                      y2={nodes[node.leftId].y || 0}
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <text
                      x={(currentX + (nodes[node.leftId].x || 0)) / 2 - 12}
                      y={(currentY + (nodes[node.leftId].y || 0)) / 2}
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      L
                    </text>
                  </g>
                )}

                {/* Right Edge */}
                {node.rightId && nodes[node.rightId] && (
                  <g>
                    <line
                      x1={currentX}
                      y1={currentY}
                      x2={nodes[node.rightId].x || 0}
                      y2={nodes[node.rightId].y || 0}
                      stroke="#94a3b8"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <text
                      x={(currentX + (nodes[node.rightId].x || 0)) / 2 + 6}
                      y={(currentY + (nodes[node.rightId].y || 0)) / 2}
                      fontSize="9"
                      fill="#64748b"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      R
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Draw Nodes */}
          {nodeList.map((node) => {
            const currentX = node.x || 0;
            const currentY = node.y || 0;
            const isRoot = node.id === rootId;
            const colors = getNodeFill(node.state);

            return (
              <motion.g
                key={`node-${node.id}`}
                initial={{ opacity: 0, x: currentX, y: currentY, scale: 0.8 }}
                animate={{ opacity: 1, x: currentX, y: currentY, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
              >
                {/* Outer glow ring for active / comparing */}
                {node.state && node.state !== 'default' && (
                  <motion.circle
                    cx={0}
                    cy={0}
                    r="28"
                    fill={colors.fill}
                    initial={{ opacity: 0.15, scale: 0.9 }}
                    animate={{ opacity: 0.25, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  />
                )}

                {/* Main Node Circle */}
                <circle
                  cx={0}
                  cy={0}
                  r="22"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08))"
                />

                {/* Node Value Text */}
                <text
                  x={0}
                  y={5}
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {node.value}
                </text>

                {isRoot && (
                  <g transform="translate(-22, -36)">
                    <rect
                      width="44"
                      height="16"
                      rx="8"
                      fill="#1e40af"
                      stroke="#1d4ed8"
                      strokeWidth="1"
                    />
                    <text
                      x="22"
                      y="12"
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      ROOT
                    </text>
                  </g>
                )}

                {node.highlightLabel && (() => {
                  const badgeW = Math.max(58, node.highlightLabel.length * 6.5 + 14);
                  return (
                    <g transform={`translate(${-badgeW / 2}, 28)`}>
                      <rect
                        width={badgeW}
                        height="17"
                        rx="8"
                        fill="#f59e0b"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={badgeW / 2}
                        y="12"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {node.highlightLabel}
                      </text>
                    </g>
                  );
                })()}
              </motion.g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
