import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import {
  Users,
  UserPlus,
  PlaneTakeoff,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Ticket,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import AlgorithmChip from '../components/AlgorithmChip.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { MAX_QUEUE_CAPACITY } from '../algorithms/constants.js';

export default function WaitlistPage() {
  const {
    cities,
    metrics,
    waitlistQueue,
    handleEnqueuePassenger,
    handleDequeuePassenger,
    handleClearWaitlist,
  } = useApp();

  // Form input states
  const [passengerName, setPassengerName] = useState('');
  const [selectedFlight, setSelectedFlight] = useState('');
  const [seatClass, setSeatClass] = useState('Economy');
  const [formError, setFormError] = useState('');
  const [isBoarding, setIsBoarding] = useState(false);
  const [boardedPassenger, setBoardedPassenger] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Active passengers in linear queue
  const activePassengers = waitlistQueue ? waitlistQueue.getActivePassengers() : [];
  const queueSize = waitlistQueue ? waitlistQueue.size() : 0;
  const isQueueFull = waitlistQueue ? waitlistQueue.isFull() : false;
  const isQueueEmpty = waitlistQueue ? waitlistQueue.isEmpty() : true;

  // Available flights list for dropdown
  const availableRoutes = metrics.routes.map((r) => `${r.from} (${r.fromCode}) → ${r.to} (${r.toCode})`);
  const defaultFlight = availableRoutes[0] || 'Chennai (MAA) → Kolkata (CCU)';

  // Handle Enqueue Form Submission
  const handleSubmitEnqueue = (e) => {
    e.preventDefault();
    setFormError('');

    if (!passengerName.trim()) {
      setFormError('Passenger full name is required.');
      return;
    }

    if (isQueueFull) {
      setFormError(`Queue overflow error! Maximum linear array capacity of ${MAX_QUEUE_CAPACITY} reached.`);
      return;
    }

    const flightToUse = selectedFlight || defaultFlight;
    const success = handleEnqueuePassenger({
      name: passengerName.trim(),
      flight: flightToUse,
      seatClass,
    });

    if (success) {
      setPassengerName('');
    }
  };

  // Handle Dequeue (Board Passenger) with animation
  const handleBoardNext = () => {
    if (isQueueEmpty) return;

    setIsBoarding(true);
    // Smooth transition
    setTimeout(() => {
      const passenger = handleDequeuePassenger();
      setBoardedPassenger(passenger);
      setIsBoarding(false);
    }, 250);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. TOP HEADER & QUEUE STATUS BAR */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              Overbooked Flight Waitlist Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Array-based First-In-First-Out (FIFO) linear queue with front & rear pointers. Pointers reset to [0, -1] upon becoming empty.
            </p>
          </div>
          <AlgorithmChip
            name="Linear Queue"
            complexity="O(1) Enqueue / Dequeue"
            type="FIFO Data Structure"
            details="Fixed array queue[100] with front and rear pointers. When empty (front > rear), indexes automatically reset to [0, -1] preventing false overflow."
          />
        </div>

        {/* Pointer Diagnostic Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              FRONT Pointer
            </span>
            <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
              index[{waitlistQueue ? waitlistQueue.front : 0}]
            </div>
            <span className="text-[10px] text-slate-400">Next to board</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              REAR Pointer
            </span>
            <div className="text-lg font-bold font-mono text-blue-600 dark:text-blue-400">
              index[{waitlistQueue ? waitlistQueue.rear : -1}]
            </div>
            <span className="text-[10px] text-slate-400">Last enqueued</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Queue Occupancy
            </span>
            <div className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {queueSize} / {MAX_QUEUE_CAPACITY}
            </div>
            <span className="text-[10px] text-slate-400">Max capacity 100</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Queue State
            </span>
            <div className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
              {isQueueEmpty ? 'EMPTY' : isQueueFull ? 'FULL' : 'ACTIVE'}
            </div>
            <span className="text-[10px] text-slate-400">
              {isQueueEmpty ? 'Reset to [0, -1]' : 'FIFO In-Memory'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. ADD PASSENGER & ACTIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enqueue Form (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-600" />
              Enqueue Overbooked Passenger
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              items[++rear]
            </span>
          </div>

          <form onSubmit={handleSubmitEnqueue} className="space-y-3.5">
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Passenger Full Name
              </label>
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="e.g. Ananya Sen, Rohan Gupta"
                required
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Flight Corridor
              </label>
              <select
                value={selectedFlight || defaultFlight}
                onChange={(e) => setSelectedFlight(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 font-medium"
              >
                {availableRoutes.map((route, i) => (
                  <option key={i} value={route}>
                    {route}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Requested Travel Class
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Economy', 'Business', 'First Class'].map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSeatClass(cls)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      seatClass === cls
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isQueueFull}
              className="w-full py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add to Waitlist (Enqueue)</span>
            </button>
          </form>
        </div>

        {/* Boarding Controls & Boarded Banner (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Gate Clearance & Boarding Dispatch
              </h3>
              <p className="text-xs text-slate-400">
                Dequeues front-most passenger, advances front pointer, and resets when empty
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(true)}
                disabled={isQueueEmpty}
                className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900/40 disabled:opacity-40 transition-colors"
              >
                Clear Queue
              </button>
              <button
                type="button"
                onClick={handleBoardNext}
                disabled={isQueueEmpty || isBoarding}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <PlaneTakeoff className="w-4 h-4" />
                <span>Board Next Passenger (Dequeue)</span>
              </button>
            </div>
          </div>

          {/* Last Boarded Passenger Showcase */}
          {boardedPassenger ? (
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Successfully Boarded & Cleared
                </span>
                <span className="font-mono text-[10px] bg-emerald-200/80 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-900 dark:text-emerald-200 font-bold">
                  PNR: {boardedPassenger.pnr}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-700 dark:text-slate-300 gap-1 pt-1">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {boardedPassenger.name}
                  </span>
                  <span className="text-slate-500 block text-[11px]">
                    Flight: {boardedPassenger.flight}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {boardedPassenger.seatClass}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              Click "Board Next Passenger" to clear the passenger currently at the FRONT of the queue.
            </div>
          )}

          {/* DSA Pointer Reset Note */}
          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
            <span>
              <strong>Viva Architecture Note:</strong> In a fixed linear array queue, repeated enqueue/dequeue shifts indices forward. SkyRoute automatically resets <code>front = 0</code> and <code>rear = -1</code> whenever the queue empties, preventing artificial overflow.
            </span>
          </div>
        </div>
      </div>

      {/* 3. VISUAL QUEUE REPRESENTATION (CARDS ROW WITH FRONT & REAR LABELS) */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Live Linear Queue Array Visualization
            </h3>
            <p className="text-xs text-slate-400">
              Showing active elements in queue array from FRONT (head) to REAR (tail)
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl">
            {activePassengers.length} in queue
          </span>
        </div>

        {activePassengers.length === 0 ? (
          /* Empty Queue State Illustration */
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Ticket className="w-8 h-8 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Waitlist Queue is Currently Empty
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                All scheduled flights are operating at standard capacity. Add an overbooked passenger using the form above.
              </p>
            </div>
            <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              Pointers Normalized: front = 0, rear = -1
            </div>
          </div>
        ) : (
          /* Visual Cards in Row / Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activePassengers.map((pax) => {
              const isFront = pax.isFront;
              const isRear = pax.isRear;

              return (
                <div
                  key={pax.id}
                  className={`relative p-4 rounded-2xl border transition-all ${
                    isFront
                      ? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm ring-1 ring-emerald-400/40'
                      : isRear
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50/30 dark:bg-blue-950/20 shadow-sm ring-1 ring-blue-400/40'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                  }`}
                >
                  {/* Top Pointer Badges */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        #{pax.position}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.2 rounded">
                        slot[{pax.physicalIndex}]
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isFront && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white animate-pulse">
                          FRONT (Next)
                        </span>
                      )}
                      {isRear && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          REAR (Tail)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passenger Details */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {pax.name}
                      </h4>
                      <span className="font-mono text-[10px] text-slate-500 font-semibold">
                        {pax.pnr}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {pax.flight}
                    </div>

                    <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400">
                      <span className="px-2 py-0.5 rounded font-semibold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {pax.seatClass}
                      </span>
                      <span>
                        Wait: {new Date(pax.enqueuedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM CLEAR MODAL */}
      <ConfirmDialog
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearWaitlist}
        title="Purge Waitlist Queue?"
        message="Are you sure you want to clear all passengers from the overbooked queue? Pointers will be reset to front = 0 and rear = -1."
        confirmText="Clear All"
        confirmVariant="danger"
      />
    </div>
  );
}
