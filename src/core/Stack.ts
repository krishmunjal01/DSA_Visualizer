import { AnimationStep, OperationExplanation } from '../types/dsa';
import { StackItemData, StackStateSnapshot } from '../types/stack';

function finalizeSteps<T>(steps: AnimationStep<T>[]): AnimationStep<T>[] {
  const total = steps.length;
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
    totalSteps: total,
  }));
}

export class StackItem<T = number | string> {
  private static nextId = 1;
  id: string;
  value: T;

  constructor(value: T, id?: string) {
    this.value = value;
    this.id = id || `stack-item-${StackItem.nextId++}`;
  }
}

export class Stack<T = number | string> {
  private items: StackItem<T>[] = [];
  private capacity: number;
  private isBounded: boolean;

  constructor(capacity: number = 7, isBounded: boolean = true) {
    this.capacity = capacity;
    this.isBounded = isBounded;
  }

  setCapacity(capacity: number, isBounded: boolean = true): boolean {
    if (isBounded && this.items.length > capacity) {
      return false;
    }
    this.capacity = capacity;
    this.isBounded = isBounded;
    return true;
  }

  getCapacity(): number {
    return this.capacity;
  }

  getIsBounded(): boolean {
    return this.isBounded;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  getSnapshot(
    highlightIndex?: number,
    stateType: StackItemData['state'] = 'default',
    message?: string
  ): StackStateSnapshot {
    return {
      items: this.items.map((item, idx) => ({
        id: item.id,
        value: item.value as number | string,
        index: idx,
        state:
          idx === highlightIndex
            ? stateType
            : idx === this.items.length - 1
              ? 'top'
              : 'default',
      })),
      topIndex: this.items.length - 1,
      capacity: this.capacity,
      isBounded: this.isBounded,
      message,
    };
  }

  pushDirect(value: T, id?: string): void {
    if (this.isBounded && this.items.length >= this.capacity) return;
    this.items.push(new StackItem(value, id));
  }

  push(val: T): { steps: AnimationStep<StackStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (isBounded && top == capacity - 1) throw Overflow',
      'top = top + 1',
      'stack[top] = value',
      'return success',
    ];

    if (this.isBounded && this.items.length >= this.capacity) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Stack Overflow',
            description: `Cannot push ${val}. Stack is full at maximum capacity (${this.capacity}).`,
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', `Overflow: Capacity ${this.capacity} reached`),
          },
        ]),
        explanation: {
          operationName: `PUSH(${val})`,
          displayName: 'Push Operation',
          whatHappens: `Checked capacity limit. Current size (${this.items.length}) equals max capacity (${this.capacity}), so the push is rejected.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
            notes: 'Checking bounds and reporting overflow takes constant time.',
          },
          resultMessage: `Overflow: Stack is full (capacity ${this.capacity}).`,
          status: 'error',
        },
      };
    }

    const steps: AnimationStep<StackStateSnapshot>[] = [];
    const newItem = new StackItem<T>(val);

    steps.push({
      stepNumber: 1,
      totalSteps: 3,
      title: 'Check Capacity',
      description: `Stack has space (${this.items.length}/${this.capacity} slots used).`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot(undefined, 'default', 'Capacity check passed'),
    });

    const newTopIdx = this.items.length;
    this.items.push(newItem);

    steps.push({
      stepNumber: 2,
      totalSteps: 3,
      title: `Insert Element (${val})`,
      description: `Placed ${val} at index ${newTopIdx}.`,
      activeLineIndex: 2,
      stateSnapshot: {
        ...this.getSnapshot(),
        items: this.items.map((it, idx) => ({
          id: it.id,
          value: it.value as number | string,
          index: idx,
          state: idx === newTopIdx ? 'pushing' : 'default',
        })),
        message: `Pushed ${val}`,
      },
    });

    steps.push({
      stepNumber: 3,
      totalSteps: 3,
      title: 'Update Top Pointer',
      description: `TOP now points to index ${newTopIdx} (${val}). Size is ${this.items.length}.`,
      activeLineIndex: 3,
      isComplete: true,
      stateSnapshot: this.getSnapshot(newTopIdx, 'top', `Pushed ${val}. TOP at index ${newTopIdx}.`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `PUSH(${val})`,
        displayName: 'Push to Stack',
        whatHappens: `Inserts ${val} onto the top of the stack and advances the TOP pointer.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Insertion happens directly at the top index without shifting elements.',
        },
        resultMessage: `Pushed ${val} (TOP at index ${newTopIdx}).`,
        status: 'success',
      },
    };
  }

  pop(): { steps: AnimationStep<StackStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (top == -1) throw Underflow',
      'val = stack[top]',
      'top = top - 1',
      'return val',
    ];

    if (this.items.length === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Stack Underflow',
            description: 'Cannot pop from an empty stack (TOP = -1).',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Stack Underflow'),
          },
        ]),
        explanation: {
          operationName: 'POP()',
          displayName: 'Pop Operation',
          whatHappens: 'Stack is empty (TOP = -1), so there is no element to remove.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Underflow: Stack is empty.',
          status: 'warning',
        },
      };
    }

    const steps: AnimationStep<StackStateSnapshot>[] = [];
    const topIdx = this.items.length - 1;
    const poppedItem = this.items[topIdx];

    steps.push({
      stepNumber: 1,
      totalSteps: 3,
      title: 'Read Top Element',
      description: `Element at TOP is ${poppedItem.value} (index ${topIdx}).`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot(topIdx, 'popping', `Removing ${poppedItem.value}`),
    });

    this.items.pop();
    const newTopIdx = this.items.length - 1;

    steps.push({
      stepNumber: 2,
      totalSteps: 3,
      title: 'Decrement Top',
      description: `Removed ${poppedItem.value}. TOP moved to index ${newTopIdx}.`,
      activeLineIndex: 2,
      stateSnapshot: this.getSnapshot(newTopIdx >= 0 ? newTopIdx : undefined, 'top', `Removed ${poppedItem.value}`),
    });

    steps.push({
      stepNumber: 3,
      totalSteps: 3,
      title: 'Pop Complete',
      description: `Popped ${poppedItem.value}. Remaining elements: ${this.items.length}.`,
      activeLineIndex: 3,
      isComplete: true,
      stateSnapshot: this.getSnapshot(undefined, 'default', `Popped ${poppedItem.value}`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'POP()',
        displayName: 'Pop from Stack',
        whatHappens: `Removes and returns the most recently pushed item (${poppedItem.value}) following LIFO order.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Deletion strictly removes the element at TOP.',
        },
        resultMessage: `Popped ${poppedItem.value} from stack.`,
        status: 'success',
      },
    };
  }

  peek(): { steps: AnimationStep<StackStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'if (top == -1) throw EmptyStack',
      'return stack[top]',
    ];

    if (this.items.length === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Stack',
            description: 'Stack is empty. No top element to inspect.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Stack is empty'),
          },
        ]),
        explanation: {
          operationName: 'PEEK()',
          displayName: 'Peek / Top',
          whatHappens: 'Checks if the stack is empty before reading the top element.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Stack is empty.',
          status: 'warning',
        },
      };
    }

    const topIdx = this.items.length - 1;
    const topItem = this.items[topIdx];

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Peek Top Element',
          description: `Top element is ${topItem.value} at index ${topIdx}. Stack is unchanged.`,
          activeLineIndex: 1,
          isComplete: true,
          stateSnapshot: this.getSnapshot(topIdx, 'peeking', `Peek: ${topItem.value}`),
        },
      ]),
      explanation: {
        operationName: 'PEEK()',
        displayName: 'Peek / Top',
        whatHappens: `Reads the top value (${topItem.value}) without removing it.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Direct index lookup at stack[top].',
        },
        resultMessage: `Top element is ${topItem.value}.`,
        status: 'success',
      },
    };
  }

  isEmpty(): { steps: AnimationStep<StackStateSnapshot>[]; explanation: OperationExplanation } {
    const empty = this.items.length === 0;
    const pseudocode = ['return top == -1'];

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Check Is Empty',
          description: `top == -1 evaluates to ${empty} (${this.items.length} element(s)).`,
          activeLineIndex: 0,
          isComplete: true,
          stateSnapshot: this.getSnapshot(undefined, 'default', empty ? 'Stack is empty' : 'Stack is not empty'),
        },
      ]),
      explanation: {
        operationName: 'IS_EMPTY()',
        displayName: 'Is Empty Check',
        whatHappens: `Checks whether TOP is -1 (size is 0). Result: ${empty}.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: empty ? 'true: Stack is empty.' : `false: Stack has ${this.items.length} item(s).`,
        status: 'idle',
      },
    };
  }

  isFull(): { steps: AnimationStep<StackStateSnapshot>[]; explanation: OperationExplanation } {
    const full = this.isBounded && this.items.length >= this.capacity;
    const pseudocode = [
      'if (!isBounded) return false',
      'return top == capacity - 1',
    ];

    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Check Is Full',
          description: `Size is ${this.items.length}/${this.capacity}. Is full: ${full}.`,
          activeLineIndex: this.isBounded ? 1 : 0,
          isComplete: true,
          stateSnapshot: this.getSnapshot(undefined, 'default', full ? 'Stack is full' : 'Stack has space'),
        },
      ]),
      explanation: {
        operationName: 'IS_FULL()',
        displayName: 'Is Full Check',
        whatHappens: `Compares current count (${this.items.length}) against capacity (${this.capacity}). Result: ${full}.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: full
          ? `true: Stack is full (${this.capacity}/${this.capacity}).`
          : `false: ${this.capacity - this.items.length} free slot(s) remaining.`,
        status: full ? 'warning' : 'idle',
      },
    };
  }

  display(): { steps: AnimationStep<StackStateSnapshot>[]; explanation: OperationExplanation } {
    if (this.items.length === 0) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Stack',
            description: 'Stack is empty. Nothing to display.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot(undefined, 'default', 'Stack is empty'),
          },
        ]),
        explanation: {
          operationName: 'DISPLAY()',
          displayName: 'Display Stack',
          whatHappens: 'Stack has no elements.',
          pseudocode: ['if (top == -1) print "Empty"'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Stack is empty.',
          status: 'idle',
        },
      };
    }

    const steps: AnimationStep<StackStateSnapshot>[] = [];
    const pseudocode = ['for i = top down to 0: print stack[i]'];

    for (let i = this.items.length - 1; i >= 0; i--) {
      steps.push({
        stepNumber: this.items.length - i,
        totalSteps: this.items.length + 1,
        title: `Scan Index ${i}`,
        description: `stack[${i}] = ${this.items[i].value} (${i === this.items.length - 1 ? 'TOP' : `depth ${this.items.length - 1 - i}`}).`,
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(i, 'highlight', `Inspecting index ${i}`),
      });
    }

    steps.push({
      stepNumber: this.items.length + 1,
      totalSteps: this.items.length + 1,
      title: 'Display Complete',
      description: `Scanned all ${this.items.length} item(s) from TOP to bottom.`,
      activeLineIndex: 0,
      isComplete: true,
      stateSnapshot: this.getSnapshot(undefined, 'default', `Displayed ${this.items.length} element(s).`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'DISPLAY()',
        displayName: 'Display Stack',
        whatHappens: 'Traverses the stack from top to bottom (LIFO order) and reads each element.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'Inspects every element once.',
        },
        resultMessage: `Displayed ${this.items.length} item(s) from top to bottom.`,
        status: 'success',
      },
    };
  }
}
