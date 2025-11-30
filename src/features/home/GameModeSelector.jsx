import React from 'react';
import { Zap, BookOpen, Clock, ArrowRight, RotateCcw, Siren } from 'lucide-react';
import { motion } from 'framer-motion';

export function GameModeSelector({ onSelectMode, missedCount = 0 }) {
    const modes = [
        {
            id: 'rapid10',
            title: 'Rapid 10',
            description: 'Quick fire 10-question sprint. Perfect for daily practice.',
            icon: Zap,
            color: 'from-fire-red to-fire-orange',
            shadow: 'shadow-fire-red/30',
            delay: 0
        },
        {
            id: 'flashcards',
            title: 'Flashcards',
            description: 'Flip through questions to test your memory recall.',
            icon: BookOpen,
            color: 'from-emerald-500 to-emerald-400',
            shadow: 'shadow-emerald-500/30',
            delay: 0.1
        },
        {
            id: 'full',
            title: 'Full Exam',
            description: '100 questions, 2 hours. The real deal simulation.',
            icon: Clock,
            color: 'from-blue-600 to-blue-400',
            shadow: 'shadow-blue-500/30',
            delay: 0.2
        },
        {
            id: 'review',
            title: 'Review Missed',
            description: missedCount > 0 ? `${missedCount} questions to review.` : 'No missed questions yet!',
            icon: RotateCcw,
            color: 'from-purple-600 to-purple-400',
            shadow: 'shadow-purple-500/30',
            delay: 0.3,
            disabled: missedCount === 0
        },
        {
            id: 'firemarshal',
            title: 'Fire Marshal',
            description: 'Sudden Death. 1 Strike = Game Over. How far can you go?',
            icon: Siren,
            color: 'from-red-700 to-red-600',
            shadow: 'shadow-red-600/30',
            delay: 0.4
        }
    ];

    return (
        <div className="glass-panel rounded-xl p-4 mb-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-white">
                <div className="w-1.5 h-6 bg-gradient-to-b from-fire-red to-fire-orange rounded-full shadow-[0_0_10px_rgba(255,69,0,0.5)]"></div>
                Game Modes
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {modes.map((mode) => (
                    <motion.button
                        key={mode.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: mode.delay }}
                        whileHover={{ y: -4, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => !mode.disabled && onSelectMode(mode.id)}
                        className={`relative group text-left h-full ${mode.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-500`} />

                        <div className="glass-panel h-full p-3 sm:p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                            <div className="flex items-start gap-3">
                                <div className={`
                                w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${mode.color} 
                                flex items-center justify-center shadow-lg ${mode.shadow}
                                group-hover:scale-110 transition-transform duration-300 shrink-0
                            `}>
                                    <mode.icon size={20} className="text-white drop-shadow-md sm:w-6 sm:h-6" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm sm:text-lg font-bold text-white mb-1 group-hover:text-glow transition-all leading-tight">
                                        {mode.title}
                                    </h3>

                                    <p className="text-slate-400 text-[10px] sm:text-xs leading-snug mb-0 group-hover:text-slate-300 transition-colors">
                                        {mode.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
