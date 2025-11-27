export interface WalletSettings {
  initialBalance: number;
  currentBalance: number;
  hourlyWage: number;
  currency: string;
  payday: number; // 1-31
  lastSubscriptionProcessDate: string; // YYYY-MM-DD
  customCycleStartDate?: string; // YYYY-MM-DD (Manual override)
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  type: 'monthly' | 'yearly';
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  memo: string;
  satisfaction?: number;
  isSubscription?: boolean; // Identify auto-generated transactions
  createdAt: string;
}
