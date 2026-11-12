import { AnimationStep, OperationExplanation } from '../types/dsa';
import { BSTNodeData, BSTStateSnapshot } from '../types/bst';

function finalizeSteps<T>(steps: AnimationStep<T>[]): AnimationStep<T>[] {
  const total = steps.length;
  return steps.map((step, index) => ({
    ...step,
    stepNumber: index + 1,
    totalSteps: total,
  }));
}

export class BSTNode {
  private static nextId = 1;
  id: string;
  value: number;
  left: BSTNode | null = null;
  right: BSTNode | null = null;
  parent: BSTNode | null = null;

  constructor(value: number, id?: string) {
    this.value = value;
    this.id = id || `bst-node-${BSTNode.nextId++}`;
  }
}

export class BinarySearchTree {
  root: BSTNode | null = null;
  private nodeCount: number = 0;

  size(): number {
    return this.nodeCount;
  }

  clear(): void {
    this.root = null;
    this.nodeCount = 0;
  }

  // Assign X coordinates by in-order rank so branches never cross or overlap.
  private computeLayout(): Record<string, { x: number; y: number; level: number }> {
    const layout: Record<string, { x: number; y: number; level: number }> = {};
    if (!this.root) return layout;

    const inorderNodes: { node: BSTNode; level: number }[] = [];

    const traverse = (node: BSTNode | null, level: number) => {
      if (!node) return;
      traverse(node.left, level + 1);
      inorderNodes.push({ node, level });
      traverse(node.right, level + 1);
    };

    traverse(this.root, 0);

    const total = inorderNodes.length;
    const canvasWidth = Math.max(750, total * 68);
    const startX = 60;
    const stepX = total > 1 ? (canvasWidth - 120) / (total - 1) : 0;

    inorderNodes.forEach((item, idx) => {
      layout[item.node.id] = {
        x: total === 1 ? canvasWidth / 2 : startX + idx * stepX,
        y: 60 + item.level * 80,
        level: item.level,
      };
    });

    return layout;
  }

  getHeight(node: BSTNode | null = this.root): number {
    if (!node) return 0;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  getSnapshot(
    highlightMap: Record<string, { state: BSTNodeData['state']; label?: string }> = {},
    message?: string
  ): BSTStateSnapshot {
    const layout = this.computeLayout();
    const nodes: Record<string, BSTNodeData> = {};

    const collect = (node: BSTNode | null) => {
      if (!node) return;
      const hl = highlightMap[node.id] || { state: 'default' };
      const pos = layout[node.id] || { x: 375, y: 60, level: 0 };

      nodes[node.id] = {
        id: node.id,
        value: node.value,
        leftId: node.left ? node.left.id : null,
        rightId: node.right ? node.right.id : null,
        parentId: node.parent ? node.parent.id : null,
        x: pos.x,
        y: pos.y,
        level: pos.level,
        state: hl.state,
        highlightLabel: hl.label,
      };

      collect(node.left);
      collect(node.right);
    };

    collect(this.root);

    return {
      nodes,
      rootId: this.root ? this.root.id : null,
      size: this.nodeCount,
      height: this.getHeight(),
      message,
    };
  }

  insertDirect(val: number): BSTNode | null {
    if (!this.root) {
      this.root = new BSTNode(val);
      this.nodeCount = 1;
      return this.root;
    }

    let curr: BSTNode | null = this.root;
    while (curr) {
      if (val === curr.value) return null;
      if (val < curr.value) {
        if (!curr.left) {
          const newNode = new BSTNode(val);
          newNode.parent = curr;
          curr.left = newNode;
          this.nodeCount++;
          return newNode;
        }
        curr = curr.left;
      } else {
        if (!curr.right) {
          const newNode = new BSTNode(val);
          newNode.parent = curr;
          curr.right = newNode;
          this.nodeCount++;
          return newNode;
        }
        curr = curr.right;
      }
    }
    return null;
  }

  insert(val: number): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'newNode = new Node(value)',
      'if (root == null) { root = newNode; return; }',
      'curr = root',
      'while (curr != null) {',
      '  if (val == curr.val) return duplicateError',
      '  if (val < curr.val) {',
      '    if (curr.left == null) { curr.left = newNode; break; }',
      '    curr = curr.left',
      '  } else {',
      '    if (curr.right == null) { curr.right = newNode; break; }',
      '    curr = curr.right',
      '  }',
      '}',
    ];

