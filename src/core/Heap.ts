import { AnimationStep, OperationExplanation } from '../types/dsa';
import {
  HeapItemState,
  HeapMode,
  HeapNodeItem,
  HeapOrder,
  HeapStateSnapshot,
} from '../types/heap';
import { finalizeSteps } from '../utils/steps';

export class BinaryHeap {
  private items: HeapNodeItem[] = [];
  private order: HeapOrder;
  private mode: HeapMode;
  private nextId = 1;

  constructor(order: HeapOrder = 'min', mode: HeapMode = 'heap') {
    this.order = order;
    this.mode = mode;
  }

  private createId(): string {
    return `hp-${this.nextId++}`;
  }

  private hasHigherPriority(a: number, b: number): boolean {
    return this.order === 'min' ? a < b : a > b;
  }

  public getOrder(): HeapOrder {
    return this.order;
  }

  public getMode(): HeapMode {
    return this.mode;
  }

  public getSize(): number {
    return this.items.length;
  }

  public setMode(mode: HeapMode): void {
    this.mode = mode;
  }

  public setOrder(order: HeapOrder): void {
    if (this.order === order) return;
    this.order = order;
    this.heapifyAllDirect();
  }

  private heapifyAllDirect(): void {
    for (let i = Math.floor(this.items.length / 2) - 1; i >= 0; i--) {
      this.siftDownDirect(i);
    }
  }

