import React, { useState, useEffect } from 'react';
import { ArrowLeft, Siren, AlertOctagon, Skull, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HapticFeedback } from '../../services/haptics';
import { saveScore } from '../../services/progress';

export function FireMarshal({ questions, onExit, onFinish }) {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isGameOver, setIsGameOver] = useState(false);
    const [gameQuestions, setGameQuestions] = useState([]);
    const [highScore, setHighScore] = useState(0);

    // Infinite mode: shuffle all questions initially
    useEffect(() => {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        setGameQuestions(shuffled);
    }, [questions]);

    if (gameQuestions.length === 0) return null;

    // If we run out of questions (rare), reshuffle
    if (currentQIndex >= gameQuestions.length) {
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        setGameQuestions(prev => [...prev, ...shuffled]);
    }

    const currentQ = gameQuestions[currentQIndex];

    const handleOptionClick = async (index) => {
        if (selectedOption !== null) return;

        setSelectedOption(index);

        if (index === currentQ.correct) {
            // Correct
            await HapticFeedback.success();
            setTimeout(() => {
                setScore(s => s + 1);
                setCurrentQIndex(i => i + 1);
                setSelectedOption(null);
            }, 800); // Quick transition for flow
        } else {
            // WRONG - GAME OVER
            await HapticFeedback.error();
            setIsGameOver(true);
            // Save score immediately and mark the missed question
            if (onFinish) onFinish(score, score + 1, [currentQ.id], [currentQ.id]); // Treat as score/total
        }
    };

    if (isGameOver) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-in fade-in zoom-in duration-300">
                <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6 border-4 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                    <Skull size={48} className="text-red-500" />
                </div>

                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">BUSTED!</h2>
                <p className="text-slate-400 mb-8 text-lg">The Fire Marshal shut you down.</p>

                <div className="bg-black/40 p-6 rounded-2xl border border-white/10 w-full max-w-sm mb-8 backdrop-blur-md">
                    <div className="text-sm text-slate-500 uppercase tracking-widest font-bold mb-1">Streak</div>
                    <div className="text-6xl font-black text-fire-red text-glow">{score}</div>
                </div>

                <div className="flex gap-4 w-full max-w-sm">
                    <button
                        onClick={onExit}
                        className="flex-1 py-4 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-colors"
                    >
                        Exit
                    </button>
                    <button
                        onClick={() => {
                            setIsGameOver(false);
                            setScore(0);
                            setCurrentQIndex(0);
                            setSelectedOption(null);
                            const shuffled = [...questions].sort(() => 0.5 - Math.random());
                            setGameQuestions(shuffled);
                        }}
                        className="flex-1 py-4 rounded-xl bg-fire-red text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-fire-red/20"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full md:max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8 px-2">
                <button
                    onClick={onExit}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-300" />
                </button>

                <div className="px-4 py-1.5 rounded-full bg-red-950/50 border border-red-500/30 text-red-400 text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.2)] animate-pulse">
                    <Siren size={18} />
                    SUDDEN DEATH
                </div>

                <div className="font-mono font-bold text-xl text-white">
                    {score}
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQ.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    className="glass-panel rounded-2xl p-6 sm:p-10 relative overflow-hidden border-red-500/10"
                >
                    <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-8 text-white">
                        {currentQ.question}
                    </h2>

                    <div className="space-y-3">
                        {currentQ.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={`
                                    w-full text-left p-4 sm:p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group
                                    bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200
                                    active:scale-[0.98]
                                `}
                                onClick={() => handleOptionClick(idx)}
                            >
                                <span className="leading-relaxed font-medium text-base">{opt}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
