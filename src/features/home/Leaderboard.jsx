import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { subscribeToLeaderboard } from '../../services/progress';

export function Leaderboard() {
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToLeaderboard((data) => {
            setLeaders(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="glass-panel rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl"></div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg shadow-lg shadow-orange-500/20">
                    <Trophy size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white tracking-wide">Top Fitters</h3>
            </div>

            <div className="space-y-2 relative z-10">
                {leaders.map((player, index) => {
                    let rankIcon = <span className="text-slate-500 font-mono font-bold w-6 text-center">{index + 1}</span>;
                    let rowClass = "bg-white/5 border-white/5 hover:bg-white/10";
                    let textClass = "text-slate-300";

                    if (index === 0) {
                        rankIcon = <Crown size={20} className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />;
                        rowClass = "bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
                        textClass = "text-yellow-100 font-bold";
                    } else if (index === 1) {
                        rankIcon = <Medal size={20} className="text-slate-300" />;
                        rowClass = "bg-white/10 border-white/20";
                        textClass = "text-white font-semibold";
                    } else if (index === 2) {
                        rankIcon = <Medal size={20} className="text-orange-400" />;
                        rowClass = "bg-orange-500/10 border-orange-500/20";
                        textClass = "text-orange-100";
                    }

                    return (
                        <div key={index} className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 group hover:scale-[1.01] active:scale-[0.99] ${rowClass}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 flex justify-center shrink-0">
                                    {rankIcon}
                                </div>
                                <div>
                                    <div className={`text-sm ${textClass} group-hover:text-white transition-colors`}>
                                        {player.displayName || 'Anonymous'}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">
                                        {player.gamesPlayed} Missions
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-bold text-white font-mono bg-black/20 px-2 py-1 rounded border border-white/5">
                                    {player.totalScore}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {leaders.length === 0 && (
                    <div className="text-center py-8 text-slate-500 italic text-sm">
                        No records yet. Be the first!
                    </div>
                )}
            </div>
        </div>
    );
}
