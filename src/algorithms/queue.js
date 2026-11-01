/**
 * SkyRoute - Overbooked Flight Linear Waitlist Queue
 *
 * Classical array-based linear queue mirroring a C data-structures project:
 * - Fixed size array of capacity 100 (items[MAX_QUEUE_CAPACITY])
 * - front pointer: index of next element to dequeue
 * - rear pointer: index of last enqueued element
 * - Automatic reset of front & rear when queue becomes empty
 *
 * Enqueue: O(1)
 * Dequeue: O(1)
 * Space Complexity: O(N) where N = 100
 */

import { MAX_QUEUE_CAPACITY } from './constants.js';

export class LinearWaitlistQueue {
  constructor(initialData = null) {
    if (initialData) {
      this.capacity = initialData.capacity || MAX_QUEUE_CAPACITY;
      this.items = initialData.items || new Array(this.capacity).fill(null);
      this.front = typeof initialData.front === 'number' ? initialData.front : 0;
      this.rear = typeof initialData.rear === 'number' ? initialData.rear : -1;
    } else {
      this.capacity = MAX_QUEUE_CAPACITY;
      this.items = new Array(this.capacity).fill(null);
      this.front = 0;
      this.rear = -1;
    }
  }

  /**
   * Checks if the queue is empty.
   */
  isEmpty() {
    return this.front > this.rear || this.rear === -1;
  }

  /**
   * Checks if the linear queue has reached its maximum capacity.
   */
  isFull() {
    return this.rear >= this.capacity - 1;
  }

  /**
   * Number of passengers currently in the waitlist.
   */
  size() {
    if (this.isEmpty()) return 0;
    return this.rear - this.front + 1;
  }

  /**
   * Enqueues a passenger into the waitlist.
   * @param {Object} passenger - { id, name, flight, seatClass, timestamp, pnr }
   * @returns {{ success: boolean, passenger?: Object, error?: string }}
   */
  enqueue(passenger) {
    if (this.isFull()) {
      return {
        success: false,
        error: `Waitlist Queue is FULL (Maximum capacity ${this.capacity} reached). Cannot add more passengers.`,
      };
    }

    this.rear++;
    const passengerRecord = {
      ...passenger,
      id: passenger.id || `PAX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      pnr: passenger.pnr || `SR${Math.floor(100000 + Math.random() * 900000)}`,
      enqueuedAt: passenger.enqueuedAt || new Date().toISOString(),
      queueIndex: this.rear,
    };

    this.items[this.rear] = passengerRecord;

    return {
      success: true,
      passenger: passengerRecord,
      front: this.front,
      rear: this.rear,
      size: this.size(),
    };
  }

  /**
   * Dequeues (boards) the next passenger from the waitlist.
   * If the queue becomes empty, resets front = 0 and rear = -1.
   * @returns {{ success: boolean, passenger?: Object, error?: string, wasReset?: boolean }}
   */
  dequeue() {
    if (this.isEmpty()) {
      return {
        success: false,
        error: 'Waitlist is EMPTY. No passengers available to board.',
      };
    }

    const passenger = this.items[this.front];
    this.items[this.front] = null; // Clear physical slot
    this.front++;

    let wasReset = false;
    // Reset pointers when queue becomes empty
    if (this.front > this.rear) {
      this.front = 0;
      this.rear = -1;
      wasReset = true;
    }

    return {
      success: true,
      passenger,
      front: this.front,
      rear: this.rear,
      size: this.size(),
      wasReset,
    };
  }

  /**
   * Clears the entire queue and resets front & rear pointers.
   */
  clear() {
    this.items = new Array(this.capacity).fill(null);
    this.front = 0;
    this.rear = -1;
    return {
      front: 0,
      rear: -1,
      size: 0,
    };
  }

  /**
   * Returns list of currently active passengers with their position info.
   */
  getActivePassengers() {
    if (this.isEmpty()) return [];

    const active = [];
    for (let i = this.front; i <= this.rear; i++) {
      if (this.items[i]) {
        active.push({
          ...this.items[i],
          physicalIndex: i,
          position: i - this.front + 1,
          isFront: i === this.front,
          isRear: i === this.rear,
        });
      }
    }
    return active;
  }

  /**
   * Serializes queue for localStorage persistence.
   */
  serialize() {
    return {
      capacity: this.capacity,
      front: this.front,
      rear: this.rear,
      items: this.items,
    };
  }
}

/**
 * Creates sample waitlist passengers for realistic airline feel.
 */
export function getInitialWaitlistData() {
  const q = new LinearWaitlistQueue();
  const samplePax = [
    { name: 'Dr. Priya Sharma', flight: 'DEL → CCU (Flight SR-204)', seatClass: 'Business' },
    { name: 'Capt. Rahul Verma', flight: 'MAA → BLR (Flight SR-102)', seatClass: 'Economy' },
    { name: 'Sneha Rao', flight: 'BOM → HYD (Flight SR-308)', seatClass: 'First Class' },
  ];

  samplePax.forEach((p) => q.enqueue(p));
  return q.serialize();
}
