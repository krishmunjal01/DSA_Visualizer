import { describe, expect, it } from 'vitest';
import { SinglyLinkedList } from '../src/core/LinkedList';
import { Stack } from '../src/core/Stack';
import { Queue } from '../src/core/Queue';
import { BinarySearchTree } from '../src/core/BST';
import { HashTable } from '../src/core/HashTable';
import { BinaryHeap } from '../src/core/Heap';
import { Graph } from '../src/core/Graph';
import { SortAlgorithmId } from '../src/types/algorithms';
import { benchmarkSort, generateDataset, runSortWithTrace } from '../src/core/Sorting';
import { runSearchWithTrace } from '../src/core/Searching';

describe('Core Data Structures', () => {
  it('SinglyLinkedList supports insertion, deletion, and in-place reversal', () => {
    const ll = new SinglyLinkedList<number>();
    ll.insertAtEnd(10);
    ll.insertAtEnd(20);
    ll.insertAtBeginning(5);
    expect(ll.getSnapshot().nodes.map((n) => n.value)).toEqual([5, 10, 20]);

    ll.deleteByValue(10);
    expect(ll.getSnapshot().nodes.map((n) => n.value)).toEqual([5, 20]);

    ll.reverse();
    expect(ll.getSnapshot().nodes.map((n) => n.value)).toEqual([20, 5]);
  });

  it('Stack and Circular Queue handle bounds and FIFO/LIFO order', () => {
    const s = new Stack<number>(2, true);
    expect(s.push(1).explanation.status).toBe('success');
    expect(s.push(2).explanation.status).toBe('success');
    expect(s.push(3).explanation.status).toBe('error');
    expect(s.pop().explanation.resultMessage).toContain('2');

    const q = new Queue<number>(3, true);
    q.enqueue(10);
    q.enqueue(20);
    q.dequeue();
    q.enqueue(30);
    q.enqueue(40);
    expect(q.getSnapshot().size).toBe(3);
    expect(q.dequeue().explanation.resultMessage).toContain('20');
  });

  it('BinarySearchTree maintains ordered structure across insert and delete', () => {
    const bst = new BinarySearchTree();
    [50, 30, 70, 20, 40, 60, 80].forEach((v) => bst.insertDirect(v));
    expect(bst.search(60).explanation.status).toBe('success');
    expect(bst.search(99).explanation.status).toBe('warning');

    bst.delete(50);
    const inorder = bst.inorderTraversal().explanation.resultMessage;
    expect(inorder).toContain('20');
    expect(inorder).toContain('60');
    expect(bst.size()).toBe(6);
  });

  it('HashTable handles separate chaining collisions and delete', () => {
    const ht = new HashTable(7, 'chaining');
    expect(ht.insert(10).explanation.status).toBe('success');
    expect(ht.insert(17).explanation.status).toBe('success');
    expect(ht.insert(24).explanation.status).toBe('success');
    expect(ht.getSize()).toBe(3);
    expect(ht.search(17).explanation.status).toBe('success');

    expect(ht.delete(17).explanation.status).toBe('success');
    expect(ht.search(17).explanation.status).toBe('warning');
    expect(ht.search(24).explanation.status).toBe('success');
  });

  it('HashTable linear probing preserves probe chain lookups after deletions via tombstones', () => {
    const ht = new HashTable(7, 'linear-probing');
    ht.insert(7);
    ht.insert(14);
    ht.insert(21);
    expect(ht.delete(14).explanation.status).toBe('success');
    expect(ht.search(21).explanation.status).toBe('success');
    expect(ht.insert(28).explanation.status).toBe('success');
    expect(ht.search(28).explanation.status).toBe('success');
  });

  it('BinaryHeap extracts in sorted order for both min-heap and max-heap', () => {
    const minHeap = new BinaryHeap('min', 'heap');
    [35, 12, 48, 7, 20, 12].forEach((v) => minHeap.insert(v));
    const minOut: number[] = [];
    while (minHeap.getSize() > 0) {
      const msg = minHeap.extractTop().explanation.resultMessage;
      const num = Number(msg.match(/Extracted (\d+)/)?.[1]);
      minOut.push(num);
    }
    expect(minOut).toEqual([7, 12, 12, 20, 35, 48]);

    const maxHeap = new BinaryHeap('max', 'heap');
    [35, 12, 48, 7, 20].forEach((v) => maxHeap.insert(v));
    const maxOut: number[] = [];
    while (maxHeap.getSize() > 0) {
      const msg = maxHeap.extractTop().explanation.resultMessage;
      const num = Number(msg.match(/Extracted (\d+)/)?.[1]);
      maxOut.push(num);
    }
    expect(maxOut).toEqual([48, 35, 20, 12, 7]);
  });
});

