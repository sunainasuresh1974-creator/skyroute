import React, { useState } from 'react';
import { Cpu, Info, Check, HelpCircle } from 'lucide-react';

export default function AlgorithmChip({
  name = 'Dijkstra',
  complexity = 'O(V²)',
  type = 'Shortest Path',
  details = '',
  className = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50/90 text-blue-700 border border-blue-200/80 hover:bg-blue-100 hover:border-blue-300 transition-all dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 shadow-sm"
        title="Click to view DSA details"
      >
        <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
        <span className="font-semibold">{name}</span>
        <span className="text-blue-400 dark:text-blue-500">·</span>
        <span className="font-mono text-[11px] bg-blue-100/80 dark:bg-blue-900/60 px-1.5 py-0.2 rounded text-blue-800 dark:text-blue-200">
          {complexity}
        </span>
      </button>

      {showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-2 w-72 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 animate-fade-in pointer-events-none">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider text-[10px]">
              {type}
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {complexity}
            </span>
          </div>
          <p className="leading-relaxed">
            {details ||
              `Pure array-based implementation without graph libraries, mirroring classical C data structures.`}
          </p>
        </div>
      )}
    </div>
  );
}
