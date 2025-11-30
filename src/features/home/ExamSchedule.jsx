import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EXAM_DATES = [
    { date: '2025-12-05', status: 'closed', location: 'St. Paul, MN' },
    { date: '2026-02-06', status: 'open', daysLeft: 56, location: 'St. Paul, MN' },
    { date: '2026-04-03', status: 'open', daysLeft: 112, location: 'St. Paul, MN' },
    { date: '2026-06-05', status: 'open', daysLeft: 175, location: 'St. Paul, MN' },
    { date: '2026-08-07', status: 'open', daysLeft: 238, location: 'St. Paul, MN' },
    { date: '2026-10-02', status: 'open', daysLeft: 294, location: 'St. Paul, MN' },
    { date: '2026-12-04', status: 'open', daysLeft: 357, location: 'St. Paul, MN' },
];

export function ExamSchedule() {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="glass-panel rounded-xl p-4 relative overflow-hidden group transition-all duration-500">
            <div className="flex items-center gap-3 relative z-10">
                {/* Icon Box */}
                <div className="bg-white/5 p-2 rounded-lg border border-white/10 shrink-0">
                    <Calendar size={18} className="text-blue-400" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-y-1 gap-x-2 mb-1">
                        <h3 className="text-white font-bold text-xs tracking-wide whitespace-nowrap">EXAM SCHEDULE</h3>
                        <div className="px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
                            Reg. Closes in 56 Days
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] font-medium truncate">Next: <span className="text-white font-bold">Fri, Feb 6, 2026</span></span>

                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-blue-400 hover:text-blue-300 text-[9px] font-bold flex items-center gap-0.5 transition-colors group/btn ml-auto shrink-0"
                        >
                            {isExpanded ? 'HIDE' : 'VIEW'}
                            {isExpanded ? (
                                <ChevronUp size={12} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                            ) : (
                                <ChevronDown size={12} className="group-hover/btn:translate-y-0.5 transition-transform" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 border-t border-white/10 mt-4">
                            {/* Action Buttons */}
                            <div className="flex justify-center gap-3 mb-2">
                                <a href="#" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition-colors">
                                    User Guide <ExternalLink size={12} />
                                </a>
                                <a href="#" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-600/20">
                                    SFM Portal <ExternalLink size={12} />
                                </a>
                            </div>

                            {/* Scrollable List */}
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                {EXAM_DATES.map((exam, idx) => {
                                    const dateObj = new Date(exam.date);
                                    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();
                                    const day = dateObj.getDate();
                                    const year = dateObj.getFullYear();
                                    const dayName = dateObj.toLocaleString('default', { weekday: 'short' }).toUpperCase();

                                    const isOpen = exam.status === 'open';

                                    return (
                                        <div key={idx} className="bg-black/20 border border-white/5 rounded-lg p-2 flex items-center gap-3 hover:bg-white/5 transition-colors group/item">
                                            {/* Date Box */}
                                            <div className="bg-slate-800 rounded-md p-1.5 text-center min-w-[50px] border border-white/5 group-hover/item:border-white/10 transition-colors">
                                                <div className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-0.5">{month}</div>
                                                <div className="text-base font-bold text-white leading-none">{day}</div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-baseline gap-1.5 mb-0.5">
                                                    <span className="text-slate-400 text-[10px] font-bold uppercase">{dayName}, {year}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="text-white font-bold text-xs truncate">
                                                        {exam.location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <div className={`w-1 h-1 rounded-full ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                        <span className={`text-[10px] font-bold ${isOpen ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {isOpen ? `${exam.daysLeft} days` : 'Closed'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
