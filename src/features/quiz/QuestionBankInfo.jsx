import React from 'react';
import { Database, RefreshCw, Layers } from 'lucide-react';

export function QuestionBankInfo({ questions, loading, onReload }) {
    return (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Database size={64} className="text-white" />
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={14} /> System Status
                </h3>

                <div className="flex items-baseline gap-2 mb-2">
                    {loading ? (
                        <div className="h-10 w-24 bg-white/10 rounded animate-pulse"></div>
                    ) : (
                        <span className="text-4xl font-bold text-white text-glow">{questions.length}</span>
                    )}
                    <span className="text-slate-500 font-medium">Total Questions</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
                    Database Online
                </div>

                <button
                    onClick={onReload}
                    disabled={loading}
                    className="mt-6 text-xs font-bold text-slate-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-wider"
                >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Refresh Data
                </button>
            </div>
        </div>
    );
}
