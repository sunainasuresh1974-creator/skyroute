import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getInitialGraphState,
  addCityToGraph,
  removeCityFromGraph,
  setFlightEdge,
  removeFlightEdge,
  calculateGraphMetrics,
  LinearWaitlistQueue,
  getInitialWaitlistData,
  MAX_CITIES,
} from '../algorithms/index.js';

const AppContext = createContext(null);
const STORAGE_KEY = 'skyroute_state_v1';

export function AppProvider({ children }) {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('skyroute_theme');
      if (saved !== null) return saved === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Core Data States
  const [cities, setCities] = useState([]);
  const [matrix, setMatrix] = useState([]);
  const [waitlistQueue, setWaitlistQueue] = useState(null);
  const [activityLog, setActivityLog] = useState([]);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = (type, title, message) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Activity Log Helper
  const logActivity = (type, title, detail) => {
    const entry = {
      id: `act-${Date.now()}-${Math.random()}`,
      type, // 'route' | 'city' | 'dijkstra' | 'prim' | 'queue' | 'system'
      title,
      detail,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setActivityLog((prev) => [entry, ...prev.slice(0, 24)]);
  };

  // Initialize or load from LocalStorage
  useEffect(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed.cities && parsed.matrix) {
          setCities(parsed.cities);
          setMatrix(parsed.matrix);
          setWaitlistQueue(new LinearWaitlistQueue(parsed.waitlist));
          setActivityLog(parsed.activityLog || []);
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved state, loading default data.', e);
    }

    // Default initialization
    loadSampleData(false);
  }, []);

  // Save to LocalStorage whenever key states change
  useEffect(() => {
    if (cities.length > 0 && matrix.length > 0 && waitlistQueue) {
      try {
        const stateToSave = {
          cities,
          matrix,
          waitlist: waitlistQueue.serialize(),
          activityLog: activityLog.slice(0, 25),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (err) {
        console.error('Error saving state to localStorage', err);
      }
    }
  }, [cities, matrix, waitlistQueue, activityLog]);

  // Sync theme to <html> element
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('skyroute_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('skyroute_theme', 'light');
      }
    } catch (err) {
      console.error(err);
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Load sample dataset
  const loadSampleData = (showToastNotification = true) => {
    const { cities: initCities, matrix: initMatrix } = getInitialGraphState();
    const initQueueData = getInitialWaitlistData();
    const newQueue = new LinearWaitlistQueue(initQueueData);

    const initialLogs = [
      {
        id: `act-init-1`,
        type: 'system',
        title: 'Network Initialized',
        detail: 'Preloaded 6 metro cities and 8 bidirectional flight corridors.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: `act-init-2`,
        type: 'route',
        title: 'Core Routes Active',
        detail: 'MAA, DEL, BOM, BLR, CCU, HYD connected in adjacency matrix.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];

    setCities(initCities);
    setMatrix(initMatrix);
    setWaitlistQueue(newQueue);
    setActivityLog(initialLogs);

    if (showToastNotification) {
      addToast('success', 'Sample Data Loaded', 'Restored 6 cities, 8 routes, and sample waitlist passengers.');
      logActivity('system', 'Sample Data Restored', 'Reset graph network to standard test benchmark.');
    }
  };

  // Reset all data completely
  const resetAllData = () => {
    const emptyCities = [];
    const emptyMatrix = [];
    const emptyQueue = new LinearWaitlistQueue();
    emptyQueue.clear();

    setCities(emptyCities);
    setMatrix(emptyMatrix);
    setWaitlistQueue(emptyQueue);
    setActivityLog([
      {
        id: `act-reset-${Date.now()}`,
        type: 'system',
        title: 'System Purged',
        detail: 'All cities, routes, and queue records have been reset.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }

    addToast('info', 'System Reset', 'All network routes and waitlists have been purged.');
  };

  // Add / Update Flight
  const handleSetFlight = (fromIdx, toIdx, fare) => {
    try {
      const u = parseInt(fromIdx, 10);
      const v = parseInt(toIdx, 10);
      const price = parseInt(fare, 10);

      const updatedMatrix = setFlightEdge(matrix, u, v, price);
      setMatrix(updatedMatrix);

      const c1 = cities[u].name;
      const c2 = cities[v].name;
      addToast('success', 'Route Configured', `Direct two-way flight ${c1} ⇄ ${c2} set to $${price}.`);
      logActivity('route', `Route Updated: ${c1} ⇄ ${c2}`, `Set bilateral fare to $${price}.`);
      return true;
    } catch (err) {
      addToast('error', 'Failed to Set Route', err.message);
      return false;
    }
  };

  // Delete Flight
  const handleDeleteFlight = (u, v) => {
    try {
      const updatedMatrix = removeFlightEdge(matrix, u, v);
      setMatrix(updatedMatrix);
      const c1 = cities[u]?.name || `City ${u}`;
      const c2 = cities[v]?.name || `City ${v}`;
      addToast('info', 'Flight Cancelled', `Removed route between ${c1} and ${c2}.`);
      logActivity('route', `Route Removed: ${c1} ⇄ ${c2}`, 'Bilateral edge disconnected in matrix.');
      return true;
    } catch (err) {
      addToast('error', 'Error Removing Route', err.message);
      return false;
    }
  };

  // Add City
  const handleAddCity = (name, code, state) => {
    try {
      if (!name || !name.trim()) {
        throw new Error('City name cannot be empty.');
      }
      if (cities.length >= MAX_CITIES) {
        throw new Error(`Capacity limit reached. Max ${MAX_CITIES} cities allowed.`);
      }

      const cleanName = name.trim();
      const cleanCode = (code || cleanName.slice(0, 3)).toUpperCase().trim();
      const cleanState = (state || 'Region').trim();

      const result = addCityToGraph(cities, matrix, {
        name: cleanName,
        code: cleanCode,
        state: cleanState,
      });

      setCities(result.cities);
      setMatrix(result.matrix);

      addToast('success', 'Airport Added', `${cleanName} (${cleanCode}) added to operations network.`);
      logActivity('city', `City Enrolled: ${cleanName}`, `Adjacency matrix expanded to ${result.cities.length}x${result.cities.length}.`);
      return true;
    } catch (err) {
      addToast('error', 'Validation Error', err.message);
      return false;
    }
  };

  // Delete City
  const handleDeleteCity = (cityIdx) => {
    try {
      const cityName = cities[cityIdx]?.name;
      const result = removeCityFromGraph(cities, matrix, cityIdx);
      setCities(result.cities);
      setMatrix(result.matrix);

      addToast('info', 'Airport Removed', `${cityName} and its routes removed.`);
      logActivity('city', `City Removed: ${cityName}`, `Adjacency matrix contracted to ${result.cities.length}x${result.cities.length}.`);
      return true;
    } catch (err) {
      addToast('error', 'Error Removing City', err.message);
      return false;
    }
  };

  // Queue Operations
  const handleEnqueuePassenger = (passenger) => {
    if (!waitlistQueue) return false;

    const res = waitlistQueue.enqueue(passenger);
    if (!res.success) {
      addToast('error', 'Waitlist Overflow', res.error);
      return false;
    }

    // Force React re-render by creating a clone of queue object
    setWaitlistQueue(new LinearWaitlistQueue(waitlistQueue.serialize()));
    addToast('success', 'Passenger Waitlisted', `${res.passenger.name} added to waitlist (Queue pos #${res.size}).`);
    logActivity('queue', `Passenger Enqueued: ${res.passenger.name}`, `Assigned slot index ${res.passenger.queueIndex} (${res.passenger.flight}).`);
    return true;
  };

  const handleDequeuePassenger = () => {
    if (!waitlistQueue) return null;

    const res = waitlistQueue.dequeue();
    if (!res.success) {
      addToast('warning', 'Queue Empty', res.error);
      return null;
    }

    setWaitlistQueue(new LinearWaitlistQueue(waitlistQueue.serialize()));
    addToast(
      'success',
      'Passenger Boarded',
      `${res.passenger.name} boarded on flight ${res.passenger.flight}.${res.wasReset ? ' [Queue empty: Front & Rear pointers reset]' : ''}`
    );
    logActivity(
      'queue',
      `Boarded: ${res.passenger.name}`,
      `Dequeued from slot ${res.front - 1}. ${res.wasReset ? 'Pointers reset (front=0, rear=-1).' : `Remaining: ${res.size}`}`
    );
    return res.passenger;
  };

  const handleClearWaitlist = () => {
    if (!waitlistQueue) return;
    waitlistQueue.clear();
    setWaitlistQueue(new LinearWaitlistQueue(waitlistQueue.serialize()));
    addToast('info', 'Waitlist Cleared', 'All passengers cleared. Front & rear pointers reset to [0, -1].');
    logActivity('queue', 'Waitlist Purged', 'Reset linear queue array to initial empty state.');
  };

  const metrics = calculateGraphMetrics(cities, matrix);

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        sidebarOpen,
        setSidebarOpen,
        globalSearch,
        setGlobalSearch,
        cities,
        matrix,
        metrics,
        waitlistQueue,
        activityLog,
        toasts,
        addToast,
        removeToast,
        logActivity,
        handleSetFlight,
        handleDeleteFlight,
        handleAddCity,
        handleDeleteCity,
        handleEnqueuePassenger,
        handleDequeuePassenger,
        handleClearWaitlist,
        loadSampleData,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
