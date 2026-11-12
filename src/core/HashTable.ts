import { AnimationStep, OperationExplanation } from '../types/dsa';
import {
  CollisionMode,
  HashBucketSnapshot,
  HashEntry,
  HashItemState,
  HashTableSnapshot,
  ProbeSlotStatus,
} from '../types/hashTable';
import { finalizeSteps } from '../utils/steps';

interface InternalEntry {
  id: string;
  key: number;
  value?: string;
}

export class HashTable {
  private capacity: number;
  private mode: CollisionMode;
  private buckets: InternalEntry[][];
  private probeSlots: (InternalEntry | null)[];
  private probeStates: ProbeSlotStatus[];
  private count = 0;
  private nextId = 1;

  constructor(capacity = 7, mode: CollisionMode = 'chaining') {
    this.capacity = capacity;
    this.mode = mode;
    this.buckets = Array.from({ length: capacity }, () => []);
    this.probeSlots = Array.from({ length: capacity }, () => null);
    this.probeStates = Array.from({ length: capacity }, () => 'empty');
  }

  private createEntryId(): string {
    return `ht-${this.nextId++}`;
  }

  public hash(key: number): number {
    return ((key % this.capacity) + this.capacity) % this.capacity;
  }

  public getCapacity(): number {
    return this.capacity;
  }

  public getMode(): CollisionMode {
    return this.mode;
  }

  public getSize(): number {
    return this.count;
  }

  public getSnapshot(
    highlights?: Map<number, HashItemState>,
    entryHighlights?: Map<string, HashItemState>,
    formulaText?: string
  ): HashTableSnapshot {
    const bucketSnapshots: HashBucketSnapshot[] = Array.from(
      { length: this.capacity },
      (_, idx) => {
        if (this.mode === 'chaining') {
          const entries: HashEntry[] = this.buckets[idx].map((item) => ({
            id: item.id,
            key: item.key,
            value: item.value,
            state: entryHighlights?.get(item.id) ?? 'default',
          }));
          return {
            index: idx,
            entries,
            slotState: highlights?.get(idx) ?? 'default',
          };
        }

        const slotEntry = this.probeSlots[idx];
        const status = this.probeStates[idx];
        const entries: HashEntry[] = slotEntry
          ? [
              {
                id: slotEntry.id,
                key: slotEntry.key,
                value: slotEntry.value,
                state: entryHighlights?.get(slotEntry.id) ?? highlights?.get(idx) ?? 'default',
              },
            ]
          : [];
        return {
          index: idx,
          entries,
          probeStatus: status,
          slotState: highlights?.get(idx) ?? 'default',
        };
      }
    );

    return {
      buckets: bucketSnapshots,
      mode: this.mode,
      capacity: this.capacity,
      size: this.count,
      loadFactor: Number((this.count / this.capacity).toFixed(2)),
      formulaText,
    };
  }

  private collectAllEntries(): InternalEntry[] {
    if (this.mode === 'chaining') {
      return this.buckets.flat().map((e) => ({ ...e }));
    }
    const collected: InternalEntry[] = [];
    for (let i = 0; i < this.capacity; i++) {
      const slot = this.probeSlots[i];
      if (this.probeStates[i] === 'occupied' && slot) {
        collected.push({ ...slot });
      }
    }
    return collected;
  }

  private resetStorage(capacity: number, mode: CollisionMode): void {
    this.capacity = capacity;
    this.mode = mode;
    this.buckets = Array.from({ length: capacity }, () => []);
    this.probeSlots = Array.from({ length: capacity }, () => null);
    this.probeStates = Array.from({ length: capacity }, () => 'empty');
    this.count = 0;
  }

