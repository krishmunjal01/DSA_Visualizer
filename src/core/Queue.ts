import { AnimationStep, OperationExplanation } from '../types/dsa';
import { QueueItemData, QueueStateSnapshot } from '../types/queue';

function finalizeSteps<T>(steps: AnimationStep<T>[]): AnimationStep<T>[] {
  const total = steps.length;
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
    totalSteps: total,
  }));
}

export class QueueItem<T = number | string> {
  private static nextId = 1;
  id: string;
  value: T;

  constructor(value: T, id?: string) {
    this.value = value;
    this.id = id || `queue-item-${QueueItem.nextId++}`;
  }
}

export class Queue<T = number | string> {
  private slots: (QueueItem<T> | null)[];
  private frontIdx: number = -1;
  private rearIdx: number = -1;
  private count: number = 0;
  private capacity: number;
  private isBounded: boolean;

  constructor(capacity: number = 7, isBounded: boolean = true) {
    this.capacity = capacity;
    this.isBounded = isBounded;
    this.slots = new Array(capacity).fill(null);
  }

  setCapacity(capacity: number, isBounded: boolean = true): boolean {
    if (isBounded && this.count > capacity) {
      return false;
    }

    const ordered: QueueItem<T>[] = [];
    for (let i = 0; i < this.count; i++) {
      const idx = (this.frontIdx + i) % this.capacity;
      const item = this.slots[idx];
      if (item) ordered.push(item);
    }

    this.capacity = capacity;
    this.isBounded = isBounded;
    this.slots = new Array(capacity).fill(null);
    ordered.forEach((item, idx) => {
      this.slots[idx] = item;
    });
    this.frontIdx = this.count > 0 ? 0 : -1;
    this.rearIdx = this.count > 0 ? this.count - 1 : -1;
    return true;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getIsBounded(): boolean {
    return this.isBounded;
  }

  size(): number {
    return this.count;
  }

  clear(): void {
    this.slots = new Array(this.capacity).fill(null);
    this.frontIdx = -1;
    this.rearIdx = -1;
    this.count = 0;
  }

  enqueueDirect(value: T, id?: string): void {
    if (this.isBounded && this.count >= this.capacity) return;
    if (this.count === 0) {
      this.frontIdx = 0;
      this.rearIdx = 0;
    } else {
      this.rearIdx = (this.rearIdx + 1) % this.capacity;
    }
    this.slots[this.rearIdx] = new QueueItem(value, id);
    this.count++;
  }

  getSnapshot(
    highlightSlotIndex?: number,
    stateType: QueueItemData['state'] = 'default',
    message?: string
  ): QueueStateSnapshot {
    const items: (QueueItemData | null)[] = this.slots.map((item, idx) => {
      if (!item) return null;

      let state: QueueItemData['state'] = 'default';
      if (idx === highlightSlotIndex) {
        state = stateType;
      } else if (idx === this.frontIdx) {
        state = 'front';
      } else if (idx === this.rearIdx) {
        state = 'rear';
      }

      return {
        id: item.id,
        value: item.value as number | string,
        index: idx,
        state,
      };
    });

    return {
      items,
      frontIndex: this.frontIdx,
      rearIndex: this.rearIdx,
      size: this.count,
      capacity: this.capacity,
      isBounded: this.isBounded,
      message,
    };
  }

  enqueue(val: T): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (size == capacity) throw Overflow',
      'if (front == -1) front = 0',
      'rear = (rear + 1) % capacity',
      'queue[rear] = value',
      'size++',
    ];

