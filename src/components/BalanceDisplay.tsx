import React from 'react';
import { WalletSettings } from '@/types';

interface BalanceDisplayProps {
    settings: WalletSettings;
}

export function BalanceDisplay({ settings }: BalanceDisplayProps) {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-2xl shadow-lg mb-6">
            <div className="text-gray-400 text-sm mb-1">現在の残高</div>
            <div className="text-4xl font-bold mb-4">
                {settings.currency} {settings.currentBalance.toLocaleString()}
            </div>
        </div>
    );
}
