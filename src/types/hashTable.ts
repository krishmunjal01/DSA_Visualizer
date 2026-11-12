export type CollisionMode = 'chaining' | 'linear-probing';

export type HashItemState = 'default' | 'probing' | 'inserted' | 'found' | 'deleting' | 'collision';

export interface HashEntry {
  id: string;
  key: number;
  value?: string;
  state?: HashItemState;
}

export type ProbeSlotStatus = 'empty' | 'occupied' | 'deleted';

export interface HashBucketSnapshot {
  index: number;
  entries: HashEntry[];
  probeStatus?: ProbeSlotStatus;
  slotState?: HashItemState;
}

export interface HashTableSnapshot {
  buckets: HashBucketSnapshot[];
  mode: CollisionMode;
  capacity: number;
  size: number;
  loadFactor: number;
  formulaText?: string;
}

