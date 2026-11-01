import React, { useState, useMemo } from 'react';
import { Plane, ZoomIn, ZoomOut, RotateCcw, Compass, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { INF } from '../algorithms/constants.js';

// Predefined geographic layout for classic Indian metro hubs (scaled to 760x520 canvas)
const GEO_COORDINATES = {
  DELHI: { x: 380, y: 100 },
  MUMBAI: { x: 230, y: 290 },
  KOLKATA: { x: 590, y: 230 },
  HYDERABAD: { x: 390, y: 350 },
  BANGALORE: { x: 340, y: 440 },
  CHENNAI: { x: 450, y: 460 },
  // Common additional Indian airports if added
  PUNE: { x: 250, y: 320 },
  AHMEDABAD: { x: 220, y: 230 },
  JAIPUR: { x: 330, y: 150 },
  KOCHI: { x: 320, y: 490 },
  GOA: { x: 260, y: 400 },
  CHANDIGARH: { x: 370, y: 70 },
  LUCKNOW: { x: 470, y: 150 },
  GUWAHATI: { x: 670, y: 190 },
};

export default function NetworkMap({
  cities = [],
  matrix = [],
  highlightMode = 'all', // 'all' | 'dijkstra' | 'prim'
  dijkstraPath = [], // array of city indices
  primEdges = [], // array of MST edges { u, v, fare }
  onSelectCity = null,
  selectedCityIndex = null,
  height = 520,
}) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Compute node positions (hybrid: predefined coordinates if known, else circular arrangement)
  const nodePositions = useMemo(() => {
    const total = cities.length;
    const positions = [];
    const centerX = 380;
    const centerY = 260;
    const radius = Math.min(220, 160 + total * 4);

    cities.forEach((city, index) => {
      const upperName = city.name.trim().toUpperCase();
      if (GEO_COORDINATES[upperName]) {
        positions.push({
          ...GEO_COORDINATES[upperName],
          index,
          city,
        });
      } else {
        // Equi-angular distribution on circle
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        positions.push({
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
          index,
          city,
        });
      }
    });

    return positions;
  }, [cities]);

  // Extract all active bidirectional edges
  const edges = useMemo(() => {
    const edgeList = [];
    const n = cities.length;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const fare = matrix[i] && matrix[i][j];
        if (fare > 0 && fare < INF) {
          const uPos = nodePositions[i];
          const vPos = nodePositions[j];
          if (uPos && vPos) {
            edgeList.push({
              id: `${i}-${j}`,
              u: i,
              v: j,
              fromName: cities[i].name,
              toName: cities[j].name,
              fare,
              x1: uPos.x,
              y1: uPos.y,
              x2: vPos.x,
              y2: vPos.y,
              midX: (uPos.x + vPos.x) / 2,
              midY: (uPos.y + vPos.y) / 2,
            });
          }
        }
      }
    }

    return edgeList;
  }, [cities, matrix, nodePositions]);

  // Lookup helper for Dijkstra path edges
  const dijkstraEdgeSet = useMemo(() => {
    const set = new Set();
    if (!dijkstraPath || dijkstraPath.length < 2) return set;
    for (let k = 0; k < dijkstraPath.length - 1; k++) {
      const u = dijkstraPath[k];
      const v = dijkstraPath[k + 1];
      set.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
    }
    return set;
  }, [dijkstraPath]);

  // Lookup helper for Prim MST edges
  const primEdgeSet = useMemo(() => {
    const set = new Set();
    if (!primEdges) return set;
    primEdges.forEach((e) => {
      set.add(`${Math.min(e.u, e.v)}-${Math.max(e.u, e.v)}`);
    });
    return set;
  }, [primEdges]);

  // Connected cities helper for hover state
  const hoveredConnections = useMemo(() => {
    if (hoveredNode === null) return new Set();
    const connected = new Set();
    connected.add(hoveredNode);
    edges.forEach((e) => {
      if (e.u === hoveredNode) connected.add(e.v);
      if (e.v === hoveredNode) connected.add(e.u);
    });
    return connected;
  }, [hoveredNode, edges]);

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.7, +(prev + delta).toFixed(1))));
  };

  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all flex flex-col">
      {/* Top Map Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-blue-600 dark:text-blue-400 rotate-45" />
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Network Topology Visualizer
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
            {cities.length} Hubs · {edges.length} Routes
          </span>
        </div>

        {/* Legend / Status */}
        <div className="flex items-center gap-2">
          {highlightMode === 'dijkstra' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Cheapest Itinerary Path
            </span>
          )}
          {highlightMode === 'prim' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              MST Backbone ({primEdges.length} Edges)
            </span>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xs p-0.5">
            <button
              type="button"
              onClick={() => handleZoom(0.1)}
              className="p-1 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.1)}
              className="p-1 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded transition-colors"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full flex-1 min-h-[420px] flex items-center justify-center p-2 bg-[#F8FAFC] dark:bg-[#0E1626]">
        {/* Subtle background radar/grid circles */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] dark:opacity-[0.12] flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full border border-slate-400 dark:border-slate-300" />
          <div className="absolute w-[340px] h-[340px] rounded-full border border-slate-400 dark:border-slate-300" />
          <div className="absolute w-[180px] h-[180px] rounded-full border border-slate-400 dark:border-slate-300" />
        </div>

        <svg
          viewBox="0 0 760 520"
          className="w-full h-full max-h-[520px] transition-transform duration-200 select-none"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Glow filter for highlighted Dijkstra path */}
            <filter id="blue-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Glow filter for MST edges */}
            <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 1. EDGES */}
          <g className="edges-layer">
            {edges.map((edge) => {
              const pairKey = `${Math.min(edge.u, edge.v)}-${Math.max(edge.u, edge.v)}`;
              const isDijkstraEdge = dijkstraEdgeSet.has(pairKey);
              const isPrimEdge = primEdgeSet.has(pairKey);
              const isHoverConnected =
                hoveredNode !== null && (edge.u === hoveredNode || edge.v === hoveredNode);

              // Determine Edge styling based on active mode
              let strokeColor = '#94a3b8'; // default slate-400
              let strokeWidth = 1.8;
              let strokeDasharray = 'none';
              let opacity = 0.65;
              let filter = 'none';

              if (highlightMode === 'dijkstra') {
                if (isDijkstraEdge) {
                  strokeColor = '#2563eb'; // Primary Blue
                  strokeWidth = 4.5;
                  opacity = 1;
                  filter = 'url(#blue-glow)';
                } else {
                  strokeColor = '#cbd5e1';
                  strokeWidth = 1.2;
                  opacity = 0.22;
                  strokeDasharray = '4 4';
                }
              } else if (highlightMode === 'prim') {
                if (isPrimEdge) {
                  strokeColor = '#10b981'; // Emerald Green
                  strokeWidth = 4;
                  opacity = 1;
                  filter = 'url(#emerald-glow)';
                } else {
                  strokeColor = '#94a3b8';
                  strokeWidth = 1.2;
                  opacity = 0.2;
                  strokeDasharray = '5 4';
                }
              } else if (hoveredNode !== null) {
                if (isHoverConnected) {
                  strokeColor = '#2563eb';
                  strokeWidth = 3;
                  opacity = 1;
                } else {
                  opacity = 0.18;
                  strokeWidth = 1;
                }
              }

              return (
                <g key={edge.id} className="transition-all duration-200">
                  {/* Connection Line */}
                  <line
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeOpacity={opacity}
                    filter={filter}
                    className={isDijkstraEdge ? 'animate-dash' : ''}
                  />

                  {/* Price Badge on Edge */}
                  {(opacity > 0.4 || isHoverConnected || isDijkstraEdge || isPrimEdge) && (
                    <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                      <rect
                        x="-20"
                        y="-10"
                        width="40"
                        height="20"
                        rx="6"
                        fill={
                          isDijkstraEdge
                            ? '#2563eb'
                            : isPrimEdge
                            ? '#059669'
                            : isHoverConnected
                            ? '#1e293b'
                            : '#ffffff'
                        }
                        stroke={isDijkstraEdge || isPrimEdge ? 'transparent' : '#cbd5e1'}
                        strokeWidth="1"
                        className="shadow-sm transition-all"
                      />
                      <text
                        x="0"
                        y="3.5"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill={isDijkstraEdge || isPrimEdge || isHoverConnected ? '#ffffff' : '#334155'}
                        fontFamily="ui-monospace, monospace"
                      >
                        ${edge.fare}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* 2. NODES (Cities) */}
          <g className="nodes-layer">
            {nodePositions.map((pos) => {
              const isHovered = hoveredNode === pos.index;
              const isSelected = selectedCityIndex === pos.index;
              const inDijkstraPath = dijkstraPath.includes(pos.index);
              const dijkstraStopIndex = dijkstraPath.indexOf(pos.index);
              const isDijkstraSource = dijkstraPath[0] === pos.index;
              const isDijkstraDest = dijkstraPath[dijkstraPath.length - 1] === pos.index;

              // Node badge color
              let nodeFill = '#ffffff';
              let nodeStroke = '#3b82f6';
              let ringColor = '#93c5fd';

              if (highlightMode === 'dijkstra') {
                if (isDijkstraSource) {
                  nodeFill = '#2563eb';
                  nodeStroke = '#1d4ed8';
                  ringColor = '#60a5fa';
                } else if (isDijkstraDest) {
                  nodeFill = '#10b981';
                  nodeStroke = '#059669';
                  ringColor = '#6ee7b7';
                } else if (inDijkstraPath) {
                  nodeFill = '#3b82f6';
                  nodeStroke = '#2563eb';
                  ringColor = '#bfdbfe';
                } else {
                  nodeFill = '#f1f5f9';
                  nodeStroke = '#cbd5e1';
                }
              } else if (highlightMode === 'prim') {
                nodeFill = '#ecfdf5';
                nodeStroke = '#10b981';
                ringColor = '#a7f3d0';
              } else if (isHovered || isSelected) {
                nodeFill = '#eff6ff';
                nodeStroke = '#2563eb';
                ringColor = '#3b82f6';
              }

              const airportCode = pos.city.code || pos.city.name.slice(0, 3).toUpperCase();

              return (
                <g
                  key={pos.index}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onMouseEnter={() => setHoveredNode(pos.index)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => onSelectCity && onSelectCity(pos.index)}
                  className="cursor-pointer transition-transform duration-150 hover:scale-110"
                >
                  {/* Outer pulse indicator on hover / source / dest */}
                  {(isHovered || isDijkstraSource || isDijkstraDest) && (
                    <circle
                      r="26"
                      fill="none"
                      stroke={ringColor}
                      strokeWidth="2.5"
                      opacity="0.8"
                      className="animate-ping origin-center"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r="20"
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={isHovered || inDijkstraPath ? '3' : '2'}
                    className="shadow-md transition-all"
                  />

                  {/* City Code inside circle */}
                  <text
                    x="0"
                    y="4.5"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill={
                      highlightMode === 'dijkstra' && inDijkstraPath
                        ? '#ffffff'
                        : '#0f172a'
                    }
                    fontFamily="Inter, sans-serif"
                    letterSpacing="0.5px"
                  >
                    {airportCode}
                  </text>

                  {/* Stop order indicator badge for Dijkstra */}
                  {highlightMode === 'dijkstra' && inDijkstraPath && (
                    <g transform="translate(14, -14)">
                      <circle r="8" fill="#1e293b" stroke="#ffffff" strokeWidth="1.5" />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#ffffff"
                      >
                        {dijkstraStopIndex + 1}
                      </text>
                    </g>
                  )}

                  {/* City Name Label Below Node */}
                  <g transform="translate(0, 32)">
                    <rect
                      x="-42"
                      y="-10"
                      width="84"
                      height="18"
                      rx="4"
                      fill="#0f172a"
                      fillOpacity={isHovered || inDijkstraPath ? '0.9' : '0.75'}
                    />
                    <text
                      x="0"
                      y="2.5"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="600"
                      fill="#ffffff"
                    >
                      {pos.city.name}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hovered City Infobox overlay */}
        {hoveredNode !== null && cities[hoveredNode] && (
          <div className="absolute top-4 left-4 z-20 p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs w-60 animate-fade-in pointer-events-none">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                {cities[hoveredNode].name} ({cities[hoveredNode].code || 'HUB'})
              </span>
              <span className="text-[10px] font-mono bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-1.5 py-0.2 rounded">
                Node [{hoveredNode}]
              </span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Direct Routes:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {hoveredConnections.size - 1} connected hubs
                </span>
              </div>
              <div className="flex justify-between">
                <span>Region / State:</span>
                <span className="font-medium">{cities[hoveredNode].state || 'Domestic Hub'}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Footer Bar */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Two-Way Air Route
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal Hub / MST
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 border-t border-dashed border-slate-400" /> Non-Tree Link
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-[10px]">
          SVG Coordinate Graph · Adjacency Matrix View
        </span>
      </div>
    </div>
  );
}
