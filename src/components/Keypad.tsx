import React from 'react';
import { Delete, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface KeypadProps {
    onInput: (value: string) => void;
    onDelete: () => void;
    onConfirm: () => void;
    confirmDisabled?: boolean;
}

export function Keypad({ onInput, onDelete, onConfirm, confirmDisabled }: KeypadProps) {
    const keys = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '00', '0'];

    return (
        <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 rounded-t-2xl">
            {keys.map((key) => (
                <button
                    key={key}
                    onClick={() => onInput(key)}
                    className="h-16 text-2xl font-bold text-gray-900 bg-white rounded-xl shadow-sm active:bg-gray-100 transition-colors"
                >
                    {key}
                </button>
            ))}
            <button
                onClick={onDelete}
                className="h-16 flex items-center justify-center bg-gray-200 rounded-xl active:bg-gray-300 transition-colors"
            >
                <Delete className="w-6 h-6 text-gray-700" />
            </button>

            <button
                onClick={onConfirm}
                disabled={confirmDisabled}
                className={clsx(
                    "col-span-3 h-16 flex items-center justify-center rounded-xl text-white font-bold text-xl transition-colors",
                    confirmDisabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 active:bg-blue-700 shadow-md"
                )}
            >
                <Check className="w-6 h-6 mr-2" />
                決定
            </button>
        </div>
    );
}
