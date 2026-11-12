import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { DSAType, AnimationStep, OperationExplanation, HistoryItem } from '../../types/dsa';
import { LLStateSnapshot } from '../../types/linkedList';
import { StackStateSnapshot } from '../../types/stack';
import { QueueStateSnapshot } from '../../types/queue';
import { BSTStateSnapshot } from '../../types/bst';
import { HashTableSnapshot, CollisionMode } from '../../types/hashTable';
import { HeapStateSnapshot, HeapOrder } from '../../types/heap';
import { GraphStateSnapshot } from '../../types/graph';
import { SinglyLinkedList } from '../../core/LinkedList';
import { Stack } from '../../core/Stack';
import { Queue } from '../../core/Queue';
import { BinarySearchTree } from '../../core/BST';
import { HashTable } from '../../core/HashTable';
import { BinaryHeap } from '../../core/Heap';
import { Graph } from '../../core/Graph';

import { LinkedListVisualizer } from '../visualizers/LinkedListVisualizer';
import { StackVisualizer } from '../visualizers/StackVisualizer';
import { QueueVisualizer } from '../visualizers/QueueVisualizer';
import { BSTVisualizer } from '../visualizers/BSTVisualizer';
import { HashTableVisualizer } from '../visualizers/HashTableVisualizer';
import { HeapVisualizer } from '../visualizers/HeapVisualizer';
import { GraphVisualizer } from '../visualizers/GraphVisualizer';

import { LinkedListPanel } from '../panels/LinkedListPanel';
import { StackPanel } from '../panels/StackPanel';
import { QueuePanel } from '../panels/QueuePanel';
import { BSTPanel } from '../panels/BSTPanel';
import { HashTablePanel } from '../panels/HashTablePanel';
import { HeapPanel } from '../panels/HeapPanel';
import { GraphPanel } from '../panels/GraphPanel';

import { AnimationControls } from '../common/AnimationControls';
import { ExplanationPanel } from '../common/ExplanationPanel';
import { HistoryDrawer } from '../common/HistoryDrawer';
import { sound } from '../common/SoundEffects';

import {
  Link2,
  Layers,
  ArrowRightLeft,
  GitBranch,
  Hash,
  GitFork,
  ListOrdered,
  Share2,
  ArrowLeft,
  RotateCcw,
  RefreshCw,
  BookOpen,
} from 'lucide-react';

