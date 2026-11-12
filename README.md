# DSA Visualizer

An educational web app for stepping through core data structures in TypeScript: Singly Linked List, bounded LIFO Stack, circular FIFO Queue, and Binary Search Tree.

## Features

- **Singly Linked List**: Insert at head, tail, or index; delete from head, tail, or by value; linear search, traversal, and in-place pointer reversal with `HEAD`, `TAIL`, and directional `next` connectors.
- **Stack (LIFO)**: Bounded stack with configurable capacity (5, 7, or 9), `TOP` pointer tracking, `push`, `pop`, `peek`, `isEmpty`, `isFull`, and `display` steps.
- **Circular Queue (FIFO)**: Fixed-capacity ring buffer with O(1) circular `(index + 1) % capacity` wrap-around for `FRONT` and `REAR`, supporting `enqueue`, `dequeue`, `front`, `rear`, `isEmpty`, `isFull`, and `display`.
- **Binary Search Tree (BST)**: Insert, delete (leaf, one-child, two-child inorder successor), search, four traversals (in-order, pre-order, post-order, level-order BFS), find min/max, bottom-up post-order height calculation, bulk comma-separated insertion, and zoomable SVG canvas.
- **Step-by-Step Playback**: Play, pause, replay, step forward/backward, and adjust playback speed (0.5x, 1x, 1.5x, 2x) with synchronized pseudocode line highlights and time/space complexity notes.
- **Undo & Operation History**: Snapshot-based undo for mutating operations and an operation log drawer per session.
- **Complexity Cheat Sheet**: Modal comparison table covering Linked List, Stack, Queue, and BST complexities.
- **Optional Sound Cues**: Synthesized Web Audio API chimes (toggleable from the navbar, persisted in `localStorage`).

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

- React 18 and TypeScript (strict mode)
- Tailwind CSS v3
- Lucide React icons
- Vite
- Web Audio API
