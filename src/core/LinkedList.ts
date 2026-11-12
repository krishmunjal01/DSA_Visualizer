import { AnimationStep, OperationExplanation } from '../types/dsa';
import { LLNodeData, LLStateSnapshot } from '../types/linkedList';

function finalizeSteps<T>(steps: AnimationStep<T>[]): AnimationStep<T>[] {
  const total = steps.length;
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
    totalSteps: total,
  }));
}

export class LinkedListNode<T = number> {
  private static nextId = 1;
  id: string;
  value: T;
  next: LinkedListNode<T> | null = null;

  constructor(value: T, id?: string) {
    this.value = value;
    this.id = id || `ll-node-${LinkedListNode.nextId++}`;
  }
}

export class SinglyLinkedList<T = number> {
  head: LinkedListNode<T> | null = null;
  tail: LinkedListNode<T> | null = null;
  size: number = 0;

  getSnapshot(
    highlightMap: Record<string, { state: LLNodeData['state']; label?: string }> = {},
    message?: string
  ): LLStateSnapshot {
    const nodes: LLNodeData[] = [];
    let curr = this.head;

    while (curr) {
      const hl = highlightMap[curr.id] || { state: 'default' };
      nodes.push({
        id: curr.id,
        value: curr.value as number | string,
        nextId: curr.next ? curr.next.id : null,
        state: hl.state,
        highlightLabel: hl.label,
      });
      curr = curr.next;
    }

    return {
      nodes,
      headId: this.head ? this.head.id : null,
      tailId: this.tail ? this.tail.id : null,
      size: this.size,
      message,
    };
  }

