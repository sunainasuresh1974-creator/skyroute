/**
 * SkyRoute - Core DSA Constants
 * Designed to mirror a C data-structures project
 */

// Sentinel value representing no flight / infinity
export const INF = 99999;

// Maximum number of cities allowed in the adjacency matrix
export const MAX_CITIES = 20;

// Maximum capacity for the overbooked-flight linear waitlist queue
export const MAX_QUEUE_CAPACITY = 100;

// Initial sample cities with 3-letter IATA airport codes
export const INITIAL_CITIES = [
  { name: 'Chennai', code: 'MAA', state: 'Tamil Nadu' },
  { name: 'Delhi', code: 'DEL', state: 'National Capital Territory' },
  { name: 'Mumbai', code: 'BOM', state: 'Maharashtra' },
  { name: 'Bangalore', code: 'BLR', state: 'Karnataka' },
  { name: 'Kolkata', code: 'CCU', state: 'West Bengal' },
  { name: 'Hyderabad', code: 'HYD', state: 'Telangana' },
];

// Initial two-way flight fares ($)
// Expected shortest Chennai->Kolkata = $620 (Chennai -> Bangalore -> Hyderabad -> Kolkata)
// Expected Prim MST Total = $970
export const INITIAL_FARES = [
  { from: 'Chennai', to: 'Delhi', fare: 500 },
  { from: 'Chennai', to: 'Mumbai', fare: 300 },
  { from: 'Chennai', to: 'Bangalore', fare: 100 },
  { from: 'Delhi', to: 'Mumbai', fare: 250 },
  { from: 'Delhi', to: 'Kolkata', fare: 350 },
  { from: 'Mumbai', to: 'Hyderabad', fare: 150 },
  { from: 'Bangalore', to: 'Hyderabad', fare: 120 },
  { from: 'Hyderabad', to: 'Kolkata', fare: 400 },
];
