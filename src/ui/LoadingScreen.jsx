import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-fire-red/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-fire-orange/10 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 bg-fire-orange/20 blur-xl rounded-full animate-pulse" />
          <div className="bg-gradient-to-br from-fire-red to-fire-orange p-6 rounded-3xl shadow-2xl shadow-fire-red/30">
            <Flame size={64} className="text-white animate-bounce" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-8 text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">
            MN Fire Prep
          </h1>
          <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
            Loading Question Bank...
          </p>
        </motion.div>

        {/* Loading Bar */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8 h-1.5 bg-slate-800 rounded-full overflow-hidden w-48"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-fire-red to-fire-orange"
            animate={{
              x: [-200, 200],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};
