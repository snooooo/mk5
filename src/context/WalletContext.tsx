'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { WalletSettings, Transaction, Subscription } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WalletContextType {
    settings: WalletSettings;
    transactions: Transaction[];
    subscriptions: Subscription[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    updateSettings: (newSettings: Partial<WalletSettings>) => void;
    editTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
    addSubscription: (subscription: Omit<Subscription, 'id' | 'createdAt'>) => void;
    removeSubscription: (id: string) => void;
    resetData: () => void;
    isLoading: boolean;
}

const defaultSettings: WalletSettings = {
    initialBalance: 100000,
    currentBalance: 100000,
    hourlyWage: 2000,
    currency: '¥',
    payday: 25,
    lastSubscriptionProcessDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useLocalStorage<WalletSettings>('mk5_settings', defaultSettings);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('mk5_transactions', []);
    const [subscriptions, setSubscriptions] = useLocalStorage<Subscription[]>('mk5_subscriptions', []);
    const [isLoaded, setIsLoaded] = React.useState(false);

    // Process daily subscriptions
    useEffect(() => {
        if (!isLoaded || subscriptions.length === 0) return;

        const today = new Date().toISOString().split('T')[0];
        const lastProcessDate = settings.lastSubscriptionProcessDate || today;

        if (lastProcessDate === today) return;

        // Calculate days to process
        const start = new Date(lastProcessDate);
        const end = new Date(today);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return;

        const newTransactions: Transaction[] = [];
        let totalCost = 0;

        // Calculate daily cost for all subscriptions
        const dailyTotal = subscriptions.reduce((sum, sub) => {
            const dailyCost = sub.type === 'monthly'
                ? Math.round((sub.amount * 12) / 365)
                : Math.round(sub.amount / 365);
            return sum + dailyCost;
        }, 0);

        // Generate transactions for each day
        for (let i = 1; i <= diffDays; i++) {
            const date = new Date(start);
            date.setDate(date.getDate() + i);

            newTransactions.push({
                id: crypto.randomUUID(),
                amount: dailyTotal,
                type: 'expense',
                memo: 'サブスクリプション（日割り）',
                isSubscription: true,
                createdAt: date.toISOString(),
            });
            totalCost += dailyTotal;
        }

        setTransactions(prev => [...newTransactions, ...prev]);
        setSettings(prev => ({
            ...prev,
            currentBalance: prev.currentBalance - totalCost,
            lastSubscriptionProcessDate: today,
            updatedAt: new Date().toISOString(),
        }));

    }, [isLoaded, subscriptions, settings.lastSubscriptionProcessDate]);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const addTransaction = (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
        const transaction: Transaction = {
            ...newTx,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };

        const updatedTransactions = [transaction, ...transactions];
        setTransactions(updatedTransactions);

        const newBalance = newTx.type === 'income'
            ? settings.currentBalance + newTx.amount
            : settings.currentBalance - newTx.amount;

        setSettings({
            ...settings,
            currentBalance: newBalance,
            updatedAt: new Date().toISOString(),
        });
    };

    const updateSettings = (newSettings: Partial<WalletSettings>) => {
        setSettings((prev) => ({
            ...prev,
            ...newSettings,
            updatedAt: new Date().toISOString(),
        }));
    };

    const editTransaction = (id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
        setTransactions(prev => prev.map(tx =>
            tx.id === id ? { ...tx, ...updates } : tx
        ));
    };

    const addSubscription = (newSub: Omit<Subscription, 'id' | 'createdAt'>) => {
        const subscription: Subscription = {
            ...newSub,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
        };
        setSubscriptions(prev => [...prev, subscription]);
    };

    const removeSubscription = (id: string) => {
        setSubscriptions(prev => prev.filter(sub => sub.id !== id));
    };

    const resetData = () => {
        setSettings(defaultSettings);
        setTransactions([]);
        setSubscriptions([]);
    };

    return (
        <WalletContext.Provider
            value={{
                settings,
                transactions,
                subscriptions,
                addTransaction,
                updateSettings,
                editTransaction,
                addSubscription,
                removeSubscription,
                resetData,
                isLoading: !isLoaded,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
