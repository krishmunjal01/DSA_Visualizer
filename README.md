# DSA Visualizer

A client-side React and TypeScript web application for exploring core Data Structures, Algorithm Laboratories, Side-by-Side Algorithm Comparisons, and a Campus Route Optimizer. Every module executes pure TypeScript models that emit immutable step snapshots tied to pseudocode lines and time/space bounds.

## Modules & Features

### 1. Data Structure Workspaces
- **Singly Linked List**: Insert at head, tail, or index; delete from head, tail, or by value; linear search, traversal, and in-place reversal with `HEAD`, `TAIL`, and directional `next` connectors.
- **Stack (LIFO)**: Bounded stack with configurable capacity (`5`, `7`, or `9`), `TOP` pointer tracking, `push`, `pop`, `peek`, `isEmpty`, `isFull`, and `display`.
- **Circular Queue (FIFO)**: Fixed-capacity ring buffer using O(1) modular `(index + 1) % capacity` wrap-around for `FRONT` and `REAR`.
- **Binary Search Tree (BST)**: Insert, delete (leaf, single-child, and two-child inorder-successor cases), search, four traversals (in-order, pre-order, post-order, level-order BFS), find min/max, height calculation, bulk comma-separated insertion, and zoomable SVG tree view.
- **Hash Table**: Integer modulo hashing `h(k) = k mod m` with toggleable collision resolution (`Separate Chaining` vs `Linear Probing` with tombstone deletion markers) and configurable capacities (`7`, `11`, `13`).
- **Binary Heap**: Complete binary tree synchronized with its zero-indexed backing array (`parent = floor((i-1)/2)`), supporting both **Min-Heap** and **Max-Heap** order.
- **Priority Queue**: Heap-backed task scheduler storing numeric priorities alongside task labels (`Emergency ER`, `Router Packet`, etc.) for O(log n) enqueue and dequeue.
- **Graphs**: Interactive SVG graph editor supporting **Directed / Undirected** and **Weighted / Unweighted** modes, edge blocking toggles, and step-by-step **BFS**, **DFS**, **Dijkstra**, **Prim MST**, and **Kruskal MST**.

### 2. Algorithm Laboratory
- **Sorting (6 algorithms)**: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort, and Heap Sort with color-coded bars and live comparison/swap counters.
- **Searching (2 algorithms)**: Linear Search and Binary Search (`low`, `mid`, `high` range shrinking).
- **Graph Algorithms**: BFS, DFS, Dijkstra, Prim MST, and Kruskal MST traces on customizable graphs.
- **Custom Datasets**: Configure size, dataset pattern (`Random`, `Nearly Sorted`, `Reversed`), or supply custom comma-separated values.

### 3. Algorithm Compare
- Execute any two sorting algorithms simultaneously on the **exact same dataset**.
- Track live animated bar progress, **Comparisons**, **Swaps/Writes**, and headless **Execution Time (ms)** side-by-side.
- Scaling benchmarks across `n = 100`, `500`, and `2000` show asymptotic divergence directly in the browser.

### 4. Campus Route Optimizer
- Models university buildings (`Main Gate`, `Admin Block`, `Library`, `Auditorium`, `Science Block`, `Cafeteria`, `CS Labs`, `Hostel`) as weighted graph vertices with meter-scale walkways.
- **Shortest Route (Dijkstra)**: Compute the shortest walking path between any two buildings in meters.
- **Minimum-Cost Connectivity (Prim / Kruskal)**: Compute the minimum-cost cable or shuttle loop connecting all buildings.
- **Reachable Locations (BFS)**: Identify reachable buildings hop-by-hop and toggle walkway blocks by clicking edges to inspect detours.

## Architecture

1. **Core Models (`src/core/`)**
   - `LinkedList.ts`, `Stack.ts`, `Queue.ts`, `BST.ts`
   - `HashTable.ts`, `Heap.ts`, `Graph.ts` (including `DisjointSet` with path compression and union by rank)
   - `Sorting.ts` and `Searching.ts`
2. **Playback & Views (`src/hooks/`, `src/components/views/`)**
   - `useStepPlayer.ts`: Shared step player hook driving `AnimationControls` and `ExplanationPanel`.
   - `WorkspaceView.tsx`, `AlgorithmLabView.tsx`, and `CampusOptimizerView.tsx`.
3. **Visualizers & Panels (`src/components/visualizers/`, `src/components/panels/`)**
   - SVG and DOM views for each structure and algorithm family using Tailwind CSS and Framer Motion.

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Local Development
```bash
npm install
npm run dev
```
Vite serves the app on `http://localhost:3000`.

### Unit Tests & Production Build
```bash
npm test
npm run build
```

## Tech Stack
- React 18 and TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- Tailwind CSS v3
- Framer Motion
- Lucide React
- Vite & Vitest
- Web Audio API
