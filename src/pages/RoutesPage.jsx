import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Table,
  Grid,
  Plane,
  Building2,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import AlgorithmChip from '../components/AlgorithmChip.jsx';
import { INF, MAX_CITIES } from '../algorithms/constants.js';

export default function RoutesPage({
  isAddFlightModalOpen,
  setIsAddFlightModalOpen,
}) {
  const {
    cities,
    matrix,
    metrics,
    handleSetFlight,
    handleDeleteFlight,
    handleAddCity,
    handleDeleteCity,
    globalSearch,
    setGlobalSearch,
  } = useApp();

  // Local state
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'matrix'
  const [searchFilter, setSearchFilter] = useState('');
  const [sortOption, setSortOption] = useState('fare-asc'); // 'fare-asc' | 'fare-desc' | 'name-asc'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add City Modal State
  const [isAddCityModalOpen, setIsAddCityModalOpen] = useState(false);
  const [newCityName, setNewCityName] = useState('');
  const [newCityCode, setNewCityCode] = useState('');
  const [newCityState, setNewCityState] = useState('');
  const [cityError, setCityError] = useState('');

  // Add / Edit Flight Modal State
  const [flightFromIdx, setFlightFromIdx] = useState(0);
  const [flightToIdx, setFlightToIdx] = useState(cities.length > 1 ? 1 : 0);
  const [flightFare, setFlightFare] = useState('');
  const [flightError, setFlightError] = useState('');
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Delete Confirm State
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    type: 'flight', // 'flight' | 'city'
    payload: null,
    title: '',
    message: '',
  });

  // Effective search term (either page local or navbar global)
  const query = (searchFilter || globalSearch).trim().toLowerCase();

  // Filtered & Sorted Routes
  const filteredRoutes = useMemo(() => {
    let list = [...metrics.routes];

    if (query) {
      list = list.filter(
        (r) =>
          r.from.toLowerCase().includes(query) ||
          r.to.toLowerCase().includes(query) ||
          r.fromCode.toLowerCase().includes(query) ||
          r.toCode.toLowerCase().includes(query) ||
          r.fare.toString().includes(query)
      );
    }

    if (sortOption === 'fare-asc') {
      list.sort((a, b) => a.fare - b.fare);
    } else if (sortOption === 'fare-desc') {
      list.sort((a, b) => b.fare - a.fare);
    } else if (sortOption === 'name-asc') {
      list.sort((a, b) => a.from.localeCompare(b.from));
    }

    return list;
  }, [metrics.routes, query, sortOption]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / pageSize));
  const paginatedRoutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRoutes.slice(start, start + pageSize);
  }, [filteredRoutes, currentPage, pageSize]);

  // Open modal to add a flight
  const handleOpenAddFlight = (initialFrom = 0, initialTo = 1, initialFare = '') => {
    setFlightFromIdx(initialFrom);
    setFlightToIdx(initialTo);
    setFlightFare(initialFare);
    setFlightError('');
    setIsEditingExisting(Boolean(initialFare));
    setIsAddFlightModalOpen(true);
  };

  // Submit flight
  const handleSaveFlight = (e) => {
    e.preventDefault();
    setFlightError('');

    const u = parseInt(flightFromIdx, 10);
    const v = parseInt(flightToIdx, 10);
    const fareVal = parseInt(flightFare, 10);

    if (isNaN(u) || isNaN(v) || u === v) {
      setFlightError('Origin and destination airport must be different.');
      return;
    }
    if (isNaN(fareVal) || fareVal < 1 || fareVal >= INF) {
      setFlightError(`Fare must be a positive integer between $1 and $${INF - 1}.`);
      return;
    }

    const success = handleSetFlight(u, v, fareVal);
    if (success) {
      setIsAddFlightModalOpen(false);
      setFlightFare('');
    }
  };

  // Submit city
  const handleSaveCity = (e) => {
    e.preventDefault();
    setCityError('');

    if (!newCityName.trim()) {
      setCityError('City name is required.');
      return;
    }

    const cleanName = newCityName.trim();
    const cleanCode = (newCityCode || cleanName.slice(0, 3)).toUpperCase().trim();

    if (cleanCode.length !== 3) {
      setCityError('IATA Airport code must be exactly 3 uppercase letters.');
      return;
    }

    const success = handleAddCity(cleanName, cleanCode, newCityState);
    if (success) {
      setIsAddCityModalOpen(false);
      setNewCityName('');
      setNewCityCode('');
      setNewCityState('');
    }
  };

  // Confirm delete handler
  const executeDelete = () => {
    const { type, payload } = deleteConfirmState;
    if (type === 'flight') {
      handleDeleteFlight(payload.u, payload.v);
    } else if (type === 'city') {
      handleDeleteCity(payload.cityIndex);
    }
  };

  // Matrix Heatmap cell color generator
  const getCellBgColor = (fare) => {
    if (fare === 0) return 'bg-slate-100 dark:bg-slate-800 text-slate-400';
    if (fare >= INF) return 'bg-transparent text-slate-300 dark:text-slate-600';

    const min = metrics.minFare || 100;
    const max = metrics.maxFare || 600;
    const ratio = Math.min(1, Math.max(0, (fare - min) / (max - min || 1)));

    if (ratio < 0.35) {
      return 'bg-emerald-100/90 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold';
    } else if (ratio < 0.7) {
      return 'bg-amber-100/90 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 font-bold';
    } else {
      return 'bg-rose-100/90 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300 font-bold';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP CONTROLS BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Left: Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px] flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => {
                setSearchFilter(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter flights by city or code..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="fare-asc">Fare: Lowest First</option>
              <option value="fare-desc">Fare: Highest First</option>
              <option value="name-asc">City: A to Z</option>
            </select>
          </div>
        </div>

        {/* Right: View Toggle & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Fare Matrix Heatmap</span>
            </button>
          </div>

          {/* Add City Button */}
          <button
            type="button"
            onClick={() => {
              setCityError('');
              setIsAddCityModalOpen(true);
            }}
            disabled={cities.length >= MAX_CITIES}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
            title={cities.length >= MAX_CITIES ? `Max limit of ${MAX_CITIES} cities reached` : 'Add City'}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Add City</span>
          </button>

          {/* Add Route Button */}
          <button
            type="button"
            onClick={() => handleOpenAddFlight(0, cities.length > 1 ? 1 : 0, '')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Flight</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT VIEW: TABLE OR MATRIX */}
      {viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Active Bilateral Corridors ({filteredRoutes.length})
              </h3>
              <p className="text-xs text-slate-400">
                Bidirectional flight routes stored in adjacency matrix [matrix[u][v] = matrix[v][u]]
              </p>
            </div>
            <AlgorithmChip name="Adjacency Matrix" complexity="O(1) Edge Edit" type="Graph" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-3">Departure Hub</th>
                  <th className="py-3 px-3">Arrival Hub</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3 text-right">Fare ($ USD)</th>
                  <th className="py-3 px-3 text-center">Matrix Coordinates</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedRoutes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      No routes match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedRoutes.map((route) => (
                    <tr
                      key={route.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold font-mono text-xs flex items-center justify-center">
                            {route.fromCode}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {route.from}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Hub [{route.u}]
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold font-mono text-xs flex items-center justify-center">
                            {route.toCode}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {route.to}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Hub [{route.v}]
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Two-Way
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                          ${route.fare}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          [{route.u}][{route.v}] = [{route.v}][{route.u}]
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAddFlight(route.u, route.v, route.fare)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="Edit fare"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmState({
                                isOpen: true,
                                type: 'flight',
                                payload: { u: route.u, v: route.v },
                                title: 'Cancel Flight Route?',
                                message: `Are you sure you want to cancel the bidirectional flight between ${route.from} and ${route.to}? This will set matrix[${route.u}][${route.v}] = 99999 (INF).`,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                            title="Cancel flight"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div>
                Showing page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span> ({filteredRoutes.length} routes)
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FARE MATRIX HEATMAP VIEW */
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                2D Adjacency Fare Heatmap Matrix
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                  {cities.length} × {cities.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Green cells represent economical flights, amber/red cells represent pricier corridors, and "–" represents no direct flight (INF = 99999). Click any cell to configure or edit fare.
              </p>
            </div>
            {/* Heatmap Legend */}
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-200 dark:bg-emerald-900" />
                <span className="text-[11px] text-slate-500">Economy ($)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-amber-200 dark:bg-amber-900" />
                <span className="text-[11px] text-slate-500">Mid ($$)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-200 dark:bg-rose-900" />
                <span className="text-[11px] text-slate-500">Premium ($$$)</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold sticky left-0 z-10">
                    Hub \ Hub
                  </th>
                  {cities.map((city, idx) => (
                    <th
                      key={city.name}
                      className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-200 font-bold text-center min-w-[70px]"
                      title={`${city.name} (${city.code || 'HUB'})`}
                    >
                      <div className="font-mono text-xs text-blue-600 dark:text-blue-400">
                        {city.code || city.name.slice(0, 3).toUpperCase()}
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal truncate max-w-[65px]">
                        {city.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cities.map((rowCity, i) => (
                  <tr key={rowCity.name}>
                    <td className="p-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-200 sticky left-0 z-10 flex items-center justify-between min-w-[120px]">
                      <span>{rowCity.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">
                        [{i}]
                      </span>
                    </td>

                    {cities.map((colCity, j) => {
                      const fare = matrix[i] ? matrix[i][j] : INF;
                      const isSelf = i === j;
                      const hasFlight = fare > 0 && fare < INF;

                      return (
                        <td
                          key={colCity.name}
                          onClick={() => {
                            if (!isSelf) {
                              handleOpenAddFlight(i, j, hasFlight ? fare : '');
                            }
                          }}
                          className={`p-2 border border-slate-200 dark:border-slate-800 text-center font-mono text-xs transition-all ${
                            isSelf
                              ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 cursor-default'
                              : 'cursor-pointer hover:ring-2 hover:ring-blue-500 hover:scale-105'
                          } ${getCellBgColor(fare)}`}
                          title={
                            isSelf
                              ? 'Same City (Distance 0)'
                              : hasFlight
                              ? `${rowCity.name} ⇄ ${colCity.name}: $${fare} (Click to edit)`
                              : `No direct flight (INF). Click to create route.`
                          }
                        >
                          {isSelf ? '0' : hasFlight ? `$${fare}` : '–'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. AIRPORT HUBS LIST CARD (WITH REMOVE CITY OPTION) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Registered Airport Hubs ({cities.length}/{MAX_CITIES})
            </h3>
            <p className="text-xs text-slate-400">
              Vertex indices representing network nodes in C-style array: cities[0..n-1]
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAddCityModalOpen(true)}
            disabled={cities.length >= MAX_CITIES}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-40"
          >
            + Add New Airport
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {cities.map((city, idx) => (
            <div
              key={city.name}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between group hover:border-blue-400 dark:hover:border-blue-700 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                  {city.code || city.name.slice(0, 3).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {city.name}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Index [{idx}] · {city.state || 'Hub'}
                  </div>
                </div>
              </div>

              {cities.length > 2 && (
                <button
                  type="button"
                  onClick={() =>
                    setDeleteConfirmState({
                      isOpen: true,
                      type: 'city',
                      payload: { cityIndex: idx },
                      title: `Remove Airport ${city.name}?`,
                      message: `Removing ${city.name} will delete all its flight connections and contract the adjacency matrix to ${
                        cities.length - 1
                      }x${cities.length - 1}.`,
                    })
                  }
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all"
                  title="Remove airport"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: ADD / EDIT FLIGHT */}
      <Modal
        isOpen={isAddFlightModalOpen}
        onClose={() => setIsAddFlightModalOpen(false)}
        title={isEditingExisting ? 'Edit Bilateral Flight Fare' : 'Add New Flight Route'}
        subtitle="Configures undirected edge matrix[u][v] = matrix[v][u] in the graph"
      >
        <form onSubmit={handleSaveFlight} className="space-y-4">
          {flightError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{flightError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Departure Hub (City u)
              </label>
              <select
                value={flightFromIdx}
                onChange={(e) => setFlightFromIdx(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
              >
                {cities.map((city, idx) => (
                  <option key={city.name} value={idx}>
                    {city.name} ({city.code || 'HUB'}) [Index {idx}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Arrival Hub (City v)
              </label>
              <select
                value={flightToIdx}
                onChange={(e) => setFlightToIdx(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
              >
                {cities.map((city, idx) => (
                  <option key={city.name} value={idx}>
                    {city.name} ({city.code || 'HUB'}) [Index {idx}]
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ticket Price / Fare ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                $
              </span>
              <input
                type="number"
                min="1"
                max="99998"
                value={flightFare}
                onChange={(e) => setFlightFare(e.target.value)}
                placeholder="e.g. 250"
                required
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Valid range: $1 to $99,998. (99999 is reserved for INF / no flight).
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddFlightModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
            >
              Save Flight Route
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ADD CITY */}
      <Modal
        isOpen={isAddCityModalOpen}
        onClose={() => setIsAddCityModalOpen(false)}
        title="Add Airport Hub to Network"
        subtitle={`Expands adjacency matrix from ${cities.length}×${cities.length} to ${cities.length + 1}×${cities.length + 1}`}
      >
        <form onSubmit={handleSaveCity} className="space-y-4">
          {cityError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{cityError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              City Name
            </label>
            <input
              type="text"
              value={newCityName}
              onChange={(e) => {
                setNewCityName(e.target.value);
                if (!newCityCode && e.target.value.length >= 3) {
                  setNewCityCode(e.target.value.slice(0, 3).toUpperCase());
                }
              }}
              placeholder="e.g. Pune, Ahmedabad, Kochi"
              required
              className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                IATA Airport Code (3 Letters)
              </label>
              <input
                type="text"
                maxLength="3"
                value={newCityCode}
                onChange={(e) => setNewCityCode(e.target.value.toUpperCase())}
                placeholder="e.g. PNQ"
                required
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                State / Region (Optional)
              </label>
              <input
                type="text"
                value={newCityState}
                onChange={(e) => setNewCityState(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddCityModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors"
            >
              Enroll Airport
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteConfirmState.isOpen}
        onClose={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeDelete}
        title={deleteConfirmState.title}
        message={deleteConfirmState.message}
        confirmText="Confirm Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
