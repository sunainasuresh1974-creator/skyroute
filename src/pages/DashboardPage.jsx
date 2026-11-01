import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Building2,
  Route,
  DollarSign,
  Users,
  TrendingUp,
  ArrowRight,
  Plane,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import NetworkMap from '../components/NetworkMap.jsx';
import AlgorithmChip from '../components/AlgorithmChip.jsx';
import { MAX_CITIES } from '../algorithms/constants.js';

export default function DashboardPage({ onOpenAddFlightModal }) {
  const {
    cities,
    matrix,
    metrics,
    waitlistQueue,
    activityLog,
    setActiveTab,
  } = useApp();

  // Top 5 cheapest direct routes
  const topCheapestRoutes = [...metrics.routes]
    .sort((a, b) => a.fare - b.fare)
    .slice(0, 5);

  const waitlistCount = waitlistQueue ? waitlistQueue.size() : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Total Cities */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Network Hubs
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              {metrics.totalCities}
            </span>
            <span className="text-xs font-medium text-slate-400">
              / {MAX_CITIES} max hubs
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Adjacency matrix {metrics.totalCities}×{metrics.totalCities}</span>
          </div>
        </div>

        {/* KPI 2: Active Routes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Corridors
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Route className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              {metrics.activeRoutes}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-medium">
              Bidirectional
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{metrics.activeRoutes * 2} flight legs scheduled</span>
          </div>
        </div>

        {/* KPI 3: Average Fare */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Average Fare
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              ${metrics.averageFare}
            </span>
            <span className="text-xs font-medium text-slate-400">
              per corridor
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Range: ${metrics.minFare} – ${metrics.maxFare}</span>
          </div>
        </div>

        {/* KPI 4: Waitlisted Passengers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Waitlist Queue
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-sans">
              {waitlistCount}
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Passengers
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Linear FIFO array (front: {waitlistQueue ? waitlistQueue.front : 0})</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NETWORK MAP CARD */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Route Network Topology
              <AlgorithmChip name="Graph Matrix" complexity="V × V" type="Data Structure" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive SVG map showing bidirectional flight connections and fares. Hover on any city to inspect connected routes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dijkstra')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border dark:border-blue-800 transition-colors"
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Find Cheapest (Dijkstra)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('prim')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border dark:border-emerald-800 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Optimize MST (Prim)</span>
            </button>
          </div>
        </div>

        <NetworkMap cities={cities} matrix={matrix} highlightMode="all" />
      </div>

      {/* 3. LOWER SECTION: CHEAPEST ROUTES TABLE & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cheapest Routes Mini-Table (2 columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Lowest Fare Corridors
              </h3>
              <p className="text-xs text-slate-400">
                Top direct routes sorted by price efficiency
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('routes')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <span>View All Routes ({metrics.activeRoutes})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5">Origin</th>
                  <th className="pb-2.5">Destination</th>
                  <th className="pb-2.5 text-center">Type</th>
                  <th className="pb-2.5 text-right">Fare</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {topCheapestRoutes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">
                      No active flight routes found.
                    </td>
                  </tr>
                ) : (
                  topCheapestRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {route.from} <span className="font-mono text-slate-400 text-[10px]">({route.fromCode})</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">
                        {route.to} <span className="font-mono text-slate-400 text-[10px]">({route.toCode})</span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          Direct
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">
                        ${route.fare}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveTab('dijkstra')}
                          className="px-2 py-1 rounded-lg text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition-colors"
                        >
                          Check Path
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Activity Feed (1 column) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" /> Recent Activity
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Live Log</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[300px] pr-1">
            {activityLog.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No activity recorded yet.
              </div>
            ) : (
              activityLog.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {log.title}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {log.detail}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
