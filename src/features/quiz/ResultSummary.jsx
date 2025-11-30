import React from 'react';
import { Trophy, RotateCcw, Home, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function ResultSummary({ score, total, onRetry, onHome, questions, userAnswers }) {
    const percentage = Math.round((score / total) * 100);
    const passed = percentage >= 70;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto"
        >
            <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center mb-8 relative overflow-hidden">
                {/* Background Glow */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 blur-[100px] pointer-events-none ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} />

                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className={`
                        w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10
                        ${passed ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/40' : 'bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/40'}
                    `}
                >
                    <Trophy size={40} className="text-white drop-shadow-md" />
                </motion.div>

                <h2 className="text-4xl font-bold text-white mb-2 relative z-10 text-glow">
                    {passed ? 'Shift Complete!' : 'Keep Training!'}
                </h2>
                <p className="text-slate-300 text-lg mb-8 relative z-10">
                    {passed ? 'Excellent work, firefighter.' : 'Review your mistakes and try again.'}
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-10 relative z-10">
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Score</div>
                        <div className={`text-3xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{score}</div>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Total</div>
                        <div className="text-3xl font-bold text-white">{total}</div>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-1">Accuracy</div>
                        <div className={`text-3xl font-bold ${passed ? 'text-emerald-400' : 'text-red-400'}`}>{percentage}%</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <button
                        onClick={onHome}
                        className="px-8 py-3 rounded-xl font-bold border border-white/10 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={20} /> Dashboard
                    </button>
                    <button
                        onClick={onRetry}
                        className="px-8 py-3 rounded-xl font-bold bg-white text-slate-900 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10"
                    >
                        <RotateCcw size={20} /> Play Again
                    </button>
                </div>
            </div>

            {/* Review Section */}
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white px-4 flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    Review Incorrect Answers
                </h3>

                {questions.map((q, idx) => {
                    const userAns = userAnswers[idx];
                    const isCorrect = userAns === q.correct;

                    if (isCorrect) return null;

                    return (
                        <motion.div
                            key={q.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/5"
                        >
                            <div className="flex gap-4 mb-6">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold shrink-0 border border-red-500/20">
                                    <XCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-lg text-white font-medium leading-relaxed">{q.question}</p>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 mb-6">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                    <div className="text-xs text-red-400 font-bold uppercase mb-2 flex items-center gap-2">
                                        <XCircle size={14} /> Your Answer
                                    </div>
                                    <p className="text-red-100">{q.options[userAns] || "Skipped"}</p>
                                </div>
                                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
                                    <div className="text-xs text-emerald-400 font-bold uppercase mb-2 flex items-center gap-2">
                                        <CheckCircle size={14} /> Correct Answer
                                    </div>
                                    <p className="text-emerald-100">{q.options[q.correct]}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-5 rounded-xl text-left w-full border border-slate-700/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                                    Code Text / Explanation
                                </h4>
                                {(q.code_text && q.code_text !== "No explanation provided.") ? (
                                    <p className="text-slate-300 text-sm leading-relaxed mb-3">{q.code_text}</p>
                                ) : (
                                    <p className="text-slate-400 italic text-sm mb-3">Refer to Standard</p>
                                )}
                                {q.citation && (
                                    <div className="text-xs text-slate-500 font-mono mt-3 pt-2 border-t border-white/5">
                                        Ref: {q.citation}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    );
                })}

                {questions.every((q, idx) => userAnswers[idx] === q.correct) && (
                    <div className="text-center p-12 glass-panel rounded-3xl border border-emerald-500/20 bg-emerald-500/5">
                        <Trophy size={48} className="text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-emerald-300 mb-2">Perfect Score!</h3>
                        <p className="text-emerald-200/70">There are no incorrect answers to review.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
