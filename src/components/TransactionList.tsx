'use client';

import React, { useState } from 'react';
import { Transaction } from '@/types';
import { useWallet } from '@/context/WalletContext';
import { X, Save, Clock, Trash2, Star } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
    const { editTransaction, deleteTransaction, settings } = useWallet();
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [memoInput, setMemoInput] = useState('');
    const [amountInput, setAmountInput] = useState('');
    const [dateTimeInput, setDateTimeInput] = useState('');
    const [satisfaction, setSatisfaction] = useState<number | undefined>(undefined);

    const [deletingTxId, setDeletingTxId] = useState<string | null>(null);

    const handleEditClick = (tx: Transaction) => {
        setEditingTx(tx);
        setMemoInput(tx.memo);
        setAmountInput(Math.abs(tx.amount).toString());
        setSatisfaction(tx.satisfaction);
        // Format datetime for input (YYYY-MM-DDTHH:MM)
        const date = new Date(tx.createdAt);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        setDateTimeInput(`${y}-${m}-${d}T${h}:${min}`);
    };

    const handleSave = () => {
        if (editingTx) {
            const newAmount = parseInt(amountInput, 10);
            if (isNaN(newAmount)) return;

            editTransaction(editingTx.id, {
                amount: editingTx.type === 'income' ? newAmount : -newAmount,
                memo: memoInput,
                createdAt: new Date(dateTimeInput).toISOString(),
                satisfaction: satisfaction
            });
            setEditingTx(null);
        }
    };

    const handleDelete = () => {
        if (deletingTxId) {
            deleteTransaction(deletingTxId);
            setDeletingTxId(null);
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

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, tx) => {
        const date = new Date(tx.createdAt).toLocaleDateString('ja-JP');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(tx);
        return groups;
    }, {} as Record<string, Transaction[]>);

    const getRelativeDateLabel = (dateStr: string) => {
        const today = new Date().toLocaleDateString('ja-JP');
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('ja-JP');

        if (dateStr === today) return '今日';
        if (dateStr === yesterday) return '昨日';
        return dateStr;
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
            <div className="space-y-6">
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                    <div key={date}>
                        <h3 className="text-sm font-bold text-gray-500 mb-2 ml-1">
                            {getRelativeDateLabel(date)}
                        </h3>
                        <div className="space-y-3">
                            {txs.map((tx) => {
                                const timeEq = getTimeEquivalent(tx.amount);
                                return (
                                    <div
                                        key={tx.id}
                                        onClick={() => handleEditClick(tx)}
                                        className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-gray-100 active:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400 mb-0.5">
                                                {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className={`font-medium truncate max-w-[200px] ${!tx.memo ? 'text-gray-400 italic' : 'text-gray-700'}`}>
                                                {tx.memo || '使途を入力...'}
                                            </span>
                                            {tx.satisfaction && (
                                                <div className="flex items-center mt-0.5">
                                                    {[...Array(tx.satisfaction)].map((_, i) => (
                                                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                                {tx.type === 'income' ? '+' : ''}¥{tx.amount.toLocaleString()}
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
                    </div>
                ))}
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
                            <h3 className="text-lg font-bold text-gray-900">取引を編集</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setDeletingTxId(editingTx.id)}
                                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <button onClick={() => setEditingTx(null)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">金額</label>
                                    <div className="relative">
                                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${editingTx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {editingTx.type === 'income' ? '+' : '-'}¥
                                        </span>
                                        <input
                                            type="number"
                                            value={amountInput}
                                            onChange={(e) => setAmountInput(e.target.value)}
                                            className={`w-full p-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-xl ${editingTx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">日時</label>
                                    <input
                                        type="datetime-local"
                                        value={dateTimeInput}
                                        onChange={(e) => setDateTimeInput(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">使途</label>
                                    <input
                                        type="text"
                                        value={memoInput}
                                        onChange={(e) => setMemoInput(e.target.value)}
                                        placeholder="使途を入力してください"
                                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                {editingTx.type === 'expense' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">支出の質</label>
                                        <div className="flex gap-2 justify-center bg-gray-50 p-3 rounded-xl">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setSatisfaction(star)}
                                                    className={`p-1 transition-transform active:scale-95 ${(satisfaction || 0) >= star
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-gray-300'
                                                        }`}
                                                >
                                                    <Star className={`w-8 h-8 ${(satisfaction || 0) >= star ? 'fill-current' : ''}`} />
                                                </button>
                                            ))}
                                        </div>
                                        <div className="text-center text-xs text-gray-400 mt-1">
                                            {satisfaction === 1 && '悪い支出...'}
                                            {satisfaction === 2 && '微妙'}
                                            {satisfaction === 3 && '普通'}
                                            {satisfaction === 4 && '良い！'}
                                            {satisfaction === 5 && '最高の支出！'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingTx(null)}
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl active:bg-gray-200 transition-colors flex items-center justify-center"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-md active:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingTxId && (
                <div
                    onClick={() => setDeletingTxId(null)}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white w-full max-w-xs rounded-2xl p-6 shadow-xl text-center"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-2">確認</h3>
                        <p className="text-gray-600 mb-6">この取引を削除しますか？</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingTxId(null)}
                                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl active:bg-gray-200 transition-colors"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl shadow-md active:bg-red-600 transition-colors"
                            >
                                削除
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