describe('Graphs, Traversals, Shortest Path & MST', () => {
  it('computes identical MST weight for Prim and Kruskal on undirected graphs', () => {
    const g = new Graph('default');
    const primRes = g.prim('A');
    const kruskalRes = g.kruskal();
    const primLast = primRes.steps[primRes.steps.length - 1].stateSnapshot;
    const kruskalLast = kruskalRes.steps[kruskalRes.steps.length - 1].stateSnapshot;

    expect(primLast.mstTotalWeight).toBeGreaterThan(0);
    expect(primLast.mstTotalWeight).toBe(kruskalLast.mstTotalWeight);
  });

  it('computes Dijkstra shortest route on Campus Graph and detours when an edge is blocked', () => {
    const campus = new Graph('campus');
    const baseline = campus.dijkstra('gate', 'cse');
    const baseDist = baseline.steps[baseline.steps.length - 1].stateSnapshot.shortestDistance!;
    expect(baseDist).toBe(380);

    // Block admin -> lib walkway used by shortest path (gate->admin->lib->cse = 120+110+150)
    const snap = campus.getSnapshot();
    const targetEdge = snap.edges.find(
      (e) => (e.from === 'admin' && e.to === 'lib') || (e.from === 'lib' && e.to === 'admin')
    )!;
    campus.toggleBlockEdge(targetEdge.id);

    const detour = campus.dijkstra('gate', 'cse');
    const detourDist = detour.steps[detour.steps.length - 1].stateSnapshot.shortestDistance!;
    expect(detourDist).toBe(400);

    const bfsRes = campus.bfs('gate');
    expect(bfsRes.steps[bfsRes.steps.length - 1].stateSnapshot.visitedOrder.length).toBe(8);
  });
});

describe('Sorting and Searching Algorithms', () => {
  const algos: SortAlgorithmId[] = ['bubble', 'selection', 'insertion', 'merge', 'quick', 'heap'];

  it.each(algos)('%s sort sorts random and edge-case arrays accurately', (algo) => {
    const input = [42, 7, 19, 7, 99, 1, 53, 18];
    const expected = [...input].sort((a, b) => a - b);

    const res = runSortWithTrace(algo, input);
    const finalBars = res.steps[res.steps.length - 1].stateSnapshot.bars.map((b) => b.value);
    expect(finalBars).toEqual(expected);

    const bench = benchmarkSort(algo, generateDataset(100, 'reversed'));
    expect(bench.comparisons).toBeGreaterThan(0);
    expect(bench.timeMs).toBeGreaterThanOrEqual(0);

    const benchSame = benchmarkSort(algo, input);
    expect(benchSame.comparisons).toBe(res.comparisons);
    expect(benchSame.swaps).toBe(res.swaps);
  });

  it('Linear Search and Binary Search find targets accurately', () => {
    const linHit = runSearchWithTrace('linear', [15, 42, 8, 23], 8);
    expect(linHit.steps[linHit.steps.length - 1].stateSnapshot.foundIndex).toBe(2);

    const linMiss = runSearchWithTrace('linear', [15, 42, 8, 23], 99);
    expect(linMiss.steps[linMiss.steps.length - 1].stateSnapshot.foundIndex).toBeNull();

    const binHit = runSearchWithTrace('binary', [40, 10, 30, 20, 50], 40);
    expect(binHit.steps[binHit.steps.length - 1].stateSnapshot.foundIndex).toBe(3);

    const binMiss = runSearchWithTrace('binary', [40, 10, 30, 20, 50], 11);
    expect(binMiss.steps[binMiss.steps.length - 1].stateSnapshot.foundIndex).toBeNull();
  });
});
