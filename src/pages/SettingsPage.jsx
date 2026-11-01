import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Settings,
  RotateCcw,
  Trash2,
  Download,
  Upload,
  BookOpen,
  Cpu,
  Layers,
  Database,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import AlgorithmChip from '../components/AlgorithmChip.jsx';

export default function SettingsPage() {
  const {
    cities,
    matrix,
    waitlistQueue,
    loadSampleData,
    resetAllData,
    addToast,
  } = useApp();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  // Export state to JSON file
  const handleExportJSON = () => {
    try {
      const exportObject = {
        app: 'SkyRoute',
        version: '1.0',
        exportedAt: new Date().toISOString(),
        cities,
        matrix,
        waitlist: waitlistQueue ? waitlistQueue.serialize() : null,
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `skyroute_backup_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      addToast('success', 'Backup Exported', 'Downloaded network topology JSON configuration.');
    } catch (err) {
      addToast('error', 'Export Failed', err.message);
    }
  };

  // Viva Questions & Answers
  const vivaTopics = [
    {
      q: 'Why did you use an Adjacency Matrix instead of an Adjacency List for the airline routes?',
      a: 'In airline route operations, lookups for whether a direct flight exists between city u and city v are frequent. An Adjacency Matrix provides O(1) instantaneous edge weight lookup and update (matrix[u][v] = fare). Since the number of airports in our system is bounded (max 20 cities), the O(V²) memory footprint is tiny (only 400 integers, ~1.6 KB), providing superior cache locality and predictable indexing mirroring C arrays.',
    },
    {
      q: 'How does Dijkstra’s algorithm work with an Adjacency Matrix?',
      a: 'We maintain distance[], visited[], and parent[] arrays of size V. Initially, distance[src] = 0, and all other distances are set to 99999 (INF). In each of the V iterations, we find the unvisited vertex u with minimum distance[u]. We mark visited[u] = true and relax all unvisited neighbors v: if distance[u] + matrix[u][v] < distance[v], we update distance[v] and record parent[v] = u. Time complexity is O(V²) and auxiliary space is O(V).',
    },
    {
      q: 'How does Prim’s algorithm guarantee a Minimum Spanning Tree without cycles?',
      a: 'Prim’s algorithm relies on the Cut Property of graphs. At each step, vertices are partitioned into two sets: those already in the tree (inMST[u] = true) and those outside. We greedily pick the minimum weight edge that crosses the cut (connecting an in-tree vertex to an out-of-tree vertex). Because we only ever connect to an unvisited vertex, a cycle can never form. Repeating this V - 1 times yields the unique minimum spanning tree.',
    },
    {
      q: 'What happens in Prim’s algorithm if the route network is disconnected?',
      a: 'If the graph contains two or more disconnected components, the minimum key unvisited vertex will have key[u] === INF. Instead of generating a corrupt tree with fake infinity costs, SkyRoute detects this condition, flags isConnected: false, and clearly lists which cities cannot be reached from Root City 0.',
    },
    {
      q: 'How do you prevent artificial queue overflow in the Linear Waitlist Queue?',
      a: 'In a classical linear queue with fixed capacity (array of 100 slots), front and rear pointers continually advance during enqueue and dequeue operations. Even if previous slots are freed, rear could reach capacity 99 while the queue has only a few items. To solve this without complex circular modulo operations, SkyRoute implements automatic pointer reset: whenever the queue becomes empty (front > rear), both pointers are reset to front = 0 and rear = -1, reclaiming all 100 slots.',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. DATA MANAGEMENT ACTIONS */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              System Operations & Benchmark Data Management
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Restore benchmark datasets, manage localStorage persistence, and export topologies.
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
            localStorage: Synced
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Action 1: Load Sample Benchmark Data */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-200">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                Load Benchmark Sample Data
              </div>
              <p className="text-[11px] text-blue-800/80 dark:text-blue-300 mt-1">
                Restores 6 metro hubs (MAA, DEL, BOM, BLR, CCU, HYD) and 8 test fares ($620 shortest route, $970 MST).
              </p>
            </div>
            <button
              type="button"
              onClick={() => loadSampleData(true)}
              className="w-full py-2 px-3 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Restore Benchmark Data
            </button>
          </div>

          {/* Action 2: Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-slate-200">
                <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                Export Network Backup
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Downloads active adjacency matrix, registered airports, and waitlist array as a portable JSON file.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="w-full py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl shadow-xs transition-colors"
            >
              Export JSON Backup
            </button>
          </div>

          {/* Action 3: Purge / Reset All Data */}
          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900 dark:text-rose-200">
                <Trash2 className="w-4 h-4 text-rose-600" />
                Purge All Data
              </div>
              <p className="text-[11px] text-rose-800/80 dark:text-rose-300 mt-1">
                Wipes all custom cities, clears matrix, purges waitlist, and deletes localStorage entry.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="w-full py-2 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>

      {/* 2. DSA ARCHITECTURE BREAKDOWN */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              DSA Architecture & Viva Documentation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean array-based structures mirroring classic C implementations without graph libraries.
            </p>
          </div>
          <AlgorithmChip name="Data Structures" complexity="Array-Based" type="Architecture" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Adjacency Matrix */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-blue-600" />
                1. Graph Adjacency Matrix
              </span>
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                matrix[n][n]
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              2D array of ticket prices. <code>99999</code> (INF) represents no route. Flights are bidirectional, enforcing <code>matrix[u][v] = matrix[v][u]</code>. A separate <code>cities[]</code> array stores metadata (name, code, state). Max capacity 20 nodes.
            </p>
          </div>

          {/* Card 2: Dijkstra's Algorithm */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                2. Dijkstra's Algorithm
              </span>
              <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                O(V²) Time · O(V) Space
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Array-based shortest path with <code>distance[]</code>, <code>visited[]</code>, and <code>parent[]</code> arrays. Reconstructs lowest-fare itinerary with leg breakdown, total fare, and intermediate stops. Handles disconnected graphs gracefully.
            </p>
          </div>

          {/* Card 3: Prim's Algorithm */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-600" />
                3. Prim's Minimum Spanning Tree
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                O(V²) Time · O(V) Space
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Greedy minimum spanning tree starting at city 0 using <code>key[]</code>, <code>parent[]</code>, and <code>inMST[]</code> arrays. Calculates total backbone cost and savings against current route network. Warns if graph is disconnected.
            </p>
          </div>

          {/* Card 4: Linear Waitlist Queue */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                4. Linear Waitlist Queue
              </span>
              <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded">
                O(1) Enqueue / Dequeue
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Array of capacity 100 with <code>front</code> and <code>rear</code> pointers. Supports enqueue, animated boarding dequeue, overflow detection, and pointer reset when empty (front &gt; rear &rarr; front = 0, rear = -1).
            </p>
          </div>
        </div>
      </div>

      {/* 3. INTERACTIVE VIVA Q&A ACCORDION */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            Viva Examination FAQ Flashcards
          </h3>
          <p className="text-xs text-slate-400">
            Click any question to view the rigorous theoretical explanation for project defense.
          </p>
        </div>

        <div className="space-y-3">
          {vivaTopics.map((topic, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? -1 : idx)}
                  className="w-full p-3.5 text-left text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[10px] flex items-center justify-center font-bold">
                      Q{idx + 1}
                    </span>
                    <span>{topic.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
                    {topic.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CONFIRM RESET MODAL */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetAllData}
        title="Wipe and Reset All Network Data?"
        message="This action will permanently delete all custom airports, matrix edges, passenger waitlists, and localStorage cache. Are you sure you want to proceed?"
        confirmText="Confirm Purge"
        confirmVariant="danger"
      />
    </div>
  );
}
