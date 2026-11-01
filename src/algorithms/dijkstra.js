/**
 * SkyRoute - Dijkstra's Shortest Path Algorithm
 *
 * Classical array-based implementation mirroring C data structures:
 * - distance[] array: holds current shortest known distance from src to each vertex
 * - visited[] array: boolean flags indicating whether a vertex has been finalized
 * - parent[] array: tracks predecessor vertex along the shortest path
 *
 * Time Complexity: O(V²) with an adjacency matrix.
 * Space Complexity: O(V) auxiliary arrays.
 */

import { INF } from './constants.js';

/**
 * Finds the unvisited vertex with the minimum distance value.
 * @param {number[]} distance
 * @param {boolean[]} visited
 * @param {number} n
 * @returns {number} Index of minimum vertex, or -1 if unreachable.
 */
function findMinDistanceVertex(distance, visited, n) {
  let min = INF;
  let minIndex = -1;

  for (let v = 0; v < n; v++) {
    if (!visited[v] && distance[v] < min) {
      min = distance[v];
      minIndex = v;
    }
  }

  return minIndex;
}

/**
 * Executes Dijkstra's algorithm from source city to destination city.
 *
 * @param {number[][]} matrix - N x N adjacency matrix (INF means no edge)
 * @param {Array} cities - Array of city objects [{ name, code, ... }]
 * @param {number} src - Source city index
 * @param {number} dest - Destination city index
 * @returns {Object} Algorithm outcome including path, fare, stops, and execution trace
 */
export function runDijkstra(matrix, cities, src, dest) {
  const n = cities.length;

  if (src < 0 || src >= n || dest < 0 || dest >= n) {
    return {
      success: false,
      message: 'Invalid source or destination city index.',
      path: [],
      pathCities: [],
      totalFare: INF,
      stops: 0,
      legs: [],
      trace: [],
    };
  }

  // 1. Initialize data structures
  const distance = new Array(n).fill(INF);
  const visited = new Array(n).fill(false);
  const parent = new Array(n).fill(-1);

  // Distance from source to itself is 0
  distance[src] = 0;

  // Trace array for viva / step-by-step visualization
  const trace = [];

  // 2. Iterate up to n times to find shortest path to all reachable vertices
  for (let count = 0; count < n; count++) {
    // Pick the minimum distance vertex from the set of unvisited vertices
    const u = findMinDistanceVertex(distance, visited, n);

    // If all remaining unvisited vertices have distance INF, they are unreachable
    if (u === -1 || distance[u] === INF) {
      break;
    }

    // Mark picked vertex as finalized / visited
    visited[u] = true;

    // Snapshot relaxation step
    const stepRelaxations = [];

    // Relax all adjacent vertices of u
    for (let v = 0; v < n; v++) {
      const edgeWeight = matrix[u][v];

      // Condition: v is unvisited, there is an edge, and path through u is cheaper
      if (!visited[v] && edgeWeight !== INF && distance[u] + edgeWeight < distance[v]) {
        const oldDist = distance[v];
        distance[v] = distance[u] + edgeWeight;
        parent[v] = u;

        stepRelaxations.push({
          neighborIndex: v,
          neighborName: cities[v].name,
          edgeWeight,
          oldDist,
          newDist: distance[v],
        });
      }
    }

    trace.push({
      step: count + 1,
      selectedNodeIndex: u,
      selectedNodeName: cities[u].name,
      selectedNodeDist: distance[u],
      relaxations: stepRelaxations,
      distanceSnapshot: [...distance],
      visitedSnapshot: [...visited],
      parentSnapshot: [...parent],
    });

    // If we've reached our destination vertex, we can stop early
    if (u === dest) {
      break;
    }
  }

  // 3. Check if destination is reachable
  if (distance[dest] === INF) {
    return {
      success: false,
      message: `No flight route available between ${cities[src].name} and ${cities[dest].name}.`,
      path: [],
      pathCities: [],
      totalFare: INF,
      stops: 0,
      legs: [],
      trace,
    };
  }

  // 4. Reconstruct path using parent[] array
  const path = [];
  let curr = dest;
  while (curr !== -1) {
    path.unshift(curr);
    curr = parent[curr];
  }

  // Build legs and stops
  const legs = [];
  for (let i = 0; i < path.length - 1; i++) {
    const fromIdx = path[i];
    const toIdx = path[i + 1];
    legs.push({
      fromIndex: fromIdx,
      toIndex: toIdx,
      fromName: cities[fromIdx].name,
      toName: cities[toIdx].name,
      fromCode: cities[fromIdx].code || cities[fromIdx].name.slice(0, 3).toUpperCase(),
      toCode: cities[toIdx].code || cities[toIdx].name.slice(0, 3).toUpperCase(),
      fare: matrix[fromIdx][toIdx],
    });
  }

  const pathCities = path.map((idx) => cities[idx]);
  const stops = Math.max(0, path.length - 2); // Intermediate stops

  return {
    success: true,
    srcIndex: src,
    destIndex: dest,
    srcCity: cities[src].name,
    destCity: cities[dest].name,
    path,
    pathCities,
    totalFare: distance[dest],
    stops,
    legs,
    isDirect: path.length === 2,
    trace,
  };
}