  insertAtEndDirect(value: T, id?: string): LinkedListNode<T> {
    const node = new LinkedListNode<T>(value, id);
    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      if (this.tail) {
        this.tail.next = node;
      }
      this.tail = node;
    }
    this.size++;
    return node;
  }

  clear(): void {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  insertAtBeginning(val: T): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'newNode = new Node(value)',
      'newNode.next = head',
      'head = newNode',
      'if (tail == null) tail = newNode',
      'size++',
    ];

    const newNode = new LinkedListNode<T>(val);
    const startSnap = this.getSnapshot();
    const wasEmpty = this.head === null;

    steps.push({
      stepNumber: 1,
      totalSteps: 4,
      title: 'Create New Node',
      description: `Allocated new node with value ${val}. Initial next pointer is null.`,
      activeLineIndex: 0,
      stateSnapshot: {
        ...startSnap,
        nodes: [
          {
            id: newNode.id,
            value: newNode.value as number | string,
            nextId: null,
            state: 'inserted',
            highlightLabel: 'newNode',
          },
          ...startSnap.nodes,
        ],
        message: `Created node (${val})`,
      },
    });

    newNode.next = this.head;
    steps.push({
      stepNumber: 2,
      totalSteps: 4,
      title: 'Link Next Pointer',
      description: `Set newNode.next to current head (${this.head ? this.head.value : 'null'}).`,
      activeLineIndex: 1,
      stateSnapshot: {
        ...startSnap,
        nodes: [
          {
            id: newNode.id,
            value: newNode.value as number | string,
            nextId: this.head ? this.head.id : null,
            state: 'active',
            highlightLabel: 'newNode.next',
          },
          ...startSnap.nodes,
        ],
        message: 'Linked newNode.next to current head',
      },
    });

    this.head = newNode;
    if (!this.tail) {
      this.tail = newNode;
    }
    this.size++;

    steps.push({
      stepNumber: 3,
      totalSteps: 4,
      title: 'Update Head Pointer',
      description: `Updated head pointer to the new node (${val}).`,
      activeLineIndex: wasEmpty ? 3 : 2,
      stateSnapshot: this.getSnapshot({
        [newNode.id]: { state: 'inserted', label: 'HEAD' },
      }),
    });

    steps.push({
      stepNumber: 4,
      totalSteps: 4,
      title: 'Insertion Complete',
      description: `Inserted ${val} at the beginning. Size is now ${this.size}.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `Inserted ${val} at head. Size: ${this.size}`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `INSERT_AT_BEGINNING(${val})`,
        displayName: 'Insert at Beginning',
        whatHappens: `Prepends a new node (${val}) to the front of the list and updates head.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Constant time because no traversal is required; head is updated directly.',
        },
        resultMessage: `Inserted ${val} at index 0.`,
        status: 'success',
      },
    };
  }

  insertAtEnd(val: T): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    if (!this.head) {
      return this.insertAtBeginning(val);
    }

    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'newNode = new Node(value)',
      'if (head == null) { head = tail = newNode; return; }',
      'tail.next = newNode',
      'tail = newNode',
      'size++',
    ];

    const newNode = new LinkedListNode<T>(val);
    const beforeSnap = this.getSnapshot();

    steps.push({
      stepNumber: 1,
      totalSteps: 3,
      title: 'Create New Node',
      description: `Allocated new node with value ${val}.`,
      activeLineIndex: 0,
      stateSnapshot: {
        ...beforeSnap,
        nodes: [
          ...beforeSnap.nodes,
          {
            id: newNode.id,
            value: newNode.value as number | string,
            nextId: null,
            state: 'inserted',
            highlightLabel: 'newNode',
          },
        ],
      },
    });

    const oldTailId = this.tail ? this.tail.id : '';
    if (this.tail) {
      this.tail.next = newNode;
    }

    steps.push({
      stepNumber: 2,
      totalSteps: 3,
      title: 'Link Tail Pointer',
      description: `Set current tail.next to the new node (${val}).`,
      activeLineIndex: 2,
      stateSnapshot: {
        nodes: [
          ...beforeSnap.nodes.map((n) =>
            n.id === oldTailId
              ? { ...n, nextId: newNode.id, state: 'active' as const, highlightLabel: 'tail.next' }
              : n
          ),
          {
            id: newNode.id,
            value: newNode.value as number | string,
            nextId: null,
            state: 'inserted' as const,
            highlightLabel: 'newNode',
          },
        ],
        headId: this.head.id,
        tailId: oldTailId,
        size: this.size,
      },
    });

    this.tail = newNode;
    this.size++;

    steps.push({
      stepNumber: 3,
      totalSteps: 3,
      title: 'Update Tail Reference',
      description: `Updated tail to (${val}). Total size: ${this.size}.`,
      activeLineIndex: 3,
      isComplete: true,
      stateSnapshot: this.getSnapshot({
        [newNode.id]: { state: 'inserted', label: 'TAIL' },
      }),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `INSERT_AT_END(${val})`,
        displayName: 'Insert at End',
        whatHappens: `Appends a new node (${val}) after the current tail and advances tail.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1) with tail pointer / O(n) without',
          timeWorst: 'O(1) with tail pointer / O(n) without',
          auxiliarySpace: 'O(1)',
          notes: 'Maintaining a tail reference allows O(1) appends instead of an O(n) traversal.',
        },
        resultMessage: `Appended ${val} at index ${this.size - 1}.`,
        status: 'success',
      },
    };
  }

  insertAtPosition(val: T, position: number): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    if (position < 0 || position > this.size) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Index Out of Bounds',
            description: `Position ${position} is invalid. Valid range is 0 to ${this.size}.`,
            activeLineIndex: 0,
            stateSnapshot: this.getSnapshot({}, `Invalid position: ${position}`),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: `INSERT_AT_POSITION(${val}, pos=${position})`,
          displayName: 'Insert at Position',
          whatHappens: `Index ${position} is outside the valid range [0, ${this.size}].`,
          pseudocode: ['if (pos < 0 || pos > size) throw OutOfBounds'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Error: Position ${position} is out of bounds (0-${this.size}).`,
          status: 'error',
        },
      };
    }

    if (position === 0) {
      return this.insertAtBeginning(val);
    }
    if (position === this.size) {
      return this.insertAtEnd(val);
    }

    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'newNode = new Node(value)',
      'curr = head; for i = 0 to pos - 2: curr = curr.next',
      'newNode.next = curr.next',
      'curr.next = newNode',
      'size++',
    ];

    const newNode = new LinkedListNode<T>(val);

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Create New Node',
      description: `Created node (${val}) to insert at index ${position}.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({}, `Ready to insert at index ${position}`),
    });

    let curr = this.head!;
    for (let i = 0; i < position - 1; i++) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Traverse Index ${i}`,
        description: `curr is at node (${curr.value}), index ${i}.`,
        activeLineIndex: 1,
        stateSnapshot: this.getSnapshot({
          [curr.id]: { state: 'comparing', label: `curr [${i}]` },
        }),
      });
      curr = curr.next!;
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Reached Predecessor',
      description: `Stopped at predecessor node (${curr.value}) at index ${position - 1}.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'active', label: 'prev' },
      }),
    });

    newNode.next = curr.next;
    curr.next = newNode;
    this.size++;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Rewire Pointers',
      description: 'Linked newNode.next = prev.next and updated prev.next = newNode.',
      activeLineIndex: 3,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'secondary', label: 'prev' },
        [newNode.id]: { state: 'inserted', label: 'newNode' },
      }),
    });

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Insertion Complete',
      description: `Inserted ${val} at position ${position}. Size is now ${this.size}.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot({
        [newNode.id]: { state: 'inserted', label: `pos: ${position}` },
      }),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `INSERT_AT_POS(${val}, ${position})`,
        displayName: 'Insert at Position',
        whatHappens: `Walks to index ${position - 1}, points newNode.next to curr.next, then updates curr.next to newNode.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1) (at index 0)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: `Traverses ${position} step(s) before rewiring pointers in O(1).`,
        },
        resultMessage: `Inserted ${val} at index ${position}.`,
        status: 'success',
      },
    };
  }

  deleteFromBeginning(): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    if (!this.head) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'List Underflow',
            description: 'Cannot delete from an empty list.',
            activeLineIndex: 0,
            stateSnapshot: this.getSnapshot({}, 'List is empty'),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: 'DELETE_FROM_BEGINNING()',
          displayName: 'Delete from Beginning',
          whatHappens: 'List is empty (head is null), so deletion is skipped.',
          pseudocode: ['if (head == null) throw Underflow', 'toDelete = head', 'head = head.next', 'size--'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Underflow: List is empty.',
          status: 'warning',
        },
      };
    }

    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'if (head == null) return',
      'toDelete = head',
      'head = head.next',
      'if (head == null) tail = null',
      'size--',
    ];

    const deletedVal = this.head.value;
    const deletedId = this.head.id;

    steps.push({
      stepNumber: 1,
      totalSteps: 3,
      title: 'Mark Head Node',
      description: `Targeting head node (${deletedVal}) for removal.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot({
        [deletedId]: { state: 'deleting', label: 'toDelete' },
      }),
    });

    this.head = this.head.next;
    const becameEmpty = this.head === null;
    if (becameEmpty) {
      this.tail = null;
    }
    this.size--;

    steps.push({
      stepNumber: 2,
      totalSteps: 3,
      title: 'Advance Head Pointer',
      description: `Moved head to ${this.head ? this.head.value : 'null'}.`,
      activeLineIndex: becameEmpty ? 3 : 2,
      stateSnapshot: this.getSnapshot(
        this.head ? { [this.head.id]: { state: 'active', label: 'new HEAD' } } : {},
        'Head updated'
      ),
    });

    steps.push({
      stepNumber: 3,
      totalSteps: 3,
      title: 'Deletion Complete',
      description: `Removed ${deletedVal}. Size is now ${this.size}.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `Removed ${deletedVal} from head.`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'DELETE_FROM_BEGINNING()',
        displayName: 'Delete from Beginning',
        whatHappens: 'Unlinks the first node by advancing head to head.next.',
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
          notes: 'Updates head directly without traversing the list.',
        },
        resultMessage: `Deleted ${deletedVal} from index 0.`,
        status: 'success',
      },
    };
  }

  deleteFromEnd(): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    if (!this.head) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'List Underflow',
            description: 'Cannot delete from an empty list.',
            activeLineIndex: 0,
            stateSnapshot: this.getSnapshot({}, 'List is empty'),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: 'DELETE_FROM_END()',
          displayName: 'Delete from End',
          whatHappens: 'List is empty, so deletion cannot proceed.',
          pseudocode: ['if (head == null) throw Underflow'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Underflow: List is empty.',
          status: 'warning',
        },
      };
    }

    if (this.size === 1) {
      return this.deleteFromBeginning();
    }

    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'curr = head',
      'while (curr.next != tail) { curr = curr.next }',
      'toDelete = tail',
      'curr.next = null',
      'tail = curr',
      'size--',
    ];

    const deletedVal = this.tail!.value;
    const deletedId = this.tail!.id;
    let curr = this.head;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Start at Head',
      description: 'Traversing from head to find the node before tail.',
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'comparing', label: 'curr' },
      }),
    });

    while (curr.next && curr.next !== this.tail) {
      curr = curr.next;
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Traversing',
        description: `Advancing curr to (${curr.value}).`,
        activeLineIndex: 1,
        stateSnapshot: this.getSnapshot({
          [curr.id]: { state: 'comparing', label: 'curr' },
          [deletedId]: { state: 'secondary', label: 'tail' },
        }),
      });
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Found Predecessor',
      description: `Node (${curr.value}) precedes tail (${deletedVal}).`,
      activeLineIndex: 2,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'active', label: 'new TAIL' },
        [deletedId]: { state: 'deleting', label: 'toDelete' },
      }),
    });

    curr.next = null;
    this.tail = curr;
    this.size--;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Unlink Tail',
      description: `Set curr.next = null and updated tail. Deleted ${deletedVal}.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot(
        { [this.tail.id]: { state: 'active', label: 'TAIL' } },
        `Deleted ${deletedVal} from end. Size: ${this.size}`
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'DELETE_FROM_END()',
        displayName: 'Delete from End',
        whatHappens: 'Walks from head to the second-to-last node, sets its next pointer to null, and updates tail.',
        pseudocode,
        complexity: {
          timeBest: 'O(1) (single element)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'Singly linked nodes lack back pointers, so finding the predecessor takes O(n).',
        },
        resultMessage: `Deleted ${deletedVal} from tail.`,
        status: 'success',
      },
    };
  }

  deleteByValue(val: T): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    if (!this.head) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'List Empty',
            description: `Cannot delete ${val} from an empty list.`,
            activeLineIndex: 0,
            stateSnapshot: this.getSnapshot({}, 'Empty list'),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: `DELETE_BY_VALUE(${val})`,
          displayName: 'Delete by Value',
          whatHappens: 'List is empty.',
          pseudocode: ['if (head == null) return false'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Value ${val} not found (empty list).`,
          status: 'warning',
        },
      };
    }

    if (this.head.value === val) {
      return this.deleteFromBeginning();
    }

    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'prev = head; curr = head.next',
      'while (curr != null && curr.val != target) { prev = curr; curr = curr.next }',
      'if (curr == null) return false // Not found',
      'prev.next = curr.next',
      'if (curr == tail) tail = prev',
      'size--',
    ];

    let prev = this.head;
    let curr = this.head.next;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Initialize Search Pointers',
      description: `Starting search for ${val} after head (${prev.value}).`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        [prev.id]: { state: 'secondary', label: 'prev' },
        ...(curr ? { [curr.id]: { state: 'comparing', label: 'curr' } } : {}),
      }),
    });

    while (curr && curr.value !== val) {
      prev = curr;
      curr = curr.next;
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Compare Node',
        description: curr
          ? `${curr.value} vs target ${val}.`
          : 'Reached end of list.',
        activeLineIndex: 1,
        stateSnapshot: this.getSnapshot({
          [prev.id]: { state: 'secondary', label: 'prev' },
          ...(curr ? { [curr.id]: { state: 'comparing', label: 'curr' } } : {}),
        }),
      });
    }

    if (!curr) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Target Not Found',
        description: `Traversed the list; value ${val} is not present.`,
        activeLineIndex: 2,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Value ${val} not found`),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `DELETE_BY_VALUE(${val})`,
          displayName: 'Delete by Value',
          whatHappens: `Scanned the list for ${val}, but no matching node exists.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Value ${val} not found in list.`,
          status: 'warning',
        },
      };
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Target Located',
      description: `Found node (${val}). Bypassing it via prev.next = curr.next.`,
      activeLineIndex: 3,
      stateSnapshot: this.getSnapshot({
        [prev.id]: { state: 'active', label: 'prev' },
        [curr.id]: { state: 'deleting', label: 'toDelete' },
      }),
    });

    const wasTail = curr === this.tail;
    prev.next = curr.next;
    if (wasTail) {
      this.tail = prev;
    }
    this.size--;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Node Unlinked',
      description: `Removed ${val}. Remaining nodes: ${this.size}.`,
      activeLineIndex: wasTail ? 4 : 5,
      isComplete: true,
      stateSnapshot: this.getSnapshot(
        { [prev.id]: { state: 'inserted', label: 'prev' } },
        `Deleted ${val}. Remaining: ${this.size}`
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `DELETE_BY_VALUE(${val})`,
        displayName: 'Delete by Value',
        whatHappens: `Finds ${val} and its predecessor, then updates prev.next to skip over the target node.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1) (at head)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'Requires linear scan to locate the value and its predecessor.',
        },
        resultMessage: `Deleted node with value ${val}.`,
        status: 'success',
      },
    };
  }

  search(val: T): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'curr = head; index = 0',
      'while (curr != null) {',
      '  if (curr.val == target) return index',
      '  curr = curr.next; index++',
      '}',
      'return -1 // Not found',
    ];

    if (!this.head) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty List',
            description: 'Cannot search inside an empty linked list.',
            activeLineIndex: 5,
            stateSnapshot: this.getSnapshot({}, 'List is empty'),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: `SEARCH(${val})`,
          displayName: 'Search Element',
          whatHappens: 'List is empty.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Target ${val} not found (empty list).`,
          status: 'warning',
        },
      };
    }

    let curr: LinkedListNode<T> | null = this.head;
    let idx = 0;
    let found = false;

    while (curr) {
      const isMatch = curr.value === val;

      if (isMatch) {
        found = true;
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: 'Target Found',
          description: `Matched target ${val} at index ${idx}.`,
          activeLineIndex: 2,
          isComplete: true,
          stateSnapshot: this.getSnapshot(
            { [curr.id]: { state: 'found', label: `FOUND [${idx}]` } },
            `Target ${val} found at index ${idx}`
          ),
        });
        break;
      }

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Check Index ${idx}`,
        description: `Node at index ${idx} is ${curr.value} != ${val}. Advancing to next.`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot({
          [curr.id]: { state: 'comparing', label: `curr [${idx}]` },
        }),
      });

      curr = curr.next;
      idx++;
    }

    if (!found) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Target Not Found',
        description: `Checked all ${this.size} node(s). Value ${val} is not in the list.`,
        activeLineIndex: 5,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Value ${val} not found`),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `SEARCH(${val})`,
          displayName: 'Search Element',
          whatHappens: `Sequentially checked each node against ${val} and reached null without a match.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1) (at head)',
            timeAverage: 'O(n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
            notes: 'Linked lists do not support O(1) random access by index.',
          },
          resultMessage: `Target ${val} was not found.`,
          status: 'warning',
        },
      };
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `SEARCH(${val})`,
        displayName: 'Search Element',
        whatHappens: `Walked node by node from head until finding ${val}.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1) (at head)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: `Located target in ${idx + 1} comparison(s).`,
        },
        resultMessage: `Target ${val} found at index ${idx}.`,
        status: 'success',
      },
    };
  }

  traverse(): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'curr = head',
      'while (curr != null) {',
      '  visit(curr.val)',
      '  curr = curr.next',
      '}',
    ];

    if (!this.head) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty List',
            description: 'List is empty. Nothing to traverse.',
            activeLineIndex: 1,
            stateSnapshot: this.getSnapshot({}, 'Empty list'),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: 'TRAVERSE()',
          displayName: 'Traverse List',
          whatHappens: 'Empty list has no nodes to visit.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'List is empty.',
          status: 'idle',
        },
      };
    }

    let curr: LinkedListNode<T> | null = this.head;
    let idx = 0;
    const visitedIds: string[] = [];

    while (curr) {
      visitedIds.push(curr.id);
      const hl: Record<string, { state: LLNodeData['state']; label?: string }> = {};
      visitedIds.forEach((id) => {
        hl[id] = { state: 'secondary' };
      });
      hl[curr.id] = { state: 'active', label: `visit [${idx}]` };

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Visit Node [${idx}]`,
        description: `Visited node [${idx}] = ${curr.value}.`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot(hl, `Visited: ${curr.value}`),
      });

      curr = curr.next;
      idx++;
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Traversal Complete',
      description: `Visited all ${this.size} node(s) from head to tail.`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `Traversed ${this.size} node(s).`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'TRAVERSE()',
        displayName: 'Traverse List',
        whatHappens: 'Walks sequentially from head to tail, visiting each node once.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'Visits every node once.',
        },
        resultMessage: `Traversed ${this.size} element(s).`,
        status: 'success',
      },
    };
  }

  reverse(): { steps: AnimationStep<LLStateSnapshot>[]; explanation: OperationExplanation } {
    if (!this.head || this.size <= 1) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Reverse Complete',
            description: 'List has 0 or 1 node, so reversing leaves it unchanged.',
            activeLineIndex: 0,
            stateSnapshot: this.getSnapshot({}, 'List unchanged'),
            isComplete: true,
          },
        ]),
        explanation: {
          operationName: 'REVERSE()',
          displayName: 'Reverse Linked List',
          whatHappens: 'A list with fewer than 2 nodes is already reversed.',
          pseudocode: ['if (head == null || head.next == null) return head'],
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'List reversed (0 or 1 element).',
          status: 'idle',
        },
      };
    }

    const steps: AnimationStep<LLStateSnapshot>[] = [];
    const pseudocode = [
      'prev = null; curr = head',
      'while (curr != null) {',
      '  nextTemp = curr.next',
      '  curr.next = prev',
      '  prev = curr; curr = nextTemp',
      '}',
      'tail = head; head = prev',
    ];

    const allNodes: LinkedListNode<T>[] = [];
    {
      let n: LinkedListNode<T> | null = this.head;
      while (n) {
        allNodes.push(n);
        n = n.next;
      }
    }

    const buildMidReverseSnapshot = (
      highlightMap: Record<string, { state: LLNodeData['state']; label?: string }>,
      headId: string | null,
      tailId: string | null,
      message?: string
    ): LLStateSnapshot => ({
      nodes: allNodes.map((node) => {
        const hl = highlightMap[node.id] || { state: 'default' };
        return {
          id: node.id,
          value: node.value as number | string,
          nextId: node.next ? node.next.id : null,
          state: hl.state,
          highlightLabel: hl.label,
        };
      }),
      headId,
      tailId,
      size: this.size,
      message,
    });

    let prev: LinkedListNode<T> | null = null;
    let curr: LinkedListNode<T> | null = this.head;
    const oldHead = this.head;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Initialize Pointers',
      description: 'Set prev = null and curr = head.',
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'active', label: 'curr (head)' },
      }),
    });

    while (curr) {
      const nextTemp: LinkedListNode<T> | null = curr.next;

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Flip Pointer (${curr.value})`,
        description: `Save nextTemp = ${nextTemp ? nextTemp.value : 'null'}, then point (${curr.value}).next to ${prev ? prev.value : 'null'}.`,
        activeLineIndex: 3,
        stateSnapshot: buildMidReverseSnapshot(
          {
            [curr.id]: { state: 'comparing', label: 'curr' },
            ...(prev ? { [prev.id]: { state: 'secondary', label: 'prev' } } : {}),
            ...(nextTemp ? { [nextTemp.id]: { state: 'default', label: 'nextTemp' } } : {}),
          },
          oldHead.id,
          this.tail!.id
        ),
      });

      curr.next = prev;
      prev = curr;
      curr = nextTemp;

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Advance prev & curr',
        description: `Moved prev to (${prev.value}) and curr to (${curr ? curr.value : 'null'}).`,
        activeLineIndex: 4,
        stateSnapshot: buildMidReverseSnapshot(
          {
            [prev.id]: { state: 'active', label: 'prev' },
            ...(curr ? { [curr.id]: { state: 'comparing', label: 'curr' } } : {}),
          },
          oldHead.id,
          this.tail!.id
        ),
      });
    }

    this.tail = oldHead;
    this.head = prev;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Reverse Complete',
      description: `Updated head to (${this.head!.value}) and tail to (${this.tail!.value}).`,
      activeLineIndex: 6,
      isComplete: true,
      stateSnapshot: this.getSnapshot(
        {
          [this.head!.id]: { state: 'inserted', label: 'HEAD' },
          [this.tail!.id]: { state: 'inserted', label: 'TAIL' },
        },
        'List reversed in-place.'
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'REVERSE()',
        displayName: 'Reverse Linked List (In-Place)',
        whatHappens: 'Flips each node.next pointer backward in one pass using prev, curr, and nextTemp without allocating extra nodes.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'Single O(n) pass with three pointer variables.',
        },
        resultMessage: `Reversed ${this.size} node(s) in-place.`,
        status: 'success',
      },
    };
  }
}
