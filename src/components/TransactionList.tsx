'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';
import { useWallet } from '@/context/WalletContext';
import { X, Save, Clock } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const { editTransaction, settings } = useWallet();
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [memoInput, setMemoInput] = useState('');

    const handleEditClick = (tx: Transaction) => {
        setEditingTx(tx);
        setMemoInput(tx.memo);
    };

    const handleSave = () => {
        if (editingTx) {
            editTransaction(editingTx.id, { memo: memoInput });
            setEditingTx(null);
        }
    };

    const getTimeEquivalent = (amount: number) => {
        if (!settings.hourlyWage || settings.hourlyWage <= 0) return null;
        const hours = Math.abs(amount) / settings.hourlyWage;

        // 1時間未満の場合は分で表示
        if (hours < 1) {
            const minutes = Math.round(hours * 60);
            return `${minutes}分`;
        }

        return `${hours.toFixed(1)}時間`;
    };

    if (transactions.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                まだ取引履歴がありません
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {transactions.map((tx) => {
                    const timeEq = getTimeEquivalent(tx.amount);

                    return (
                        <div
                            key={tx.id}
                            onClick={() => handleEditClick(tx)}
                            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex flex-col">
                                <span className="text-sm text-gray-500">
                                    {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className={`font-medium truncate max-w-[200px] ${!tx.memo ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                                    {tx.memo || '使途を入力...'}
                                </span>
                            </div>
                            <div className="text-right">
                                <div className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : ''}{tx.amount.toLocaleString()}
                                </div>
                                {timeEq && tx.type === 'expense' && (
                                    <div className="text-xs text-gray-400 flex items-center justify-end mt-1">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {timeEq}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {editingTx && (
                <div
                    onClick={() => setEditingTx(null)}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">使途を編集</h3>
                            <button onClick={() => setEditingTx(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="text-2xl font-bold text-center mb-4 text-gray-900">
                                {editingTx.type === 'income' ? '+' : ''}{editingTx.amount.toLocaleString()}
                            </div>
                            <input
                                type="text"
                                value={memoInput}
                                onChange={(e) => setMemoInput(e.target.value)}
                                placeholder="使途を入力してください"
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                autoFocus
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md active:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                            <Save className="w-5 h-5 mr-2" />
                            保存
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
