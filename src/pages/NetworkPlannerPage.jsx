import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  GitFork,
  Sparkles,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Table,
  Layers,
  Code2,
  Cpu,
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap.jsx';
import AlgorithmChip from '../components/AlgorithmChip.jsx';
import { runPrimMST } from '../algorithms/prim.js';
import { INF } from '../algorithms/constants.js';

export default function NetworkPlannerPage() {
  const { cities, matrix, addToast, logActivity } = useApp();

  // Root vertex to initiate Prim's algorithm (default city 0 = Chennai)
  const [startCityIdx, setStartCityIdx] = useState(0);
  const [mstResult, setMstResult] = useState(null);
  const [showTrace, setShowTrace] = useState(false);

  // Run Prim's MST
  const handleComputeMST = () => {
    const result = runPrimMST(matrix, cities, startCityIdx);
    setMstResult(result);

    if (result.isConnected) {
      addToast(
        'success',
        'Minimum Spanning Tree Constructed',
        `MST Total Cost: $${result.totalMstCost} across ${result.edges.length} edges (Saved ${result.savingsPercent}%).`
      );
      logActivity(
        'prim',
        `Prim's MST Optimized (Root: ${result.startCityName})`,
        `Built backbone network for $${result.totalMstCost} (Saved $${result.savings}).`
      );
    } else {
      addToast('error', 'Disconnected Graph Warning', result.message);
      logActivity(
        'prim',
        `Prim Disconnected Network Warning`,
        `Network cannot span all hubs from ${cities[startCityIdx]?.name}.`
      );
    }
  };

  // Run on mount or when cities change
  useEffect(() => {
    if (cities.length >= 2) {
      const res = runPrimMST(matrix, cities, startCityIdx);
      setMstResult(res);
    }
  }, [cities.length, startCityIdx]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP HEADER & MST CONTROLS */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GitFork className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Network Backbone Planner (Prim's Algorithm)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Computes the Minimum Spanning Tree (MST) connecting all {cities.length} airport hubs with the absolute minimum total route cost without cycles.
            </p>
          </div>
          <AlgorithmChip
            name="Prim's Algorithm"
            complexity="O(V²)"
            type="Minimum Spanning Tree"
            details="Greedy array-based algorithm maintaining key[], parent[], and inMST[] arrays starting from Root Vertex 0."
          />
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Starting Hub (Root Node):
            </label>
            <select
              value={startCityIdx}
              onChange={(e) => setStartCityIdx(parseInt(e.target.value, 10))}
              className="p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-emerald-500 font-medium"
            >
              {cities.map((city, idx) => (
                <option key={city.name} value={idx}>
                  {city.name} ({city.code || 'HUB'}) — Root [{idx}]
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleComputeMST}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Build Cheapest Network (MST)</span>
          </button>
        </div>
      </div>

      {/* 2. SAVINGS METRICS CARDS */}
      {mstResult && mstResult.isConnected && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: MST Cost */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              MST Backbone Cost
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                ${mstResult.totalMstCost}
              </span>
              <span className="text-xs text-slate-400">
                ({mstResult.edges.length} edges)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              All {cities.length} hubs fully connected with zero redundancy.
            </p>
          </div>

          {/* Card 2: Current Total Cost */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Current All-Route Cost
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-slate-700 dark:text-slate-300">
                ${mstResult.originalCost}
              </span>
              <span className="text-xs text-slate-400">
                ({mstResult.totalOriginalRoutes} routes)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Sum of all existing bidirectional routes in adjacency matrix.
            </p>
          </div>

          {/* Card 3: Capital Savings */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 shadow-sm">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Operational Savings
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300">
                ${mstResult.savings}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ({mstResult.savingsPercent}% savings)
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300/80 mt-2">
              Retains complete hub reachability while removing expensive redundant loops.
            </p>
          </div>
        </div>
      )}

      {/* 3. DISCONNECTED WARNING (IF GRAPH NOT FULLY CONNECTED) */}
      {mstResult && !mstResult.isConnected && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Network Disconnected — Prim's Algorithm Incomplete</span>
          </div>
          <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
            {mstResult.message}
          </p>
          <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-rose-200 dark:border-rose-900 text-xs space-y-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200 block">
              DSA Prim Requirement:
            </span>
            <p className="text-slate-600 dark:text-slate-400">
              A Minimum Spanning Tree requires a connected undirected graph. Please add routes connecting {mstResult.unconnectedCities?.join(', ')} in the Routes page first.
            </p>
          </div>
        </div>
      )}

      {/* 4. MAIN LAYOUT: MST EDGES TABLE (LEFT) & NETWORK MAP (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chosen MST Edges Table (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Optimal Backbone Edges (V - 1 = {mstResult ? mstResult.edges.length : 0})
                </h3>
                <p className="text-xs text-slate-400">
                  Selected minimum weight edges forming the MST
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                No Cycles
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Edge</th>
                    <th className="py-2.5">Bilateral Flight Corridor</th>
                    <th className="py-2.5 text-right">Edge Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                  {mstResult && mstResult.edges && mstResult.edges.length > 0 ? (
                    mstResult.edges.map((edge, idx) => (
                      <tr key={edge.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 font-mono text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="py-2.5 text-slate-800 dark:text-slate-200">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold">{edge.fromCity}</span>
                            <span className="text-slate-400 font-mono text-[10px]">({edge.fromCode})</span>
                            <span className="text-emerald-500 font-bold">⇄</span>
                            <span className="font-semibold">{edge.toCity}</span>
                            <span className="text-slate-400 font-mono text-[10px]">({edge.toCode})</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          ${edge.fare}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-6 text-center text-slate-400">
                        No spanning tree edges available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Trace Toggle */}
            <button
              type="button"
              onClick={() => setShowTrace(!showTrace)}
              className="w-full mt-2 py-2 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showTrace ? 'Hide Prim Trace Table' : 'View Prim Algorithm Trace (Viva Step-by-Step)'}</span>
            </button>
          </div>
        </div>

        {/* Right: Network Map with MST Highlight (7 cols) */}
        <div className="lg:col-span-7">
          <NetworkMap
            cities={cities}
            matrix={matrix}
            highlightMode="prim"
            primEdges={mstResult && mstResult.isConnected ? mstResult.edges : []}
          />
        </div>
      </div>

      {/* 5. PRIM STEP-BY-STEP TRACE TABLE (VIVA EVIDENCE) */}
      {showTrace && mstResult && mstResult.trace && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-600" />
                Prim Algorithm State Trace Table
              </h3>
              <p className="text-xs text-slate-400">
                Demonstrates key[] and parent[] vector updates at each greedy step.
              </p>
            </div>
            <AlgorithmChip name="Cut Property" complexity="Greedy Choice" type="Proof" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Step</th>
                  <th className="py-2.5 px-3">Vertex Added to MST (u)</th>
                  <th className="py-2.5 px-3">Edge Weight</th>
                  <th className="py-2.5 px-3">Parent Hub</th>
                  <th className="py-2.5 px-3">Neighbor Key[] Updates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {mstResult.trace.map((step) => (
                  <tr key={step.step} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                      Step {step.step}
                    </td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400 font-bold">
                      {step.selectedVertexName} (Node [{step.selectedVertexIndex}])
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      ${step.edgeAddedCost}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                      {step.parentName}
                    </td>
                    <td className="py-2 px-3 text-slate-500">
                      {step.keyUpdates.length === 0 ? (
                        <span className="text-slate-400 font-sans">No keys relaxed</span>
                      ) : (
                        step.keyUpdates.map((k, i) => (
                          <div key={i} className="text-blue-600 dark:text-blue-400 text-[10px]">
                            {k.targetName}: key reduced to ${k.newKey}
                          </div>
                        ))
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
