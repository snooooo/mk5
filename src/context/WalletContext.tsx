'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { WalletSettings, Transaction } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WalletContextType {
    settings: WalletSettings;
    transactions: Transaction[];
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
    updateSettings: (newSettings: Partial<WalletSettings>) => void;
    editTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => void;
    resetData: () => void;
    isLoading: boolean;
}

const defaultSettings: WalletSettings = {
    initialBalance: 100000,
    currentBalance: 100000,
    hourlyWage: 2000,
    currency: '¥',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    // Initialize with default values, but useLocalStorage will update them from storage after mount
    const [settings, setSettings] = useLocalStorage<WalletSettings>('mk5_settings', defaultSettings);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('mk5_transactions', []);
    const [isLoaded, setIsLoaded] = React.useState(false);

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

        // Update current balance
        const newBalance = settings.currentBalance + transaction.amount;
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

    const editTransaction = (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>) => {
        setTransactions(prev => prev.map(tx =>
            tx.id === id ? { ...tx, ...updates } : tx
        ));
    };

    const resetData = () => {
        setSettings(defaultSettings);
        setTransactions([]);
    };

    return (
        <WalletContext.Provider
            value={{
                settings,
                transactions,
                addTransaction,
                updateSettings,
                editTransaction,
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
