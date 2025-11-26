'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Save } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { Layout } from '@/components/Layout';

export default function SettingsPage() {
    const router = useRouter();
    const { settings, updateSettings, resetData } = useWallet();

    const [initialBalance, setInitialBalance] = useState(settings.initialBalance.toString());
    const [hourlyWage, setHourlyWage] = useState(settings.hourlyWage.toString());

    // Sync local state when settings load
    useEffect(() => {
        setInitialBalance(settings.initialBalance.toString());
        setHourlyWage(settings.hourlyWage.toString());
    }, [settings]);

    const handleSave = () => {
        const newInitialBalance = parseInt(initialBalance) || 0;
        const newHourlyWage = parseInt(hourlyWage) || 0;

        updateSettings({
            initialBalance: newInitialBalance,
            currentBalance: newInitialBalance, // Also update current balance
            hourlyWage: newHourlyWage,
        });
        router.back();
    };

    const handleReset = () => {
        if (window.confirm('本当にすべてのデータを削除しますか？この操作は取り消せません。')) {
            if (window.confirm('データは完全に消去されます。よろしいですか？')) {
                resetData();
                router.push('/');
            }
        }
    };

    return (
        <Layout>
            <header className="p-4 flex items-center bg-white border-b border-gray-100">
                <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg ml-2">設定</h1>
            </header>

            <main className="p-4 space-y-6">
                <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="font-bold text-gray-800 mb-4">基本設定</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                初期残高（円）
                            </label>
                            <input
                                type="number"
                                value={initialBalance}
                                onChange={(e) => setInitialBalance(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                                onChange={(e) => setHourlyWage(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                ※「0」に設定すると時間換算表示がオフになります
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center shadow-md active:bg-blue-700 transition-colors"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        設定を保存
                    </button>
                </section>

                <section className="bg-white p-4 rounded-xl shadow-sm border border-red-100">
                    <h2 className="font-bold text-red-600 mb-4">危険な操作</h2>

                    <button
                        onClick={handleReset}
                        className="w-full bg-red-50 text-red-600 font-bold py-3 rounded-lg flex items-center justify-center border border-red-200 active:bg-red-100 transition-colors"
                    >
                        <Trash2 className="w-5 h-5 mr-2" />
                        データを全消去・リセット
                    </button>
                </section>
            </main>
        </Layout>
    );
}
