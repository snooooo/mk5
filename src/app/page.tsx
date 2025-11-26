'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Clock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useWallet } from '@/context/WalletContext';
import { Keypad } from '@/components/Keypad';
import { Layout } from '@/components/Layout';

function TransactionInputContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get('type') as 'income' | 'expense') || 'expense';

  const { addTransaction, settings } = useWallet();

  const [amountStr, setAmountStr] = useState('0');
  const [showResult, setShowResult] = useState(false);
  const [timeConsumed, setTimeConsumed] = useState<{ hours: number, minutes: number } | null>(null);

  const handleInput = (key: string) => {
    if (amountStr === '0' && key !== '00') {
      setAmountStr(key);
    } else {
      if (amountStr.length < 9) {
        setAmountStr(prev => prev + key);
      }
    }
  };

  const handleDelete = () => {
    if (amountStr.length === 1) {
      setAmountStr('0');
    } else {
      setAmountStr(prev => prev.slice(0, -1));
    }
  };

  const handleConfirm = () => {
    const amountVal = parseInt(amountStr);
    if (amountVal <= 0) return;

    const finalAmount = type === 'expense' ? -amountVal : amountVal;

    // Calculate time consumed before saving/resetting
    if (settings.hourlyWage > 0 && type === 'expense') {
      const hours = amountVal / settings.hourlyWage;
      const h = Math.floor(hours);
      const m = Math.round((hours - h) * 60);
      setTimeConsumed({ hours: h, minutes: m });
    }

    addTransaction({
      amount: finalAmount,
      type,
      memo: '', // Empty memo initially
    });

    setShowResult(true);
  };

  const handleClose = () => {
    router.push('/home');
  };

  if (showResult) {
    return (
      <div
        onClick={handleClose}
        className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-6 animate-in fade-in duration-300 cursor-pointer"
      >
        <div className="text-6xl font-bold mb-4">
          {type === 'expense' ? '-' : '+'}{parseInt(amountStr).toLocaleString()}
        </div>
        <div className="text-xl text-gray-400 mb-8">
          {type === 'expense' ? '支払いました' : '受け取りました'}
        </div>

        {timeConsumed && (
          <div className="bg-white/10 p-6 rounded-2xl text-center backdrop-blur-sm">
            <div className="text-sm text-gray-400 mb-2">あなたの人生</div>
            <div className="text-3xl font-bold text-yellow-400 flex items-center justify-center gap-2">
              <Clock className="w-8 h-8" />
              <span>
                {timeConsumed.hours > 0 && `${timeConsumed.hours}時間`}
                {timeConsumed.minutes}分
              </span>
            </div>
            <div className="text-sm text-gray-400 mt-2">を消費しました</div>
          </div>
        )}

        <div className="mt-12 text-sm text-gray-500 animate-pulse">
          画面をタップしてホームへ
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="w-10" /> {/* Spacer */}
        <h1 className="font-bold text-lg">
          {type === 'expense' ? '支出を記録' : '入金を記録'}
        </h1>
        <Link href="/home" className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
          <Wallet className="w-5 h-5 mr-1" />
          履歴
        </Link>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={`text-5xl font-bold mb-2 ${type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
            {type === 'expense' ? '-' : '+'}{parseInt(amountStr).toLocaleString()}
          </div>
        </div>

        <Keypad
          onInput={handleInput}
          onDelete={handleDelete}
          onConfirm={handleConfirm}
          confirmDisabled={parseInt(amountStr) === 0}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <TransactionInputContent />
      </Suspense>
    </Layout>
  );
}
