import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Graph } from '../../core/Graph';
import { GraphStateSnapshot } from '../../types/graph';
import { useStepPlayer } from '../../hooks/useStepPlayer';
import { GraphVisualizer } from '../visualizers/GraphVisualizer';
import { AnimationControls } from '../common/AnimationControls';
import { ExplanationPanel } from '../common/ExplanationPanel';
import { sound } from '../common/SoundEffects';
import { ArrowLeft, MapPin, Network, RefreshCw, Route, Compass } from 'lucide-react';

interface CampusOptimizerViewProps {
  onBackToHome: () => void;
}

export const CampusOptimizerView: React.FC<CampusOptimizerViewProps> = ({ onBackToHome }) => {
  const graphRef = useRef(new Graph('campus'));
  const [baseSnapshot, setBaseSnapshot] = useState<GraphStateSnapshot>(() =>
    graphRef.current.getSnapshot()
  );

  const [sourceId, setSourceId] = useState(() => baseSnapshot.vertices[0]?.id ?? 'gate');
  const [targetId, setTargetId] = useState(
    () =>
      baseSnapshot.vertices.find((v) => v.id === 'cse')?.id ??
      baseSnapshot.vertices[baseSnapshot.vertices.length - 1]?.id ??
      'cse'
  );
  const [mstAlgo, setMstAlgo] = useState<'prim' | 'kruskal'>('prim');

  const player = useStepPlayer<GraphStateSnapshot>(1);
  const vertices = baseSnapshot.vertices;
  const blockedCount = baseSnapshot.edges.filter((e) => e.blocked).length;

  const activeSnapshot = player.currentStep?.stateSnapshot ?? baseSnapshot;

  const runRouteDijkstra = () => {
    sound.playClick();
    const res = graphRef.current.dijkstra(sourceId, targetId);
    player.startPlayback(res.steps, res.explanation, true);
  };

  const runNetworkMST = () => {
    sound.playClick();
    const res =
      mstAlgo === 'prim' ? graphRef.current.prim(sourceId) : graphRef.current.kruskal();
    player.startPlayback(res.steps, res.explanation, true);
  };

  const runReachableBFS = () => {
    sound.playClick();
    const res = graphRef.current.bfs(sourceId);
    player.startPlayback(res.steps, res.explanation, true);
  };

  const handleToggleWalkway = (edgeId: string) => {
    sound.playClick();
    graphRef.current.toggleBlockEdge(edgeId);
    setBaseSnapshot(graphRef.current.getSnapshot());
    player.clearPlayback({
      operationName: 'TOGGLE_WALKWAY',
      displayName: 'Walkway Status Updated',
      whatHappens:
        'Updated blocked walkway status on the campus graph. Re-run Dijkstra, BFS, or MST to see the recalculated route or reachability.',
      pseudocode: ['edge.blocked = !edge.blocked'],
      complexity: {
        timeBest: 'O(1)',
        timeAverage: 'O(1)',
        timeWorst: 'O(1)',
        auxiliarySpace: 'O(1)',
      },
      resultMessage: 'Walkway status toggled. Re-run an algorithm to recompute.',
      status: 'idle',
    });
  };

  const handleResetCampus = () => {
    sound.playClick();
    graphRef.current.loadPreset('campus');
    setBaseSnapshot(graphRef.current.getSnapshot());
    player.clearPlayback();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHome();
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Back to Homepage"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-brand-50 rounded-lg">
                <MapPin className="w-4 h-4 text-brand-600" />
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">
                Campus Route Optimizer
              </h1>
              {blockedCount > 0 && (
                <span className="text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full">
                  {blockedCount} blocked walkway{blockedCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              University buildings modeled as weighted graph vertices. Click any walkway to simulate maintenance closures.
            </p>
          </div>
        </div>

        <button
          onClick={handleResetCampus}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          Reset Walkways
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Campus Walkway Graph (meters)
              </span>
              {player.currentStep && (
                <span className="text-xs font-mono font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                  {player.currentStep.title}
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex items-center justify-center">
              <GraphVisualizer
                snapshot={activeSnapshot}
                onToggleEdgeBlock={handleToggleWalkway}
                weightUnit="m"
              />
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/40">
              <AnimationControls
                currentStep={player.steps.length > 0 ? player.currentStepIndex + 1 : 0}
                totalSteps={player.steps.length}
                isPlaying={player.isPlaying}
                speed={player.speed}
                operationStatus={player.explanation?.status}
                onPlayToggle={player.handlePlayToggle}
                onReplay={player.handleReplay}
                onNextStep={player.handleNextStep}
                onPrevStep={player.handlePrevStep}
                onResetAnimation={player.handleResetAnimation}
                onSpeedChange={player.setSpeed}
              />
            </div>
          </div>

          <ExplanationPanel
            explanation={player.explanation}
            currentStepData={player.currentStep}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Campus Planning Tools
              </h3>
            </div>

            {player.explanation && (
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  player.explanation.status === 'error' || player.explanation.status === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : player.explanation.status === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-brand-50 border-brand-200 text-brand-900'
                }`}
              >
                <div className="font-semibold mb-0.5">{player.explanation.displayName}</div>
                <div>{player.explanation.resultMessage}</div>
              </div>
            )}

            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-emerald-600" />
                Shortest Route (Dijkstra)
              </span>

              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Origin Building</label>
                  <select
                    value={sourceId}
                    onChange={(e) => setSourceId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    {vertices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} ({v.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Destination Building</label>
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg"
                  >
                    {vertices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label} ({v.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={runRouteDijkstra}
                disabled={sourceId === targetId}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
              >
                Find Shortest Path
              </button>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2.5">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-brand-600" />
                Minimum-Cost Connectivity (MST)
              </span>
              <p className="text-[11px] text-slate-500">
                Compute the lowest-cost fiber or shuttle network connecting all open campus buildings.
              </p>

              <div className="grid grid-cols-2 gap-1.5 bg-white p-1 rounded-lg border border-slate-200">
                {(['prim', 'kruskal'] as const).map((alg) => (
                  <button
                    key={alg}
                    onClick={() => setMstAlgo(alg)}
                    className={`py-1 rounded-md text-xs font-medium capitalize transition-colors ${mstAlgo === alg
                        ? 'bg-brand-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                      }`}
                  >
                    {alg}
                  </button>
                ))}
              </div>

              <button
                onClick={runNetworkMST}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Build Minimum Network
              </button>
            </div>

            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-600" />
                Reachable Locations (BFS)
              </span>
              <p className="text-[11px] text-slate-500">
                List every building reachable by hop count from the selected origin, respecting blocked paths.
              </p>
              <button
                onClick={runReachableBFS}
                className="w-full py-2 bg-white hover:bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-lg text-xs font-semibold transition-colors"
              >
                Check Reachable from {sourceId}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