    if (this.isBounded && this.count >= this.capacity) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Queue Overflow',
            description: `Cannot enqueue ${val}. Queue is at full capacity (${this.capacity}).`,
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', `Overflow: Capacity ${this.capacity} reached`),
          },
        ]),
        explanation: {
          operationName: `ENQUEUE(${val})`,
          displayName: 'Enqueue Operation',
          whatHappens: `Checked capacity limit. Current size (${this.count}) equals capacity (${this.capacity}), so enqueue is rejected.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Overflow: Queue is full (${this.capacity}/${this.capacity}).`,
          status: 'error',
        },
      };
    }

    const steps: AnimationStep<QueueStateSnapshot>[] = [];
    const newItem = new QueueItem<T>(val);

    steps.push({
      stepNumber: 1,
      totalSteps: 3,
      title: 'Check Available Space',
      description: `Queue uses ${this.count}/${this.capacity} slots. Space is available.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot(undefined, 'default', 'Space check passed'),
    });

    if (this.count === 0) {
      this.frontIdx = 0;
      this.rearIdx = 0;
    } else {
      this.rearIdx = (this.rearIdx + 1) % this.capacity;
    }
    const newRearIdx = this.rearIdx;
    this.slots[newRearIdx] = newItem;
    this.count++;

    steps.push({
      stepNumber: 2,
      totalSteps: 3,
      title: 'Insert at Rear',
      description: `Placed ${val} at circular REAR slot [${newRearIdx}].`,
      activeLineIndex: 3,
      stateSnapshot: this.getSnapshot(newRearIdx, 'enqueueing', `Enqueued ${val} at [${newRearIdx}]`),
    });

    steps.push({
      stepNumber: 3,
      totalSteps: 3,
      title: 'Update Rear Pointer',
      description: `REAR now points to slot [${newRearIdx}]. Size is ${this.count}.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot(newRearIdx, 'rear', `Enqueued ${val}. Size: ${this.count}`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `ENQUEUE(${val})`,
        displayName: 'Enqueue (Insert at Rear)',
        whatHappens: `Places ${val} at the REAR index using circular wrap-around ((rear + 1) % capacity) in FIFO order.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Direct slot write at the circular rear index.',
        },
        resultMessage: `Enqueued ${val} at slot [${newRearIdx}].`,
        status: 'success',
      },
    };
  }

  dequeue(): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (size == 0) throw Underflow',
      'val = queue[front]',
      'if (front == rear) front = rear = -1',
      'else front = (front + 1) % capacity',
      'size--; return val',
    ];

    if (this.count === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Queue Underflow',
            description: 'Cannot dequeue from an empty queue.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Queue Underflow'),
          },
        ]),
        explanation: {
          operationName: 'DEQUEUE()',
          displayName: 'Dequeue Operation',
          whatHappens: 'Queue is empty, so there is no front element to remove.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Underflow: Queue is empty.',
          status: 'warning',
        },
      };
    }

    const steps: AnimationStep<QueueStateSnapshot>[] = [];
    const oldFrontIdx = this.frontIdx;
    const dequeuedItem = this.slots[oldFrontIdx]!;

    steps.push({
      stepNumber: 1,
      totalSteps: 3,
      title: 'Read Front Element',
      description: `FRONT is at slot [${oldFrontIdx}] with value ${dequeuedItem.value}.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot(oldFrontIdx, 'dequeueing', `Removing ${dequeuedItem.value}`),
    });

    this.slots[oldFrontIdx] = null;
    this.count--;
    if (this.count === 0) {
      this.frontIdx = -1;
      this.rearIdx = -1;
    } else {
      this.frontIdx = (this.frontIdx + 1) % this.capacity;
    }

    steps.push({
      stepNumber: 2,
      totalSteps: 3,
      title: 'Advance Front Pointer',
      description:
        this.count === 0
          ? `Removed ${dequeuedItem.value}. Queue is now empty (FRONT = -1, REAR = -1).`
          : `Removed ${dequeuedItem.value}. FRONT advanced to slot [${this.frontIdx}].`,
      activeLineIndex: this.count === 0 ? 2 : 3,
      stateSnapshot: this.getSnapshot(
        this.count > 0 ? this.frontIdx : undefined,
        'front',
        `Removed ${dequeuedItem.value}`
      ),
    });

    steps.push({
      stepNumber: 3,
      totalSteps: 3,
      title: 'Dequeue Complete',
      description: `Dequeued ${dequeuedItem.value}. Remaining elements: ${this.count}.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot(undefined, 'default', `Dequeued ${dequeuedItem.value}`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'DEQUEUE()',
        displayName: 'Dequeue (Remove from Front)',
        whatHappens: `Removes and returns the oldest element (${dequeuedItem.value}) from FRONT and advances the circular front index without shifting other items.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Circular indexing updates front in O(1) without shifting array elements.',
        },
        resultMessage: `Dequeued ${dequeuedItem.value} from slot [${oldFrontIdx}].`,
        status: 'success',
      },
    };
  }

  front(): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (size == 0) throw EmptyQueue',
      'return queue[front]',
    ];

    if (this.count === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Queue',
            description: 'Queue is empty. No FRONT element exists.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Queue is empty'),
          },
        ]),
        explanation: {
          operationName: 'FRONT()',
          displayName: 'Inspect Front',
          whatHappens: 'Checks if queue is empty before reading FRONT.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Queue is empty.',
          status: 'warning',
        },
      };
    }

    const frontItem = this.slots[this.frontIdx]!;

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Inspect Front',
          description: `FRONT element is ${frontItem.value} at slot [${this.frontIdx}].`,
          activeLineIndex: 1,
          isComplete: true,
          stateSnapshot: this.getSnapshot(this.frontIdx, 'front', `FRONT: ${frontItem.value}`),
        },
      ]),
      explanation: {
        operationName: 'FRONT()',
        displayName: 'Inspect Front',
        whatHappens: `Returns the FRONT value (${frontItem.value}) without removing it.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Front element is ${frontItem.value}.`,
        status: 'success',
      },
    };
  }

  rear(): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (size == 0) throw EmptyQueue',
      'return queue[rear]',
    ];

    if (this.count === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Queue',
            description: 'Queue is empty. No REAR element exists.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Queue is empty'),
          },
        ]),
        explanation: {
          operationName: 'REAR()',
          displayName: 'Inspect Rear',
          whatHappens: 'Checks if queue is empty before reading REAR.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Queue is empty.',
          status: 'warning',
        },
      };
    }

    const rearItem = this.slots[this.rearIdx]!;

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Inspect Rear',
          description: `REAR element is ${rearItem.value} at slot [${this.rearIdx}].`,
          activeLineIndex: 1,
          isComplete: true,
          stateSnapshot: this.getSnapshot(this.rearIdx, 'rear', `REAR: ${rearItem.value}`),
        },
      ]),
      explanation: {
        operationName: 'REAR()',
        displayName: 'Inspect Rear',
        whatHappens: `Returns the most recently enqueued value (${rearItem.value}) at REAR without modifying the queue.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Rear element is ${rearItem.value}.`,
        status: 'success',
      },
    };
  }

  isEmpty(): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    const empty = this.count === 0;
    const pseudocode = ['return size == 0'];

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Check Is Empty',
          description: `Queue size is ${this.count}. Is empty: ${empty}.`,
          activeLineIndex: 0,
          isComplete: true,
          stateSnapshot: this.getSnapshot(undefined, 'default', empty ? 'Queue is empty' : 'Queue is not empty'),
        },
      ]),
      explanation: {
        operationName: 'IS_EMPTY()',
        displayName: 'Is Empty Check',
        whatHappens: `Evaluates whether queue size is 0. Result: ${empty}.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: empty ? 'true: Queue is empty.' : `false: Queue contains ${this.count} item(s).`,
        status: 'idle',
      },
    };
  }

  isFull(): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    const full = this.isBounded && this.count >= this.capacity;
    const pseudocode = [
      'if (!isBounded) return false',
      'return size == capacity',
    ];

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Check Is Full',
          description: `Size is ${this.count}/${this.capacity}. Is full: ${full}.`,
          activeLineIndex: this.isBounded ? 1 : 0,
          isComplete: true,
          stateSnapshot: this.getSnapshot(undefined, 'default', full ? 'Queue is full' : 'Queue has space'),
        },
      ]),
      explanation: {
        operationName: 'IS_FULL()',
        displayName: 'Is Full Check',
        whatHappens: `Compares current size (${this.count}) with capacity (${this.capacity}). Result: ${full}.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: full
          ? `true: Queue is full (${this.capacity}/${this.capacity}).`
          : `false: ${this.capacity - this.count} free slot(s) remaining.`,
        status: full ? 'warning' : 'idle',
      },
    };
  }

  display(): { steps: AnimationStep<QueueStateSnapshot>[]; explanation: OperationExplanation } {
    if (this.count === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Queue',
            description: 'Queue is empty. Nothing to display.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Queue is empty'),
          },
        ]),
        explanation: {
          operationName: 'DISPLAY()',
          displayName: 'Display Queue',
          whatHappens: 'Queue is empty.',
          pseudocode: ['if (size == 0) print "Empty"'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Queue is empty.',
          status: 'idle',
        },
      };
    }

    const steps: AnimationStep<QueueStateSnapshot>[] = [];
    const pseudocode = ['for k = 0 to size - 1: print queue[(front + k) % capacity]'];

    for (let k = 0; k < this.count; k++) {
      const slotIdx = (this.frontIdx + k) % this.capacity;
      const item = this.slots[slotIdx]!;
      steps.push({
        stepNumber: k + 1,
        totalSteps: this.count + 1,
        title: `Scan Slot [${slotIdx}]`,
        description: `queue[${slotIdx}] = ${item.value} (${k === 0 ? 'FRONT' : k === this.count - 1 ? 'REAR' : `position ${k + 1}`}).`,
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(slotIdx, 'highlight', `Inspecting slot [${slotIdx}]`),
      });
    }

    steps.push({
      stepNumber: this.count + 1,
      totalSteps: this.count + 1,
      title: 'Display Complete',
      description: `Scanned all ${this.count} item(s) from FRONT to REAR in FIFO order.`,
      activeLineIndex: 0,
      isComplete: true,
      stateSnapshot: this.getSnapshot(undefined, 'default', `Displayed ${this.count} element(s).`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'DISPLAY()',
        displayName: 'Display Queue',
        whatHappens: 'Visits every occupied circular slot in FIFO order starting from FRONT.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'Linear scan of all n active elements.',
        },
        resultMessage: `Displayed ${this.count} item(s) from front to rear.`,
        status: 'success',
      },
    };
  }
}
