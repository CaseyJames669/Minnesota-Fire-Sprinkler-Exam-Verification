import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { saveMissedQuestions } from '../../services/progress';

import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function Flashcards({ questions, onExit, user }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [userGuess, setUserGuess] = useState(null);

    useEffect(() => {
        // Shuffle questions for the session
        const shuffled = [...questions].sort(() => 0.5 - Math.random());
        setShuffledQuestions(shuffled);
    }, [questions]);

    if (shuffledQuestions.length === 0) return <div className="text-center p-8 text-slate-400">Loading cards...</div>;

    const currentQ = shuffledQuestions[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setUserGuess(null);
        setTimeout(() => {
            setCurrentIndex(prev => (prev + 1) % shuffledQuestions.length);
        }, 400);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setUserGuess(null);
        setTimeout(() => {
            setCurrentIndex(prev => (prev - 1 + shuffledQuestions.length) % shuffledQuestions.length);
        }, 400);
    };

    const handleFlip = async () => {
        if (!isFlipped) {
            await Haptics.impact({ style: ImpactStyle.Light });
            // If flipping to reveal without choosing, mark as wrong (or just reveal)
            if (user) {
                saveMissedQuestions(user.uid, [currentQ.id]);
            }
            setIsFlipped(!isFlipped);
        } else {
            // If already flipped (showing back), go to next card
            await Haptics.impact({ style: ImpactStyle.Medium });
            handleNext();
        }
    };

    const handleOptionClick = async (e, idx) => {
        e.stopPropagation();
        await Haptics.impact({ style: ImpactStyle.Light });
        setUserGuess(idx);
        if (idx === currentQ.correct) {
            // Correct - just flip
            setIsFlipped(true);
        } else {
            // Wrong - mark as missed and flip
            if (user) {
                saveMissedQuestions(user.uid, [currentQ.id]);
            }
            setIsFlipped(true);
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-4">
            <div className="flex justify-between items-center px-2">
                <button
                    onClick={onExit}
                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors active:scale-95"
                >
                    <ArrowLeft size={24} />
                </button>
                <button
                    onClick={() => {
                        const shuffled = [...questions].sort(() => 0.5 - Math.random());
                        setShuffledQuestions(shuffled);
                        setCurrentIndex(0);
                        setIsFlipped(false);
                        setUserGuess(null);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-slate-400 hover:text-white transition-all active:scale-95"
                >
                    <RotateCcw size={14} /> Shuffle Deck
                </button>
            </div>

            <div className="h-[calc(100vh-320px)] min-h-[400px] w-full relative perspective-1000 group cursor-pointer" onClick={handleFlip}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front of Card */}
                    <div
                        className="absolute w-full h-full backface-hidden bg-slate-900/90 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-4 sm:p-8 pb-8 sm:pb-10 flex flex-col items-center text-center backdrop-blur-xl"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <div className="w-full flex justify-between items-start mb-4 shrink-0">
                            <h3 className="text-slate-500 uppercase tracking-widest text-xs font-bold">Question</h3>
                            <span className="font-mono text-xs text-slate-400 bg-black/20 px-2 py-1 rounded border border-white/5">
                                {currentIndex + 1} / {shuffledQuestions.length}
                            </span>
                        </div>

                        <div className="flex-1 w-full flex flex-col justify-start items-center overflow-y-auto my-4">
                            <h2 className="text-lg sm:text-2xl font-medium leading-relaxed mb-4">{currentQ.question}</h2>
                            {currentQ.media && (
                                <div className="mb-6">
                                    {currentQ.media.type === 'image' ? (
                                        <img
                                            src={currentQ.media.url}
                                            alt="Question Reference"
                                            className="max-h-[200px] rounded-lg border border-slate-600"
                                        />
                                    ) : (
                                        <div className="text-sm text-slate-500 italic">
                                            (Video available in Quiz Mode)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="w-full max-w-lg mx-auto flex flex-col gap-3 shrink-0">
                            {currentQ.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => handleOptionClick(e, idx)}
                                    className="w-full p-4 rounded-xl bg-black/20 border border-white/5 text-slate-200 text-base sm:text-lg font-medium flex items-center justify-center text-center hover:bg-white/10 hover:border-white/20 hover:scale-[1.01] transition-all active:scale-95"
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Back of Card */}
                    <div
                        className="absolute w-full h-full backface-hidden bg-slate-900/90 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 sm:p-8 flex flex-col items-center text-center backdrop-blur-xl"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <div className="w-full flex justify-between items-start mb-2 shrink-0">
                            <h3 className="text-slate-500 uppercase tracking-widest text-xs font-bold">Answer</h3>
                            <span className="font-mono text-xs text-slate-400 bg-black/20 px-2 py-1 rounded border border-white/5">
                                {currentIndex + 1} / {shuffledQuestions.length}
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col justify-start items-center w-full mt-4 overflow-y-auto px-2">
                            {/* Feedback Section */}
                            <div className="mb-6 w-full">
                                {userGuess !== null && (
                                    <div className={`text-xl font-bold mb-2 ${userGuess === currentQ.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {userGuess === currentQ.correct ? 'Correct!' : 'Incorrect'}
                                    </div>
                                )}
                                <div className="text-3xl font-bold text-white mb-2">
                                    {currentQ.options[currentQ.correct]}
                                </div>
                                {userGuess !== null && userGuess !== currentQ.correct && (
                                    <div className="text-sm text-slate-400">
                                        You guessed: <span className="text-red-300">{currentQ.options[userGuess]}</span>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-900/50 p-6 rounded-xl text-left w-full border border-slate-700/50">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                                    Code Text / Explanation
                                </h4>
                                {(currentQ.code_text && currentQ.code_text !== "No explanation provided.") ? (
                                    <>
                                        <p className="text-slate-300 leading-relaxed mb-3 text-sm sm:text-base">{currentQ.code_text}</p>
                                        {currentQ.citation && (
                                            <div className="text-xs text-slate-500 font-mono mt-4 pt-2 border-t border-white/5">
                                                Ref: {currentQ.citation}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-slate-400 italic mb-2 text-sm">Refer to Standard:</p>
                                        <p className="text-lg font-bold text-white font-mono">{currentQ.citation || "N/A"}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute bottom-8 text-slate-500 flex items-center gap-2 text-sm font-medium animate-pulse">
                            Tap to Next <ArrowRight size={16} />
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="flex justify-between gap-4">
                <button
                    className={`px-6 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 transition-all flex items-center gap-2 active:scale-95 ${currentIndex === 0 ? 'invisible' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    disabled={currentIndex === 0}
                >
                    <ArrowLeft size={20} /> Previous
                </button>
            </div>
        </div>
    );
}
