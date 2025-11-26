'use client';

import Link from 'next/link';
import { Settings, Plus, Minus } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { BalanceDisplay } from '@/components/BalanceDisplay';
import { TransactionList } from '@/components/TransactionList';
import { Layout } from '@/components/Layout';

export default function HomePage() {
    const { settings, transactions, isLoading } = useWallet();

    if (isLoading) {
        return (
            <Layout>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </Layout>
        );
    }

    // Calculate today's summary
    const today = new Date().toLocaleDateString();
    const todaysTransactions = transactions.filter(
        (tx) => new Date(tx.createdAt).toLocaleDateString() === today
    );

    const todayExpense = todaysTransactions
        .filter((tx) => tx.type === 'expense')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const todayIncome = todaysTransactions

        < div className = "bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6" >
                    <h2 className="text-sm font-semibold text-gray-500 mb-3">今日のサマリー</h2>
                    <div className="flex justify-between">
                        <div>
                            <div className="text-xs text-gray-400">支出</div>
                            <div className="text-lg font-bold text-red-600">-{todayExpense.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400">入金</div>
                            <div className="text-lg font-bold text-green-600">+{todayIncome.toLocaleString()}</div>
                        </div>
                    </div>
                </div >

                <h2 className="text-lg font-bold mb-3 text-gray-900">最近の取引</h2>
                <TransactionList transactions={transactions} />
            </main >

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
        </Layout >
    );
}
