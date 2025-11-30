import React from 'react';
import { BarChart3, Book } from 'lucide-react';

export function StatsCard({ filteredCount, totalCount, isMnOnly }) {
    return (
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <BarChart3 size={64} className="text-white" />
            </div>

            <div className="relative z-10">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Book size={14} /> Question Bank
                </h3>

                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold text-white text-glow">{filteredCount}</span>
                    <span className="text-slate-500 font-medium">/ {totalCount}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-400">
                    <div className={`w-2 h-2 rounded-full ${isMnOnly ? 'bg-fire-orange shadow-[0_0_8px_rgba(249,115,22,0.8)]' : 'bg-slate-600'}`}></div>
                    {isMnOnly ? 'MN Statutes Active' : 'All Categories'}
                </div>
            </div>
        </div>
    );
}
