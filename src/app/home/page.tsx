'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Settings, Plus, Minus, Calendar, X, RotateCcw } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { TransactionList } from '@/components/TransactionList';
import { Layout } from '@/components/Layout';

export default function HomePage() {
    const { settings, updateSettings, transactions, isLoading } = useWallet();
    const [isDateModalOpen, setIsDateModalOpen] = useState(false);
    const [showFullName, setShowFullName] = useState(false);

    if (isLoading) {
        return (
            <Layout>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </Layout>
        );
    }

    // Calculate salary cycle
    const getCycleStartDate = () => {
        // 1. Check for manual override first
        if (settings.customCycleStartDate) {
            // Parse YYYY-MM-DD explicitly to avoid timezone issues
            const [year, month, day] = settings.customCycleStartDate.split('-').map(Number);
            // Note: month is 0-indexed in Date constructor
            return new Date(year, month - 1, day);
        }

        // 2. Default logic
        const today = new Date();
        const payday = settings.payday || 25;
        let start = new Date(today.getFullYear(), today.getMonth(), payday);

        // If today is before payday, cycle started last month
        if (today.getDate() < payday) {
            start = new Date(today.getFullYear(), today.getMonth() - 1, payday);
        }

        // Handle end of month setting (99)
        if (payday === 99) {
            start = new Date(today.getFullYear(), today.getMonth(), 0); // Last day of previous month
        }

        start.setHours(0, 0, 0, 0);
        return start;
    };

    const cycleStartDate = getCycleStartDate();

    const cycleTransactions = transactions.filter(
        (tx) => new Date(tx.createdAt) >= cycleStartDate
    );

    const cycleExpense = cycleTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const cycleIncome = cycleTransactions
        .filter((tx) => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);

    const cycleBalance = cycleIncome - cycleExpense;

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateSettings({ customCycleStartDate: e.target.value });
    };

    const handleResetDate = () => {
        updateSettings({ customCycleStartDate: undefined });
        setIsDateModalOpen(false);
    };

    // Format date for input value (YYYY-MM-DD)
    const formatDateForInput = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return (
        <Layout>
            <header className="p-4 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-10">
                <div className="flex flex-col">
                    <h1
                        onClick={() => setShowFullName(!showFullName)}
                        className="text-xl font-bold tracking-tight text-gray-900 cursor-pointer select-none active:scale-95 transition-transform"
                    >
                        MK5
                    </h1>
                    {showFullName && (
                        <span className="text-xs text-gray-500 animate-in fade-in slide-in-from-top-1 duration-200">
                            MajiでKaikeiして5秒
                        </span>
                    )}
                </div>
                <Link href="/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Settings className="w-6 h-6 text-gray-600" />
                </Link>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                {/* Total Balance */}
                <BalanceDisplay settings={settings} />

                {/* Salary Cycle Summary */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => setIsDateModalOpen(true)}
                            className="text-sm font-semibold text-gray-500 flex items-center hover:text-blue-600 transition-colors"
                        >
                            <Calendar className="w-4 h-4 mr-1" />
                            今「給料サイクル」の収支 ({cycleStartDate.getMonth() + 1}/{cycleStartDate.getDate()}〜現在)
                        </button>
                        <span className={`text-sm font-bold ${cycleBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {cycleBalance >= 0 ? '+' : ''}{cycleBalance.toLocaleString()}
                        </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div className="text-center flex-1 border-r border-gray-200">
                            <div className="text-xs text-gray-400 mb-1">収入</div>
                            <div className="text-lg font-bold text-green-600">+{cycleIncome.toLocaleString()}</div>
                        </div>
                        <div className="text-center flex-1">
                            <div className="text-xs text-gray-400 mb-1">支出</div>
                            <div className="text-lg font-bold text-red-600">-{cycleExpense.toLocaleString()}</div>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-bold mb-3 text-gray-900">最近の取引</h2>
                <TransactionList transactions={transactions.slice(0, 50)} />

                {transactions.length > 50 && (
                    <div className="mt-6 text-center">
                        <Link
                            href="/history"
                            className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors"
                        >
                            すべての履歴を見る ({transactions.length}件)
                        </Link>
                    </div>
                )}
            </main>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex gap-3 justify-center max-w-md mx-auto w-full">
                <Link
                    href="/?type=expense"
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-4 flex items-center justify-center font-bold shadow-lg active:scale-95 transition-all"
                >
                    <Minus className="w-6 h-6 mr-2" />
                    支出を記録
                </Link>
                <Link
                    href="/?type=income"
                    className="w-1/3 bg-green-500 hover:bg-green-600 text-white rounded-xl py-4 flex items-center justify-center font-bold shadow-lg active:scale-95 transition-all"
                >
                    <Plus className="w-6 h-6 mr-1" />
                    入金
                </Link>
            </div>

            {/* Date Change Modal */}
            {isDateModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200" onClick={() => setIsDateModalOpen(false)}>
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">集計開始日を変更</h3>
                            <button onClick={() => setIsDateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-gray-500 mb-3">
                                今月の給料日がずれた場合などに、集計の開始日を一時的に変更できます。
                            </p>
                            <input
                                type="date"
                                value={formatDateForInput(cycleStartDate)}
                                onChange={handleDateChange}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 text-lg"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleResetDate}
                                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl active:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                リセット
                            </button>
                            <button
                                onClick={() => setIsDateModalOpen(false)}
                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md active:bg-blue-700 transition-colors"
                            >
                                完了
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}
