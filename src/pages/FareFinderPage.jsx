import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Compass,
  ArrowRightLeft,
  Search,
  Plane,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  ChevronRight,
  Sparkles,
  Layers,
  Code2,
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap.jsx';
import AlgorithmChip from '../components/AlgorithmChip.jsx';
import { runDijkstra } from '../algorithms/dijkstra.js';
import { INF } from '../algorithms/constants.js';

export default function FareFinderPage() {
  const { cities, matrix, addToast, logActivity } = useApp();

  // Selected source & destination city indices
  const [sourceIdx, setSourceIdx] = useState(0); // Chennai by default
  const [destIdx, setDestIdx] = useState(cities.length > 4 ? 4 : cities.length - 1); // Kolkata by default
  const [dijkstraResult, setDijkstraResult] = useState(null);
  const [showTrace, setShowTrace] = useState(false);

  // Run Dijkstra when user searches or cities change
  const handleCalculateRoute = () => {
    if (sourceIdx === destIdx) {
      addToast('warning', 'Same City Selected', 'Origin and destination airport must be different.');
      return;
    }

    const result = runDijkstra(matrix, cities, sourceIdx, destIdx);
    setDijkstraResult(result);

    if (result.success) {
      addToast(
        'success',
        'Cheapest Route Calculated',
        `Cheapest fare: $${result.totalFare} via ${result.pathCities.map((c) => c.code || c.name).join(' → ')}.`
      );
      logActivity(
        'dijkstra',
        `Dijkstra: ${result.srcCity} → ${result.destCity}`,
        `Calculated optimal cost $${result.totalFare} (${result.stops} stops).`
      );
    } else {
      addToast('warning', 'No Route Found', result.message);
      logActivity(
        'dijkstra',
        `Dijkstra: Disconnected Route`,
        `No flight path between ${cities[sourceIdx].name} and ${cities[destIdx].name}.`
      );
    }
  };

  // Swap source & destination
  const handleSwap = () => {
    const temp = sourceIdx;
    setSourceIdx(destIdx);
    setDestIdx(temp);
  };

  // Compute initial benchmark route on mount
  useEffect(() => {
    if (cities.length >= 2) {
      const s = 0;
      const d = cities.findIndex((c) => c.name.toLowerCase() === 'kolkata');
      const validDest = d !== -1 ? d : 1;
      setSourceIdx(s);
      setDestIdx(validDest);
      const res = runDijkstra(matrix, cities, s, validDest);
      setDijkstraResult(res);
    }
  }, [cities.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP HEADER & SEARCH CARD */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Bilateral Fare Finder & Shortest Path Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Finds the most cost-effective flight itinerary using array-based Dijkstra's algorithm.
            </p>
          </div>
          <AlgorithmChip
            name="Dijkstra's Algorithm"
            complexity="O(V²)"
            type="Single-Source Shortest Path"
            details="Maintains distance[], visited[], and parent[] arrays. Relaxes unvisited vertices until destination is reached."
          />
        </div>

        {/* Booking-Style Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Origin Airport */}
          <div className="md:col-span-5 space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Origin Airport
            </label>
            <div className="relative">
              <select
                value={sourceIdx}
                onChange={(e) => setSourceIdx(parseInt(e.target.value, 10))}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {cities.map((city, idx) => (
                  <option key={city.name} value={idx}>
                    {city.name} ({city.code || 'HUB'}) — Node [{idx}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwap}
              className="p-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-all hover:rotate-180"
              title="Swap Departure & Arrival"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Airport */}
          <div className="md:col-span-4 space-y-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Destination Airport
            </label>
            <div className="relative">
              <select
                value={destIdx}
                onChange={(e) => setDestIdx(parseInt(e.target.value, 10))}
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
              >
                {cities.map((city, idx) => (
                  <option key={city.name} value={idx}>
                    {city.name} ({city.code || 'HUB'}) — Node [{idx}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleCalculateRoute}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Calculate</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. RESULTS SPLIT: ITINERARY TIMELINE (LEFT) & NETWORK MAP HIGHLIGHT (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Itinerary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {dijkstraResult && dijkstraResult.success ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
              {/* Header Summary */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                      ${dijkstraResult.totalFare}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Cheapest Guaranteed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {dijkstraResult.stops === 0
                      ? 'Non-stop Direct Flight'
                      : `${dijkstraResult.stops} intermediate stop${dijkstraResult.stops > 1 ? 's' : ''} (${dijkstraResult.legs.length} legs)`}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Algorithm Time
                  </span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    O(V²) · {cities.length} Iterations
                  </span>
                </div>
              </div>

              {/* Horizontal Timeline Visualization */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Optimal Flight Corridor Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-300 dark:before:bg-blue-800">
                  {dijkstraResult.pathCities.map((city, idx) => {
                    const isSource = idx === 0;
                    const isDest = idx === dijkstraResult.pathCities.length - 1;
                    const legFare = !isDest && dijkstraResult.legs[idx] ? dijkstraResult.legs[idx].fare : null;

                    return (
                      <div key={city.name} className="relative group">
                        {/* Dot on timeline */}
                        <div
                          className={`absolute -left-6 top-1.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            isSource
                              ? 'bg-blue-600 border-white dark:border-slate-900 text-white shadow-sm'
                              : isDest
                              ? 'bg-emerald-600 border-white dark:border-slate-900 text-white shadow-sm'
                              : 'bg-white dark:bg-slate-900 border-blue-500 text-blue-600 text-[10px]'
                          }`}
                        >
                          {isSource ? (
                            <Plane className="w-2.5 h-2.5 rotate-45" />
                          ) : isDest ? (
                            <MapPin className="w-2.5 h-2.5" />
                          ) : (
                            <span className="font-mono text-[9px] font-bold">{idx}</span>
                          )}
                        </div>

                        {/* City Details */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {city.name}
                              </span>
                              <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                                {city.code || city.name.slice(0, 3).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {isSource ? 'Departure Airport' : isDest ? 'Final Destination' : 'Transit Connection'}
                            </span>
                          </div>

                          {legFare !== null && (
                            <div className="text-right">
                              <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                                +${legFare}
                              </span>
                              <span className="block text-[9px] text-slate-400">Leg {idx + 1}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Cost Breakdown Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Fare Breakdown per Leg:
                </div>
                <div className="divide-y divide-slate-200/60 dark:divide-slate-700/60">
                  {dijkstraResult.legs.map((leg, i) => (
                    <div key={i} className="py-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">
                        Leg {i + 1}: {leg.fromName} ({leg.fromCode}) → {leg.toName} ({leg.toCode})
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        ${leg.fare}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                    <span>Total Itinerary Fare:</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 text-sm">
                      ${dijkstraResult.totalFare}
                    </span>
                  </div>
                </div>
              </div>

              {/* Viva Trace Toggle Button */}
              <button
                type="button"
                onClick={() => setShowTrace(!showTrace)}
                className="w-full py-2 px-3 rounded-xl border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{showTrace ? 'Hide Execution Trace' : 'View Dijkstra Execution Trace (Viva Step-by-Step)'}</span>
              </button>
            </div>
          ) : dijkstraResult && !dijkstraResult.success ? (
            /* Disconnected warning */
            <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>No Route Available</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {dijkstraResult.message}
              </p>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold block mb-1">DSA Diagnostics:</span>
                `distance[{destIdx}]` remained 99999 (INF). There are no directed or undirected edges connecting these two vertices in the adjacency matrix.
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center text-slate-400 text-xs">
              Select origin and destination to compute the shortest route.
            </div>
          )}
        </div>

        {/* Right Network Map Card (7 cols) */}
        <div className="lg:col-span-7">
          <NetworkMap
            cities={cities}
            matrix={matrix}
            highlightMode="dijkstra"
            dijkstraPath={dijkstraResult && dijkstraResult.success ? dijkstraResult.path : []}
          />
        </div>
      </div>

      {/* 3. STEP-BY-STEP DIJKSTRA TRACE TABLE (ACADEMIC / VIVA PROOF) */}
      {showTrace && dijkstraResult && dijkstraResult.trace && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                Dijkstra Algorithm State Trace Table
              </h3>
              <p className="text-xs text-slate-400">
                Mathematical trace showing min vertex selection and distance[] array relaxation across iterations.
              </p>
            </div>
            <AlgorithmChip name="Trace Matrix" complexity="V iterations" type="Proof" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Step #</th>
                  <th className="py-2.5 px-3">Selected Min Node (u)</th>
                  <th className="py-2.5 px-3">Current Dist[u]</th>
                  <th className="py-2.5 px-3">Neighbors Relaxed</th>
                  <th className="py-2.5 px-3">Distance[] Array State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {dijkstraResult.trace.map((step) => (
                  <tr key={step.step} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300">
                      Iteration {step.step}
                    </td>
                    <td className="py-2 px-3 text-blue-600 dark:text-blue-400 font-bold">
                      {step.selectedNodeName} (Node {step.selectedNodeIndex})
                    </td>
                    <td className="py-2 px-3 font-semibold">
                      ${step.selectedNodeDist}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                      {step.relaxations.length === 0 ? (
                        <span className="text-slate-400 font-sans">None updated</span>
                      ) : (
                        step.relaxations.map((r, i) => (
                          <div key={i} className="text-emerald-600 dark:text-emerald-400 text-[10px]">
                            {r.neighborName}: ${r.oldDist === INF ? 'INF' : r.oldDist} → ${r.newDist}
                          </div>
                        ))
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-500 max-w-xs truncate">
                      [{step.distanceSnapshot.map((d) => (d === INF ? 'INF' : `$${d}`)).join(', ')}]
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