  public insertDirect(key: number, value?: string): boolean {
    if (this.mode === 'chaining') {
      const idx = this.hash(key);
      const existing = this.buckets[idx].find((e) => e.key === key);
      if (existing) {
        existing.value = value;
        return true;
      }
      this.buckets[idx].push({ id: this.createEntryId(), key, value });
      this.count++;
      return true;
    }

    const baseIdx = this.hash(key);
    let firstDeleted = -1;
    for (let step = 0; step < this.capacity; step++) {
      const idx = (baseIdx + step) % this.capacity;
      const status = this.probeStates[idx];
      const slot = this.probeSlots[idx];

      if (status === 'occupied' && slot?.key === key) {
        slot.value = value;
        return true;
      }
      if (status === 'deleted' && firstDeleted === -1) {
        firstDeleted = idx;
      }
      if (status === 'empty') {
        const target = firstDeleted !== -1 ? firstDeleted : idx;
        this.probeSlots[target] = { id: this.createEntryId(), key, value };
        this.probeStates[target] = 'occupied';
        this.count++;
        return true;
      }
    }

    if (firstDeleted !== -1) {
      this.probeSlots[firstDeleted] = { id: this.createEntryId(), key, value };
      this.probeStates[firstDeleted] = 'occupied';
      this.count++;
      return true;
    }
    return false;
  }

  public reconfigure(newCapacity: number, newMode: CollisionMode): void {
    const existing = this.collectAllEntries();
    this.resetStorage(newCapacity, newMode);
    for (const item of existing) {
      this.insertDirect(item.key, item.value);
    }
  }

  public clear(): void {
    this.resetStorage(this.capacity, this.mode);
  }

