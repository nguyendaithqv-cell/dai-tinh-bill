
export interface BillItem {
  id: string;
  amount: number;
  label?: string;
  timestamp: number;
}

export interface BillState {
  items: BillItem[];
  currentInput: string;
}
