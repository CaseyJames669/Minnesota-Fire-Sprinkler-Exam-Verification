import React from 'react';
import { Search, Filter, BookOpen } from 'lucide-react';

export function FilterBar({ filters, onFilterChange, categories }) {
    return (
        <div className="glass-panel rounded-xl p-4 space-y-3 mb-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="w-1.5 h-6 bg-gradient-to-b from-safety-yellow to-orange-500 rounded-full shadow-[0_0_10px_rgba(255,215,0,0.5)]"></div>
                Study Filters
            </h2>
            {/* Row 1: Search */}
            <div className="relative group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-fire-red transition-colors" size={16} />
                <input
                    type="text"
                    placeholder="Search keywords..."
                    className="input-field pl-10 bg-black/20 border-white/10 focus:bg-black/40 h-10 text-sm w-full box-border rounded-lg"
                    value={filters.search}
                    onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                />
            </div>

            {/* Row 2: Dropdowns */}
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        className="input-field pl-8 appearance-none cursor-pointer hover:bg-white/5 transition-colors w-full h-10 text-xs sm:text-sm rounded-lg"
                        value={filters.category}
                        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                        ))}
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                        ▼
                    </div>
                </div>

                <div className="relative">
                    <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <select
                        className="input-field pl-8 appearance-none cursor-pointer hover:bg-white/5 transition-colors w-full h-10 text-xs sm:text-sm rounded-lg"
                        value={filters.difficulty}
                        onChange={(e) => onFilterChange({ ...filters, difficulty: e.target.value })}
                    >
                        <option value="">All Levels</option>
                        <option value="Easy" className="bg-slate-900 text-emerald-400">Easy</option>
                        <option value="Medium" className="bg-slate-900 text-yellow-400">Medium</option>
                        <option value="Hard" className="bg-slate-900 text-red-400">Hard</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-[10px]">
                        ▼
                    </div>
                </div>
            </div>

            {/* Row 3: MN Only */}
            <label className="flex items-center gap-2 p-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 cursor-pointer transition-all group justify-center sm:justify-start">
                <div className={`
                    w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${filters.mnOnly ? 'bg-fire-red border-fire-red' : 'border-slate-500 group-hover:border-slate-400'}
                `}>
                    {filters.mnOnly && <span className="text-white font-bold text-[10px]">✓</span>}
                </div>
                <input
                    type="checkbox"
                    checked={filters.mnOnly}
                    onChange={(e) => onFilterChange({ ...filters, mnOnly: e.target.checked })}
                    className="hidden"
                />
                <span className={`text-sm font-medium transition-colors ${filters.mnOnly ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                    MN Amendments Only
                </span>
            </label>
        </div>
    );
}
