import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  LayoutDashboard,
  PlaneTakeoff,
  Compass,
  GitFork,
  Users,
  Settings,
  X,
  Plane,
  Layers,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { MAX_CITIES, MAX_QUEUE_CAPACITY } from '../algorithms/constants.js';

export default function Sidebar() {
  const {
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    cities,
    waitlistQueue,
  } = useApp();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'routes',
      label: 'Routes & Cities',
      icon: PlaneTakeoff,
      badge: cities.length ? `${cities.length}` : null,
    },
    {
      id: 'dijkstra',
      label: 'Fare Finder (Dijkstra)',
      icon: Compass,
      badge: 'O(V²)',
    },
    {
      id: 'prim',
      label: 'Network Planner (Prim)',
      icon: GitFork,
      badge: 'MST',
    },
    {
      id: 'waitlist',
      label: 'Waitlist (Queue)',
      icon: Users,
      badge: waitlistQueue && waitlistQueue.size() > 0 ? `${waitlistQueue.size()}` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'settings',
      label: 'Settings & Viva Docs',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container: 240px fixed width, dark navy #0F172A */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-sans">
                  SkyRoute
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                Airline Route & Fare Hub
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-5 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Operations & Algorithms
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      item.badgeColor
                        ? item.badgeColor
                        : isActive
                        ? 'bg-blue-700 text-blue-100 font-semibold'
                        : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* System & DSA Status Box */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/50">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Database className="w-3.5 h-3.5 text-blue-400" /> Matrix Capacity
              </span>
              <span className="font-mono text-white font-semibold">
                {cities.length}/{MAX_CITIES}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Layers className="w-3.5 h-3.5 text-amber-400" /> Queue Pointer
              </span>
              <span className="font-mono text-white font-semibold">
                [{waitlistQueue ? waitlistQueue.front : 0}, {waitlistQueue ? waitlistQueue.rear : -1}]
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Array In-Memory
              </span>
              <span className="text-emerald-400 font-mono font-medium">Synced</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
