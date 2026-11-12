export interface StackItemData {
  id: string;
  value: number | string;
  index: number;
  state?: 'default' | 'top' | 'pushing' | 'popping' | 'peeking' | 'highlight';
}

export interface StackStateSnapshot {
  items: StackItemData[];
  topIndex: number;
  capacity: number; // e.g. 7
  isBounded: boolean;
  message?: string;
}
