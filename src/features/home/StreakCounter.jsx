import React from 'react';
import { Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export function StreakCounter({ streak = 0 }) {
    if (streak === 0) return null;

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full"
        >
            <Flame size={16} className="text-orange-500 fill-orange-500 animate-pulse" />
            <span className="text-orange-500 font-bold text-sm">{streak} Day Streak</span>
        </motion.div>
    );
}
