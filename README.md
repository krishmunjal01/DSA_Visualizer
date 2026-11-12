# DSA Visualizer

A client-side React and TypeScript web app for stepping through operations on Singly Linked Lists, bounded LIFO Stacks, circular FIFO Queues, and Binary Search Trees. Each workspace runs dedicated TypeScript data structure classes that emit state snapshots and active pseudocode lines at every step.

## Features

- **Singly Linked List**: Insert at head, tail, or index; delete from head, tail, or by value; linear search, traversal, and in-place pointer reversal with `HEAD`, `TAIL`, and directional `next` connectors.
- **Stack (LIFO)**: Bounded stack with configurable capacity (`5`, `7`, or `9`), `TOP` pointer tracking, `push`, `pop`, `peek`, `isEmpty`, `isFull`, and `display`.
- **Circular Queue (FIFO)**: Fixed-capacity ring buffer with O(1) modular `(index + 1) % capacity` wrap-around for `FRONT` and `REAR`, supporting `enqueue`, `dequeue`, `front`, `rear`, `isEmpty`, `isFull`, `display`, and active-order repacking on resize.
- **Binary Search Tree (BST)**: Insert, delete (leaf, single-child, and two-child inorder-successor cases), search, four traversals (in-order, pre-order, post-order, level-order BFS), find min/max, bottom-up post-order height calculation, bulk comma-separated insertion, and a zoomable SVG canvas.
- **Step-by-Step Playback**: Play, pause, replay, step forward/backward, and adjust playback speed (`0.5x`, `1x`, `1.5x`, `2x`) alongside synchronized pseudocode line highlights and best/average/worst time plus auxiliary space bounds.
- **Undo & Operation History**: Pre-mutation snapshot undo for mutating operations and a per-session operation history log.
- **Complexity Cheat Sheet**: Filterable modal comparing time and space bounds across all implemented operations.
- **Optional Sound Cues**: Synthesized Web Audio API chimes (toggleable from the navbar and persisted in `localStorage`).

## Architecture

State flow is separated into three layers:

1. **Core Models (`src/core/`)**
   - `SinglyLinkedList` (`src/core/LinkedList.ts`): Node objects linked via `next` references maintaining `head`, `tail`, and `size`.
   - `Stack` (`src/core/Stack.ts`): Bounded array-backed LIFO container with overflow/underflow checks and capacity guards.
   - `Queue` (`src/core/Queue.ts`): Fixed-capacity circular array buffer (`frontIdx`, `rearIdx`, `count`) using modular wrap-around indexing.
   - `BinarySearchTree` (`src/core/BST.ts`): Key-ordered binary tree with recursive/iterative traces and collision-free subtree-width coordinate layout.
2. **Workspace & Step Player (`src/components/views/WorkspaceView.tsx`)**
   - Captures pre-mutation snapshots for undo, records session actions in `HistoryDrawer`, drives `AnimationControls`, and feeds the active step trace into `ExplanationPanel`.
3. **Visualizers & Operation Panels (`src/components/visualizers/`, `src/components/panels/`)**
   - `LinkedListVisualizer`, `StackVisualizer`, `QueueVisualizer`, and `BSTVisualizer` render animated SVG/DOM views for each snapshot using Framer Motion.

## Supported Operations

| Structure | Operations |
| :--- | :--- |
| **Linked List** | Insert Beginning, Insert End, Insert at Position, Delete Beginning, Delete End, Delete by Value, Search, Traverse, Reverse, Sample/Random datasets, Clear |
| **Stack** | Push, Pop, Peek, Is Empty, Is Full, Display, Capacity presets (5, 7, 9), Sample/Fill, Clear |
| **Queue** | Enqueue, Dequeue, Front, Rear, Is Empty, Is Full, Display, Capacity presets (5, 7, 9), Sample/Fill, Clear |
| **BST** | Insert, Delete (all 3 cases), Search, In-order, Pre-order, Post-order, Level-order BFS, Find Min, Find Max, Height, Balanced/Random/Skewed samples, Bulk comma-separated insert, Clear |

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Local Development

```bash
npm install
npm run dev
```

Vite serves the app on `http://localhost:3000`.

### Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React 18 and TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- Tailwind CSS v3
- Framer Motion
- Lucide React
- Vite
- Web Audio API