    const steps: AnimationStep<BSTStateSnapshot>[] = [];

    if (!this.root) {
      this.root = new BSTNode(val);
      this.nodeCount = 1;

      steps.push({
        stepNumber: 1,
        totalSteps: 2,
        title: 'Tree is Empty',
        description: `Root is null. Setting ${val} as the tree root.`,
        activeLineIndex: 1,
        stateSnapshot: this.getSnapshot(
          { [this.root.id]: { state: 'inserting', label: 'New Root' } },
          `Set ${val} as root`
        ),
      });

      steps.push({
        stepNumber: 2,
        totalSteps: 2,
        title: 'Root Inserted',
        description: `Node (${val}) is now the root.`,
        activeLineIndex: 1,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Inserted ${val} as root.`),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `INSERT(${val})`,
          displayName: 'Insert Node into BST',
          whatHappens: `The tree was empty, so ${val} became the root node.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
            notes: 'Inserting into an empty tree is O(1).',
          },
          resultMessage: `Inserted ${val} as root.`,
          status: 'success',
        },
      };
    }

    let curr: BSTNode | null = this.root;
    let duplicate = false;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Start at Root',
      description: `Comparing ${val} with root (${curr.value}).`,
      activeLineIndex: 2,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'comparing', label: `Compare ${curr.value}` },
      }),
    });

    while (curr) {
      if (val === curr.value) {
        duplicate = true;
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: 'Duplicate Key',
          description: `Value ${val} already exists in the BST. Insertion skipped.`,
          activeLineIndex: 4,
          isComplete: true,
          stateSnapshot: this.getSnapshot(
            { [curr.id]: { state: 'active', label: 'Duplicate' } },
            `Duplicate key ${val} rejected`
          ),
        });
        break;
      }

      if (val < curr.value) {
        if (!curr.left) {
          const newNode = new BSTNode(val);
          newNode.parent = curr;
          curr.left = newNode;
          this.nodeCount++;

          steps.push({
            stepNumber: 1,
            totalSteps: 1,
            title: 'Insert Left Child',
            description: `${val} < ${curr.value} and left is empty. Attached ${val} as left child of ${curr.value}.`,
            activeLineIndex: 6,
            stateSnapshot: this.getSnapshot({
              [curr.id]: { state: 'active', label: 'Parent' },
              [newNode.id]: { state: 'inserting', label: `New (${val})` },
            }),
          });

          steps.push({
            stepNumber: 1,
            totalSteps: 1,
            title: 'Insertion Complete',
            description: `Inserted ${val}. Size: ${this.nodeCount}, Height: ${this.getHeight()}.`,
            activeLineIndex: 6,
            isComplete: true,
            stateSnapshot: this.getSnapshot(
              { [newNode.id]: { state: 'inserting', label: 'Inserted' } },
              `Inserted ${val}`
            ),
          });
          break;
        } else {
          steps.push({
            stepNumber: 1,
            totalSteps: 1,
            title: `Go Left (${val} < ${curr.value})`,
            description: `${val} < ${curr.value}, moving to left child (${curr.left.value}).`,
            activeLineIndex: 7,
            stateSnapshot: this.getSnapshot({
              [curr.left.id]: { state: 'comparing', label: `Compare ${curr.left.value}` },
            }),
          });
          curr = curr.left;
        }
      } else {
        if (!curr.right) {
          const newNode = new BSTNode(val);
          newNode.parent = curr;
          curr.right = newNode;
          this.nodeCount++;

          steps.push({
            stepNumber: 1,
            totalSteps: 1,
            title: 'Insert Right Child',
            description: `${val} > ${curr.value} and right is empty. Attached ${val} as right child of ${curr.value}.`,
            activeLineIndex: 9,
            stateSnapshot: this.getSnapshot({
              [curr.id]: { state: 'active', label: 'Parent' },
              [newNode.id]: { state: 'inserting', label: `New (${val})` },
            }),
          });

          steps.push({
            stepNumber: 1,
            totalSteps: 1,
            title: 'Insertion Complete',
            description: `Inserted ${val}. Size: ${this.nodeCount}, Height: ${this.getHeight()}.`,
            activeLineIndex: 9,
            isComplete: true,
            stateSnapshot: this.getSnapshot(
              { [newNode.id]: { state: 'inserting', label: 'Inserted' } },
              `Inserted ${val}`
            ),
          });
          break;
        } else {
          steps.push({
            stepNumber: 1,
            totalSteps: 1,
            title: `Go Right (${val} > ${curr.value})`,
            description: `${val} > ${curr.value}, moving to right child (${curr.right.value}).`,
            activeLineIndex: 10,
            stateSnapshot: this.getSnapshot({
              [curr.right.id]: { state: 'comparing', label: `Compare ${curr.right.value}` },
            }),
          });
          curr = curr.right;
        }
      }
    }

    if (duplicate) {
      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `INSERT(${val})`,
          displayName: 'Insert Node into BST',
          whatHappens: `BST keys must be distinct. Value ${val} is already in the tree.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Duplicate key ${val} already exists.`,
          status: 'warning',
        },
      };
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `INSERT(${val})`,
        displayName: 'Insert Node into BST',
        whatHappens: 'Compares against nodes from root down (left if smaller, right if larger) and inserts at the first empty child link.',
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(n) (skewed tree)',
          auxiliarySpace: 'O(1)',
          notes: 'Height is O(log n) when balanced and O(n) when degenerate.',
        },
        resultMessage: `Inserted ${val}. Total nodes: ${this.nodeCount}.`,
        status: 'success',
      },
    };
  }

  search(val: number): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'curr = root',
      'while (curr != null) {',
      '  if (val == curr.val) return curr // Found',
      '  if (val < curr.val) curr = curr.left',
      '  else curr = curr.right',
      '}',
      'return null // Not found',
    ];

    const steps: AnimationStep<BSTStateSnapshot>[] = [];

    if (!this.root) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Tree',
            description: 'BST is empty.',
            activeLineIndex: 6,
            isComplete: true,
            stateSnapshot: this.getSnapshot({}, 'Tree is empty'),
          },
        ]),
        explanation: {
          operationName: `SEARCH(${val})`,
          displayName: 'Search Node in BST',
          whatHappens: 'Tree is empty.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Value ${val} not found in empty tree.`,
          status: 'warning',
        },
      };
    }

    let curr: BSTNode | null = this.root;
    let found = false;

    while (curr) {
      if (curr.value === val) {
        found = true;
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: 'Node Found',
          description: `Matched ${curr.value} == ${val}.`,
          activeLineIndex: 2,
          isComplete: true,
          stateSnapshot: this.getSnapshot(
            { [curr.id]: { state: 'found', label: `Found (${val})` } },
            `Found ${val}`
          ),
        });
        break;
      }

      if (val < curr.value) {
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: `Compare (${curr.value})`,
          description: `${val} < ${curr.value}: moving to left subtree.`,
          activeLineIndex: 3,
          stateSnapshot: this.getSnapshot({
            [curr.id]: { state: 'comparing', label: `${val} < ${curr.value}` },
          }),
        });
        curr = curr.left;
      } else {
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: `Compare (${curr.value})`,
          description: `${val} > ${curr.value}: moving to right subtree.`,
          activeLineIndex: 4,
          stateSnapshot: this.getSnapshot({
            [curr.id]: { state: 'comparing', label: `${val} > ${curr.value}` },
          }),
        });
        curr = curr.right;
      }
    }

    if (!found) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Not Found',
        description: `Reached null. Value ${val} does not exist in the BST.`,
        activeLineIndex: 6,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Key ${val} not found`),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `SEARCH(${val})`,
          displayName: 'Search Node in BST',
          whatHappens: `Followed BST comparisons down to a null child without finding ${val}.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1) (at root)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Target ${val} not found.`,
          status: 'warning',
        },
      };
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `SEARCH(${val})`,
        displayName: 'Search Node in BST',
        whatHappens: `Discards half the remaining tree at each step by comparing ${val} against the current node.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1) (at root)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
          notes: 'O(log n) average on balanced trees.',
        },
        resultMessage: `Found ${val} in the BST.`,
        status: 'success',
      },
    };
  }

  delete(val: number): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation } {
    const pseudocode = [
      'node = search(val)',
      'if (node == null) return false // Not found',
      '// Case 1: Leaf node (0 children)',
      'if (node.left == null && node.right == null) unlink(node)',
      '// Case 2: One child',
      'else if (node.left == null || node.right == null) spliceChild(node)',
      '// Case 3: Two children',
      'else { succ = min(node.right); node.val = succ.val; delete(succ); }',
    ];

    const steps: AnimationStep<BSTStateSnapshot>[] = [];

    if (!this.root) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Tree',
            description: `Cannot delete ${val} from an empty tree.`,
            activeLineIndex: 1,
            isComplete: true,
            stateSnapshot: this.getSnapshot({}, 'Empty tree'),
          },
        ]),
        explanation: {
          operationName: `DELETE(${val})`,
          displayName: 'Delete Node from BST',
          whatHappens: 'Tree is empty.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Cannot delete from empty tree.',
          status: 'warning',
        },
      };
    }

    let curr: BSTNode | null = this.root;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Start Search',
      description: `Searching for ${val} starting at root (${curr.value}).`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'comparing', label: `Find ${val}` },
      }),
    });

    while (curr && curr.value !== val) {
      curr = val < curr.value ? curr.left : curr.right;
      if (curr) {
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: 'Traverse',
          description: `Checking node (${curr.value}).`,
          activeLineIndex: 0,
          stateSnapshot: this.getSnapshot({
            [curr.id]: { state: 'comparing', label: `Compare ${curr.value}` },
          }),
        });
      }
    }

    if (!curr) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Target Not Found',
        description: `Value ${val} is not in the tree.`,
        activeLineIndex: 1,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Value ${val} not found`),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `DELETE(${val})`,
          displayName: 'Delete Node from BST',
          whatHappens: `Searched for ${val} but it is not present in the BST.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Target ${val} not found.`,
          status: 'warning',
        },
      };
    }

    const targetNode = curr;

    if (!targetNode.left && !targetNode.right) {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Case 1: Leaf Node',
        description: `Node (${targetNode.value}) has no children; unlinking it from its parent.`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot({
          [targetNode.id]: { state: 'deleting', label: 'Delete Leaf' },
        }),
      });

      this.replaceNodeInParent(targetNode, null);
      this.nodeCount--;

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Leaf Removed',
        description: `Removed leaf node (${val}).`,
        activeLineIndex: 3,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Deleted leaf ${val}`),
      });
    } else if (!targetNode.left || !targetNode.right) {
      const child = targetNode.left ? targetNode.left : targetNode.right!;
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Case 2: One Child',
        description: `Node (${targetNode.value}) has one child (${child.value}); splicing child into parent.`,
        activeLineIndex: 5,
        stateSnapshot: this.getSnapshot({
          [targetNode.id]: { state: 'deleting', label: 'Delete' },
          [child.id]: { state: 'active', label: 'Promote' },
        }),
      });

      this.replaceNodeInParent(targetNode, child);
      this.nodeCount--;

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Child Promoted',
        description: `Replaced ${val} with child (${child.value}).`,
        activeLineIndex: 5,
        isComplete: true,
        stateSnapshot: this.getSnapshot(
          { [child.id]: { state: 'default', label: 'Promoted' } },
          `Deleted ${val}, promoted ${child.value}`
        ),
      });
    } else {
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Case 3: Two Children',
        description: `Node (${targetNode.value}) has two children. Finding in-order successor in right subtree.`,
        activeLineIndex: 7,
        stateSnapshot: this.getSnapshot({
          [targetNode.id]: { state: 'deleting', label: 'Target' },
          [targetNode.right.id]: { state: 'comparing', label: 'Right Tree' },
        }),
      });

      let successor = targetNode.right;
      while (successor.left) {
        successor = successor.left;
      }

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Found In-Order Successor',
        description: `Smallest key in right subtree is (${successor.value}).`,
        activeLineIndex: 7,
        stateSnapshot: this.getSnapshot({
          [targetNode.id]: { state: 'deleting', label: 'Target' },
          [successor.id]: { state: 'active', label: `Succ (${successor.value})` },
        }),
      });

      const successorVal = successor.value;
      targetNode.value = successorVal;

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Copy Successor Value',
        description: `Copied ${successorVal} into target node; now unlinking original successor node.`,
        activeLineIndex: 7,
        stateSnapshot: this.getSnapshot({
          [targetNode.id]: { state: 'active', label: `Copied ${successorVal}` },
          [successor.id]: { state: 'deleting', label: 'Unlink' },
        }),
      });

      this.replaceNodeInParent(successor, successor.right);
      this.nodeCount--;

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Deletion Complete',
        description: `Replaced ${val} with ${successorVal} and removed duplicate node.`,
        activeLineIndex: 7,
        isComplete: true,
        stateSnapshot: this.getSnapshot({}, `Deleted ${val}, replaced with ${successorVal}`),
      });
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `DELETE(${val})`,
        displayName: 'Delete Node from BST',
        whatHappens: `Locates ${val} and applies leaf unlink (0 children), child splice (1 child), or in-order successor swap (2 children).`,
        pseudocode,
        complexity: {
          timeBest: 'O(1) (root leaf)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(n) (skewed tree)',
          auxiliarySpace: 'O(1)',
          notes: 'Bounded by tree height to search and (if needed) locate the successor.',
        },
        resultMessage: `Deleted ${val} from BST.`,
        status: 'success',
      },
    };
  }

  private replaceNodeInParent(node: BSTNode, replacement: BSTNode | null) {
    if (!node.parent) {
      this.root = replacement;
      if (replacement) replacement.parent = null;
      return;
    }

    if (node.parent.left === node) {
      node.parent.left = replacement;
    } else {
      node.parent.right = replacement;
    }

    if (replacement) {
      replacement.parent = node.parent;
    }
  }

  private emptyTraversalResult(opName: string, displayName: string, pseudocode: string[]) {
    return {
      steps: finalizeSteps([
        {
          stepNumber: 1,
          totalSteps: 1,
          title: 'Empty Tree',
          description: 'Tree is empty. No nodes to traverse.',
          activeLineIndex: 1,
          isComplete: true,
          stateSnapshot: this.getSnapshot({}, 'Empty tree'),
        },
      ]),
      explanation: {
        operationName: opName,
        displayName,
        whatHappens: 'Tree is empty.',
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1)',
          timeWorst: 'O(1)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: 'Tree is empty.',
        status: 'idle' as const,
      },
      visitedOrder: [] as number[],
    };
  }

  inorderTraversal(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; visitedOrder: number[] } {
    const pseudocode = [
      'function inorder(node):',
      '  if (node == null) return',
      '  inorder(node.left)',
      '  visit(node.val) // Sorted order',
      '  inorder(node.right)',
    ];

    if (!this.root) {
      return this.emptyTraversalResult('INORDER_TRAVERSAL()', 'In-Order Traversal (L-Ro-R)', pseudocode);
    }

    const visited: number[] = [];
    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    const visitedIds: string[] = [];

    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);

      visited.push(node.value);
      visitedIds.push(node.id);

      const hl: Record<string, { state: BSTNodeData['state']; label?: string }> = {};
      visitedIds.forEach((id) => {
        hl[id] = { state: 'visited' };
      });
      hl[node.id] = { state: 'active', label: `#${visited.length}: ${node.value}` };

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `In-Order: Visit (${node.value})`,
        description: `Visited ${node.value} after left subtree. Order so far: [${visited.join(', ')}]`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot(hl, `Visited: ${node.value}`),
      });

      traverse(node.right);
    };

    traverse(this.root);

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'In-Order Complete',
      description: `Sorted sequence: [${visited.join(', ')}].`,
      activeLineIndex: 1,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `Inorder: [${visited.join(', ')}]`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'INORDER_TRAVERSAL()',
        displayName: 'In-Order Traversal (L-Ro-R)',
        whatHappens: 'Visits Left Subtree -> Node -> Right Subtree, producing BST keys in ascending sorted order.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(h) call stack',
          notes: 'Visits every node once; recursion stack depth is O(h).',
        },
        resultMessage: `In-order: [${visited.join(', ')}]`,
        status: 'success',
      },
      visitedOrder: visited,
    };
  }

  preorderTraversal(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; visitedOrder: number[] } {
    const pseudocode = [
      'function preorder(node):',
      '  if (node == null) return',
      '  visit(node.val) // Visit root first',
      '  preorder(node.left)',
      '  preorder(node.right)',
    ];

    if (!this.root) {
      return this.emptyTraversalResult('PREORDER_TRAVERSAL()', 'Pre-Order Traversal (Ro-L-R)', pseudocode);
    }

    const visited: number[] = [];
    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    const visitedIds: string[] = [];

    const traverse = (node: BSTNode | null) => {
      if (!node) return;

      visited.push(node.value);
      visitedIds.push(node.id);

      const hl: Record<string, { state: BSTNodeData['state']; label?: string }> = {};
      visitedIds.forEach((id) => {
        hl[id] = { state: 'visited' };
      });
      hl[node.id] = { state: 'active', label: `#${visited.length}: ${node.value}` };

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Pre-Order: Visit (${node.value})`,
        description: `Visited ${node.value} before children. Order so far: [${visited.join(', ')}]`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot(hl, `Visited: ${node.value}`),
      });

      traverse(node.left);
      traverse(node.right);
    };

    traverse(this.root);

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Pre-Order Complete',
      description: `Pre-order sequence: [${visited.join(', ')}].`,
      activeLineIndex: 1,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `Preorder: [${visited.join(', ')}]`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'PREORDER_TRAVERSAL()',
        displayName: 'Pre-Order Traversal (Ro-L-R)',
        whatHappens: 'Visits Node -> Left Subtree -> Right Subtree. Useful for serializing or copying tree topology.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(h) call stack',
        },
        resultMessage: `Pre-order: [${visited.join(', ')}]`,
        status: 'success',
      },
      visitedOrder: visited,
    };
  }

  postorderTraversal(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; visitedOrder: number[] } {
    const pseudocode = [
      'function postorder(node):',
      '  if (node == null) return',
      '  postorder(node.left)',
      '  postorder(node.right)',
      '  visit(node.val) // Visit root last',
    ];

    if (!this.root) {
      return this.emptyTraversalResult('POSTORDER_TRAVERSAL()', 'Post-Order Traversal (L-R-Ro)', pseudocode);
    }

    const visited: number[] = [];
    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    const visitedIds: string[] = [];

    const traverse = (node: BSTNode | null) => {
      if (!node) return;
      traverse(node.left);
      traverse(node.right);

      visited.push(node.value);
      visitedIds.push(node.id);

      const hl: Record<string, { state: BSTNodeData['state']; label?: string }> = {};
      visitedIds.forEach((id) => {
        hl[id] = { state: 'visited' };
      });
      hl[node.id] = { state: 'active', label: `#${visited.length}: ${node.value}` };

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Post-Order: Visit (${node.value})`,
        description: `Both subtrees done; visiting ${node.value}. Order so far: [${visited.join(', ')}]`,
        activeLineIndex: 4,
        stateSnapshot: this.getSnapshot(hl, `Visited: ${node.value}`),
      });
    };

    traverse(this.root);

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Post-Order Complete',
      description: `Post-order sequence: [${visited.join(', ')}].`,
      activeLineIndex: 1,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `Postorder: [${visited.join(', ')}]`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'POSTORDER_TRAVERSAL()',
        displayName: 'Post-Order Traversal (L-R-Ro)',
        whatHappens: 'Visits Left Subtree -> Right Subtree -> Node. Children always complete before parents.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(h) call stack',
        },
        resultMessage: `Post-order: [${visited.join(', ')}]`,
        status: 'success',
      },
      visitedOrder: visited,
    };
  }

  levelOrderTraversal(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; visitedOrder: number[] } {
    const pseudocode = [
      'queue = [root]',
      'while (queue not empty) {',
      '  curr = queue.dequeue()',
      '  visit(curr.val)',
      '  if (curr.left) queue.enqueue(curr.left)',
      '  if (curr.right) queue.enqueue(curr.right)',
      '}',
    ];

    if (!this.root) {
      return this.emptyTraversalResult('LEVEL_ORDER_TRAVERSAL()', 'Level Order Traversal (BFS)', pseudocode);
    }

    const visited: number[] = [];
    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    const queue: BSTNode[] = [this.root];
    const visitedIds: string[] = [];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      visited.push(curr.value);
      visitedIds.push(curr.id);

      const hl: Record<string, { state: BSTNodeData['state']; label?: string }> = {};
      visitedIds.forEach((id) => {
        hl[id] = { state: 'visited' };
      });
      hl[curr.id] = { state: 'active', label: `BFS #${visited.length}` };

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `BFS: Dequeued (${curr.value})`,
        description: `Dequeued ${curr.value} and queued its children. Order so far: [${visited.join(', ')}]`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot(hl, `Visited: ${curr.value}`),
      });

      if (curr.left) queue.push(curr.left);
      if (curr.right) queue.push(curr.right);
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Level Order Complete',
      description: `BFS sequence: [${visited.join(', ')}].`,
      activeLineIndex: 1,
      isComplete: true,
      stateSnapshot: this.getSnapshot({}, `BFS: [${visited.join(', ')}]`),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'LEVEL_ORDER_TRAVERSAL()',
        displayName: 'Level Order Traversal (BFS)',
        whatHappens: 'Processes nodes breadth-first using a FIFO queue, one depth level at a time.',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(w) max width',
          notes: 'Queue holds up to the widest level w (at most n/2 leaves in a full tree).',
        },
        resultMessage: `Level-order: [${visited.join(', ')}]`,
        status: 'success',
      },
      visitedOrder: visited,
    };
  }

  findMin(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; value: number | null } {
    const pseudocode = [
      'if (root == null) return null',
      'curr = root',
      'while (curr.left != null) {',
      '  curr = curr.left',
      '}',
      'return curr.val',
    ];

    if (!this.root) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Tree',
            description: 'Tree is empty. No minimum key exists.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot({}, 'Tree is empty'),
          },
        ]),
        explanation: {
          operationName: 'FIND_MIN()',
          displayName: 'Find Minimum Key',
          whatHappens: 'Tree is empty.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Tree is empty.',
          status: 'warning',
        },
        value: null,
      };
    }

    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    let curr: BSTNode = this.root;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Start at Root',
      description: `Following left pointers from root (${curr.value}) to find the minimum key.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'comparing', label: 'Root' },
      }),
    });

    while (curr.left) {
      curr = curr.left;
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Move Left',
        description: `Moved to left child (${curr.value}).`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot({
          [curr.id]: { state: 'comparing', label: `curr (${curr.value})` },
        }),
      });
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Minimum Found',
      description: `(${curr.value}) has no left child, so it is the minimum value.`,
      activeLineIndex: 5,
      isComplete: true,
      stateSnapshot: this.getSnapshot(
        { [curr.id]: { state: 'min-max', label: `Min: ${curr.value}` } },
        `Minimum is ${curr.value}`
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'FIND_MIN()',
        displayName: 'Find Minimum Key in BST',
        whatHappens: 'Follows left child pointers until reaching the leftmost node.',
        pseudocode,
        complexity: {
          timeBest: 'O(1) (no left subtree)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(n) (left-skewed)',
          auxiliarySpace: 'O(1)',
          notes: 'Only walks the left spine.',
        },
        resultMessage: `Minimum value is ${curr.value}.`,
        status: 'success',
      },
      value: curr.value,
    };
  }

  findMax(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; value: number | null } {
    const pseudocode = [
      'if (root == null) return null',
      'curr = root',
      'while (curr.right != null) {',
      '  curr = curr.right',
      '}',
      'return curr.val',
    ];

    if (!this.root) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Empty Tree',
            description: 'Tree is empty. No maximum key exists.',
            activeLineIndex: 0,
            isComplete: true,
            stateSnapshot: this.getSnapshot({}, 'Tree is empty'),
          },
        ]),
        explanation: {
          operationName: 'FIND_MAX()',
          displayName: 'Find Maximum Key',
          whatHappens: 'Tree is empty.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(log n)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Tree is empty.',
          status: 'warning',
        },
        value: null,
      };
    }

    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    let curr: BSTNode = this.root;

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Start at Root',
      description: `Following right pointers from root (${curr.value}) to find the maximum key.`,
      activeLineIndex: 1,
      stateSnapshot: this.getSnapshot({
        [curr.id]: { state: 'comparing', label: 'Root' },
      }),
    });

    while (curr.right) {
      curr = curr.right;
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: 'Move Right',
        description: `Moved to right child (${curr.value}).`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot({
          [curr.id]: { state: 'comparing', label: `curr (${curr.value})` },
        }),
      });
    }

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Maximum Found',
      description: `(${curr.value}) has no right child, so it is the maximum value.`,
      activeLineIndex: 5,
      isComplete: true,
      stateSnapshot: this.getSnapshot(
        { [curr.id]: { state: 'min-max', label: `Max: ${curr.value}` } },
        `Maximum is ${curr.value}`
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'FIND_MAX()',
        displayName: 'Find Maximum Key in BST',
        whatHappens: 'Follows right child pointers until reaching the rightmost node.',
        pseudocode,
        complexity: {
          timeBest: 'O(1) (no right subtree)',
          timeAverage: 'O(log n)',
          timeWorst: 'O(n) (right-skewed)',
          auxiliarySpace: 'O(1)',
          notes: 'Only walks the right spine.',
        },
        resultMessage: `Maximum value is ${curr.value}.`,
        status: 'success',
      },
      value: curr.value,
    };
  }

  calculateHeight(): { steps: AnimationStep<BSTStateSnapshot>[]; explanation: OperationExplanation; height: number } {
    const pseudocode = [
      'function height(node):',
      '  if (node == null) return 0',
      '  leftH = height(node.left)',
      '  rightH = height(node.right)',
      '  return 1 + max(leftH, rightH)',
    ];

    if (!this.root) {
      return {
        steps: finalizeSteps([
          {
            stepNumber: 1,
            totalSteps: 1,
            title: 'Height of Empty Tree',
            description: 'Empty tree has height 0 (counting nodes on longest root-to-leaf path).',
            activeLineIndex: 1,
            isComplete: true,
            stateSnapshot: this.getSnapshot({}, 'Height is 0'),
          },
        ]),
        explanation: {
          operationName: 'CALCULATE_HEIGHT()',
          displayName: 'Calculate Tree Height',
          whatHappens: 'Tree is empty; height is 0.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1)',
            timeWorst: 'O(1)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: 'Height: 0 levels.',
          status: 'idle',
        },
        height: 0,
      };
    }

    const steps: AnimationStep<BSTStateSnapshot>[] = [];
    const computedHeights: Record<string, number> = {};

    const evalHeight = (node: BSTNode | null): number => {
      if (!node) return 0;
      const leftH = evalHeight(node.left);
      const rightH = evalHeight(node.right);
      const h = 1 + Math.max(leftH, rightH);
      computedHeights[node.id] = h;

      const hl: Record<string, { state: BSTNodeData['state']; label?: string }> = {};
      Object.entries(computedHeights).forEach(([id, val]) => {
        hl[id] = { state: 'visited', label: `h=${val}` };
      });
      hl[node.id] = { state: 'active', label: `h=${h}` };

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Height at (${node.value})`,
        description: `leftH=${leftH}, rightH=${rightH} -> 1 + max(${leftH}, ${rightH}) = ${h}.`,
        activeLineIndex: 4,
        stateSnapshot: this.getSnapshot(hl, `height(${node.value}) = ${h}`),
      });

      return h;
    };

    const h = evalHeight(this.root);

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: 'Height Complete',
      description: `Tree height is ${h} level(s) (${this.nodeCount} nodes).`,
      activeLineIndex: 4,
      isComplete: true,
      stateSnapshot: this.getSnapshot(
        { [this.root.id]: { state: 'found', label: `Height: ${h}` } },
        `Tree height: ${h}`
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: 'CALCULATE_HEIGHT()',
        displayName: 'Calculate Tree Height',
        whatHappens: 'Recursively computes subtree heights bottom-up (post-order): height(node) = 1 + max(leftH, rightH).',
        pseudocode,
        complexity: {
          timeBest: 'O(n)',
          timeAverage: 'O(n)',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(h) call stack',
          notes: 'Evaluates every node once bottom-up.',
        },
        resultMessage: `Tree height is ${h} level(s).`,
        status: 'success',
      },
      height: h,
    };
  }
}
