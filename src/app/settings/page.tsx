'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Plus, CreditCard } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Layout } from '@/components/Layout';

export default function SettingsPage() {
    const router = useRouter();
    const { settings, updateSettings, resetData, subscriptions, addSubscription, removeSubscription } = useWallet();

    // Local state for inputs to avoid jumping cursors, but sync with settings
    const [initialBalance, setInitialBalance] = useState(settings.initialBalance.toString());
    const [hourlyWage, setHourlyWage] = useState(settings.hourlyWage.toString());

    // Sync local state with settings when settings change (e.g. on first load)
    useEffect(() => {
        setInitialBalance(settings.initialBalance.toString());
        setHourlyWage(settings.hourlyWage.toString());
    }, [settings.initialBalance, settings.hourlyWage]);

    // Subscription form state
    const [subName, setSubName] = useState('');
    const [subAmount, setSubAmount] = useState('');
    const [subType, setSubType] = useState<'monthly' | 'yearly'>('monthly');

    const handleInitialBalanceChange = (val: string) => {
        setInitialBalance(val);
        const num = parseInt(val.replace(/,/g, ''), 10);
        if (!isNaN(num)) {
            // When initial balance changes, we also reset current balance to match logic
            updateSettings({
                initialBalance: num,
                currentBalance: num,
            });
        }
    };

    const handleHourlyWageChange = (val: string) => {
        setHourlyWage(val);
        const num = parseInt(val.replace(/,/g, ''), 10);
        if (!isNaN(num)) {
            updateSettings({ hourlyWage: num });
        }
    };

    const handlePaydayChange = (val: string) => {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
            updateSettings({ payday: num });
        }
    };

    const handleReset = () => {
        if (confirm('本当にすべてのデータを消去しますか？この操作は取り消せません。')) {
            resetData();
            router.push('/');
        }
    };

    const handleAddSubscription = () => {
        if (!subName || !subAmount) return;
        const amount = parseInt(subAmount, 10);
        if (isNaN(amount)) return;

        addSubscription({
            name: subName,
            amount: amount,
            type: subType,
        });

        setSubName('');
        setSubAmount('');
    };

    const calculateDailyCost = (amount: number, type: 'monthly' | 'yearly') => {
        if (type === 'monthly') {
            return Math.round((amount * 12) / 365);
        }
        return Math.round(amount / 365);
    };

    return (
        <Layout>
            <header className="p-4 flex items-center bg-white border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg ml-2 text-gray-900">設定</h1>
            </header>

            <main className="p-4 space-y-8 pb-24">
                {/* Basic Settings */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2">基本設定</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            初期残高（円）
                        </label>
                        <input
                            type="number"
                            value={initialBalance}
                            onChange={(e) => handleInitialBalanceChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-semibold"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ※変更すると現在の残高もこの値にリセットされます
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            時給（円）
                        </label>
                        <input
                            type="number"
                            value={hourlyWage}
                            onChange={(e) => handleHourlyWageChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-semibold"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ※「0」に設定すると時間換算表示がオフになります
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            給料日
                        </label>
                        <select
                            value={settings.payday || 25}
                            onChange={(e) => handlePaydayChange(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 font-semibold bg-white"
                        >
                            {[...Array(28)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}日</option>
                            ))}
                            <option value="99">末日</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            ※給料サイクル集計の基準日になります
                        </p>
                    </div>
                </section>

                {/* Subscription Settings */}
                <section className="space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center">
                        <CreditCard className="w-5 h-5 mr-2" />
                        サブスクリプション管理
                    </h2>

                    <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                        <h3 className="text-sm font-bold text-gray-700">新規登録</h3>
                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="サービス名（例: Netflix）"
                                value={subName}
                                onChange={(e) => setSubName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="金額"
                                    value={subAmount}
                                    onChange={(e) => setSubAmount(e.target.value)}
                                    className="flex-1 p-3 border border-gray-300 rounded-lg text-gray-900"
                                />
                                <select
                                    value={subType}
                                    onChange={(e) => setSubType(e.target.value as 'monthly' | 'yearly')}
                                    className="p-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
                                >
                                    <option value="monthly">月額</option>
                                    <option value="yearly">年額</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAddSubscription}
                                disabled={!subName || !subAmount}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                                <Plus className="w-5 h-5 mr-1" />
                                追加する
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {subscriptions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                                <div>
                                    <div className="font-bold text-gray-900">{sub.name}</div>
                                    <div className="text-xs text-gray-500">
                                        {sub.type === 'monthly' ? '月額' : '年額'} {sub.amount.toLocaleString()}円
                                        <span className="ml-2 text-blue-600 font-medium">
                                            (日割: {calculateDailyCost(sub.amount, sub.type)}円)
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeSubscription(sub.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        {subscriptions.length === 0 && (
                            <div className="text-center text-gray-400 py-4 text-sm">
                                登録されたサブスクリプションはありません
                            </div>
                        )}
                    </div>
                </section>

                {/* Danger Zone */}
                <section className="pt-8 border-t">
                    <button
                        onClick={handleReset}
                        className="w-full flex items-center justify-center p-4 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors font-bold"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        データを全消去・リセット
                    </button>
                </section>
            </main>
        </Layout>
    );
}
