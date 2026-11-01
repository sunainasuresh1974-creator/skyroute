# SkyRoute — Airline Route Network & Fare Operations Dashboard

SkyRoute is a professional, modern airline route network and fare management dashboard inspired by global distribution systems like Amadeus and Sabre.

The core of the application is built entirely with hand-implemented, array-based Data Structures and Algorithms mirroring a classic C/C++ computer science curriculum, wrapped in a high-performance React and Tailwind CSS single-page web application.

---

## Key Features & Pages

### 1. Operations Dashboard
- **4 Key Performance Indicators (KPI Cards)**:
  - **Network Hubs**: Total airports enrolled (e.g. 6/20 capacity).
  - **Active Corridors**: Number of bilateral route pairs (8 routes, 16 scheduled legs).
  - **Average Fare**: Dynamically computed average leg fare across all active corridors ($271).
  - **Waitlist Queue**: Real-time counter of waitlisted passengers in the linear FIFO queue.
- **Interactive SVG Topology Map**:
  - Visual graph with airport hubs as nodes and flight routes as weighted edges.
  - Hovering on any city dynamically highlights all connected corridors and dims unrelated paths.
  - Interactive zoom in/out, fit-to-view, and airport node details card.
- **Cheapest Corridors Table & Live Activity Feed**: Top 5 lowest fare routes and chronological operations log.

### 2. Routes & Hub Management
- **Bilateral Routes Table**:
  - Filter by city/code, sort by fare (lowest/highest) or city name (A-Z), and clean pagination.
  - Full CRUD operations: Edit fare, cancel flight with confirmation modal.
- **Add Route Modal**:
  - Origin hub, destination hub, and fare ($1 to $99,998) with inline validation.
- **Add Airport Hub Modal**:
  - Airport name, 3-letter IATA code, and state/region. Enforces unique case-insensitive names and 20-hub limit.
- **Fare Matrix Heatmap**:
  - 2D $N \times N$ heat-map matrix color-coded from emerald green (economic) to amber/rose (premium) with `–` for disconnected pairs ($INF = 99999$).
  - Click any cell to configure or edit the corridor fare directly.

### 3. Fare Finder (Dijkstra's Algorithm)
- **Booking-Style Search Card**:
  - Origin dropdown, Destination dropdown, Swap button, and Calculate button.
- **Cheapest Itinerary Timeline**:
  - Visual horizontal stop timeline with dots, flight legs, stop count, and leg price breakdown.
  - **Benchmark Validation**: Chennai (MAA) $\rightarrow$ Kolkata (CCU) calculates the exact lowest fare of **$620** via **Chennai $\rightarrow$ Bangalore $\rightarrow$ Hyderabad $\rightarrow$ Kolkata** with 2 intermediate stops.
- **Network Map Route Highlight**:
  - Highlights optimal path with glowing blue lines, directional arrows, and stop numbers.
- **Step-by-Step Viva Execution Trace**:
  - Displays the algorithm's iteration-by-iteration trace table revealing which vertex $u$ was selected, current $dist[u]$, neighbor relaxations, and the full $distance[]$ array state.

### 4. Network Planner (Prim's Minimum Spanning Tree)
- **MST Backbone Builder**:
  - Greedy algorithm starting at city 0 (Chennai) to determine the absolute cheapest network connecting all hubs without cycles.
  - **Benchmark Validation**: Generates 5 optimal backbone edges with a total network cost of **$970** (yielding **$1,200 savings / 55.3% reduction** compared to the $2,170 full network).
- **Disconnected Graph Diagnostics**:
  - If the route network is partitioned into disconnected components, displays a warning listing unreachable hubs rather than a broken tree.
- **MST Step Trace Table**:
  - Shows $key[]$, $inMST[]$, and $parent[]$ evolution for viva demonstration.

### 5. Overbooked Flight Waitlist (Linear Queue)
- **Queue Mechanics**:
  - Fixed-size array with `front` and `rear` pointers (maximum capacity 100).
  - Enqueue passenger with name, flight route, and travel class (Economy, Business, First).
  - "Board Next Passenger" (dequeue) with animated clearance transition.
  - **Pointer Reset on Empty**: When the queue becomes empty ($front > rear$), pointers automatically reset to $front = 0$ and $rear = -1$, preventing artificial queue overflow.
  - **Queue Overflow Error**: Rejects enqueues when capacity 100 is reached with inline error and notification.

### 6. System Settings & Viva Theory Hub
- **Benchmark Data Restore**: One-click restore for the standard 6-city, 8-route test graph.
- **Full Purge / Reset**: Modal confirmation to clear custom state and cache.
- **JSON Backup Export**: Download complete network state as a JSON file.
- **Viva Masterclass**: Comprehensive interactive FAQ flashcards covering Adjacency Matrix trade-offs, Dijkstra relaxation formulas, Prim's cut property, and Queue pointer reset logic.

---

## Data Structures & Algorithms Core

All algorithms are implemented from scratch in pure JavaScript within `src/algorithms/` without third-party graph packages:

| Data Structure / Algorithm | Source File | Time Complexity | Space Complexity | Representation |
| :--- | :--- | :--- | :--- | :--- |
| **Adjacency Matrix** | [`src/algorithms/graphMatrix.js`](file:///c:/Users/Vishal%20Sunaina/OneDrive/Sem-3/dsproj/src/algorithms/graphMatrix.js) | $O(1)$ lookup / update | $O(V^2)$ | 2D array `matrix[20][20]`, $INF=99999$ |
| **Dijkstra's Algorithm** | [`src/algorithms/dijkstra.js`](file:///c:/Users/Vishal%20Sunaina/OneDrive/Sem-3/dsproj/src/algorithms/dijkstra.js) | $O(V^2)$ | $O(V)$ | Arrays `distance[]`, `visited[]`, `parent[]` |
| **Prim's Algorithm** | [`src/algorithms/prim.js`](file:///c:/Users/Vishal%20Sunaina/OneDrive/Sem-3/dsproj/src/algorithms/prim.js) | $O(V^2)$ | $O(V)$ | Arrays `key[]`, `parent[]`, `inMST[]` |
| **Linear Waitlist Queue** | [`src/algorithms/queue.js`](file:///c:/Users/Vishal%20Sunaina/OneDrive/Sem-3/dsproj/src/algorithms/queue.js) | $O(1)$ enqueue / dequeue | $O(N)$ | Fixed array `items[100]`, `front`, `rear` |

---

## How to Run Locally

### 1. Development Server
```bash
npm install
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

### 2. Run Production Build
```bash
npm run build
```

---

## Sample Data Benchmark Reference

```
Cities:
[0] Chennai (MAA)
[1] Delhi (DEL)
[2] Mumbai (BOM)
[3] Bangalore (BLR)
[4] Kolkata (CCU)
[5] Hyderabad (HYD)

Two-Way Corridors:
- Chennai ⇄ Delhi: $500
- Chennai ⇄ Mumbai: $300
- Chennai ⇄ Bangalore: $100
- Delhi ⇄ Mumbai: $250
- Delhi ⇄ Kolkata: $350
- Mumbai ⇄ Hyderabad: $150
- Bangalore ⇄ Hyderabad: $120
- Hyderabad ⇄ Kolkata: $400

Benchmark Outcomes:
- Cheapest Chennai → Kolkata: Chennai → Bangalore → Hyderabad → Kolkata at $620 (2 intermediate stops).
- Prim's Minimum Spanning Tree: $970 total across 5 optimal backbone edges (55.3% savings).
```
