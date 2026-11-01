/**
 * SkyRoute - Prim's Minimum Spanning Tree Algorithm
 *
 * Array-based implementation mirroring C data structures:
 * - key[] array: minimum edge weight to connect an unvisited vertex to the growing MST
 * - parent[] array: stores the predecessor / parent for each vertex in the MST
 * - inMST[] array: boolean flags indicating whether vertex is in the MST
 *
 * Starts at city 0 (by default).
 * Validates graph connectivity. If disconnected, returns isConnected: false with warning.
 *
 * Time Complexity: O(V²) with an adjacency matrix.
 * Space Complexity: O(V) auxiliary arrays.
 */

import { INF } from './constants.js';
import { getAllRoutes } from './graphMatrix.js';

/**
 * Finds the vertex with the minimum key value among vertices not yet included in the MST.
 * @param {number[]} key
 * @param {boolean[]} inMST
 * @param {number} n
 * @returns {number} Vertex index, or -1 if no reachable vertex remains.
 */
function findMinKeyVertex(key, inMST, n) {
  let min = INF;
  let minIndex = -1;

  for (let v = 0; v < n; v++) {
    if (!inMST[v] && key[v] < min) {
      min = key[v];
      minIndex = v;
    }
  }

  return minIndex;
}

/**
 * Executes Prim's Algorithm to find the Minimum Spanning Tree (MST).
 *
 * @param {number[][]} matrix - N x N adjacency matrix
 * @param {Array} cities - Array of city objects [{ name, code, ... }]
 * @param {number} startCity - Root vertex to start MST (default 0)
 * @returns {Object} MST outcome with chosen edges, total cost, savings, or connectivity warning
 */
export function runPrimMST(matrix, cities, startCity = 0) {
  const n = cities.length;

  if (n === 0) {
    return {
      isConnected: false,
      message: 'Network has no cities.',
      edges: [],
      totalMstCost: 0,
      originalCost: 0,
      savings: 0,
      savingsPercent: 0,
      trace: [],
    };
  }

  if (n === 1) {
    return {
      isConnected: true,
      message: 'Single city network requires 0 route edges.',
      edges: [],
      totalMstCost: 0,
      originalCost: 0,
      savings: 0,
      savingsPercent: 0,
      trace: [],
    };
  }

  // 1. Initialize arrays
  const key = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  const inMST = new Array(n).fill(false);

  // Start vertex key is 0 so it is picked first
  key[startCity] = 0;
  parent[startCity] = -1;

  const trace = [];
  let verticesIncludedCount = 0;

  // 2. The MST will have n vertices
  for (let count = 0; count < n; count++) {
    // Pick the minimum key vertex from the set of vertices not yet in MST
    const u = findMinKeyVertex(key, inMST, n);

    // If no reachable vertex found (key is INF or u is -1), graph is disconnected!
    if (u === -1 || key[u] === INF) {
      break;
    }

    // Include u in MST
    inMST[u] = true;
    verticesIncludedCount++;

    const keyUpdates = [];

    // Update key and parent of adjacent vertices of u not yet in MST
    for (let v = 0; v < n; v++) {
      const weight = matrix[u][v];

      // Condition: v not in MST, direct edge exists, and edge weight is less than current key[v]
      if (!inMST[v] && weight !== INF && weight < key[v]) {
        const oldKey = key[v];
        key[v] = weight;
        parent[v] = u;

        keyUpdates.push({
          targetIndex: v,
          targetName: cities[v].name,
          edgeCost: weight,
          oldKey,
          newKey: key[v],
        });
      }
    }

    trace.push({
      step: count + 1,
      selectedVertexIndex: u,
      selectedVertexName: cities[u].name,
      edgeAddedCost: key[u],
      parentIndex: parent[u],
      parentName: parent[u] !== -1 ? cities[parent[u]].name : 'Root',
      keyUpdates,
      keySnapshot: [...key],
      inMSTSnapshot: [...inMST],
      parentSnapshot: [...parent],
    });
  }

  // 3. Connectivity Verification: Did we include all n vertices?
  const unconnectedCities = [];
  for (let i = 0; i < n; i++) {
    if (!inMST[i]) {
      unconnectedCities.push(cities[i].name);
    }
  }

  if (unconnectedCities.length > 0) {
    return {
      isConnected: false,
      message: `The route network is disconnected! Prim's algorithm cannot create a single spanning tree because ${unconnectedCities.join(', ')} cannot be reached from ${cities[startCity].name}.`,
      unconnectedCities,
      startCityName: cities[startCity].name,
      edges: [],
      totalMstCost: 0,
      originalCost: 0,
      savings: 0,
      savingsPercent: 0,
      trace,
    };
  }

  // 4. Construct chosen MST edges
  const edges = [];
  let totalMstCost = 0;

  for (let v = 0; v < n; v++) {
    if (v !== startCity && parent[v] !== -1) {
      const u = parent[v];
      const fare = matrix[u][v];
      totalMstCost += fare;

      edges.push({
        id: `mst-${Math.min(u, v)}-${Math.max(u, v)}`,
        u,
        v,
        fromCity: cities[u].name,
        toCity: cities[v].name,
        fromCode: cities[u].code || cities[u].name.slice(0, 3).toUpperCase(),
        toCode: cities[v].code || cities[v].name.slice(0, 3).toUpperCase(),
        fare,
      });
    }
  }

  // 5. Calculate savings against current total routes
  const allRoutes = getAllRoutes(cities, matrix);
  const originalCost = allRoutes.reduce((sum, r) => sum + r.fare, 0);
  const savings = Math.max(0, originalCost - totalMstCost);
  const savingsPercent = originalCost > 0 ? ((savings / originalCost) * 100).toFixed(1) : 0;

  return {
    isConnected: true,
    startCityIndex: startCity,
    startCityName: cities[startCity].name,
    edges,
    totalMstCost,
    originalCost,
    totalOriginalRoutes: allRoutes.length,
    mstRouteCount: edges.length,
    savings,
    savingsPercent,
    trace,
  };
}
