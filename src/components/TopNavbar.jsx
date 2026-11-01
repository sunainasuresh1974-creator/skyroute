import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Search,
  Plus,
  Plane,
  X,
  Clock,
  Sparkles,
} from 'lucide-react';
import AlgorithmChip from './AlgorithmChip.jsx';

export default function TopNavbar({ onOpenAddFlightModal }) {
  const {
    activeTab,
    setSidebarOpen,
    isDarkMode,
    toggleDarkMode,
    globalSearch,
    setGlobalSearch,
    activityLog,
    setActiveTab,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);

  // Tab metadata for top title
  const tabTitles = {
    dashboard: {
      title: 'Operations Dashboard',
      subtitle: 'Real-time airline route topology, metrics, and network overview',
      chip: { name: 'Adjacency Matrix', complexity: 'V × V', type: 'Graph Representation' },
    },
    routes: {
      title: 'Routes & Hub Management',
      subtitle: 'Manage bilateral flight corridors, airport nodes, and heat-map matrix',
      chip: { name: 'Bilateral Edges', complexity: 'O(1) Lookup', type: 'Graph Storage' },
    },
    dijkstra: {
      title: 'Fare Finder (Dijkstra)',
      subtitle: 'Compute single-source cheapest flight path between any two airports',
      chip: { name: "Dijkstra's Algorithm", complexity: 'O(V²)', type: 'Shortest Path' },
    },
    prim: {
      title: 'Network Planner (Prim)',
      subtitle: 'Minimum Spanning Tree optimizer to minimize overall flight network cost',
      chip: { name: "Prim's Algorithm", complexity: 'O(V²)', type: 'Spanning Tree' },
    },
    waitlist: {
      title: 'Overbooked Waitlist (Queue)',
      subtitle: 'Array-based linear passenger queue with front and rear pointers',
      chip: { name: 'Linear Queue', complexity: 'O(1) Enqueue/Dequeue', type: 'Queue FIFO' },
    },
    settings: {
      title: 'System Settings & Viva Theory',
      subtitle: 'Sample data benchmarking, cache management, and viva viva explanation',
      chip: { name: 'C Architecture', complexity: 'Array-Based', type: 'DSA Design' },
    },
  };

  const currentTabInfo = tabTitles[activeTab] || tabTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl lg:hidden"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {currentTabInfo.title}
              </h1>
              <div className="hidden sm:block">
                <AlgorithmChip
                  name={currentTabInfo.chip.name}
                  complexity={currentTabInfo.chip.complexity}
                  type={currentTabInfo.chip.type}
                />
              </div>
            </div>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400 truncate -mt-0.5">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Global Search Bar */}
          <div className="relative hidden md:block w-48 lg:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Search route or city..."
              className="w-full pl-9 pr-7 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-xl border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Add Flight Button */}
          {onOpenAddFlightModal && (
            <button
              type="button"
              onClick={onOpenAddFlightModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Route</span>
            </button>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notification Bell with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Recent Activity Feed"
            >
              <Bell className="w-4 h-4" />
              {activityLog.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-4 z-50 animate-fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Recent Operations Feed
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      {activityLog.length} events
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 py-1">
                    {activityLog.length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400">
                        No recent operational events.
                      </div>
                    ) : (
                      activityLog.slice(0, 7).map((item) => (
                        <div key={item.id} className="py-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">
                              {item.title}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.detail}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-sm ring-2 ring-blue-500/20">
              AD
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
                Admin
              </div>
              <div className="text-[10px] text-slate-400 leading-tight">
                Operations Lead
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