  private siftUpDirect(idx: number): void {
    let curr = idx;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (!this.hasHigherPriority(this.items[curr].priority, this.items[parent].priority)) break;
      [this.items[curr], this.items[parent]] = [this.items[parent], this.items[curr]];
      curr = parent;
    }
  }

  private siftDownDirect(idx: number): void {
    let curr = idx;
    const n = this.items.length;
    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let best = curr;

      if (left < n && this.hasHigherPriority(this.items[left].priority, this.items[best].priority)) {
        best = left;
      }
      if (right < n && this.hasHigherPriority(this.items[right].priority, this.items[best].priority)) {
        best = right;
      }
      if (best === curr) break;
      [this.items[curr], this.items[best]] = [this.items[best], this.items[curr]];
      curr = best;
    }
  }

  public insertDirect(priority: number, label?: string, id?: string): void {
    this.items.push({
      id: id ?? this.createId(),
      priority,
      label,
    });
    this.siftUpDirect(this.items.length - 1);
  }

  public clear(): void {
    this.items = [];
  }

  private computeTreePositions(): { x: number; y: number }[] {
    const n = this.items.length;
    const positions: { x: number; y: number }[] = [];
    const width = 760;

    for (let i = 0; i < n; i++) {
      const level = Math.floor(Math.log2(i + 1));
      const levelStart = Math.pow(2, level) - 1;
      const posInLevel = i - levelStart;
      const nodesInLevel = Math.pow(2, level);
      const slotWidth = width / nodesInLevel;
      const x = slotWidth * posInLevel + slotWidth / 2;
      const y = 46 + level * 78;
      positions.push({ x, y });
    }
    return positions;
  }

  public getSnapshot(highlights?: Map<number, HeapItemState>): HeapStateSnapshot {
    const coords = this.computeTreePositions();
    const mapped: HeapNodeItem[] = this.items.map((item, idx) => ({
      ...item,
      state: highlights?.get(idx) ?? 'default',
      x: coords[idx]?.x ?? 380,
      y: coords[idx]?.y ?? 46,
    }));

    return {
      items: mapped,
      order: this.order,
      mode: this.mode,
      size: mapped.length,
    };
  }

  public insert(
    priority: number,
    label?: string
  ): { steps: AnimationStep<HeapStateSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<HeapStateSnapshot>[] = [];
    const cmpSymbol = this.order === 'min' ? '<' : '>';
    const pseudocode = [
      'heap.push(newNode)',
      'i = heap.length - 1',
      `while i > 0 and heap[i] ${cmpSymbol} heap[parent(i)]:`,
      '  swap(heap[i], heap[parent(i)])',
      '  i = parent(i)',
    ];

    if (this.items.length >= 15) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Visual Cap Reached (15 Nodes)',
        description: 'Heap visualization supports up to 15 nodes (4 levels) to stay readable.',
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(),
      });
      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `HEAP_INSERT(${priority})`,
          displayName: 'Insert Blocked (Visual Cap)',
          whatHappens: 'Visual workspace caps at 15 elements (depth 4) so binary levels fit cleanly.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(log n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Max visual size (15) reached.',
          status: 'warning',
        },
      };
    }

    const newItem: HeapNodeItem = {
      id: this.createId(),
      priority,
      label,
    };
    this.items.push(newItem);
    let curr = this.items.length - 1;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Append at Index [${curr}]`,
      description: `Added ${label ? `${label} (${priority})` : priority} at the next complete-tree slot [${curr}].`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot(new Map([[curr, 'inserted']])),
    });

    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      const currP = this.items[curr].priority;
      const parentP = this.items[parent].priority;

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Compare [${curr}] (${currP}) with Parent [${parent}] (${parentP})`,
        description: `Checking ${this.order === 'min' ? 'min-heap' : 'max-heap'} invariant: ${currP} ${cmpSymbol} ${parentP}.`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot(
          new Map([
            [curr, 'comparing'],
            [parent, 'active'],
          ])
        ),
      });

      if (!this.hasHigherPriority(currP, parentP)) break;

      [this.items[curr], this.items[parent]] = [this.items[parent], this.items[curr]];
      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Sift Up: Swap [${curr}] and [${parent}]`,
        description: `Swapped child (${currP}) with parent (${parentP}) to restore heap order.`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot(
          new Map([
            [parent, 'swapping'],
            [curr, 'active'],
          ])
        ),
      });

      curr = parent;
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: 'Heap Invariant Restored',
      description: `Element settled at index [${curr}]. Root priority is ${this.items[0].priority}.`,
      activeLineIndex: 4,
      stateSnapshot: this.getSnapshot(new Map([[curr, 'inserted']])),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `${this.mode === 'priority-queue' ? 'PQ_ENQUEUE' : 'HEAP_INSERT'}(${priority}${label ? `, "${label}"` : ''})`,
        displayName: `${this.mode === 'priority-queue' ? 'Priority Queue Enqueue' : 'Heap Insert'} (${this.order.toUpperCase()})`,
        whatHappens: 'Appends at the end of the complete binary tree and sifts up along parent links.',
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(log n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Inserted ${priority} (heap size: ${this.items.length}).`,
        status: 'success',
      },
    };
  }

  public extractTop(): {
    steps: AnimationStep<HeapStateSnapshot>[];
    explanation: OperationExplanation;
  } {
    const steps: AnimationStep<HeapStateSnapshot>[] = [];
    const cmpSymbol = this.order === 'min' ? '<' : '>';
    const opName = this.mode === 'priority-queue' ? 'PQ_EXTRACT' : 'EXTRACT_TOP';
    const pseudocode = [
      'if heap empty: return UNDERFLOW',
      'top = heap[0]',
      'heap[0] = heap.pop()',
      `siftDown(0) // push down while child ${cmpSymbol} current`,
    ];

    if (this.items.length === 0) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Heap Empty (Underflow)',
        description: 'Cannot extract top because no elements exist.',
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(),
      });
      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `${opName}()`,
          displayName: 'Extract Failed (Empty)',
          whatHappens: 'The heap/priority queue is empty.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Underflow: nothing to extract.',
          status: 'error',
        },
      };
    }

    const topItem = this.items[0];
    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Extract Root (${topItem.priority})`,
      description: `Selected root priority ${topItem.priority}${topItem.label ? ` ("${topItem.label}")` : ''} for removal.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot(new Map([[0, 'extracting']])),
    });

    if (this.items.length === 1) {
      this.items.pop();
      steps.push({
        stepNumber: 2,
        totalSteps: 1,
        title: 'Removed Final Element',
        description: `Extracted ${topItem.priority}. Heap is now empty.`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot(),
      });
      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `${opName}()`,
          displayName: 'Extracted Root Element',
          whatHappens: 'Removed the only node in the heap.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(log n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Extracted ${topItem.priority}.`,
          status: 'success',
        },
      };
    }

    const lastIdx = this.items.length - 1;
    this.items[0] = this.items[lastIdx];
    this.items.pop();

    steps.push({
      stepNumber: 2,
      totalSteps: 1,
      title: `Move Last Element (${this.items[0].priority}) to Root`,
      description: `Moved tail element (${this.items[0].priority}) to index [0] and popped last slot.`,
      activeLineIndex: 2,
      stateSnapshot: this.getSnapshot(new Map([[0, 'swapping']])),
    });

    let curr = 0;
    const n = this.items.length;
    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let best = curr;

      const highlight = new Map<number, HeapItemState>([[curr, 'active']]);
      if (left < n) highlight.set(left, 'comparing');
      if (right < n) highlight.set(right, 'comparing');

      if (left < n) {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Compare Node [${curr}] (${this.items[curr].priority}) With Children`,
          description: `Comparing parent ${this.items[curr].priority} against children to choose the higher-priority child.`,
          activeLineIndex: 3,
          stateSnapshot: this.getSnapshot(highlight),
        });
      }

      if (left < n && this.hasHigherPriority(this.items[left].priority, this.items[best].priority)) {
        best = left;
      }
      if (right < n && this.hasHigherPriority(this.items[right].priority, this.items[best].priority)) {
        best = right;
      }

      if (best === curr) break;

      [this.items[curr], this.items[best]] = [this.items[best], this.items[curr]];
      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Sift Down: Swap [${curr}] and [${best}]`,
        description: `Promoted ${this.items[curr].priority} up to [${curr}] and pushed ${this.items[best].priority} down to [${best}].`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot(
          new Map([
            [curr, 'active'],
            [best, 'swapping'],
          ])
        ),
      });
      curr = best;
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: 'Heap Order Restored',
      description: `Extracted ${topItem.priority}. New root is ${this.items[0].priority}.`,
      activeLineIndex: 3,
      stateSnapshot: this.getSnapshot(new Map([[0, 'inserted']])),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `${opName}()`,
        displayName: `Extract ${this.order === 'min' ? 'Minimum' : 'Maximum'}`,
        whatHappens: `Removed ${topItem.priority}, placed the last leaf at the root, and sifted down.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(log n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Extracted ${topItem.priority}${topItem.label ? ` (${topItem.label})` : ''}.`,
        status: 'success',
      },
    };
  }

  public peekTop(): {
    steps: AnimationStep<HeapStateSnapshot>[];
    explanation: OperationExplanation;
  } {
    const isEmpty = this.items.length === 0;
    const top = this.items[0];
    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: isEmpty ? 'Heap is Empty' : `Root Priority: ${top.priority}`,
          description: isEmpty
            ? 'No root item exists.'
            : `Root index [0] holds ${top.priority}${top.label ? ` ("${top.label}")` : ''}.`,
          activeLineIndex: 0,
          stateSnapshot: this.getSnapshot(isEmpty ? undefined : new Map([[0, 'active']])),
        },
      ]),
      explanation: {
        operationName: 'PEEK_TOP()',
        displayName: 'Inspect Root Element',
        whatHappens: isEmpty
          ? 'Checked index [0]; heap is empty.'
          : `Reads index [0] in constant O(1) time without modifying heap structure.`,
        pseudocode: ['return heap.length > 0 ? heap[0] : null'],
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: isEmpty ? 'Heap is empty.' : `Top element: ${top.priority}.`,
        status: isEmpty ? 'warning' : 'success',
      },
    };
  }
}

