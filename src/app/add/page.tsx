'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { Clock } from 'lucide-react';

function AddContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { addTransaction, settings } = useWallet();

    const type = searchParams.get('type') as 'income' | 'expense';
    const amount = parseInt(searchParams.get('amount') || '0');
    const memo = searchParams.get('memo') || '';

    const [saved, setSaved] = useState(false);

    // Calculate time cost for expenses
    const hourlyWage = settings.hourlyWage || 1000;
    const minutesCost = Math.round((amount / hourlyWage) * 60);

    useEffect(() => {
        if (!type || !amount) {
            router.push('/');
            return;
        }
    }, [type, amount, router]);

    const handleExpenseSave = () => {
        if (saved) return;
        setSaved(true);

        addTransaction({
            amount: -amount, // Expense is negative
            type: 'expense',
            memo: memo || '支出',
        });

        router.push('/home');
    };

    if (!type || !amount) return null;

    // Expense View (Time Equivalent)
    return (
        <div
            onClick={handleExpenseSave}
            className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 cursor-pointer animate-in fade-in duration-300"
        >
            <div className="text-center space-y-8">
                <div className="space-y-2">
                    <div className="text-6xl font-bold tracking-tighter">
                        -¥{amount.toLocaleString()}
                    </div>
                    <div className="text-slate-400 text-lg">
                        支払いました
                    </div>
                </div>

                <div className="bg-slate-800/50 p-8 rounded-3xl backdrop-blur-sm border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-2">
                        あなたの人生
                    </div>
                    <div className="flex items-center justify-center gap-3 text-yellow-400 mb-2">
                        <Clock className="w-8 h-8" />
                        <span className="text-5xl font-bold">{minutesCost}分</span>
                    </div>
                    <div className="text-slate-400 text-sm">
                        を消費しました
                    </div>
                </div>

                <div className="text-slate-500 text-sm animate-pulse pt-12">
                    画面をタップしてホームへ
                </div>
            </div>
        </div>
    );
}

export default function AddPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-900" />}>
            <AddContent />
        </Suspense>
    );
}
