import React, { useState, useEffect, useRef } from 'react';
import { Timer, CheckCircle, AlertTriangle, ArrowRight, Save, Trophy, HelpCircle, Flag, Grid, X, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResultSummary } from './ResultSummary';
import { HapticFeedback } from '../../services/haptics';

export function FullQuiz({ questions, onExit, onFinish }) {
    const QUIZ_DURATION = 120 * 60; // 2 hours in seconds

    const [quizQuestions, setQuizQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { questionIndex: optionIndex }
    const [markedForReview, setMarkedForReview] = useState(new Set());
    const [startTime, setStartTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [showNavigator, setShowNavigator] = useState(false);
    const [proctorStrikes, setProctorStrikes] = useState(0);
    const [showProctorWarning, setShowProctorWarning] = useState(false);

    const questionsRef = useRef(null);

    // Initialize Quiz (Load from Storage or New)
    useEffect(() => {
        const loadQuiz = () => {
            try {
                const savedState = JSON.parse(localStorage.getItem('mn_fire_quiz_state'));

                // Resume if valid state exists and time remains
                if (savedState && !savedState.isSubmitted && savedState.startTime) {
                    const elapsed = Math.floor((Date.now() - savedState.startTime) / 1000);
                    if (elapsed < QUIZ_DURATION) {
                        setQuizQuestions(savedState.questions);
                        setAnswers(savedState.answers);
                        setMarkedForReview(new Set(savedState.markedForReview || []));
                        setStartTime(savedState.startTime);
                        setTimeLeft(QUIZ_DURATION - elapsed);
                        setProctorStrikes(savedState.proctorStrikes || 0);
                        return;
                    }
                }
            } catch (e) {
                console.error("Failed to load quiz state", e);
            }

            // Start New Quiz
            const shuffled = [...questions].sort(() => 0.5 - Math.random());
            setQuizQuestions(shuffled.slice(0, 100));
            setStartTime(Date.now());
            setAnswers({});
            setMarkedForReview(new Set());
            setTimeLeft(QUIZ_DURATION);
            setProctorStrikes(0);
            localStorage.removeItem('mn_fire_quiz_state');
        };

        if (questions.length > 0) {
            loadQuiz();
        }
    }, [questions]);

    // Timer Logic (Timestamp based)
    useEffect(() => {
        if (!startTime || isSubmitted) return;

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = QUIZ_DURATION - elapsed;

            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
                handleSubmit(true); // Auto-submit
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isSubmitted]);

    // Proctor Dog (Anti-Cheat)
    useEffect(() => {
        if (isSubmitted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setProctorStrikes(prev => {
                    const newStrikes = prev + 1;
                    setShowProctorWarning(true);
                    HapticFeedback.heavy();
                    return newStrikes;
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [isSubmitted]);

    // Persist State
    useEffect(() => {
        if (quizQuestions.length > 0 && !isSubmitted && startTime) {
            localStorage.setItem('mn_fire_quiz_state', JSON.stringify({
                questions: quizQuestions,
                answers,
                markedForReview: Array.from(markedForReview),
                startTime,
                proctorStrikes,
                isSubmitted: false
            }));
        }
    }, [answers, quizQuestions, startTime, isSubmitted, markedForReview, proctorStrikes]);

    const handleAnswer = async (qIndex, optIndex) => {
        if (isSubmitted) return;
        await HapticFeedback.light();
        setAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
    };

    const toggleMarkForReview = (qIndex) => {
        if (isSubmitted) return;
        setMarkedForReview(prev => {
            const next = new Set(prev);
            if (next.has(qIndex)) {
                next.delete(qIndex);
            } else {
                next.add(qIndex);
            }
            return next;
        });
    };

    const handleSubmit = (auto = false) => {
        if (!auto) {
            const unansweredCount = quizQuestions.length - Object.keys(answers).length;
            if (unansweredCount > 0) {
                if (!window.confirm(`You have ${unansweredCount} unanswered questions. Are you sure you want to submit?`)) {
                    return;
                }
            } else {
                if (!window.confirm("Are you sure you want to submit your exam? This cannot be undone.")) {
                    return;
                }
            }
        }

        let correctCount = 0;
        const categoryStats = {}; // { "NFPA 13": { correct: 0, total: 0 } }

        quizQuestions.forEach((q, idx) => {
            const isCorrect = answers[idx] === q.correct;
            if (isCorrect) correctCount++;

            // Category Stats
            const cat = q.category || "General";
            if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
            categoryStats[cat].total++;
            if (isCorrect) categoryStats[cat].correct++;
        });

        setScore(correctCount);
        setIsSubmitted(true);
        localStorage.removeItem('mn_fire_quiz_state'); // Clear saved state

        const missedIds = [];
        quizQuestions.forEach((q, idx) => {
            if (answers[idx] !== q.correct) {
                missedIds.push(q.id);
            }
        });

        if (onFinish) {
            onFinish(correctCount, quizQuestions.length, missedIds, quizQuestions.map(q => q.id), categoryStats);
        }
        window.scrollTo(0, 0);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const scrollToQuestion = (index) => {
        const el = document.getElementById(`q-${index}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setShowNavigator(false);
        }
    };

    if (isSubmitted) {
        return (
            <ResultSummary
                score={score}
                total={quizQuestions.length}
                onRetry={() => {
                    setIsSubmitted(false);
                    setAnswers({});
                    setMarkedForReview(new Set());
                    setStartTime(Date.now());
                    setTimeLeft(QUIZ_DURATION);
                    setProctorStrikes(0);
                    const shuffled = [...questions].sort(() => 0.5 - Math.random());
                    setQuizQuestions(shuffled.slice(0, 100));
                    localStorage.removeItem('mn_fire_quiz_state');
                }}
                onHome={onExit}
                questions={quizQuestions}
                userAnswers={answers}
            />
        );
    }

    if (quizQuestions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
                <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="font-mono text-sm uppercase tracking-widest">Initializing Proctor...</p>
            </div>
        );
    }

    return (
        <div className="w-full lg:max-w-5xl mx-auto relative">
            {/* Proctor Warning Toast */}
            <AnimatePresence>
                {showProctorWarning && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 border border-red-400"
                    >
                        <EyeOff size={32} className="animate-pulse" />
                        <div>
                            <h3 className="font-bold text-lg">PROCTOR ALERT</h3>
                            <p className="text-sm">Focus lost! Strike {proctorStrikes}.</p>
                        </div>
                        <button onClick={() => setShowProctorWarning(false)} className="p-1 hover:bg-white/20 rounded-full">
                            <X size={20} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Header */}
            <div className="sticky top-4 z-40 glass-panel p-3 sm:p-4 rounded-2xl mb-8 flex flex-wrap gap-3 sm:gap-4 justify-between items-center border border-white/10 shadow-2xl backdrop-blur-xl">
                <div className={`flex items-center gap-2 sm:gap-3 text-lg sm:text-xl font-mono font-bold ${timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    <div className="bg-black/20 p-1.5 sm:p-2 rounded-lg">
                        <Timer size={20} className="sm:w-6 sm:h-6" />
                    </div>
                    {formatTime(timeLeft)}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowNavigator(true)}
                        className="p-2 sm:px-4 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold flex items-center gap-2 border border-white/5 transition-colors"
                    >
                        <Grid size={20} /> <span className="hidden sm:inline">Navigator</span>
                    </button>

                    <button
                        className="px-4 py-2 sm:px-6 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-105 text-sm sm:text-base"
                        onClick={() => handleSubmit()}
                    >
                        <Save size={18} /> <span className="hidden sm:inline">Submit</span><span className="inline sm:hidden">Finish</span>
                    </button>
                </div>
            </div>

            {/* Question Navigator Drawer */}
            <AnimatePresence>
                {showNavigator && (
                    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowNavigator(false)}>
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-slate-900 border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Grid size={20} className="text-blue-400" /> Question Navigator
                                </h3>
                                <button onClick={() => setShowNavigator(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                                    {quizQuestions.map((_, idx) => {
                                        let statusClass = "bg-slate-800 text-slate-500 border-slate-700";
                                        if (answers[idx] !== undefined) statusClass = "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20";
                                        if (markedForReview.has(idx)) statusClass = "bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/20";

                                        return (
                                            <button
                                                key={idx}
                                                onClick={() => scrollToQuestion(idx)}
                                                className={`h-10 w-full rounded-lg font-bold text-sm border transition-all hover:scale-105 ${statusClass}`}
                                            >
                                                {idx + 1}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-6 flex gap-4 justify-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Answered</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Marked</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700"></div> Unseen</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="space-y-8" ref={questionsRef}>
                {quizQuestions.map((q, idx) => (
                    <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        className="glass-panel rounded-2xl p-4 sm:p-8 border border-white/5 scroll-mt-32 relative overflow-hidden group"
                        id={`q-${idx}`}
                    >
                        {/* Subtle number watermark */}
                        <div className="absolute top-0 right-0 text-[120px] font-bold text-white/[0.02] leading-none -translate-y-8 translate-x-8 pointer-events-none select-none">
                            {idx + 1}
                        </div>

                        <div className="flex gap-6 mb-8 relative z-10">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 transition-all duration-300 shadow-lg cursor-pointer
                                ${markedForReview.has(idx)
                                    ? 'bg-amber-500 text-white shadow-amber-500/30'
                                    : answers[idx] !== undefined
                                        ? 'bg-blue-600 text-white shadow-blue-500/30'
                                        : 'bg-slate-800 text-slate-500 border border-white/5'}
                            `} onClick={() => toggleMarkForReview(idx)}>
                                {markedForReview.has(idx) ? <Flag size={18} fill="currentColor" /> : (idx + 1)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-lg sm:text-xl text-slate-100 leading-relaxed font-medium">{q.question}</p>
                                    <button
                                        onClick={() => toggleMarkForReview(idx)}
                                        className={`p-2 rounded-lg transition-colors ${markedForReview.has(idx) ? 'text-amber-400 bg-amber-500/10' : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'}`}
                                        title="Mark for Review"
                                    >
                                        <Flag size={20} fill={markedForReview.has(idx) ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                {q.media && (
                                    <div className="mt-6">
                                        {q.media.type === 'image' ? (
                                            <img
                                                src={q.media.url}
                                                alt="Question Reference"
                                                className="max-w-full max-h-[400px] rounded-xl border border-white/10 shadow-2xl"
                                            />
                                        ) : (
                                            <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black/40">
                                                <video
                                                    src={q.media.url}
                                                    controls
                                                    className="max-w-full max-h-[400px]"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-3 pl-0 sm:pl-16 relative z-10">
                            {q.options.map((opt, optIdx) => (
                                <label
                                    key={optIdx}
                                    className={`
                                        flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all duration-200 group/opt
                                        ${answers[idx] === optIdx
                                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-slate-300'}
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                                        ${answers[idx] === optIdx ? 'border-blue-400' : 'border-slate-600 group-hover/opt:border-slate-500'}
                                    `}>
                                        {answers[idx] === optIdx && <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name={`q-${idx}`}
                                        checked={answers[idx] === optIdx}
                                        onChange={() => handleAnswer(idx, optIdx)}
                                        className="hidden"
                                    />
                                    <span className="leading-relaxed text-lg">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 text-center pb-12">
                <button
                    className="px-10 py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-bold text-xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 hover:shadow-emerald-500/40"
                    onClick={() => handleSubmit()}
                >
                    Submit Final Exam
                </button>
            </div>
        </div>
    );
}
