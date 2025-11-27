'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { TransactionList } from '@/components/TransactionList';
import { Layout } from '@/components/Layout';

export default function HistoryPage() {
    const { transactions, isLoading } = useWallet();

    if (isLoading) {
        return (
            <Layout>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <header className="p-4 flex items-center bg-white border-b border-gray-100 sticky top-0 z-10">
                <Link href="/home" className="p-2 hover:bg-gray-100 rounded-full transition-colors mr-2">
                    <ArrowLeft className="w-6 h-6 text-gray-600" />
                </Link>
                <h1 className="text-xl font-bold tracking-tight text-gray-900">履歴</h1>
            </header>

            <main className="flex-1 overflow-y-auto p-4 pb-24">
                <div className="mb-4">
                    <p className="text-sm text-gray-500">
                        全 {transactions.length} 件の取引
                    </p>
                </div>
                <TransactionList transactions={transactions} />
            </main>
        </Layout>
    );
}
