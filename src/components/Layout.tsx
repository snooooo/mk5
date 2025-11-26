import React from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-100 flex justify-center">
            <div className="w-full max-w-md bg-white min-h-screen shadow-xl flex flex-col">
                {children}
            </div>
        </div>
    );
}