interface WorkspaceViewProps {
  dsType: DSAType;
  onBackToHome: () => void;
  onOpenComplexity: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  dsType,
  onBackToHome,
  onOpenComplexity,
}) => {
  const linkedListRef = useRef(new SinglyLinkedList());
  const stackRef = useRef(new Stack(7, true));
  const queueRef = useRef(new Queue(7, true));
  const bstRef = useRef(new BinarySearchTree());
  const hashTableRef = useRef(new HashTable(7, 'chaining'));
  const heapRef = useRef(new BinaryHeap('min', 'heap'));
  const pqRef = useRef(new BinaryHeap('min', 'priority-queue'));
  const graphRef = useRef(new Graph('default'));

  const [llSnapshot, setLLSnapshot] = useState(linkedListRef.current.getSnapshot());
  const [stackSnapshot, setStackSnapshot] = useState(stackRef.current.getSnapshot());
  const [queueSnapshot, setQueueSnapshot] = useState(queueRef.current.getSnapshot());
  const [bstSnapshot, setBSTSnapshot] = useState(bstRef.current.getSnapshot());
  const [hashSnapshot, setHashSnapshot] = useState(hashTableRef.current.getSnapshot());
  const [heapSnapshot, setHeapSnapshot] = useState(heapRef.current.getSnapshot());
  const [pqSnapshot, setPQSnapshot] = useState(pqRef.current.getSnapshot());
  const [graphSnapshot, setGraphSnapshot] = useState(graphRef.current.getSnapshot());

  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [explanation, setExplanation] = useState<OperationExplanation | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const snapshotHistoryRef = useRef<{ dsType: DSAType; opName: string; snapshot: any }[]>([]);

  const loadInitialData = useCallback((type: DSAType) => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);

    if (type === 'linked-list') {
      const ll = new SinglyLinkedList();
      [10, 20, 30, 40].forEach((n) => ll.insertAtEndDirect(n));
      linkedListRef.current = ll;
      setLLSnapshot(ll.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Linked List Initialized',
        whatHappens: 'Linked list initialized with 4 sequential elements [10 -> 20 -> 30 -> 40].',
        pseudocode: ['head -> [10] -> [20] -> [30] -> [40] -> null'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: 'Initialized list with 4 nodes.',
        status: 'idle',
      });
    } else if (type === 'stack') {
      const s = new Stack(7, true);
      [10, 20, 30].forEach((n) => s.pushDirect(n));
      stackRef.current = s;
      setStackSnapshot(s.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Stack Initialized',
        whatHappens: 'Stack initialized with 3 items. Top is at index 2 (value: 30).',
        pseudocode: ['stack.push(10)', 'stack.push(20)', 'stack.push(30)'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: 'Stack ready (3 / 7 slots occupied).',
        status: 'idle',
      });
    } else if (type === 'queue') {
      const q = new Queue(7, true);
      [10, 20, 30].forEach((n) => q.enqueueDirect(n));
      queueRef.current = q;
      setQueueSnapshot(q.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Circular Queue Initialized',
        whatHappens: 'Circular FIFO Queue initialized. Front element is 10, Rear element is 30.',
        pseudocode: ['queue.enqueue(10)', 'queue.enqueue(20)', 'queue.enqueue(30)'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: 'Queue ready with 3 elements.',
        status: 'idle',
      });
    } else if (type === 'bst') {
      const bst = new BinarySearchTree();
      [50, 30, 70, 20, 40, 60, 80].forEach((n) => bst.insertDirect(n));
      bstRef.current = bst;
      setBSTSnapshot(bst.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'BST Initialized',
        whatHappens: 'Binary Search Tree loaded with a balanced 3-level tree rooted at 50.',
        pseudocode: ['root = 50', 'left = [30, 20, 40]', 'right = [70, 60, 80]'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: 'Balanced BST initialized with 7 nodes.',
        status: 'idle',
      });
    } else if (type === 'hash-table') {
      const ht = new HashTable(7, hashTableRef.current.getMode());
      [10, 17, 24, 5, 12].forEach((k) => ht.insertDirect(k));
      hashTableRef.current = ht;
      setHashSnapshot(ht.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Hash Table Initialized',
        whatHappens: 'Hash table loaded with sample keys demonstrating modulo hashing and collisions (10, 17, 24 all hash to bucket 3 mod 7).',
        pseudocode: ['h(k) = k mod capacity', 'insert(10), insert(17), insert(24), insert(5), insert(12)'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1 + alpha)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(m + n)',
        },
        resultMessage: 'Hash table initialized with 5 keys.',
        status: 'idle',
      });
    } else if (type === 'heap') {
      const h = new BinaryHeap(heapRef.current.getOrder(), 'heap');
      [12, 24, 18, 35, 29, 40].forEach((p) => h.insertDirect(p));
      heapRef.current = h;
      setHeapSnapshot(h.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Binary Heap Initialized',
        whatHappens: 'Complete binary tree stored in an array maintaining parent-child heap order.',
        pseudocode: ['parent(i) = floor((i - 1) / 2)', 'left(i) = 2i + 1, right(i) = 2i + 2'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(log n)',
          auxiliarySpace: 'O(n)',
        },
        resultMessage: 'Binary heap initialized with 6 items.',
        status: 'idle',
      });
    } else if (type === 'priority-queue') {
      const pq = new BinaryHeap(pqRef.current.getOrder(), 'priority-queue');
      pq.insertDirect(1, 'Emergency ER');
      pq.insertDirect(4, 'Lab Report');
      pq.insertDirect(2, 'Router Packet');
      pq.insertDirect(7, 'Backup Sync');
      pq.insertDirect(3, 'Print Job');
      pqRef.current = pq;
      setPQSnapshot(pq.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Priority Queue Initialized',
        whatHappens: 'Priority queue backed by a binary heap so the highest-priority task sits at the root.',
        pseudocode: ['enqueue(priority, label) -> O(log n)', 'dequeue() -> extract root -> O(log n)'],
        complexity: {
          timeBest: 'O(1) peek',
          timeAverage: 'O(log n)',
          timeWorst: 'O(log n)',
          auxiliarySpace: 'O(n)',
        },
        resultMessage: 'Priority queue initialized with 5 scheduled tasks.',
        status: 'idle',
      });
    } else if (type === 'graph') {
      const g = new Graph('default');
      graphRef.current = g;
      setGraphSnapshot(g.getSnapshot());
      setExplanation({
        operationName: 'INITIALIZE',
        displayName: 'Graph Initialized',
        whatHappens: 'Loaded weighted undirected graph. Click any edge to toggle a block or run BFS, DFS, Dijkstra, Prim, or Kruskal.',
        pseudocode: ['G = (V, E)', 'adj[u] stores (v, weight)'],
        complexity: {
          timeBest: 'O(V + E)',
          timeAverage: 'O((V + E) log V)',
          timeWorst: 'O(E log E)',
          auxiliarySpace: 'O(V + E)',
        },
        resultMessage: 'Weighted graph ready for traversal and path algorithms.',
        status: 'idle',
      });
    }
  }, []);

  useEffect(() => {
    loadInitialData(dsType);
  }, [dsType, loadInitialData]);

  const getCurrentSnapshot = () => {
    if (dsType === 'linked-list') return linkedListRef.current.getSnapshot();
    if (dsType === 'stack') return stackRef.current.getSnapshot();
    if (dsType === 'queue') return queueRef.current.getSnapshot();
    if (dsType === 'bst') return bstRef.current.getSnapshot();
    if (dsType === 'hash-table') return hashTableRef.current.getSnapshot();
    if (dsType === 'heap') return heapRef.current.getSnapshot();
    if (dsType === 'priority-queue') return pqRef.current.getSnapshot();
    return graphRef.current.getSnapshot();
  };

  const pushHistoryItem = (
    operationName: string,
    description: string,
    success: boolean
  ) => {
    const historyItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      dsType,
      operationName,
      description,
      success,
    };
    setHistory((prev) => [historyItem, ...prev]);
  };

  const applyStepSnapshot = useCallback(
    (step?: AnimationStep) => {
      if (!step) return;
      if (dsType === 'linked-list') setLLSnapshot(step.stateSnapshot as LLStateSnapshot);
      if (dsType === 'stack') setStackSnapshot(step.stateSnapshot as StackStateSnapshot);
      if (dsType === 'queue') setQueueSnapshot(step.stateSnapshot as QueueStateSnapshot);
      if (dsType === 'bst') setBSTSnapshot(step.stateSnapshot as BSTStateSnapshot);
      if (dsType === 'hash-table') setHashSnapshot(step.stateSnapshot as HashTableSnapshot);
      if (dsType === 'heap') setHeapSnapshot(step.stateSnapshot as HeapStateSnapshot);
      if (dsType === 'priority-queue') setPQSnapshot(step.stateSnapshot as HeapStateSnapshot);
      if (dsType === 'graph') setGraphSnapshot(step.stateSnapshot as GraphStateSnapshot);
    },
    [dsType]
  );

  const runOperation = (
    run: () => { steps: AnimationStep[]; explanation: OperationExplanation },
    operationKey: string,
    isMutating = true
  ) => {
    const preSnapshot = isMutating ? getCurrentSnapshot() : null;
    const result = run();

    if (isMutating && result.explanation.status === 'success' && preSnapshot) {
      snapshotHistoryRef.current.push({
        dsType,
        opName: operationKey,
        snapshot: preSnapshot,
      });
    }

    setExplanation(result.explanation);
    setSteps(result.steps);
    setCurrentStepIndex(1);
    applyStepSnapshot(result.steps[0]);

    pushHistoryItem(
      result.explanation.operationName,
      result.explanation.resultMessage,
      result.explanation.status === 'success' || result.explanation.status === 'idle'
    );

    if (result.steps.length > 1) {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      if (
        result.explanation.status === 'error' ||
        result.explanation.status === 'warning'
      ) {
        sound.playError();
      } else if (result.explanation.status === 'success') {
        sound.playSuccess();
      }
    }
  };

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      applyStepSnapshot(steps[nextIdx - 1]);
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, steps, applyStepSnapshot]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 1) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      applyStepSnapshot(steps[prevIdx - 1]);
    }
  }, [currentStepIndex, steps, applyStepSnapshot]);

  const handleResetAnimation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(1);
    if (steps.length > 0) {
      applyStepSnapshot(steps[0]);
    }
  }, [steps, applyStepSnapshot]);

  const handleReplay = useCallback(() => {
    if (steps.length === 0) return;
    setCurrentStepIndex(1);
    applyStepSnapshot(steps[0]);
    if (steps.length > 1) {
      setIsPlaying(true);
    }
  }, [steps, applyStepSnapshot]);

  const handlePlayToggle = useCallback(() => {
    if (!isPlaying && currentStepIndex >= steps.length && steps.length > 1) {
      handleReplay();
      return;
    }
    setIsPlaying((prev) => !prev);
  }, [isPlaying, currentStepIndex, steps.length, handleReplay]);

  const handleUndo = () => {
    if (snapshotHistoryRef.current.length === 0) return;
    const last = snapshotHistoryRef.current.pop();
    if (!last || last.dsType !== dsType) return;

    sound.playClick();
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);

    if (dsType === 'linked-list' && last.snapshot) {
      const newLL = new SinglyLinkedList();
      last.snapshot.nodes.forEach((n: any) => newLL.insertAtEndDirect(n.value, n.id));
      linkedListRef.current = newLL;
      setLLSnapshot(newLL.getSnapshot());
    } else if (dsType === 'stack' && last.snapshot) {
      const newStack = new Stack(last.snapshot.capacity, last.snapshot.isBounded);
      last.snapshot.items.forEach((it: any) => newStack.pushDirect(it.value, it.id));
      stackRef.current = newStack;
      setStackSnapshot(newStack.getSnapshot());
    } else if (dsType === 'queue' && last.snapshot) {
      const newQueue = new Queue(last.snapshot.capacity, last.snapshot.isBounded);
      const { items, frontIndex, size, capacity } = last.snapshot;
      for (let offset = 0; offset < size; offset++) {
        const idx = (frontIndex + offset) % capacity;
        const it = items[idx];
        if (it) newQueue.enqueueDirect(it.value, it.id);
      }
      queueRef.current = newQueue;
      setQueueSnapshot(newQueue.getSnapshot());
    } else if (dsType === 'bst' && last.snapshot) {
      const newBST = new BinarySearchTree();
      const { nodes, rootId } = last.snapshot as {
        nodes: Record<string, any>;
        rootId: string | null;
      };
      if (rootId && nodes[rootId]) {
        const bfs: string[] = [rootId];
        while (bfs.length > 0) {
          const id = bfs.shift()!;
          const node = nodes[id];
          if (!node) continue;
          newBST.insertDirect(node.value);
          if (node.leftId) bfs.push(node.leftId);
          if (node.rightId) bfs.push(node.rightId);
        }
      }
      bstRef.current = newBST;
      setBSTSnapshot(newBST.getSnapshot());
    } else if (dsType === 'hash-table' && last.snapshot) {
      const snap = last.snapshot as HashTableSnapshot;
      const newHT = new HashTable(snap.capacity, snap.mode);
      snap.buckets.forEach((b) =>
        b.entries.forEach((entry) => newHT.insertDirect(entry.key, entry.value))
      );
      hashTableRef.current = newHT;
      setHashSnapshot(newHT.getSnapshot());
    } else if (dsType === 'heap' && last.snapshot) {
      const snap = last.snapshot as HeapStateSnapshot;
      const newHeap = new BinaryHeap(snap.order, 'heap');
      snap.items.forEach((it) => newHeap.insertDirect(it.priority, it.label, it.id));
      heapRef.current = newHeap;
      setHeapSnapshot(newHeap.getSnapshot());
    } else if (dsType === 'priority-queue' && last.snapshot) {
      const snap = last.snapshot as HeapStateSnapshot;
      const newPQ = new BinaryHeap(snap.order, 'priority-queue');
      snap.items.forEach((it) => newPQ.insertDirect(it.priority, it.label, it.id));
      pqRef.current = newPQ;
      setPQSnapshot(newPQ.getSnapshot());
    } else if (dsType === 'graph' && last.snapshot) {
      const snap = last.snapshot as GraphStateSnapshot;
      const preset = snap.presetName === 'campus' ? 'campus' : snap.directed ? 'directed' : 'default';
      const newGraph = new Graph(preset);
      graphRef.current = newGraph;
      setGraphSnapshot(newGraph.getSnapshot());
    }

    setExplanation({
      operationName: 'UNDO',
      displayName: 'Undo Operation',
      whatHappens: `Reverted previous operation (${last.opName}). State restored to previous snapshot.`,
      pseudocode: ['state = snapshotHistory.pop()'],
      complexity: {
        timeBest: 'O(1)',
        timeAverage: 'O(1)',
        timeWorst: 'O(1)',
        auxiliarySpace: 'O(n) snapshot',
      },
      resultMessage: `Undid: ${last.opName}.`,
      status: 'idle',
    });
  };

  const handleResetInitial = () => {
    sound.playClick();
    snapshotHistoryRef.current.push({
      dsType,
      opName: 'RESET_INITIAL',
      snapshot: getCurrentSnapshot(),
    });
    loadInitialData(dsType);
    pushHistoryItem('RESET_INITIAL', 'Reset workspace to initial dataset.', true);
  };

  const handleClear = () => {
    sound.playClick();
    snapshotHistoryRef.current.push({
      dsType,
      opName: 'CLEAR_ALL',
      snapshot: getCurrentSnapshot(),
    });
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);

    if (dsType === 'linked-list') {
      linkedListRef.current.clear();
      setLLSnapshot(linkedListRef.current.getSnapshot());
    } else if (dsType === 'stack') {
      stackRef.current.clear();
      setStackSnapshot(stackRef.current.getSnapshot());
    } else if (dsType === 'queue') {
      queueRef.current.clear();
      setQueueSnapshot(queueRef.current.getSnapshot());
    } else if (dsType === 'bst') {
      bstRef.current.clear();
      setBSTSnapshot(bstRef.current.getSnapshot());
    } else if (dsType === 'hash-table') {
      hashTableRef.current.clear();
      setHashSnapshot(hashTableRef.current.getSnapshot());
    } else if (dsType === 'heap') {
      heapRef.current.clear();
      setHeapSnapshot(heapRef.current.getSnapshot());
    } else if (dsType === 'priority-queue') {
      pqRef.current.clear();
      setPQSnapshot(pqRef.current.getSnapshot());
    } else if (dsType === 'graph') {
      graphRef.current.loadPreset('default');
      setGraphSnapshot(graphRef.current.getSnapshot());
    }

    setExplanation({
      operationName: 'CLEAR_ALL',
      displayName: 'Clear Data Structure',
      whatHappens: 'Emptied the structure. Memory references set to null.',
      pseudocode: ['head = null // or top = -1, root = null'],
      complexity: {
        timeBest: 'O(1)',
        timeAverage: 'O(1)',
        timeWorst: 'O(1)',
        auxiliarySpace: 'O(1)',
      },
      resultMessage: 'Structure cleared completely.',
      status: 'idle',
    });
    pushHistoryItem('CLEAR_ALL', 'Structure cleared completely.', true);
  };

  const handleLoadSample = (sampleKey: string) => {
    sound.playClick();
    snapshotHistoryRef.current.push({
      dsType,
      opName: `SAMPLE_${sampleKey}`,
      snapshot: getCurrentSnapshot(),
    });
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);

    if (dsType === 'linked-list') {
      const ll = new SinglyLinkedList();
      if (sampleKey === 'random') {
        const rands = Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 10);
        rands.forEach((n) => ll.insertAtEndDirect(n));
      } else {
        [10, 20, 30, 40].forEach((n) => ll.insertAtEndDirect(n));
      }
      linkedListRef.current = ll;
      setLLSnapshot(ll.getSnapshot());
    } else if (dsType === 'stack') {
      const s = new Stack(stackRef.current.getCapacity(), stackRef.current.getIsBounded());
      if (sampleKey === 'fill') {
        for (let i = 1; i <= s.getCapacity(); i++) {
          s.pushDirect(i * 10);
        }
      } else {
        [10, 20, 30].forEach((n) => s.pushDirect(n));
      }
      stackRef.current = s;
      setStackSnapshot(s.getSnapshot());
    } else if (dsType === 'queue') {
      const q = new Queue(queueRef.current.getCapacity(), queueRef.current.getIsBounded());
      if (sampleKey === 'fill') {
        for (let i = 1; i <= q.getCapacity(); i++) {
          q.enqueueDirect(i * 15);
        }
      } else {
        [12, 24, 36].forEach((n) => q.enqueueDirect(n));
      }
      queueRef.current = q;
      setQueueSnapshot(q.getSnapshot());
    } else if (dsType === 'bst') {
      const bst = new BinarySearchTree();
      if (sampleKey === 'skewed') {
        [10, 20, 30, 40, 50].forEach((n) => bst.insertDirect(n));
      } else if (sampleKey === 'random') {
        const unique = new Set<number>();
        while (unique.size < 7) unique.add(Math.floor(Math.random() * 85) + 10);
        Array.from(unique).forEach((n) => bst.insertDirect(n));
      } else {
        [50, 30, 70, 20, 40, 60, 80].forEach((n) => bst.insertDirect(n));
      }
      bstRef.current = bst;
      setBSTSnapshot(bst.getSnapshot());
    } else if (dsType === 'hash-table') {
      const ht = new HashTable(hashTableRef.current.getCapacity(), hashTableRef.current.getMode());
      [7, 14, 21, 10, 17, 24].forEach((k) => ht.insertDirect(k));
      hashTableRef.current = ht;
      setHashSnapshot(ht.getSnapshot());
    } else if (dsType === 'heap') {
      const h = new BinaryHeap(heapRef.current.getOrder(), 'heap');
      [9, 15, 22, 31, 45, 50, 27].forEach((n) => h.insertDirect(n));
      heapRef.current = h;
      setHeapSnapshot(h.getSnapshot());
    } else if (dsType === 'priority-queue') {
      const pq = new BinaryHeap(pqRef.current.getOrder(), 'priority-queue');
      pq.insertDirect(1, 'Emergency ER');
      pq.insertDirect(2, 'API Alert');
      pq.insertDirect(5, 'Index Sync');
      pq.insertDirect(3, 'Build Job');
      pqRef.current = pq;
      setPQSnapshot(pq.getSnapshot());
    } else if (dsType === 'graph') {
      const preset = sampleKey === 'directed' ? 'directed' : sampleKey === 'campus' ? 'campus' : 'default';
      graphRef.current.loadPreset(preset);
      setGraphSnapshot(graphRef.current.getSnapshot());
    }

    setExplanation({
      operationName: `LOAD_SAMPLE(${sampleKey})`,
      displayName: 'Load Sample Dataset',
      whatHappens: `Populated structure with preset '${sampleKey}' example.`,
      pseudocode: ['// Populated sample dataset'],
      complexity: {
        timeBest: 'O(1)',
        timeAverage: 'O(n)',
        timeWorst: 'O(n)',
        auxiliarySpace: 'O(n)',
      },
      resultMessage: `Loaded sample dataset (${sampleKey}).`,
      status: 'success',
    });
    pushHistoryItem(`LOAD_SAMPLE(${sampleKey})`, `Loaded sample dataset (${sampleKey}).`, true);
  };

  const getDSMeta = () => {
    switch (dsType) {
      case 'linked-list':
        return {
          title: 'Linked List Workspace',
          icon: <Link2 className="w-5 h-5 text-emerald-600" />,
          desc: 'Singly Linked List with pointer connections and Head/Tail markers.',
          size: llSnapshot.size,
          sizeLabel: 'Nodes',
        };
      case 'stack':
        return {
          title: 'Stack Workspace',
          icon: <Layers className="w-5 h-5 text-brand-600" />,
          desc: 'LIFO (Last-In First-Out) stack with configurable capacity bounds.',
          size: stackSnapshot.items.length,
          sizeLabel: 'Items',
        };
      case 'queue':
        return {
          title: 'Queue Workspace',
          icon: <ArrowRightLeft className="w-5 h-5 text-cyan-600" />,
          desc: 'Circular FIFO Queue with O(1) Front and Rear wrap-around indexing.',
          size: queueSnapshot.size,
          sizeLabel: 'Items',
        };
      case 'bst':
        return {
          title: 'Binary Search Tree Workspace',
          icon: <GitBranch className="w-5 h-5 text-indigo-600" />,
          desc: 'Hierarchical BST with left < parent < right key ordering.',
          size: bstSnapshot.size,
          sizeLabel: 'Nodes',
        };
      case 'hash-table':
        return {
          title: 'Hash Table Workspace',
          icon: <Hash className="w-5 h-5 text-amber-600" />,
          desc: 'Open-addressing linear probing and separate chaining with modulo hashing.',
          size: hashSnapshot.size,
          sizeLabel: 'Keys',
        };
      case 'heap':
        return {
          title: 'Binary Heap Workspace',
          icon: <GitFork className="w-5 h-5 text-emerald-600" />,
          desc: 'Complete binary tree stored in an array with sift-up and sift-down balancing.',
          size: heapSnapshot.size,
          sizeLabel: 'Items',
        };
      case 'priority-queue':
        return {
          title: 'Priority Queue Workspace',
          icon: <ListOrdered className="w-5 h-5 text-rose-600" />,
          desc: 'Task scheduler backed by a binary heap for O(log n) priority extraction.',
          size: pqSnapshot.size,
          sizeLabel: 'Tasks',
        };
      case 'graph':
        return {
          title: 'Graph Workspace',
          icon: <Share2 className="w-5 h-5 text-brand-600" />,
          desc: 'Directed/undirected weighted graph supporting BFS, DFS, Dijkstra, Prim, and Kruskal.',
          size: graphSnapshot.vertices.length,
          sizeLabel: 'Vertices',
        };
    }
  };

  const meta = getDSMeta();
  const currentStepData =
    steps.length > 0 && currentStepIndex > 0 ? steps[currentStepIndex - 1] : null;
  const canUndo =
    snapshotHistoryRef.current.length > 0 &&
    snapshotHistoryRef.current[snapshotHistoryRef.current.length - 1].dsType === dsType;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBackToHome();
            }}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            title="Back to Homepage"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg">{meta.icon}</div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900">{meta.title}</h1>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                {meta.size} {meta.sizeLabel}
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{meta.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={!canUndo || isPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-40"
          >
            <RotateCcw className="w-3.5 h-3.5 text-brand-600" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleResetInitial}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors disabled:opacity-40"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            <span>Reset Initial</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenComplexity();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-xl border border-brand-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-brand-600" />
            <span className="hidden sm:inline">Cheat Sheet</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-8 space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between min-h-[380px]">
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Visualization Canvas
              </span>
              {currentStepData && (
                <span className="text-xs font-mono font-medium text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                  {currentStepData.title}
                </span>
              )}
            </div>

            <div className="p-4 flex-1 flex items-center justify-center">
              {dsType === 'linked-list' && <LinkedListVisualizer snapshot={llSnapshot} />}
              {dsType === 'stack' && <StackVisualizer snapshot={stackSnapshot} />}
              {dsType === 'queue' && <QueueVisualizer snapshot={queueSnapshot} />}
              {dsType === 'bst' && <BSTVisualizer snapshot={bstSnapshot} />}
              {dsType === 'hash-table' && <HashTableVisualizer snapshot={hashSnapshot} />}
              {dsType === 'heap' && <HeapVisualizer snapshot={heapSnapshot} />}
              {dsType === 'priority-queue' && <HeapVisualizer snapshot={pqSnapshot} />}
              {dsType === 'graph' && (
                <GraphVisualizer
                  snapshot={graphSnapshot}
                  onToggleEdgeBlock={(edgeId) => {
                    graphRef.current.toggleBlockEdge(edgeId);
                    setGraphSnapshot(graphRef.current.getSnapshot());
                  }}
                />
              )}
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50/40">
              <AnimationControls
                currentStep={currentStepIndex}
                totalSteps={steps.length}
                isPlaying={isPlaying}
                speed={speed}
                operationStatus={explanation?.status}
                onPlayToggle={handlePlayToggle}
                onReplay={handleReplay}
                onNextStep={handleNextStep}
                onPrevStep={handlePrevStep}
                onResetAnimation={handleResetAnimation}
                onSpeedChange={setSpeed}
              />
            </div>
          </div>

          <ExplanationPanel explanation={explanation} currentStepData={currentStepData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-4 space-y-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Operations Panel
              </h3>
            </div>

            {dsType === 'linked-list' && (
              <LinkedListPanel
                onInsertBeginning={(v) =>
                  runOperation(() => linkedListRef.current.insertAtBeginning(v), 'INSERT_BEGIN', true)
                }
                onInsertEnd={(v) =>
                  runOperation(() => linkedListRef.current.insertAtEnd(v), 'INSERT_END', true)
                }
                onInsertPosition={(v, p) =>
                  runOperation(() => linkedListRef.current.insertAtPosition(v, p), 'INSERT_POS', true)
                }
                onDeleteBeginning={() =>
                  runOperation(() => linkedListRef.current.deleteFromBeginning(), 'DELETE_BEGIN', true)
                }
                onDeleteEnd={() =>
                  runOperation(() => linkedListRef.current.deleteFromEnd(), 'DELETE_END', true)
                }
                onDeleteValue={(v) =>
                  runOperation(() => linkedListRef.current.deleteByValue(v), 'DELETE_VAL', true)
                }
                onSearch={(v) =>
                  runOperation(() => linkedListRef.current.search(v), 'SEARCH', false)
                }
                onTraverse={() =>
                  runOperation(() => linkedListRef.current.traverse(), 'TRAVERSE', false)
                }
                onReverse={() =>
                  runOperation(() => linkedListRef.current.reverse(), 'REVERSE', true)
                }
                onClear={handleClear}
                onLoadSample={handleLoadSample}
                isAnimating={isPlaying}
                listSize={llSnapshot.size}
              />
            )}

            {dsType === 'stack' && (
              <StackPanel
                onPush={(v) => runOperation(() => stackRef.current.push(v), 'PUSH', true)}
                onPop={() => runOperation(() => stackRef.current.pop(), 'POP', true)}
                onPeek={() => runOperation(() => stackRef.current.peek(), 'PEEK', false)}
                onIsEmpty={() => runOperation(() => stackRef.current.isEmpty(), 'IS_EMPTY', false)}
                onIsFull={() => runOperation(() => stackRef.current.isFull(), 'IS_FULL', false)}
                onDisplay={() => runOperation(() => stackRef.current.display(), 'DISPLAY', false)}
                onSetCapacity={(c) => {
                  const prevSnapshot = stackRef.current.getSnapshot();
                  const changed = stackRef.current.setCapacity(c, true);
                  if (!changed) {
                    sound.playError();
                    setExplanation({
                      operationName: `SET_CAPACITY(${c})`,
                      displayName: 'Capacity Update Rejected',
                      whatHappens: `Cannot shrink capacity to ${c} while stack holds ${prevSnapshot.items.length} elements.`,
                      pseudocode: ['if size > newCapacity: return false'],
                      complexity: {
                        timeBest: 'O(1)',
                        timeAverage: 'O(1)',
                        timeWorst: 'O(1)',
                        auxiliarySpace: 'O(1)',
                      },
                      resultMessage: `Cannot set capacity below current size (${prevSnapshot.items.length}).`,
                      status: 'warning',
                    });
                    return;
                  }
                  snapshotHistoryRef.current.push({
                    dsType,
                    opName: `SET_CAPACITY(${c})`,
                    snapshot: prevSnapshot,
                  });
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setStackSnapshot(stackRef.current.getSnapshot());
                  setExplanation({
                    operationName: `SET_CAPACITY(${c})`,
                    displayName: 'Update Stack Capacity',
                    whatHappens: `Updated maximum stack capacity to ${c} slots.`,
                    pseudocode: [`capacity = ${c}`],
                    complexity: {
                      timeBest: 'O(1)',
                      timeAverage: 'O(1)',
                      timeWorst: 'O(1)',
                      auxiliarySpace: 'O(1)',
                    },
                    resultMessage: `Capacity set to ${c}.`,
                    status: 'success',
                  });
                  pushHistoryItem(`SET_CAPACITY(${c})`, `Updated capacity to ${c}.`, true);
                }}
                onClear={handleClear}
                onLoadSample={handleLoadSample}
                isAnimating={isPlaying}
                stackSize={stackSnapshot.items.length}
                capacity={stackSnapshot.capacity}
              />
            )}

            {dsType === 'queue' && (
              <QueuePanel
                onEnqueue={(v) => runOperation(() => queueRef.current.enqueue(v), 'ENQUEUE', true)}
                onDequeue={() => runOperation(() => queueRef.current.dequeue(), 'DEQUEUE', true)}
                onFront={() => runOperation(() => queueRef.current.front(), 'FRONT', false)}
                onRear={() => runOperation(() => queueRef.current.rear(), 'REAR', false)}
                onIsEmpty={() => runOperation(() => queueRef.current.isEmpty(), 'IS_EMPTY', false)}
                onIsFull={() => runOperation(() => queueRef.current.isFull(), 'IS_FULL', false)}
                onDisplay={() => runOperation(() => queueRef.current.display(), 'DISPLAY', false)}
                onSetCapacity={(c) => {
                  const prevSnapshot = queueRef.current.getSnapshot();
                  const changed = queueRef.current.setCapacity(c, true);
                  if (!changed) {
                    sound.playError();
                    setExplanation({
                      operationName: `SET_CAPACITY(${c})`,
                      displayName: 'Capacity Update Rejected',
                      whatHappens: `Cannot shrink capacity to ${c} while queue holds ${prevSnapshot.size} elements.`,
                      pseudocode: ['if size > newCapacity: return false'],
                      complexity: {
                        timeBest: 'O(1)',
                        timeAverage: 'O(1)',
                        timeWorst: 'O(1)',
                        auxiliarySpace: 'O(1)',
                      },
                      resultMessage: `Cannot set capacity below current size (${prevSnapshot.size}).`,
                      status: 'warning',
                    });
                    return;
                  }
                  snapshotHistoryRef.current.push({
                    dsType,
                    opName: `SET_CAPACITY(${c})`,
                    snapshot: prevSnapshot,
                  });
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setQueueSnapshot(queueRef.current.getSnapshot());
                  setExplanation({
                    operationName: `SET_CAPACITY(${c})`,
                    displayName: 'Update Queue Capacity',
                    whatHappens: `Repacked circular queue buffer with capacity ${c} slots.`,
                    pseudocode: [`capacity = ${c}`, 'front = 0', 'rear = size - 1'],
                    complexity: {
                      timeBest: 'O(1)',
                      timeAverage: 'O(n)',
                      timeWorst: 'O(n)',
                      auxiliarySpace: 'O(n)',
                    },
                    resultMessage: `Capacity set to ${c}.`,
                    status: 'success',
                  });
                  pushHistoryItem(`SET_CAPACITY(${c})`, `Updated capacity to ${c}.`, true);
                }}
                onClear={handleClear}
                onLoadSample={handleLoadSample}
                isAnimating={isPlaying}
                queueSize={queueSnapshot.size}
                capacity={queueSnapshot.capacity}
              />
            )}

            {dsType === 'bst' && (
              <BSTPanel
                onInsert={(v) => runOperation(() => bstRef.current.insert(v), 'BST_INSERT', true)}
                onDelete={(v) => runOperation(() => bstRef.current.delete(v), 'BST_DELETE', true)}
                onSearch={(v) => runOperation(() => bstRef.current.search(v), 'BST_SEARCH', false)}
                onInorder={() =>
                  runOperation(() => bstRef.current.inorderTraversal(), 'INORDER_TRAVERSAL', false)
                }
                onPreorder={() =>
                  runOperation(
                    () => bstRef.current.preorderTraversal(),
                    'PREORDER_TRAVERSAL',
                    false
                  )
                }
                onPostorder={() =>
                  runOperation(
                    () => bstRef.current.postorderTraversal(),
                    'POSTORDER_TRAVERSAL',
                    false
                  )
                }
                onLevelOrder={() =>
                  runOperation(
                    () => bstRef.current.levelOrderTraversal(),
                    'LEVEL_ORDER_TRAVERSAL',
                    false
                  )
                }
                onFindMin={() => runOperation(() => bstRef.current.findMin(), 'FIND_MIN', false)}
                onFindMax={() => runOperation(() => bstRef.current.findMax(), 'FIND_MAX', false)}
                onCalculateHeight={() =>
                  runOperation(() => bstRef.current.calculateHeight(), 'CALCULATE_HEIGHT', false)
                }
                onClear={handleClear}
                onLoadSample={handleLoadSample}
                onBulkInsert={(nums) => {
                  const prevSnapshot = bstRef.current.getSnapshot();
                  let inserted = 0;
                  let skipped = 0;
                  nums.forEach((n) => {
                    if (bstRef.current.insertDirect(n)) inserted++;
                    else skipped++;
                  });

                  if (inserted > 0) {
                    snapshotHistoryRef.current.push({
                      dsType,
                      opName: 'BULK_INSERT',
                      snapshot: prevSnapshot,
                    });
                    sound.playSuccess();
                  } else {
                    sound.playError();
                  }

                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setBSTSnapshot(bstRef.current.getSnapshot());

                  const summary =
                    skipped > 0
                      ? `Inserted ${inserted} key(s); skipped ${skipped} duplicate(s).`
                      : `Inserted ${inserted} node(s) successfully.`;
                  setExplanation({
                    operationName: `BULK_INSERT([${nums.join(', ')}])`,
                    displayName: 'Bulk Insertion into BST',
                    whatHappens: summary,
                    pseudocode: ['for each key in values: insert(key)'],
                    complexity: {
                      timeBest: 'O(k log n)',
                      timeAverage: 'O(k log n)',
                      timeWorst: 'O(k * n)',
                      auxiliarySpace: 'O(1)',
                    },
                    resultMessage: summary,
                    status: inserted > 0 ? 'success' : 'warning',
                  });
                  pushHistoryItem(
                    `BULK_INSERT([${nums.join(', ')}])`,
                    summary,
                    inserted > 0
                  );
                }}
                isAnimating={isPlaying}
                treeSize={bstSnapshot.size}
              />
            )}

            {dsType === 'hash-table' && (
              <HashTablePanel
                onInsert={(k, v) => runOperation(() => hashTableRef.current.insert(k, v), 'HASH_INSERT', true)}
                onSearch={(k) => runOperation(() => hashTableRef.current.search(k), 'HASH_SEARCH', false)}
                onDelete={(k) => runOperation(() => hashTableRef.current.delete(k), 'HASH_DELETE', true)}
                onReconfigure={(cap, mode: CollisionMode) => {
                  const prevSnapshot = hashTableRef.current.getSnapshot();
                  snapshotHistoryRef.current.push({
                    dsType,
                    opName: 'REHASH',
                    snapshot: prevSnapshot,
                  });
                  hashTableRef.current.reconfigure(cap, mode);
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setHashSnapshot(hashTableRef.current.getSnapshot());
                  setExplanation({
                    operationName: `RECONFIGURE(${cap}, ${mode})`,
                    displayName: 'Rehash Table',
                    whatHappens: `Re-inserted all existing keys using capacity ${cap} and ${mode} strategy.`,
                    pseudocode: ['for key in entries: h(key) = key mod newCapacity'],
                    complexity: {
                      timeBest: 'O(n)',
                      timeAverage: 'O(n)',
                      timeWorst: 'O(n^2)',
                      auxiliarySpace: 'O(m + n)',
                    },
                    resultMessage: `Reconfigured hash table to m=${cap} (${mode}).`,
                    status: 'success',
                  });
                  pushHistoryItem(`REHASH(m=${cap}, ${mode})`, `Rehashed table to m=${cap} (${mode}).`, true);
                }}
                onLoadSample={handleLoadSample}
                onClear={handleClear}
                isAnimating={isPlaying}
                capacity={hashSnapshot.capacity}
                mode={hashSnapshot.mode}
                size={hashSnapshot.size}
              />
            )}

            {dsType === 'heap' && (
              <HeapPanel
                mode="heap"
                order={heapSnapshot.order}
                size={heapSnapshot.size}
                isAnimating={isPlaying}
                onInsert={(p, lbl) => runOperation(() => heapRef.current.insert(p, lbl), 'HEAP_INSERT', true)}
                onExtractTop={() => runOperation(() => heapRef.current.extractTop(), 'HEAP_EXTRACT', true)}
                onPeekTop={() => runOperation(() => heapRef.current.peekTop(), 'HEAP_PEEK', false)}
                onOrderChange={(ord: HeapOrder) => {
                  heapRef.current.setOrder(ord);
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setHeapSnapshot(heapRef.current.getSnapshot());
                }}
                onLoadSample={() => handleLoadSample('heap')}
                onClear={handleClear}
              />
            )}

            {dsType === 'priority-queue' && (
              <HeapPanel
                mode="priority-queue"
                order={pqSnapshot.order}
                size={pqSnapshot.size}
                isAnimating={isPlaying}
                onInsert={(p, lbl) => runOperation(() => pqRef.current.insert(p, lbl), 'PQ_ENQUEUE', true)}
                onExtractTop={() => runOperation(() => pqRef.current.extractTop(), 'PQ_DEQUEUE', true)}
                onPeekTop={() => runOperation(() => pqRef.current.peekTop(), 'PQ_PEEK', false)}
                onOrderChange={(ord: HeapOrder) => {
                  pqRef.current.setOrder(ord);
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setPQSnapshot(pqRef.current.getSnapshot());
                }}
                onLoadSample={() => handleLoadSample('pq')}
                onClear={handleClear}
              />
            )}

            {dsType === 'graph' && (
              <GraphPanel
                vertices={graphSnapshot.vertices}
                directed={graphSnapshot.directed}
                weighted={graphSnapshot.weighted}
                isAnimating={isPlaying}
                onRunBFS={(startId) => runOperation(() => graphRef.current.bfs(startId), 'GRAPH_BFS', false)}
                onRunDFS={(startId) => runOperation(() => graphRef.current.dfs(startId), 'GRAPH_DFS', false)}
                onRunDijkstra={(src, dst) =>
                  runOperation(() => graphRef.current.dijkstra(src, dst), 'GRAPH_DIJKSTRA', false)
                }
                onRunPrim={(startId) => runOperation(() => graphRef.current.prim(startId), 'GRAPH_PRIM', false)}
                onRunKruskal={() => runOperation(() => graphRef.current.kruskal(), 'GRAPH_KRUSKAL', false)}
                onSetDirected={(d) => {
                  graphRef.current.setDirected(d);
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setGraphSnapshot(graphRef.current.getSnapshot());
                }}
                onSetWeighted={(w) => {
                  graphRef.current.setWeighted(w);
                  setIsPlaying(false);
                  setSteps([]);
                  setCurrentStepIndex(0);
                  setGraphSnapshot(graphRef.current.getSnapshot());
                }}
                onAddVertex={(lbl) => {
                  graphRef.current.addVertex(lbl);
                  setGraphSnapshot(graphRef.current.getSnapshot());
                }}
                onAddEdge={(from, to, weight) => {
                  graphRef.current.addEdge(from, to, weight);
                  setGraphSnapshot(graphRef.current.getSnapshot());
                }}
                onLoadPreset={(preset) => handleLoadSample(preset)}
              />
            )}
          </div>

          <HistoryDrawer
            history={history}
            onUndo={handleUndo}
            onClearHistory={() => setHistory([])}
            canUndo={canUndo}
          />
        </motion.div>
      </div>
    </div>
  );
};