  public insert(
    key: number,
    value?: string
  ): { steps: AnimationStep<HashTableSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<HashTableSnapshot>[] = [];
    const baseIdx = this.hash(key);
    const formula = `hash(${key}) = ${key} mod ${this.capacity} = ${baseIdx}`;

    if (this.mode === 'chaining') {
      const pseudocode = [
        'index = ((key % capacity) + capacity) % capacity',
        'bucket = table[index]',
        'if key already in bucket: update value',
        'else: bucket.append(Node(key, value))',
      ];

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Compute Hash Bucket [${baseIdx}]`,
        description: `Computed ${formula}. Inspecting bucket ${baseIdx} chain.`,
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(new Map([[baseIdx, 'probing']]), undefined, formula),
      });

      const bucket = this.buckets[baseIdx];
      const existing = bucket.find((e) => e.key === key);

      if (existing) {
        existing.value = value;
        steps.push({
          stepNumber: 2,
          totalSteps: 1,
          title: `Updated Existing Key ${key}`,
          description: `Key ${key} already existed in bucket ${baseIdx}; updated its stored entry.`,
          activeLineIndex: 2,
          stateSnapshot: this.getSnapshot(
            new Map([[baseIdx, 'found']]),
            new Map([[existing.id, 'found']]),
            formula
          ),
        });
      } else {
        const hadCollision = bucket.length > 0;
        const created: InternalEntry = { id: this.createEntryId(), key, value };
        bucket.push(created);
        this.count++;

        steps.push({
          stepNumber: 2,
          totalSteps: 1,
          title: hadCollision
            ? `Collision Handled: Appended to Chain [${baseIdx}]`
            : `Inserted Key ${key} at Bucket [${baseIdx}]`,
          description: hadCollision
            ? `Bucket ${baseIdx} already had ${bucket.length - 1} node(s); appended ${key} to its linked chain.`
            : `Bucket ${baseIdx} was empty; inserted node ${key} cleanly.`,
          activeLineIndex: 3,
          stateSnapshot: this.getSnapshot(
            new Map([[baseIdx, hadCollision ? 'collision' : 'inserted']]),
            new Map([[created.id, 'inserted']]),
            formula
          ),
        });
      }

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `HT_INSERT(${key}${value ? `, "${value}"` : ''})`,
          displayName: 'Hash Table Insert (Chaining)',
          whatHappens: `Hashes key ${key} to bucket ${baseIdx} and appends or updates inside the bucket's linked list.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1 + alpha)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
            notes: `alpha = ${this.count} / ${this.capacity} = ${(this.count / this.capacity).toFixed(2)}`,
          },
          resultMessage: `Inserted ${key} into bucket ${baseIdx}.`,
          status: 'success',
        },
      };
    }

    const pseudocode = [
      'index = hash(key)',
      'for i = 0 to capacity - 1:',
      '  probe = (index + i) % capacity',
      '  if slot[probe] is empty or key matches: place entry',
      'return Table Full',
    ];

    steps.push({
      stepNumber: 1,
      totalSteps: 1,
      title: `Start Linear Probing at [${baseIdx}]`,
      description: `Computed ${formula}. Checking slot ${baseIdx}.`,
      activeLineIndex: 0,
      stateSnapshot: this.getSnapshot(new Map([[baseIdx, 'probing']]), undefined, formula),
    });

    let firstDeleted = -1;
    let placedAt = -1;
    let updatedExisting = false;
    let insertedEntryId = '';

    for (let i = 0; i < this.capacity; i++) {
      const probe = (baseIdx + i) % this.capacity;
      const status = this.probeStates[probe];
      const slot = this.probeSlots[probe];

      if (status === 'occupied' && slot?.key === key) {
        slot.value = value;
        placedAt = probe;
        updatedExisting = true;
        insertedEntryId = slot.id;
        break;
      }

      if (status === 'occupied') {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Collision at Slot [${probe}]`,
          description: `Slot [${probe}] is occupied by key ${slot?.key}. Probing next index (${(probe + 1) % this.capacity}).`,
          activeLineIndex: 2,
          stateSnapshot: this.getSnapshot(
            new Map([[probe, 'collision']]),
            slot ? new Map([[slot.id, 'collision']]) : undefined,
            `probe = (${baseIdx} + ${i + 1}) mod ${this.capacity}`
          ),
        });
        continue;
      }

      if (status === 'deleted' && firstDeleted === -1) {
        firstDeleted = probe;
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Tombstone at Slot [${probe}]`,
          description: `Noted deleted slot [${probe}] as reusable, continuing probe to confirm key ${key} is not already further ahead.`,
          activeLineIndex: 2,
          stateSnapshot: this.getSnapshot(new Map([[probe, 'probing']]), undefined, formula),
        });
        continue;
      }

      if (status === 'empty') {
        placedAt = firstDeleted !== -1 ? firstDeleted : probe;
        const created: InternalEntry = { id: this.createEntryId(), key, value };
        this.probeSlots[placedAt] = created;
        this.probeStates[placedAt] = 'occupied';
        this.count++;
        insertedEntryId = created.id;
        break;
      }
    }

    if (placedAt === -1 && firstDeleted !== -1) {
      placedAt = firstDeleted;
      const created: InternalEntry = { id: this.createEntryId(), key, value };
      this.probeSlots[placedAt] = created;
      this.probeStates[placedAt] = 'occupied';
      this.count++;
      insertedEntryId = created.id;
    }

    if (placedAt === -1) {
      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: 'Hash Table Full',
        description: `All ${this.capacity} slots are occupied; cannot insert key ${key} without resizing.`,
        activeLineIndex: 4,
        stateSnapshot: this.getSnapshot(undefined, undefined, formula),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `HT_INSERT(${key})`,
          displayName: 'Table Full (Linear Probing)',
          whatHappens: 'Every slot in the open-addressed array was occupied during linear probing.',
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1 / (1 - alpha))',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Table full (${this.count}/${this.capacity}).`,
          status: 'warning',
        },
      };
    }

    steps.push({
      stepNumber: steps.length + 1,
      totalSteps: 1,
      title: updatedExisting ? `Updated Key ${key} at [${placedAt}]` : `Placed Key ${key} at [${placedAt}]`,
      description: updatedExisting
        ? `Updated existing entry for key ${key} in slot [${placedAt}].`
        : `Inserted key ${key} into slot [${placedAt}] (load factor now ${(this.count / this.capacity).toFixed(2)}).`,
      activeLineIndex: 3,
      stateSnapshot: this.getSnapshot(
        new Map([[placedAt, updatedExisting ? 'found' : 'inserted']]),
        new Map([[insertedEntryId, updatedExisting ? 'found' : 'inserted']]),
        formula
      ),
    });

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `HT_INSERT(${key}${value ? `, "${value}"` : ''})`,
        displayName: 'Hash Table Insert (Linear Probing)',
        whatHappens: `Starts at bucket ${baseIdx} and probes sequentially until finding key ${key} or an empty/deleted slot.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1 / (1 - alpha))',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Stored ${key} at slot [${placedAt}].`,
        status: 'success',
      },
    };
  }

  public search(
    key: number
  ): { steps: AnimationStep<HashTableSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<HashTableSnapshot>[] = [];
    const baseIdx = this.hash(key);
    const formula = `hash(${key}) = ${key} mod ${this.capacity} = ${baseIdx}`;

    if (this.mode === 'chaining') {
      const pseudocode = [
        'index = hash(key)',
        'for node in table[index]:',
        '  if node.key == key: return node',
        'return NOT_FOUND',
      ];

      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Hash Key ${key} -> Bucket [${baseIdx}]`,
        description: `Computed ${formula}. Checking chain at bucket ${baseIdx}.`,
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(new Map([[baseIdx, 'probing']]), undefined, formula),
      });

      const bucket = this.buckets[baseIdx];
      let found: InternalEntry | null = null;
      for (const node of bucket) {
        if (node.key === key) {
          found = node;
          break;
        }
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Compare Node ${node.key} != ${key}`,
          description: `Node key ${node.key} does not match ${key}; advancing in chain.`,
          activeLineIndex: 1,
          stateSnapshot: this.getSnapshot(
            new Map([[baseIdx, 'probing']]),
            new Map([[node.id, 'probing']]),
            formula
          ),
        });
      }

      if (found) {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Found Key ${key}`,
          description: `Located key ${key} in bucket [${baseIdx}].`,
          activeLineIndex: 2,
          stateSnapshot: this.getSnapshot(
            new Map([[baseIdx, 'found']]),
            new Map([[found.id, 'found']]),
            formula
          ),
        });

        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `HT_SEARCH(${key})`,
            displayName: 'Hash Table Search (Chaining)',
            whatHappens: `Hashes directly to bucket ${baseIdx} and scans only that bucket's chain.`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(1 + alpha)',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Found key ${key} in bucket [${baseIdx}].`,
            status: 'success',
          },
        };
      }

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Key ${key} Not Found`,
        description: `Reached end of bucket [${baseIdx}] chain without finding key ${key}.`,
        activeLineIndex: 3,
        stateSnapshot: this.getSnapshot(new Map([[baseIdx, 'deleting']]), undefined, formula),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `HT_SEARCH(${key})`,
          displayName: 'Hash Table Search (Not Found)',
          whatHappens: `Searched bucket ${baseIdx} chain; key ${key} is absent.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1 + alpha)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Key ${key} not found.`,
          status: 'warning',
        },
      };
    }

    const pseudocode = [
      'index = hash(key)',
      'for i = 0 to capacity - 1:',
      '  probe = (index + i) % capacity',
      '  if slot[probe] empty: return NOT_FOUND',
      '  if slot[probe].key == key: return probe',
    ];

    for (let i = 0; i < this.capacity; i++) {
      const probe = (baseIdx + i) % this.capacity;
      const status = this.probeStates[probe];
      const slot = this.probeSlots[probe];

      if (status === 'empty') {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Empty Slot [${probe}] -> Stop`,
          description: `Reached an untouched EMPTY slot at [${probe}]. Key ${key} cannot exist further ahead.`,
          activeLineIndex: 3,
          stateSnapshot: this.getSnapshot(new Map([[probe, 'deleting']]), undefined, formula),
        });
        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `HT_SEARCH(${key})`,
            displayName: 'Linear Probing Search',
            whatHappens: `Stopped on empty slot [${probe}]; key ${key} is not present.`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(1 / (1 - alpha))',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Key ${key} not found.`,
            status: 'warning',
          },
        };
      }

      if (status === 'occupied' && slot?.key === key) {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Found Key ${key} at [${probe}]`,
          description: `Probe ${i} matched key ${key} at slot [${probe}].`,
          activeLineIndex: 4,
          stateSnapshot: this.getSnapshot(
            new Map([[probe, 'found']]),
            new Map([[slot.id, 'found']]),
            formula
          ),
        });
        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `HT_SEARCH(${key})`,
            displayName: 'Linear Probing Search',
            whatHappens: `Located key ${key} after ${i + 1} probe(s).`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(1 / (1 - alpha))',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Found ${key} at slot [${probe}].`,
            status: 'success',
          },
        };
      }

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Probe [${probe}]`,
        description:
          status === 'deleted'
            ? `Slot [${probe}] is a tombstone (DELETED); must continue probing.`
            : `Slot [${probe}] holds ${slot?.key} != ${key}; advancing probe.`,
        activeLineIndex: 2,
        stateSnapshot: this.getSnapshot(
          new Map([[probe, 'probing']]),
          slot ? new Map([[slot.id, 'probing']]) : undefined,
          `probe = (${baseIdx} + ${i}) mod ${this.capacity}`
        ),
      });
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `HT_SEARCH(${key})`,
        displayName: 'Linear Probing Search',
        whatHappens: `Scanned all ${this.capacity} slots without finding ${key}.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1 / (1 - alpha))',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Key ${key} not found.`,
        status: 'warning',
      },
    };
  }

  public delete(
    key: number
  ): { steps: AnimationStep<HashTableSnapshot>[]; explanation: OperationExplanation } {
    const steps: AnimationStep<HashTableSnapshot>[] = [];
    const baseIdx = this.hash(key);
    const formula = `hash(${key}) = ${key} mod ${this.capacity} = ${baseIdx}`;

    if (this.mode === 'chaining') {
      const pseudocode = [
        'index = hash(key)',
        'remove matching node from table[index] if present',
      ];
      const bucket = this.buckets[baseIdx];
      const targetIdx = bucket.findIndex((e) => e.key === key);

      if (targetIdx === -1) {
        steps.push({
          stepNumber: 1,
          totalSteps: 1,
          title: `Key ${key} Not Found`,
          description: `Bucket [${baseIdx}] does not contain key ${key}.`,
          activeLineIndex: 1,
          stateSnapshot: this.getSnapshot(new Map([[baseIdx, 'deleting']]), undefined, formula),
        });
        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `HT_DELETE(${key})`,
            displayName: 'Delete Key (Chaining)',
            whatHappens: `Bucket [${baseIdx}] did not contain ${key}.`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(1 + alpha)',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Key ${key} not found.`,
            status: 'warning',
          },
        };
      }

      const target = bucket[targetIdx];
      steps.push({
        stepNumber: 1,
        totalSteps: 1,
        title: `Locate Key ${key} in Bucket [${baseIdx}]`,
        description: `Found ${key} in bucket [${baseIdx}] chain. Unlinking node.`,
        activeLineIndex: 1,
        stateSnapshot: this.getSnapshot(
          new Map([[baseIdx, 'deleting']]),
          new Map([[target.id, 'deleting']]),
          formula
        ),
      });

      bucket.splice(targetIdx, 1);
      this.count--;

      steps.push({
        stepNumber: 2,
        totalSteps: 1,
        title: `Removed Key ${key}`,
        description: `Unlinked ${key} from bucket [${baseIdx}]. Entries remaining: ${this.count}.`,
        activeLineIndex: 1,
        stateSnapshot: this.getSnapshot(undefined, undefined, formula),
      });

      return {
        steps: finalizeSteps(steps),
        explanation: {
          operationName: `HT_DELETE(${key})`,
          displayName: 'Delete Key (Chaining)',
          whatHappens: `Removed key ${key} from bucket ${baseIdx}'s linked list.`,
          pseudocode,
          complexity: {
            timeBest: 'O(1)',
            timeAverage: 'O(1 + alpha)',
            timeWorst: 'O(n)',
            auxiliarySpace: 'O(1)',
          },
          resultMessage: `Deleted key ${key}.`,
          status: 'success',
        },
      };
    }

    const pseudocode = [
      'probe sequentially starting at hash(key)',
      'if slot is empty: return NOT_FOUND',
      'if slot.key == key: mark slot as DELETED tombstone',
    ];

    for (let i = 0; i < this.capacity; i++) {
      const probe = (baseIdx + i) % this.capacity;
      const status = this.probeStates[probe];
      const slot = this.probeSlots[probe];

      if (status === 'empty') {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Key ${key} Not Found`,
          description: `Reached EMPTY slot [${probe}]; ${key} is not in table.`,
          activeLineIndex: 1,
          stateSnapshot: this.getSnapshot(new Map([[probe, 'deleting']]), undefined, formula),
        });
        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `HT_DELETE(${key})`,
            displayName: 'Delete Key (Linear Probing)',
            whatHappens: `Hit empty slot [${probe}]; key ${key} was not found.`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(1 / (1 - alpha))',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Key ${key} not found.`,
            status: 'warning',
          },
        };
      }

      if (status === 'occupied' && slot?.key === key) {
        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Mark Slot [${probe}] as DELETED`,
          description: `Removed ${key} at [${probe}] and left a DELETED tombstone so later probe chains stay intact.`,
          activeLineIndex: 2,
          stateSnapshot: this.getSnapshot(
            new Map([[probe, 'deleting']]),
            new Map([[slot.id, 'deleting']]),
            formula
          ),
        });

        this.probeSlots[probe] = null;
        this.probeStates[probe] = 'deleted';
        this.count--;

        steps.push({
          stepNumber: steps.length + 1,
          totalSteps: 1,
          title: `Tombstone Active at [${probe}]`,
          description: `Slot [${probe}] now marked DELETED.`,
          activeLineIndex: 2,
          stateSnapshot: this.getSnapshot(undefined, undefined, formula),
        });

        return {
          steps: finalizeSteps(steps),
          explanation: {
            operationName: `HT_DELETE(${key})`,
            displayName: 'Delete Key (Tombstone)',
            whatHappens: `Deleted key ${key} at slot [${probe}] using a tombstone marker.`,
            pseudocode,
            complexity: {
              timeBest: 'O(1)',
              timeAverage: 'O(1 / (1 - alpha))',
              timeWorst: 'O(n)',
              auxiliarySpace: 'O(1)',
            },
            resultMessage: `Deleted ${key} at slot [${probe}].`,
            status: 'success',
          },
        };
      }

      steps.push({
        stepNumber: steps.length + 1,
        totalSteps: 1,
        title: `Probe [${probe}]`,
        description: `Slot [${probe}] does not match ${key}; advancing probe.`,
        activeLineIndex: 0,
        stateSnapshot: this.getSnapshot(new Map([[probe, 'probing']]), undefined, formula),
      });
    }

    return {
      steps: finalizeSteps(steps),
      explanation: {
        operationName: `HT_DELETE(${key})`,
        displayName: 'Delete Key (Not Found)',
        whatHappens: `Key ${key} was not present in any slot.`,
        pseudocode,
        complexity: {
          timeBest: 'O(1)',
          timeAverage: 'O(1 / (1 - alpha))',
          timeWorst: 'O(n)',
          auxiliarySpace: 'O(1)',
        },
        resultMessage: `Key ${key} not found.`,
        status: 'warning',
      },
    };
  }
}

