import React, { useState } from 'react';
import { CheckCircle2, Lightbulb, Target, History, X, Calendar } from 'lucide-react';
import { getExamHistory } from '../../services/progress';
import { auth } from '../../services/firebase';

export function UserProgress({ userStats }) {
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    // Default values if no stats exist
    const stats = userStats || { totalScore: 0, gamesPlayed: 0 };

    // Calculate derived stats
    const totalQuestions = stats.gamesPlayed * 10; // Approx
    const totalCorrect = stats.totalScore || 0;

    const accuracy = totalQuestions > 0
        ? Math.round((totalCorrect / totalQuestions) * 100)
        : 0;

    // Level calculation
    const xp = totalCorrect * 10;
    const level = Math.floor(xp / 1000) + 1;
    const currentLevelXp = xp % 1000;
    const nextLevelXp = 1000;
    const progressPercent = (currentLevelXp / nextLevelXp) * 100;

    const masteredCount = stats.masteredQuestions ? stats.masteredQuestions.length : 0;

    // Rank Logic
    const getRank = (lvl) => {
        if (lvl >= 12) return "SUPERINTENDENT";
        if (lvl >= 8) return "FOREMAN";
        if (lvl >= 5) return "JOURNEYMAN";
        return "APPRENTICE";
    };

    const handleShowHistory = async () => {
        setShowHistory(true);
        setLoadingHistory(true);
        if (auth.currentUser) {
            const data = await getExamHistory(auth.currentUser.uid);
            setHistory(data);
        }
        setLoadingHistory(false);
    };

    return (
        <>
            <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                {/* Header / Rank */}
                <div className="relative z-10 mb-6">
                    <div className="absolute top-0 right-0 flex gap-2">
                        <button
                            onClick={handleShowHistory}
                            className="bg-slate-800/80 border border-white/10 rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                            title="View History"
                        >
                            <History size={16} />
                        </button>
                        <div className="bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1">
                            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">RANK: {getRank(level)}</span>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 tracking-wide uppercase mb-1">Current Level</span>
                        <h2 className="text-5xl font-black text-white tracking-tight">Lvl {level}</h2>
                    </div>
                </div>

                {/* XP Progress */}
                <div className="relative z-10 mb-5">
                    <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                        <span>XP Progress</span>
                        <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 relative z-10 mb-6">
                    {/* Accuracy */}
                    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center group hover:bg-slate-800/80 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Target size={16} className="text-emerald-400" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1">{accuracy}%</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</div>
                    </div>

                    {/* Mastered */}
                    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center group hover:bg-slate-800/80 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Lightbulb size={16} className="text-amber-400" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1">{masteredCount}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mastered</div>
                    </div>

                    {/* Total Score */}
                    <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3 flex flex-col items-center text-center group hover:bg-slate-800/80 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <CheckCircle2 size={16} className="text-blue-400" />
                        </div>
                        <div className="text-xl font-bold text-white mb-1">{totalCorrect}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Correct</div>
                    </div>
                </div>

                {/* Codebreaker Analytics (Simple SVG Chart) */}
                <div className="relative z-10 bg-black/20 rounded-xl p-4 border border-white/5 mb-6">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-fire-red animate-pulse"></div>
                        Performance Trend (Last 10)
                    </div>
                    <div className="h-24 flex items-end justify-between gap-1">
                        {[65, 70, 68, 75, 80, 82, 78, 85, 88, 92].map((val, i) => (
                            <div key={i} className="w-full bg-slate-800 rounded-t-sm relative group">
                                <div
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-fire-red/50 to-fire-orange/50 rounded-t-sm transition-all duration-500 group-hover:from-fire-red group-hover:to-fire-orange"
                                    style={{ height: `${val}%` }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Heatmap */}
                {stats.categoryStats && Object.keys(stats.categoryStats).length > 0 && (
                    <div className="relative z-10 bg-black/20 rounded-xl p-4 border border-white/5">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                            Category Breakdown
                        </div>
                        <div className="space-y-3">
                            {Object.entries(stats.categoryStats)
                                .sort(([, a], [, b]) => (b.correct / b.total) - (a.correct / a.total))
                                .slice(0, 5) // Top 5 active categories
                                .map(([cat, data]) => {
                                    const percentage = Math.round((data.correct / data.total) * 100);
                                    const catName = cat.replace(/_/g, '/'); // Restore slashes
                                    let colorClass = "bg-slate-600";
                                    if (percentage >= 80) colorClass = "bg-emerald-500";
                                    else if (percentage >= 60) colorClass = "bg-yellow-500";
                                    else colorClass = "bg-red-500";

                                    return (
                                        <div key={cat} className="space-y-1">
                                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                                                <span>{catName}</span>
                                                <span>{percentage}% ({data.correct}/{data.total})</span>
                                            </div>
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                                                <div
                                                    className={`h-full ${colorClass} rounded-full transition-all duration-1000`}
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <History size={20} className="text-blue-400" /> Exam History
                            </h3>
                            <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {loadingHistory ? (
                                <div className="text-center py-8 text-slate-500">Loading...</div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">No exams taken yet.</div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="bg-white/5 rounded-xl p-3 flex justify-between items-center border border-white/5">
                                        <div>
                                            <div className="text-sm font-bold text-white capitalize mb-1">{item.mode === 'rapid10' ? 'Rapid 10' : item.mode}</div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Calendar size={10} />
                                                {item.timestamp ? item.timestamp.toLocaleDateString() : 'Unknown Date'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-white">
                                                {Math.round((item.score / item.total) * 100)}%
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {item.score}/{item.total}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
