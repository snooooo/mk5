export interface WalletSettings {
  initialBalance: number;
  currentBalance: number;
  hourlyWage: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  memo: string;
  satisfaction?: number;
  createdAt: string;
}
