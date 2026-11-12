# DSA Visualizer & Algorithm Intelligence Platform

A comprehensive, client-side Data Structures and Algorithms exploration, visualization, and comparison platform built with **React 18, TypeScript, Tailwind CSS, and Framer Motion**. 

The platform bridges theoretical computer science education with real-world software engineering by decoupling pure algorithmic models from visual presentation. Every data structure and algorithm executes in genuine TypeScript logic, capturing immutable step snapshots synchronized with active pseudocode lines, mathematical invariants, pointer manipulations, and asymptotic Big-O bounds.

---

## Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [Core Architectural Philosophy](#2-core-architectural-philosophy)
3. [System Architecture & Data Flow](#3-system-architecture--data-flow)
4. [Module 1: Data Structure Workspaces (8 Structures)](#4-module-1-data-structure-workspaces-8-structures)
   - [4.1 Singly Linked List](#41-singly-linked-list)
   - [4.2 Bounded LIFO Stack](#42-bounded-lifo-stack)
   - [4.3 Circular FIFO Queue](#43-circular-fifo-queue)
   - [4.4 Binary Search Tree (BST)](#44-binary-search-tree-bst)
   - [4.5 Hash Table (Chaining & Linear Probing with Tombstones)](#45-hash-table-chaining--linear-probing-with-tombstones)
   - [4.6 Binary Heap (Min-Heap & Max-Heap)](#46-binary-heap-min-heap--max-heap)
   - [4.7 Priority Queue](#47-priority-queue)
   - [4.8 Graphs (Directed, Undirected & Weighted)](#48-graphs-directed-undirected--weighted)
5. [Module 2: Algorithm Laboratory](#5-module-2-algorithm-laboratory)
   - [5.1 Sorting Algorithms (6 Engines)](#51-sorting-algorithms-6-engines)
   - [5.2 Searching Algorithms](#52-searching-algorithms)
   - [5.3 Graph Traversal & Optimization](#53-graph-traversal--optimization)
6. [Module 3: Algorithm Compare & Benchmarking Engine](#6-module-3-algorithm-compare--benchmarking-engine)
   - [6.1 Synchronized Simultaneous Playback](#61-synchronized-simultaneous-playback)
   - [6.2 Visual Frames vs. CPU Execution Time](#62-visual-frames-vs-cpu-execution-time)
   - [6.3 Headless Microsecond Benchmarking Methodology](#63-headless-microsecond-benchmarking-methodology)
   - [6.4 The Small-n Constant Factor Phenomenon](#64-the-small-n-constant-factor-phenomenon)
   - [6.5 Asymptotic Scaling Verification (n = 100, 500, 2000)](#65-asymptotic-scaling-verification-n--100-500-2000)
7. [Module 4: Real-World Case Study — Campus Route & Utility Optimizer](#7-module-4-real-world-case-study--campus-route--utility-optimizer)
   - [7.1 Campus Graph Topology & Building Specifications](#71-campus-graph-topology--building-specifications)
   - [7.2 Shortest Walking Route & Dynamic Detours (Dijkstra)](#72-shortest-walking-route--dynamic-detours-dijkstra)
   - [7.3 Minimum-Cost Utility Network (Prim & Kruskal MST)](#73-minimum-cost-utility-network-prim--kruskal-mst)
   - [7.4 Reachability & Maintenance Disconnection Analysis (BFS)](#74-reachability--maintenance-disconnection-analysis-bfs)
8. [Master Big-O Complexity Reference](#8-master-big-o-complexity-reference)
9. [Undo State Architecture & Session History](#9-undo-state-architecture--session-history)
10. [Audio Synthesis & Accessibility Design](#10-audio-synthesis--accessibility-design)
11. [Technology Stack & Implementation Details](#11-technology-stack--implementation-details)
12. [Verification, Unit Test Suite & Production Build](#12-verification-unit-test-suite--production-build)
13. [Academic & Project Report Writing Notes (Viva Guide)](#13-academic--project-report-writing-notes-viva-guide)

---

## 1. Executive Summary & Problem Statement

### 1.1 The Educational Problem
Traditional instruction in Data Structures and Algorithms (DSA) suffers from a persistent cognitive gap: students memorize Big-O complexities and asymptotic formulas without understanding the low-level physical mutations occurring inside memory. Static textbook diagrams cannot convey pointer rewiring during a linked list reversal, dynamic load factor resizing during hash collisions, or the internal sift-down swaps that maintain heap completeness. Conversely, many online visualizers present pre-rendered animations or simplified toys disconnected from real software engineering constraints.

### 1.2 The Solution: DSA Visualizer
**DSA Visualizer** provides an industrial-grade, client-side computational environment that unites:
1. **Interactive Data Structure Workspaces**: Full CRUD operations across 8 fundamental structures with bounded capacities, error guards, and reversible snapshots.
2. **Algorithm Laboratory**: Step-by-step traces connecting visual changes to line-by-line pseudocode execution across sorting, searching, and graph theory.
3. **Algorithm Compare**: A head-to-head empirical testing platform running sorting algorithms simultaneously on identical datasets, measuring real comparisons, swaps/writes, and microsecond CPU execution time.
4. **Campus Route Optimizer**: A production-grade real-world application modeling a university campus graph to solve pedestrian routing, utility network cabling, and construction detour scenarios.

---

## 2. Core Architectural Philosophy

The core principle of this project is **strict separation between algorithm execution and UI rendering**:

1. **Framework-Independent Algorithmic Core (`src/core/`)**:
   No UI code, React hooks, or DOM manipulations exist within the core engines. All data structures and algorithms are implemented as standalone, pure TypeScript classes. They can run headlessly inside Node.js, command-line utilities, or automated test runners without a browser.
2. **Immutable Snapshot State Machine (`AnimationStep<T>`)**:
   Instead of updating the screen directly during an algorithm's execution, algorithms record an array of discrete, immutable state snapshots. Each snapshot freezes the exact state of every node, pointer, bar, or edge at that specific tick, along with human-readable explanations and the active line of pseudocode.
3. **Decoupled Playback Controller (`useStepPlayer`)**:
   The playback engine is an independent timer hook that steps forward or backward through the precomputed snapshot array. This ensures variable playback speed (`0.5x` to `2.5x`), instant pauses, and flawless backward scrubbing (`Prev Step`) without requiring inverse algorithm calculations.
4. **Zero-Mock Empirical Data**:
   All execution counters, comparisons, swaps, heap node coordinates, and timing benchmarks are derived from live in-memory execution. There are zero simulated delays, hardcoded benchmark values, or synthetic animations.

---

## 3. System Architecture & Data Flow

```
                      ┌────────────────────────────────────────┐
                      │            User Interaction            │
                      │   (Panels, Inputs, Sliders, Preset UI) │
                      └───────────────────┬────────────────────┘
                                          │ User triggers operation
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       Pure Core Model (src/core/)      │
                      │  - LinkedList, Stack, Queue, BST       │
                      │  - HashTable, Heap, Graph              │
                      │  - Sorting, Searching                  │
                      └───────────────────┬────────────────────┘
                                          │ Executes logic & records
                                          │ Array of AnimationStep<T>
                                          ▼
                      ┌────────────────────────────────────────┐
                      │       Playback Hook & State Store      │
                      │   - useStepPlayer / WorkspaceView      │
                      │   - Undo Stack (Pre-mutation Snapshots)│
                      │   - History Log Drawer                 │
                      └─────────────┬──────────────────────────┘
                                    │ Emits current step snapshot
                                    ▼
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
┌──────────────┐             ┌──────────────┐             ┌──────────────┐
│  Visualizer  │             │ Explanation  │             │  Animation   │
│ (SVG / HTML5)│             │    Panel     │             │   Controls   │
│ - Animated   │             │ - Pseudocode │             │ - Play/Pause │
│   Framer DOM │             │ - Complexity │             │ - Next/Prev  │
│ - Active HL  │             │ - Message    │             │ - Speed Rate │
└──────────────┘             └──────────────┘             └──────────────┘
```

---

## 4. Module 1: Data Structure Workspaces (8 Structures)

Every data structure is hosted in an interactive workspace providing:
- Manual input & parameter configuration.
- Step-by-step playback with line-by-line pseudocode synchronization.
- Pre-mutation snapshot undo stack (`handleUndo`) to revert accidental deletions or insertions.
- Preset test scenarios (sorted, reversed, random, collisions, duplicates).
- Big-O complexity badge and real-time element counter.

```
+-----------------------------------------------------------------------------+
|                                NAVBAR                                       |
|  [Home]  [Data Structures v]  [Algorithm Lab]  [Compare]  [Campus]  [Big-O] |
+-----------------------------------------------------------------------------+
| WORKSPACE HEADER: Title | Node Count | Undo | Reset Initial | Cheat Sheet   |
+--------------------------------------+--------------------------------------+
| VISUALIZATION CANVAS (8 Cols)        | OPERATIONS PANEL (4 Cols)            |
|                                      | - Action Inputs                      |
|  [Interactive SVG / DOM Node Model]  | - Parameter Controls                 |
|                                      | - Presets & Clear                    |
|                                      +--------------------------------------+
|  [Animation Playback Controls Bar]   | SESSION HISTORY DRAWER               |
+--------------------------------------+ - Timestamped action ledger          |
| EXPLANATION PANEL                    | - Reversible snapshot trail          |
| - Synchronized Active Pseudocode     |                                      |
| - Big-O Bounds (Best/Avg/Worst/Space)|                                      |
+--------------------------------------+--------------------------------------+
```

### 4.1 Singly Linked List (`src/core/LinkedList.ts`)
- **Memory Representation:** Dispersed memory nodes linked via explicit `next` references. The class maintains internal `head`, `tail`, and `size` references.
- **Visual Presentation:** Nodes rendered with data payload and next-pointer ports, connected by dynamic SVG arrow links, accompanied by dedicated `HEAD` and `TAIL` pointer badges.
- **Implemented Operations:**
  - `insertAtBeginning(val)`: $O(1)$ time, $O(1)$ space. Rewires `newHead.next = head`.
  - `insertAtEnd(val)`: $O(1)$ time, $O(1)$ space. Fast tail insertion via cached `tail` reference (`tail.next = newNode; tail = newNode`).
  - `insertAtPosition(val, pos)`: $O(n)$ time, $O(1)$ space. Traverses $pos - 1$ references before splicing.
  - `deleteFromBeginning()`: $O(1)$ time, $O(1)$ space. Updates `head = head.next`.
  - `deleteFromEnd()`: $O(n)$ time, $O(1)$ space. Traverses from `head` to find the predecessor of `tail` (illustrating the fundamental limitation of singly linked lists).
  - `deleteByValue(val)`: $O(n)$ time, $O(1)$ space. Linear search with predecessor pointer update.
  - `search(val)` & `traverse()`: $O(n)$ time, $O(1)$ space. Sequential pointer advancement.
  - `reverse()`: $O(n)$ time, $O(1)$ space. In-place iterative pointer reversal using 3 pointers (`prev`, `curr`, `next`), concluding with a `head` and `tail` reference swap.

### 4.2 Bounded LIFO Stack (`src/core/Stack.ts`)
- **Memory Representation:** Contiguous index-based array governed by Last-In, First-Out (LIFO) access semantics.
- **Bounds & Safety:** Configurable capacity bounds ($5$, $7$, $9$ slots) with explicit underflow and overflow protection guards.
- **Implemented Operations:**
  - `push(val)`: $O(1)$ time, $O(1)$ space. Verifies `items.length < capacity`, appends item, updates `TOP` pointer.
  - `pop()`: $O(1)$ time, $O(1)$ space. Underflow validation, removes top element, decrements `TOP`.
  - `peek()`: $O(1)$ time, $O(1)$ space. Reads `items[top]` without modifying state.
  - `isEmpty()` / `isFull()`: $O(1)$ time, $O(1)$ space boolean invariant checks.
  - `display()`: $O(n)$ time, $O(1)$ space traversal from `TOP` down to index $0$.

### 4.3 Circular FIFO Queue (`src/core/Queue.ts`)
- **Memory Representation:** Fixed-size ring buffer utilizing modular arithmetic over indices `frontIdx`, `rearIdx`, and total `count`.
- **The False Overflow Problem:** Demonstrates why naive array-based queues fail (empty slots created at the front by dequeues are wasted unless shifted at $O(n)$ cost). Circular indexing solves this in $O(1)$.
- **Mathematical Formulations:**
  $$\text{Next Rear Index} = (\text{rearIdx} + 1) \pmod{\text{capacity}}$$
  $$\text{Next Front Index} = (\text{frontIdx} + 1) \pmod{\text{capacity}}$$
- **Implemented Operations:**
  - `enqueue(val)`: $O(1)$ time, $O(1)$ space. Inserts at next rear position.
  - `dequeue()`: $O(1)$ time, $O(1)$ space. Extracts from front position, freeing slot for future wrap-around.
  - `front()` / `rear()`: $O(1)$ time inspections.
  - `setCapacity(newCap)`: Active items are extracted in FIFO sequence (`(frontIdx + i) % oldCap`) and repacked into `0 .. count - 1` in the new buffer.

### 4.4 Binary Search Tree (BST) (`src/core/BST.ts`)
- **Tree Invariant:** For every node $N$, all values in $\text{LeftSubtree}(N) < N.\text{value}$ and all values in $\text{RightSubtree}(N) > N.\text{value}$. Duplicate insertions are strictly prevented.
- **Dynamic Layout Engine (`computeLayout`):** In-order rank is computed across all nodes to determine exact canvas X-coordinates, while tree depth determines Y-coordinates. This guarantees that branches never cross or collide, regardless of balance.
- **Implemented Operations:**
  - `insert(val)`: Average $O(\log n)$, Worst $O(n)$ (skewed). Traverses comparisons until reaching a vacant leaf slot.
  - `search(val)`: Average $O(\log n)$, Worst $O(n)$. Binary branching comparison trace.
  - `delete(val)`: Exhaustively covers all 3 structural deletion cases:
    1. *Case 1: Leaf node (0 children)* — Direct parent link detachment.
    2. *Case 2: Node with 1 child* — Direct bypass splice connecting grandparent to child.
    3. *Case 3: Node with 2 children* — Locates the **In-order Successor** (minimum element in the right subtree), copies its value, and recursively deletes the successor node.
  - **Traversals:**
    - `inorderTraversal()`: Left $\to$ Node $\to$ Right. Emits keys in ascending sorted order ($O(n)$ time).
    - `preorderTraversal()`: Node $\to$ Left $\to$ Right. Used for serialization and deep tree cloning ($O(n)$ time).
    - `postorderTraversal()`: Left $\to$ Right $\to$ Node. Used for bottom-up cleanup and subtree operations ($O(n)$ time).
    - `levelOrderTraversal()`: Breadth-first traversal driven by a FIFO queue ($O(n)$ time, $O(w)$ space where $w$ is tree width).
  - `calculateHeight()`: Recursive post-order calculation of maximum subtree depth: $1 + \max(\text{height}_{\text{left}}, \text{height}_{\text{right}})$.
  - `findMin()` / `findMax()`: Pure left-spine / right-spine traversal ($O(\log n)$ avg, $O(n)$ worst).

### 4.5 Hash Table (`src/core/HashTable.ts`)
- **Mathematical Modulo Hashing:**
  $$h(k) = ((k \pmod m) + m) \pmod m$$
  Configurable bucket capacities $m \in \{7, 11, 13\}$ (prime capacities minimize clustering under modulo hashing).
- **Two Dual Collision Resolution Strategies:**
  1. **Separate Chaining (`chaining`):**
     Each bucket slot holds an independent linked bucket chain. Colliding keys (e.g. $10, 17, 24$ with $m = 7$ all evaluate to $3$) are chained sequentially.
  2. **Open Addressing with Linear Probing (`linear-probing`):**
     Every entry resides directly within the slot array. When bucket $h(k)$ is occupied, the table checks consecutive slots:
     $$\text{probe}(k, i) = (h(k) + i) \pmod m \quad \text{for } i = 0, 1, 2, \dots$$
- **The Tombstone Protocol (`probeStatus = 'deleted'`):**
  Deleting key $A$ in linear probing cannot simply set the slot to `empty`, because later searches for key $B$ (which collided with $A$ and was placed further down the probe chain) would terminate prematurely upon seeing `empty` and falsely report "Not Found".  
  The engine replaces deleted entries with **Tombstones (`deleted`)**:
  - `search()` treats tombstones as occupied slots and continues probing down the chain.
  - `insert()` reclaims the first tombstone encountered once it verifies the key does not already exist further down the probe cluster.
- **Metrics:** Tracks load factor $\alpha = \frac{n}{m}$, displaying active formula representations on screen.

### 4.6 Binary Heap (`src/core/Heap.ts`)
- **Representation:** Complete binary tree packed inside a zero-indexed contiguous array.
- **Index Arithmetic:**
  $$\text{Parent}(i) = \left\lfloor \frac{i - 1}{2} \right\rfloor, \quad \text{Left}(i) = 2i + 1, \quad \text{Right}(i) = 2i + 2$$
- **Dual Order Support:**
  - **Min-Heap:** $\text{arr}[\text{parent}] \le \text{arr}[\text{child}]$ (minimum element always at root index $0$).
  - **Max-Heap:** $\text{arr}[\text{parent}] \ge \text{arr}[\text{child}]$ (maximum element always at root index $0$).
- **Implemented Operations:**
  - `insert(val)`: Appends value to end of array and executes **Sift-Up (Heapify-Up)** along parent links in $O(\log n)$ time.
  - `extractTop()`: Swaps root element with the final leaf, removes the leaf, and executes **Sift-Down (Heapify-Down)** by swapping with the optimal child in $O(\log n)$ time.
  - `peekTop()`: Direct $O(1)$ root reading.
  - `setOrder(order)`: In-place array reconfiguration using bottom-up heap construction in $O(n)$ time.
- **Dual View Synchronization:** Simultaneously displays the hierarchical SVG complete tree diagram and the zero-indexed backing array representation.

### 4.7 Priority Queue (`src/core/Heap.ts` in `priority-queue` mode)
- **Concept:** Implements the Priority Queue Abstract Data Type (ADT) using the underlying `BinaryHeap` engine.
- **Task Scheduling:** Associates each numeric priority with a readable string label (e.g. `P1: Emergency ER`, `P2: Router Packet`, `P4: Lab Report`).
- **Scheduling Paradigm:**
  - Min-Heap order schedules **lowest numeric priority first** (P1 critical triage).
  - Max-Heap order schedules **highest score first** (VIP score dispatch).
- Enqueue ($O(\log n)$), Dequeue ($O(\log n)$), and Peek ($O(1)$).

### 4.8 Graphs (`src/core/Graph.ts`)
- **Structure:** Dynamic graph representation supporting:
  - Directed vs. Undirected topology.
  - Weighted vs. Unweighted edge evaluation.
  - Interactive vertex addition and edge creation.
  - Clickable edge toggling to simulate road closures and path blocks.
- **Three Presets:**
  - `default`: General 6-node weighted undirected graph.
  - `directed`: 6-node Directed Acyclic Graph (DAG) for path testing.
  - `campus`: 8-building real-world university campus graph.

---

## 5. Module 2: Algorithm Laboratory

The Algorithm Laboratory provides step-by-step traces for 13 distinct algorithms across sorting, searching, and graph theory. Users can adjust array size ($6$ to $20$), input distribution pattern (`Random`, `Nearly Sorted`, `Reversed`), or supply custom comma-separated numeric sequences.

### 5.1 Sorting Algorithms (6 Engines)

```
[42] [17] [89] [12] [55]  ===>  Line-by-line Pseudocode Highlight
  |    |                        [Comparing Index 0 vs 1]
  \----/ Comparisons: 1         [Swap: 42 > 17]
         Swaps:       1         Time Complexity: O(n log n)
```

1. **Bubble Sort (`bubble`):**
   Iterates through adjacent elements, swapping pairs when out of order. Optimized with an early-exit check (`swapped === false`) that drops best-case time to $O(n)$ on sorted inputs.
2. **Selection Sort (`selection`):**
   Divides the array into sorted and unsorted segments. Scans the unsorted suffix to locate the minimum element, performing at most $n - 1$ swaps across execution.
3. **Insertion Sort (`insertion`):**
   Builds the sorted array element by element by shifting greater elements to the right. Highly efficient for small or nearly sorted inputs ($O(n)$ best case).
4. **Merge Sort (`merge`):**
   Classic divide-and-conquer algorithm. Recursively halves the array until base cases ($n \le 1$) are reached, then merges sorted subarrays in linear time using auxiliary memory ($O(n)$ space).
5. **Quick Sort (`quick`):**
   In-place partitioning utilizing the Lomuto partition scheme around pivot `arr[high]`. Subarrays are partitioned such that elements $\le \text{pivot}$ precede elements $> \text{pivot}$, followed by recursive left and right calls.
6. **Heap Sort (`heap`):**
   Constructs an in-place Max-Heap from the array in $O(n)$ time using bottom-up sift-downs. It then repeatedly swaps the root (current maximum) with the last unsorted slot and restores the heap property over decreasing prefixes.

### 5.2 Searching Algorithms

1. **Linear Search (`linear`):**
   Sequentially scans elements from index $0$ to $n - 1$. Requires no preconditions on ordering.
   - Best Case: $O(1)$ (target at index 0)
   - Average & Worst Case: $O(n)$
   - Auxiliary Space: $O(1)$
2. **Binary Search (`binary`):**
   Requires monotonic ordering (the engine sorts a copy of the input array). It maintains `low`, `mid`, and `high` pointers, eliminating half of the search range at every comparison.
   - Best Case: $O(1)$ (target at midpoint)
   - Average & Worst Case: $O(\log n)$
   - Auxiliary Space: $O(1)$

### 5.3 Graph Traversal & Optimization

1. **Breadth-First Search (BFS):**
   Driven by a FIFO queue. Explores all vertices at distance $k$ before advancing to vertices at distance $k + 1$. Finds unweighted shortest hop paths.
   - Time: $O(V + E)$ | Space: $O(V)$
2. **Depth-First Search (DFS):**
   Driven by a LIFO recursion/stack model. Explores paths deeply until reaching a dead end before backtracking.
   - Time: $O(V + E)$ | Space: $O(V)$
3. **Dijkstra's Shortest Path Algorithm:**
   Greedy single-source shortest path algorithm on non-negative weighted graphs. Maintains tentative distance map `dist[]` initialized to $\infty$, relaxing adjacent edge weights `dist[u] + w < dist[v]`.
   - Time: $O((V + E) \log V)$ (with priority queue) | Space: $O(V)$
4. **Prim's Minimum Spanning Tree (MST):**
   Grows a single spanning tree from a start vertex by greedily adding the cheapest edge connecting an in-tree vertex to an unvisited vertex.
   - Time: $O(E \log V)$ | Space: $O(V)$
5. **Kruskal's Minimum Spanning Tree (MST):**
   Global greedy edge selection. Sorts all active edges ascending by weight, adding an edge $(u, v)$ if and only if $u$ and $v$ belong to separate components, validated using a custom **`DisjointSet` (Union-Find) engine with Path Compression and Union by Rank**.
   - Time: $O(E \log E)$ | Space: $O(V)$

---

## 6. Module 3: Algorithm Compare & Benchmarking Engine

The **Algorithm Compare** module turns the visualizer into an empirical algorithm comparison platform.

```
+-----------------------------------+-----------------------------------+
| TRACK A: Merge Sort               | TRACK B: Bubble Sort              |
| Comparisons: 27  | Swaps: 44      | Comparisons: 66  | Swaps: 42      |
| [ Animated Bar Visualizer A ]     | [ Animated Bar Visualizer B ]     |
| Completed in 46 steps             | Completed in 99 steps             |
+-----------------------------------+-----------------------------------+
| EMPIRICAL BENCHMARK RESULTS (Unlocked when both tracks complete):     |
| Algorithm      Comparisons   Swaps/Writes   Avg Runtime (n=12)   Big-O|
| Track A (Merge)    27             44              25.4 µs      O(n lg)|
| Track B (Bubble)   66             42              17.8 µs      O(n^2) |
+-----------------------------------------------------------------------+
| SCALING BENCHMARKS ON IDENTICAL INPUTS:                               |
| [ n = 100: Merge 0.08ms vs Bubble 0.45ms ]                            |
| [ n = 500: Merge 0.42ms vs Bubble 9.80ms ]                            |
| [ n = 2000: Merge 1.85ms vs Bubble 162.4ms ]                          |
+-----------------------------------------------------------------------+
```

### 6.1 Synchronized Simultaneous Playback
- Select any two sorting algorithms (e.g. Quick Sort vs. Heap Sort).
- A single dataset is generated (Random, Nearly Sorted, Reversed, or custom CSV) and cloned identically for both tracks.
- Both visualizers play side-by-side at variable animation speeds ($1\times, 1.5\times, 2.5\times$).
- The final summary and metric analysis table remain locked until **both tracks have completed sorting**, preventing premature winner declarations.

### 6.2 Visual Frames vs. CPU Execution Time
A common point of confusion in visualizers is equating animation steps with real execution time:
- **Animation Steps:** The count of discrete educational snapshot slides recorded by `runSortWithTrace` (e.g., Quick Sort records separate frames for partition borders, pivot comparisons, and swaps $\to \approx 57$ slides, while Heap Sort checks both children inside a single `siftDown` frame $\to \approx 40$ slides).
- **CPU Runtime:** The true headless execution time measured in microseconds by `benchmarkSort`.

### 6.3 Headless Microsecond Benchmarking Methodology
To measure true algorithm speed without DOM or React animation overhead:
1. **JIT Engine Warmup:** Executes 5 unmeasured warmup passes before timing to ensure the V8 JavaScript engine compiles the functions.
2. **Pre-allocated Memory:** Clones $k$ copies of the input array **outside** the timed loop, preventing memory allocation overhead (`Array.slice()`) from distorting the sorting measurement.
3. **Calibrated Batch Execution:** On small arrays ($n \le 40$), individual executions take $< 10\,\mu\text{s}$, which is vulnerable to browser timer resolution clamping ($0.1\,\text{ms}$). The engine runs up to $2,500$ iterations and divides total elapsed time by iteration count:
   $$\text{Avg Runtime} = \frac{\text{Total Time Elapsed}}{\text{Completed Batch Iterations}}$$
4. **Cohesive Unit Formatting (`formatRuntimePair`):** Formats both algorithms in identical units ($\mu\text{s}$ when both are $< 1\,\text{ms}$, $\text{ms}$ otherwise) to eliminate mid-table unit confusion.

### 6.4 The Small-n Constant Factor Phenomenon
When sorting $n = 12$ elements, Bubble Sort or Heap Sort can execute in fewer microseconds ($17\,\mu\text{s}$) than Merge Sort ($25\,\mu\text{s}$), despite having higher asymptotic complexity:
- Flat iterative loops have near-zero overhead and run inside CPU cache lines.
- Recursive Merge Sort incurs function call stack frames and allocates temporary slice arrays on every merge.
- This accurately demonstrates real-world computing behavior: production engines (like Python's Timsort or C++'s std::sort) intentionally switch to insertion/bubble sort for small subarrays ($n < 32$) due to constant-factor advantages.

### 6.5 Asymptotic Scaling Verification ($n = 100, 500, 2000$)
Right below the active table, three headless scaling cards execute both algorithms on arrays of size $100$, $500$, and $2000$:
- At $n = 500$: Merge Sort ($\approx 0.42\,\text{ms}$) decisively outpaces Bubble Sort ($\approx 9.8\,\text{ms}$).
- At $n = 2000$: Merge Sort ($\approx 1.85\,\text{ms}$) runs nearly **90 times faster** than Bubble Sort ($\approx 162\,\text{ms}$), proving the power of $O(n \log n)$ over $O(n^2)$.

---

## 7. Module 4: Real-World Case Study — Campus Route & Utility Optimizer

The **Campus Route Optimizer** applies graph theory to a concrete civil and network engineering problem on a university campus.

```
       [Admin Block] -------110m------- [Central Library]
       /           \                     /            \
    120m           130m                95m            150m
    /                 \                /                \
[Main Gate]           [Cafeteria] -125m- [Auditorium] -135m- [CSE Labs]
    \                 /                \                /       |
    140m           210m                115m           /        165m
       \           /                     \          /           |
     [Hostel Complex] ------------------180m---------------- [Sports]
```

### 7.1 Campus Graph Topology & Building Specifications
The campus is represented as a weighted undirected graph $G = (V, E)$ containing **8 vertices** and **12 walkway edges**:

| Vertex ID | Building Name | Coordinate $(X, Y)$ | Description |
| :--- | :--- | :--- | :--- |
| `gate` | Main Gate | $(95, 210)$ | Campus entry point & transit hub |
| `admin` | Admin Block | $(235, 115)$ | Administrative offices |
| `lib` | Central Library | $(410, 95)$ | Academic research repository |
| `cse` | CSE Lab Block | $(585, 115)$ | High-performance computing labs |
| `cafe` | Cafeteria | $(255, 295)$ | Central dining & student center |
| `aud` | Auditorium | $(425, 230)$ | Convocation & event hall |
| `sports` | Sports Complex | $(645, 265)$ | Athletic facilities & arena |
| `hostel` | Hostel Complex | $(475, 355)$ | Residential housing blocks |

#### Weighted Walkway Edges:
- `gate <-> admin` (120m)
- `gate <-> cafe` (140m)
- `admin <-> lib` (110m)
- `admin <-> cafe` (130m)
- `lib <-> cse` (150m)
- `lib <-> aud` (95m)
- `cafe <-> aud` (125m)
- `cafe <-> hostel` (210m)
- `aud <-> cse` (135m)
- `aud <-> hostel` (115m)
- `cse <-> sports` (165m)
- `hostel <-> sports` (180m)

### 7.2 Shortest Walking Route & Dynamic Detours (Dijkstra)
- **Baseline Route:** Finds the shortest walking path between any origin and destination.
  - Example: `Main Gate` to `CSE Lab Block`:
    $$\text{gate} \xrightarrow{120\text{m}} \text{admin} \xrightarrow{110\text{m}} \text{lib} \xrightarrow{150\text{m}} \text{cse} = \mathbf{380\text{m}}$$
- **Dynamic Detour Simulation:** Clicking any walkway in the UI toggles its status to **`BLOCKED`** (simulating construction or maintenance).  
  - If `admin <-> lib` is blocked, re-running Dijkstra immediately discovers the optimal detour:
    $$\text{gate} \xrightarrow{140\text{m}} \text{cafe} \xrightarrow{125\text{m}} \text{aud} \xrightarrow{135\text{m}} \text{cse} = \mathbf{400\text{m}} \quad (+20\text{m detour})$$

### 7.3 Minimum-Cost Utility Network (Prim & Kruskal MST)
- **Problem:** Connect every campus building with underground optical fiber or water piping using the minimal total meters of trenching.
- **MST Equivalence:** Both Prim's algorithm and Kruskal's algorithm calculate the exact same minimal spanning cost:
  $$\text{Total MST Cable Length} = \mathbf{845\text{ meters}}$$
  (Edges selected: `lib-aud: 95m`, `admin-lib: 110m`, `aud-hostel: 115m`, `gate-admin: 120m`, `cafe-aud: 125m`, `aud-cse: 135m`, `cse-sports: 165m`).

### 7.4 Reachability & Maintenance Disconnection Analysis (BFS)
- Evaluates whether pedestrians or autonomous delivery bots can reach all facilities when multiple walkways are closed.
- BFS traverses level-by-level, reporting the exact hop count to each reachable building and highlighting disconnected, stranded buildings when critical walkways are severed.

---

## 8. Master Big-O Complexity Reference

### 8.1 Data Structures Master Table

| Structure | Operation | Best Case | Average Case | Worst Case | Auxiliary Space | Notes / Mechanisms |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Singly Linked List** | Insert Head | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | Pointer rewire at `head` |
| | Insert Tail (w/ cache) | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | Direct write via `tail` reference |
| | Insert Position $k$ | $O(1)$ | $O(k)$ | $O(n)$ | $O(1)$ | Linear pointer scan |
| | Delete Head | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | `head = head.next` |
| | Delete Tail | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$ | Must locate predecessor of tail |
| | Delete by Value | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ | Linear scan for target |
| | Search / Traverse | $O(1)$ | $O(n)$ | $O(n)$ | $O(1)$ | Sequential scan |
| | In-place Reversal | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$ | 3-pointer iterative swap |
| **Bounded Stack** | Push / Pop / Peek | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | Direct index access at `top` |
| | Display | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$ | Top-to-bottom array scan |
| **Circular Queue** | Enqueue / Dequeue | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | Modular `(i + 1) % cap` indexing |
| | Resize Buffer | $O(n)$ | $O(n)$ | $O(n)$ | $O(n)$ | Repacks active items in FIFO order |
| **Binary Search Tree** | Insert / Search / Delete | $O(1)$ | $O(\log n)$ | $O(n)$ | $O(1)$ | In-order successor for 2-child delete |
| | Traversals (In/Pre/Post)| $O(n)$ | $O(n)$ | $O(n)$ | $O(h)$ | $h = \text{height}$ call stack frames |
| | Level-Order (BFS) | $O(n)$ | $O(n)$ | $O(n)$ | $O(w)$ | $w = \text{max tree width}$ queue memory |
| | Height Calculation | $O(n)$ | $O(n)$ | $O(n)$ | $O(h)$ | Bottom-up post-order recursion |
| **Hash Table** | Insert / Search / Delete | $O(1)$ | $O(1)$ | $O(n)$ | $O(m + n)$ | Degrades to $O(n)$ under heavy clustering |
| | Rehash / Resize | $O(n)$ | $O(n)$ | $O(n)$ | $O(m + n)$ | Recomputes $k \pmod{m_{\text{new}}}$ |
| **Binary Heap** | Peek Root | $O(1)$ | $O(1)$ | $O(1)$ | $O(1)$ | Array index 0 inspection |
| | Insert (Sift-Up) | $O(1)$ | $O(\log n)$ | $O(\log n)$ | $O(1)$ | Swaps along parent branch |
| | Extract Root (Sift-Down)| $O(\log n)$ | $O(\log n)$ | $O(\log n)$ | $O(1)$ | Swaps down along optimal child |
| | Heap Construction | $O(n)$ | $O(n)$ | $O(n)$ | $O(1)$ | Bottom-up sift-down from $\lfloor n/2 \rfloor - 1$ |
| **Graphs** | BFS / DFS Traversal | $O(V + E)$ | $O(V + E)$ | $O(V + E)$ | $O(V)$ | Queue/Stack + visited hash set |
| | Dijkstra Shortest Path | $O((V+E)\log V)$| $O((V+E)\log V)$| $O((V+E)\log V)$| $O(V)$ | Non-negative weight relaxation |
| | Prim's MST | $O(E \log V)$ | $O(E \log V)$ | $O(E \log V)$ | $O(V)$ | Greedy cut-edge expansion |
| | Kruskal's MST | $O(E \log E)$ | $O(E \log E)$ | $O(E \log E)$ | $O(V)$ | Edge sort + Disjoint Set Union |

### 8.2 Sorting Algorithms Master Table

| Algorithm | Best Case Time | Average Case Time | Worst Case Time | Auxiliary Space | Stable? | Key Mechanism |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bubble Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | Adjacent swaps with early exit flag |
| **Selection Sort** | $O(n^2)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | No | Unsorted suffix minimum extraction |
| **Insertion Sort** | $O(n)$ | $O(n^2)$ | $O(n^2)$ | $O(1)$ | Yes | Shift-insertion into sorted prefix |
| **Merge Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(n)$ | Yes | Recursive divide-and-conquer merge |
| **Quick Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n^2)$ | $O(\log n)$ | No | Lomuto partition around `arr[high]` |
| **Heap Sort** | $O(n \log n)$ | $O(n \log n)$ | $O(n \log n)$ | $O(1)$ | No | Max-heap build + root extraction |

---

## 9. Undo State Architecture & Session History

In `src/components/views/WorkspaceView.tsx`, the workspace implements a reversible snapshot stack:
1. **Pre-Mutation Snapshot Capture:** Prior to any mutating user operation (e.g., `insert`, `delete`, `bulkInsert`, `rehash`, `clear`), the current state snapshot is saved onto `snapshotHistoryRef`.
2. **Atomic Rollback (`handleUndo`):** When the user clicks **Undo**, the top snapshot is popped. The workspace re-instantiates the core data structure class directly from that snapshot, restoring node references, pointers, and item counts to the exact prior state without page reloads.
3. **Session History Drawer:** Every executed operation is permanently logged in a timestamped drawer showing the operation signature, status, description, and success outcome.

---

## 10. Audio Synthesis & Accessibility Design

- **Web Audio API (`src/components/common/SoundEffects.ts`):** Synthesizes pleasant sine-wave audio tones on the fly:
  - *Click Tone:* $440\,\text{Hz}$ short tick ($40\,\text{ms}$).
  - *Success Tone:* Ascending chord ($523.25\,\text{Hz} \to 659.25\,\text{Hz}$).
  - *Error Tone:* Descending alert ($220\,\text{Hz} \to 164.81\,\text{Hz}$).
  - *Playback Step:* Low tick ($330\,\text{Hz}$).
- **Accessibility & Persistence:** Mute toggle available in the header navigation, with mute state persisted across sessions via `localStorage`.
- **Motion Reduction:** Framer Motion transitions respect system `prefers-reduced-motion` settings.

---

## 11. Technology Stack & Implementation Details

- **Frontend Framework:** React 18 with TypeScript 5.6
- **Styling System:** Tailwind CSS v3 with custom cobalt-blue and slate design tokens
- **Animation Engine:** Framer Motion v11 (declarative layout animations and SVG transitions)
- **Icons:** Lucide React
- **Build Tool:** Vite 5
- **Test Runner:** Vitest v2
- **Audio:** Web Audio API (zero external audio file assets)

---

## 12. Verification, Unit Test Suite & Production Build

### 12.1 Automated Test Suite (`tests/dsa.test.ts`)
The project includes automated Vitest unit tests verifying algorithmic correctness across all modules:
- Singly Linked List: head/tail insertions, value deletions, 3-pointer in-place reversal.
- Stack & Circular Queue: bounds overflow/underflow, circular indexing wrap-around.
- Binary Search Tree: insertion, search hit/miss, in-order predecessor/successor deletions.
- Hash Table: chaining collision resolution, linear probing tombstone probe-chain integrity.
- Binary Heap: Min-Heap and Max-Heap sorted extraction sequence verification.
- Graph Algorithms: Prim vs. Kruskal MST total weight equality ($845\text{m}$), Dijkstra campus shortest path baseline ($380\text{m}$) and blocked-walkway detour ($400\text{m}$), BFS 8-building reachability.
- Sorting Parity: Verifies that all 6 sorting engines correctly sort random and edge-case arrays, and confirms that `benchmarkSort` headless operation counters match `runSortWithTrace` counts.
- Searching: Linear and binary search hit and miss validations.

```bash
# Run automated unit test suite
npm test
```

### 12.2 Production Build & Type Checking
```bash
# Strict TypeScript compilation check (noUnusedLocals, noUnusedParameters)
npm run build

# Preview production build locally
npm run preview
```

---

## 13. Academic & Project Report Writing Notes (Viva Guide)

If you are preparing an academic project report, presentation, or viva examination based on this repository, highlight these technical distinctions:

1. **Why not just use built-in JavaScript arrays?**  
   JavaScript `Array` is a high-level dynamic hash-map/buffer hybrid whose memory is managed by the V8 engine. It hides low-level computer science concepts. In our project, we implemented the actual data structures: explicit pointer links (`LinkedListNode`), bounded array indices (`Stack`), modular ring buffers (`Queue`), complete tree index mathematics (`Heap`), and node references with in-order coordinate computation (`BST`).
2. **How does the step-by-step playback engine work?**  
   Explain that algorithms run once in TypeScript to produce an array of immutable `AnimationStep` snapshots. This turns playback into a discrete state machine where users can scrub forward, pause, and step backward without recomputing or reversing time.
3. **What is the significance of the Campus Route Optimizer?**  
   It proves that graph algorithms are not just abstract whiteboard problems. Dijkstra solves pedestrian navigation, Prim/Kruskal solves minimal utility infrastructure costs, and BFS validates connectivity when construction blocks paths.
4. **Why did Bubble Sort run faster than Merge Sort on $n = 12$?**  
   A classic viva discussion: Big-O notation describes asymptotic behavior as $n \to \infty$. For tiny inputs ($n \le 20$), constant factors (recursion call frames and memory allocations) dominate. Merge Sort creates slice arrays, whereas Bubble Sort runs a flat loop in-place. The **Scaling Check** proves that as $n$ reaches $500$ and $2000$, Merge Sort runs nearly $100\times$ faster.
5. **Why are tombstones essential in open addressing?**  
   Deleting an element in linear probing cannot leave an empty slot, or subsequent searches for colliding elements placed further down the probe cluster will terminate early and fail. Tombstones maintain search chain continuity while allowing subsequent insertions to reuse the space.

---

## 14. License

This project is licensed under the MIT License — open for academic, educational, and personal exploration.
