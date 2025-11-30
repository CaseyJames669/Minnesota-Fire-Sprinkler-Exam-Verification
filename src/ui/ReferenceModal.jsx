import React from 'react';
import { X, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ReferenceModal({ citation, isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Decorative Header Background */}
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />

                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white leading-tight">Reference Library</h3>
                                <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">NFPA Standard Lookup</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="bg-black/30 rounded-xl p-5 border border-white/5 mb-6">
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Citation</div>
                        <div className="text-2xl font-mono font-bold text-white text-glow">{citation}</div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
                            <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                                <ExternalLink size={14} className="text-blue-400" /> Quick Context
                            </h4>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                This section references the specific requirements for this question.
                                In a real exam, you would locate this in your code book.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors shadow-lg shadow-blue-600/20"
                        >
                            Got it
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
