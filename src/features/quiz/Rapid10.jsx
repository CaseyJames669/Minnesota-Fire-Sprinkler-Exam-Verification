import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertTriangle, RotateCcw, Home, AlertCircle, HelpCircle, ArrowRight, Flame, Trophy, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultSummary } from './ResultSummary';
import { HapticFeedback } from '../../services/haptics';
import { saveScore, getUserStats, saveMissedQuestions, getMissedQuestions } from '../../services/progress';
import { ReferenceModal } from '../../ui/ReferenceModal';

export function Rapid10({ questions, onExit, onFinish, mode = 'standard', isGauntletMode = false }) {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isFinished, setIsFinished] = useState(false);
    const [gameQuestions, setGameQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [missedQuestions, setMissedQuestions] = useState([]);
    const [showReference, setShowReference] = useState(false);

    // Theme Config based on Mode
    const theme = isGauntletMode ? {
        bg: 'from-purple-600 to-purple-500',
        shadow: 'shadow-purple-500/20',
        text: 'Missed Question Gauntlet',
        icon: <RotateCcw size={20} />,
        progressBg: 'from-purple-600 to-purple-400'
    } : mode === 'review' ? {
        bg: 'from-amber-600 to-amber-500',
        shadow: 'shadow-amber-500/20',
        text: 'Review Mode',
        icon: <RotateCcw size={20} />,
        progressBg: 'from-amber-600 to-amber-400'
    } : {
        bg: 'from-fire-red to-fire-orange',
        shadow: 'shadow-fire-red/20',
        text: 'Rapid 10',
        icon: <Flame size={20} />,
        progressBg: 'from-fire-red to-fire-orange'
    };

    useEffect(() => {
        if (isGauntletMode) {
            // In Gauntlet mode, use all provided questions without shuffling
            setGameQuestions(questions);
        } else {
            const shuffled = [...questions].sort(() => 0.5 - Math.random());
            setGameQuestions(shuffled.slice(0, 10));
        }
    }, [questions, isGauntletMode]);

    if (gameQuestions.length === 0) return (
        <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fire-red"></div>
        </div>
    );

    const currentQ = gameQuestions[currentQIndex];
    const totalQuestions = isGauntletMode ? gameQuestions.length : 10;
    const progress = ((currentQIndex) / totalQuestions) * 100;

    const handleOptionClick = async (index) => {
        if (selectedOption !== null) return;

        await HapticFeedback.light();

        setSelectedOption(index);
        setUserAnswers(prev => ({ ...prev, [currentQIndex]: index }));

        if (index === currentQ.correct) {
            setScore(s => s + 1);
            await HapticFeedback.success();
        } else {
            setMissedQuestions(prev => [...prev, currentQ.id]);
            await HapticFeedback.error();
        }
    };

    const handleNext = () => {
        const maxIndex = isGauntletMode ? gameQuestions.length - 1 : 9;
        if (currentQIndex < maxIndex && currentQIndex < gameQuestions.length - 1) {
            setCurrentQIndex(i => i + 1);
            setSelectedOption(null);
        } else {
            setIsFinished(true);
            if (onFinish) onFinish(score, gameQuestions.length, missedQuestions, gameQuestions.map(q => q.id));
        }
    };

    if (isFinished) {
        return (
            <ResultSummary
                score={score}
                total={totalQuestions}
                onRetry={() => {
                    setIsFinished(false);
                    setCurrentQIndex(0);
                    setScore(0);
                    setSelectedOption(null);
                    setUserAnswers({});
                    setMissedQuestions([]);
                    if (!isGauntletMode) {
                        const shuffled = [...questions].sort(() => 0.5 - Math.random());
                        setGameQuestions(shuffled.slice(0, 10));
                    }
                }}
                onHome={onExit}
                questions={gameQuestions}
                userAnswers={userAnswers}
            />
        );
    }

    return (
        <div className="w-full md:max-w-3xl mx-auto">
            {/* Header / Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-end mb-4 px-2">
                    <button
                        onClick={onExit}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        <ArrowLeft size={24} className="text-slate-300" />
                    </button>

                    <div className={`px-4 py-1.5 rounded-full bg-gradient-to-r ${theme.bg} text-white text-sm font-bold flex items-center gap-2 shadow-lg ${theme.shadow}`}>
                        {theme.icon}
                        {theme.text}
                    </div>

                    <div className="text-slate-400 font-mono font-bold">
                        {currentQIndex + 1}/{totalQuestions}
                    </div>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                    <motion.div
                        className={`h-full bg-gradient-to-r ${theme.progressBg} shadow-[0_0_10px_rgba(147,51,234,0.5)]`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, x: 50, rotateY: -10 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: -50, rotateY: 10 }}
                    transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                    className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-10 relative overflow-hidden"
                >
                    {/* Decorative background blur */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <h2 className="text-xl sm:text-3xl font-bold leading-tight mb-8 text-white relative z-10">
                        {currentQ.question}
                    </h2>

                    {currentQ.media && (
                        <div className="mb-8 relative z-10">
                            {currentQ.media.type === 'image' ? (
                                <img
                                    src={currentQ.media.url}
                                    alt="Question Reference"
                                    className="max-h-[300px] rounded-xl border border-white/10 shadow-2xl"
                                />
                            ) : (
                                <div className="text-sm text-slate-500 italic bg-black/20 p-4 rounded-xl border border-white/5 inline-flex items-center gap-2">
                                    <HelpCircle size={16} /> Video content available in Full Quiz mode
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-3 relative z-10">
                        {currentQ.options.map((opt, idx) => {
                            let stateClass = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200";
                            let icon = null;

                            if (selectedOption !== null) {
                                if (idx === currentQ.correct) {
                                    stateClass = "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
                                    icon = <CheckCircle size={20} className="text-emerald-400" />;
                                } else if (idx === selectedOption) {
                                    stateClass = "bg-red-500/20 border-red-500/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)]";
                                    icon = <AlertTriangle size={20} className="text-red-400" />;
                                } else {
                                    stateClass = "bg-black/20 border-white/5 text-slate-500 opacity-50";
                                }
                            }

                            return (
                                <button
                                    key={idx}
                                    className={`
                                        w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group
                                        ${stateClass}
                                        ${selectedOption === null ? 'hover:scale-[1.01] hover:shadow-lg active:scale-[0.98]' : ''}
                                    `}
                                    onClick={() => handleOptionClick(idx)}
                                    disabled={selectedOption !== null}
                                >
                                    <span className="leading-relaxed font-medium text-base sm:text-lg">{opt}</span>
                                    {icon}
                                </button>
                            );
                        })}
                    </div>

                    {selectedOption !== null && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                            animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                            className="border-t border-white/10 pt-8"
                        >
                            <div className="bg-slate-900/50 p-6 rounded-xl text-left w-full border border-slate-700/50 mb-8">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                                    Code Text / Explanation
                                </h4>
                                {(currentQ.code_text && currentQ.code_text !== "No explanation provided.") ? (
                                    <>
                                        <p className="text-slate-300 leading-relaxed mb-3 text-sm sm:text-base">{currentQ.code_text}</p>
                                        {currentQ.citation && (
                                            <div className="text-xs text-slate-500 font-mono mt-4 pt-2 border-t border-white/5 flex items-center gap-2">
                                                Ref:
                                                <button
                                                    onClick={() => setShowReference(true)}
                                                    className="text-blue-400 hover:text-blue-300 underline decoration-dashed transition-colors"
                                                >
                                                    {currentQ.citation}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-slate-400 italic mb-2 text-sm">Refer to Standard:</p>
                                        <button
                                            onClick={() => setShowReference(true)}
                                            className="text-lg font-bold text-blue-400 font-mono hover:text-blue-300 underline decoration-dashed underline-offset-4 transition-colors"
                                        >
                                            {currentQ.citation || "N/A"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                className={`w-full py-4 bg-gradient-to-r ${theme.bg} hover:opacity-90 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg ${theme.shadow} hover:scale-[1.02] active:scale-[0.98]`}
                                onClick={handleNext}
                            >
                                {currentQIndex < (isGauntletMode ? gameQuestions.length - 1 : 9) ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            <ReferenceModal
                citation={currentQ.citation}
                isOpen={showReference}
                onClose={() => setShowReference(false)}
            />
        </div>
    );
}
