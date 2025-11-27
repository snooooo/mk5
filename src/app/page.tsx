'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Delete, X } from 'lucide-react';
import { Keypad } from '@/components/Keypad';
import { useWallet } from '@/context/WalletContext';
import { Layout } from '@/components/Layout';

export default function InputPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { settings } = useWallet();
  const [amount, setAmount] = useState('0');
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  // Auto-select type based on query param if needed, but here we just use it to highlight
  const initialType = searchParams.get('type') as 'income' | 'expense' | null;

  const handleNumberClick = (num: string) => {
    if (amount.length >= 9) return;
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDeleteClick = () => {
    if (amount.length === 1) {
      setAmount('0');
    } else {
      setAmount(amount.slice(0, -1));
    }
  };

  const handleExpenseClick = () => {
    if (amount === '0') return;
    router.push(`/add?type=expense&amount=${amount}`);
  };

  const handleIncomeClick = () => {
    if (amount === '0') return;
    setShowIncomeModal(true);
  };

  const handleIncomeCategorySelect = (category: string) => {
    router.push(`/add?type=income&amount=${amount}&memo=${encodeURIComponent(category)}`);
  };

  const handleCustomCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCategory.trim()) {
      handleIncomeCategorySelect(customCategory);
    }
  };

  // Format amount with commas
  const formattedAmount = parseInt(amount).toLocaleString();

  return (
    <Layout>
      <header className="p-4 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="text-lg font-bold text-gray-900">
          {initialType === 'income' ? '入金' : '支出'}
        </h1>
        <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
          <Home className="w-6 h-6" />
        </Link>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Amount Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
          <div className="text-gray-500 mb-2 font-medium">金額を入力</div>
          <div className="text-5xl font-bold tracking-tight text-gray-900 flex items-baseline">
            <span className="text-2xl mr-1">{settings.currency}</span>
            {formattedAmount}
          </div>
        </div>

        {/* Keypad Area */}
        <div className="bg-gray-50 p-6 rounded-t-3xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Keypad
            onInput={handleNumberClick}
            onDelete={handleDeleteClick}
            onConfirm={initialType === 'income' ? handleIncomeClick : handleExpenseClick}
            confirmDisabled={amount === '0'}
            confirmColor={initialType === 'income' ? 'green' : 'red'}
            confirmText="決定"
          />
        </div>
      </main>

      {/* Income Category Modal */}
      {showIncomeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 animate-in fade-in duration-200" onClick={() => setShowIncomeModal(false)}>
          <div className="bg-white w-full max-w-sm sm:rounded-2xl rounded-t-3xl p-6 shadow-xl animate-in slide-in-from-bottom-10 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-900">入金カテゴリーを選択</h3>
              <button onClick={() => setShowIncomeModal(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleIncomeCategorySelect('給与')}
                className="p-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 transition-colors"
              >
                給与
              </button>
              <button
                onClick={() => handleIncomeCategorySelect('ボーナス')}
                className="p-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 transition-colors"
              >
                ボーナス
              </button>
              <button
                onClick={() => handleIncomeCategorySelect('臨時収入')}
                className="p-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 transition-colors"
              >
                臨時収入
              </button>
              <button
                onClick={() => handleIncomeCategorySelect('お小遣い')}
                className="p-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl border border-green-200 transition-colors"
              >
                お小遣い
              </button>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">その他（自由入力）</p>
              <form onSubmit={handleCustomCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="入力して決定..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!customCategory.trim()}
                  className="bg-gray-900 text-white font-bold px-6 rounded-xl disabled:opacity-50"
                >
                  決定
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
