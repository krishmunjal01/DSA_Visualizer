# Project Report: DSA Visualizer

## Overview

**DSA Visualizer** is a client-side React + TypeScript application built to demonstrate how common linear and tree data structures execute operations step by step. Instead of animating static diagrams, each workspace runs dedicated TypeScript model classes that emit state snapshots and active pseudocode line indices for every phase of an algorithm.

## Technology Stack

- **Frontend**: React 18, TypeScript (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- **Build Tool**: Vite (`localhost:3000` dev server)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Audio**: Web Audio API (`SoundEffects.ts`)

## Architecture

State flow is separated into three layers:

1. **Core Models (`src/core/`)**
   - `SinglyLinkedList` (`src/core/LinkedList.ts`): Node objects linked by `next` references, maintaining `head`, `tail`, and `size`. Supports head/tail/position insert, head/tail/value delete, search, traversal, and in-place reversal.
   - `Stack` (`src/core/Stack.ts`): Bounded array-backed LIFO container (`push`, `pop`, `peek`, `isEmpty`, `isFull`, `display`) with overflow/underflow checks and capacity resizing guards.
   - `Queue` (`src/core/Queue.ts`): Fixed-capacity circular array buffer (`frontIdx`, `rearIdx`, `count`, modular indexing `(i + 1) % capacity`) supporting O(1) `enqueue` and `dequeue`, `front`, `rear`, `isEmpty`, `isFull`, `display`, and active-order repacking on capacity changes.
   - `BinarySearchTree` (`src/core/BST.ts`): Recursive/iterative BST supporting `insert`, `delete` (leaf, single-child, and inorder-successor replacement), `search`, in-order/pre-order/post-order/level-order traversals, `findMin`, `findMax`, and post-order recursive `calculateHeight`, paired with a collision-free subtree-width coordinate layout.
2. **State & Step Player (`src/components/views/WorkspaceView.tsx`)**
   - Captures pre-mutation snapshots for `Undo` on mutating operations and records executed actions in `HistoryDrawer`.
   - Steps through `AnimationStep[]` arrays via `AnimationControls` (Play/Pause, Replay, Step Forward/Backward, Reset Step 1, and speed multipliers `0.5x`, `1x`, `1.5x`, `2x`).
   - Displays current explanation, active pseudocode line, and Best/Average/Worst Time plus Auxiliary Space complexity in `ExplanationPanel`.
3. **Visualizers & Panels (`src/components/visualizers/`, `src/components/panels/`)**
   - `LinkedListVisualizer`: Renders node `[value | next]` cards, `HEAD`/`TAIL` tags, forward (`->`), reversed (`<-`), and `NULL` connectors driven by each node's actual `nextId`.
   - `StackVisualizer`: Vertical slot stack showing `[index]`, `TOP` pointer, and capacity usage.
   - `QueueVisualizer`: Horizontal circular slot strip displaying `FRONT`, `REAR`, and shared `FR / RR` markers at physical buffer indices `[0..capacity-1]`.
   - `BSTVisualizer`: Responsive SVG canvas (`viewBox` scaling for zoom plus overflow scrolling) showing `ROOT` markers, `L`/`R` edge labels, and dynamic highlight pills.

## Implemented Operations Summary

| Structure | Operations |
| :--- | :--- |
| **Linked List** | Insert Beginning, Insert End, Insert at Position, Delete Beginning, Delete End, Delete by Value, Search, Traverse, Reverse, Sample/Random datasets, Clear |
| **Stack** | Push, Pop, Peek, Is Empty, Is Full, Display, Capacity presets (5, 7, 9), Sample/Fill, Clear |
| **Queue** | Enqueue, Dequeue, Front, Rear, Is Empty, Is Full, Display, Capacity presets (5, 7, 9), Sample/Fill, Clear |
| **BST** | Insert, Delete (all 3 cases), Search, In-order, Pre-order, Post-order, Level-order BFS, Find Min, Find Max, Height, Balanced/Random/Skewed samples, Bulk comma-separated insert, Clear |

## Verification

- Type checking and production bundling run via `npm run build` (`tsc && vite build`).
- Development server runs locally via `npm run dev` on port `3000`.
