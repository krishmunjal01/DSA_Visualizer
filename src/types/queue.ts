export interface QueueItemData {
  id: string;
  value: number | string;
  index: number;
  state?: 'default' | 'front' | 'rear' | 'enqueueing' | 'dequeueing' | 'highlight';
}

export interface QueueStateSnapshot {
  items: (QueueItemData | null)[];
  frontIndex: number;
  rearIndex: number;
  size: number;
  capacity: number;
  isBounded: boolean;
  message?: string;
}
