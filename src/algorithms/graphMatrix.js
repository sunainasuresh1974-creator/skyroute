/**
 * SkyRoute - Adjacency Matrix Graph Operations
 *
 * Implements an undirected, weighted graph using an adjacency matrix:
 * - matrix[u][v] stores ticket price between city u and city v.
 * - 99999 (INF) represents no direct flight.
 * - matrix[u][u] = 0 (distance to self is zero).
 * - Symmetrical: matrix[u][v] === matrix[v][u] (two-way flights).
 */

import { INF, MAX_CITIES, INITIAL_CITIES, INITIAL_FARES } from './constants.js';

/**
 * Creates an empty N x N matrix filled with INF, diagonal 0.
 * @param {number} n - Number of cities
 * @returns {number[][]}
 */
export function createEmptyMatrix(n) {
  const matrix = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(INF);
    row[i] = 0;
    matrix.push(row);
  }
  return matrix;
}

/**
 * Generates the default initial state for SkyRoute with sample data.
 */
export function getInitialGraphState() {
  const cities = [...INITIAL_CITIES];
  const n = cities.length;
  const matrix = createEmptyMatrix(n);

  INITIAL_FARES.forEach(({ from, to, fare }) => {
    const u = cities.findIndex((c) => c.name.toLowerCase() === from.toLowerCase());
    const v = cities.findIndex((c) => c.name.toLowerCase() === to.toLowerCase());
    if (u !== -1 && v !== -1 && u !== v) {
      matrix[u][v] = fare;
      matrix[v][u] = fare;
    }
  });

  return { cities, matrix };
}

/**
 * Adds a new city into the graph. Expands the adjacency matrix by 1 row & 1 column.
 * @param {Array} cities - Current cities array
 * @param {number[][]} matrix - Current adjacency matrix
 * @param {Object} newCity - { name, code, state }
 * @returns {{ cities: Array, matrix: number[][] }}
 */
export function addCityToGraph(cities, matrix, newCity) {
  if (cities.length >= MAX_CITIES) {
    throw new Error(`Maximum limit of ${MAX_CITIES} cities reached.`);
  }

  const normalized = newCity.name.trim().toLowerCase();
  const exists = cities.some((c) => c.name.trim().toLowerCase() === normalized);
  if (exists) {
    throw new Error(`City "${newCity.name}" already exists in the network.`);
  }

  const updatedCities = [...cities, newCity];
  const newSize = updatedCities.length;

  // Clone matrix and expand
  const updatedMatrix = matrix.map((row) => [...row, INF]);
  const newRow = new Array(newSize).fill(INF);
  newRow[newSize - 1] = 0;
  updatedMatrix.push(newRow);

  return {
    cities: updatedCities,
    matrix: updatedMatrix,
  };
}

/**
 * Removes a city and shrinks the matrix.
 * @param {Array} cities
 * @param {number[][]} matrix
 * @param {number} cityIndex
 * @returns {{ cities: Array, matrix: number[][] }}
 */
export function removeCityFromGraph(cities, matrix, cityIndex) {
  if (cityIndex < 0 || cityIndex >= cities.length) {
    throw new Error('Invalid city index to remove.');
  }

  const updatedCities = cities.filter((_, idx) => idx !== cityIndex);
  const updatedMatrix = [];

  for (let i = 0; i < matrix.length; i++) {
    if (i === cityIndex) continue;
    const newRow = [];
    for (let j = 0; j < matrix[i].length; j++) {
      if (j === cityIndex) continue;
      newRow.push(matrix[i][j]);
    }
    updatedMatrix.push(newRow);
  }

  return {
    cities: updatedCities,
    matrix: updatedMatrix,
  };
}

/**
 * Adds or updates a two-way flight edge between city u and city v.
 * @param {number[][]} matrix
 * @param {number} u
 * @param {number} v
 * @param {number} fare
 * @returns {number[][]}
 */
export function setFlightEdge(matrix, u, v, fare) {
  if (u === v) {
    throw new Error('Departure and arrival city cannot be the same.');
  }
  if (fare <= 0 || fare >= INF) {
    throw new Error(`Fare must be between $1 and $${INF - 1}.`);
  }

  const newMatrix = matrix.map((row) => [...row]);
  newMatrix[u][v] = fare;
  newMatrix[v][u] = fare;
  return newMatrix;
}

/**
 * Removes a flight between city u and city v.
 * @param {number[][]} matrix
 * @param {number} u
 * @param {number} v
 * @returns {number[][]}
 */
export function removeFlightEdge(matrix, u, v) {
  const newMatrix = matrix.map((row) => [...row]);
  newMatrix[u][v] = INF;
  newMatrix[v][u] = INF;
  return newMatrix;
}

/**
 * Extracts list of all unique bidirectional routes from adjacency matrix.
 * Since undirected, we only iterate upper triangle (i < j).
 * @param {Array} cities
 * @param {number[][]} matrix
 * @returns {Array} List of { id, u, v, fromCity, toCity, fare }
 */
export function getAllRoutes(cities, matrix) {
  const routes = [];
  const n = cities.length;

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const fare = matrix[i][j];
      if (fare > 0 && fare < INF) {
        routes.push({
          id: `${i}-${j}`,
          u: i,
          v: j,
          from: cities[i].name,
          to: cities[j].name,
          fromCode: cities[i].code || cities[i].name.slice(0, 3).toUpperCase(),
          toCode: cities[j].code || cities[j].name.slice(0, 3).toUpperCase(),
          fare,
        });
      }
    }
  }

  return routes;
}

/**
 * Calculates graph statistics: Total routes, Average fare, Minimum fare, Maximum fare.
 */
export function calculateGraphMetrics(cities, matrix) {
  const routes = getAllRoutes(cities, matrix);
  const totalCities = cities.length;
  const activeRoutes = routes.length;

  let totalFareSum = 0;
  let minFare = activeRoutes > 0 ? Infinity : 0;
  let maxFare = 0;

  routes.forEach((r) => {
    totalFareSum += r.fare;
    if (r.fare < minFare) minFare = r.fare;
    if (r.fare > maxFare) maxFare = r.fare;
  });

  const averageFare = activeRoutes > 0 ? Math.round(totalFareSum / activeRoutes) : 0;

  return {
    totalCities,
    activeRoutes,
    totalFareSum,
    averageFare,
    minFare: minFare === Infinity ? 0 : minFare,
    maxFare,
    routes,
  };
}
