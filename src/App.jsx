import React, { useState, useEffect, useMemo } from 'react';
import { loadQuestions } from './services/questions';
import { QuestionBankInfo } from './features/quiz/QuestionBankInfo';
import { Leaderboard } from './features/home/Leaderboard';
import { StatsCard } from './features/home/StatsCard';
import { UserProgress } from './features/auth/UserProgress';
import { FilterBar } from './ui/FilterBar';
import { GameModeSelector } from './features/home/GameModeSelector';
import { Rapid10 } from './features/quiz/Rapid10';
import { FireMarshal } from './features/quiz/FireMarshal';
import { Flashcards } from './features/quiz/Flashcards';
import { FullQuiz } from './features/quiz/FullQuiz';
import { Login } from './features/auth/Login';
import { StreakCounter } from './features/home/StreakCounter';
import { ExamSchedule } from './features/home/ExamSchedule';
import { LoadingScreen } from './ui/LoadingScreen';
import { VideoSplash } from './ui/VideoSplash';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { saveScore, getUserStats, saveMissedQuestions, getMissedQuestions, updateMastery } from './services/progress';
import { Flame, ArrowLeft, LogOut, User, ShieldCheck, Settings, WifiOff, Trash2, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';

function App() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [error, setError] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [reviewQuestions, setReviewQuestions] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    difficulty: '',
    mnOnly: false
  });

  const [showSettings, setShowSettings] = useState(false);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleResetProgress = async () => {
    if (window.confirm("CRITICAL WARNING: This will wipe ALL your stats, history, and mastery data. This cannot be undone. Are you sure?")) {
      // In a real app, call a service function. For now, just alert.
      alert("Progress reset functionality would trigger here (requires backend implementation).");
    }
  };

  useEffect(() => {
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (gameMode) {
        setGameMode(null);
      } else {
        CapacitorApp.minimizeApp();
      }
    });
  }, [gameMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const stats = await getUserStats(currentUser.uid);
        setUserStats(stats);
      } else {
        setUserStats(null);
      }
    });

    // Configure Status Bar
    const configStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: true });
      } catch (err) {
        console.log('Status Bar not available');
      }
    };
    configStatusBar();

    return () => unsubscribe();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadQuestions();
      setQuestions(data);
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError("Failed to load question bank. Please try again.");
    } finally {
      // Add a small artificial delay to prevent a flicker if loading is too fast
      setTimeout(() => setLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter Logic
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (filters.mnOnly && !q.is_mn_amendment) return false;
      if (filters.category && q.category !== filters.category) return false;
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          q.question.toLowerCase().includes(searchLower) ||
          q.explanation.toLowerCase().includes(searchLower) ||
          (q.citation && q.citation.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [questions, filters]);

  // Extract Categories
  const categories = useMemo(() => {
    const cats = new Set(questions.map(q => q.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [questions]);

  const handleModeSelect = async (mode) => {
    if (mode === 'review') {
      if (!user) {
        alert("Please login to review your missed questions.");
        return;
      }
      setLoading(true);
      const missedIds = await getMissedQuestions(user.uid);
      const missedQs = questions.filter(q => missedIds.includes(q.id));

      if (missedQs.length === 0) {
        alert("Great job! You don't have any missed questions to review.");
        setLoading(false);
        return;
      }
      setReviewQuestions(missedQs);
      setLoading(false);
    }
    setGameMode(mode);
  };

  const handleGameFinish = async (score, total, missedQuestionIds = [], allQuestionIds = [], categoryStats = {}) => {
    if (user) {
      await saveScore(user.uid, gameMode, score, total, categoryStats);

      if (missedQuestionIds.length > 0) {
        await saveMissedQuestions(user.uid, missedQuestionIds);
      }

      // Calculate correct IDs for Mastery
      if (allQuestionIds.length > 0) {
        const correctIds = allQuestionIds.filter(id => !missedQuestionIds.includes(id));
        if (correctIds.length > 0) {
          await updateMastery(user.uid, correctIds);
        }
      }

      // Refresh stats
      const stats = await getUserStats(user.uid);
      // Explicitly fetch latest missed questions to ensure UI sync
      const latestMissed = await getMissedQuestions(user.uid);
      if (stats) {
        stats.missedQuestions = latestMissed;
      }
      setUserStats(stats);
    }
  };

  const getHeaderWidth = () => {
    switch (gameMode) {
      case 'flashcards': return 'max-w-2xl';
      case 'rapid10':
      case 'review': return 'max-w-3xl';
      case 'full': return 'max-w-5xl';
      default: return 'max-w-7xl';
    }
  };

  if (showSplash) {
    return <VideoSplash onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-100 font-sans selection:bg-fire-red selection:text-white overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fire-red/20 rounded-full blur-[120px] animate-[float_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fire-orange/20 rounded-full blur-[120px] animate-[float_10s_ease-in-out_infinite_reverse]" />
      </div>





      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900 border-b border-white/10 text-slate-400 text-xs font-bold text-center py-1 flex items-center justify-center gap-2"
          >
            <WifiOff size={12} /> OFFLINE MODE - Progress will sync when reconnected
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass Navbar */}
      {!gameMode && (
        <div className={`sticky top-4 z-50 mx-auto px-4 sm:px-6 lg:px-8 mt-4 transition-all duration-500 w-full ${getHeaderWidth()}`}>
          <header className="rounded-xl glass-panel border border-white/10">
            <div className="px-3 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2">
              {/* ... (Logo section same as before) ... */}
              <div
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
                onClick={() => setGameMode(null)}
              >
                <div className="bg-gradient-to-br from-fire-red to-fire-orange p-1.5 sm:p-2 rounded-xl shadow-lg shadow-fire-red/20 group-hover:scale-110 transition-transform duration-300">
                  <Flame size={20} className="text-white animate-pulse sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-xl font-bold tracking-tight text-white text-glow leading-tight">MN Fire Sprinkler Exam Prep</h1>
                  <p className="text-[10px] sm:text-xs text-slate-400 tracking-wider uppercase font-medium">Master the code. Pass the test.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {user && userStats?.streak > 0 && (
                  <StreakCounter streak={userStats.streak} />
                )}

                {/* Settings Button */}
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <Settings size={20} />
                </button>

                {user ? (
                  <div className="flex items-center gap-4 bg-black/20 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
                    {/* ... (User profile same as before) ... */}
                    <div className="flex items-center gap-3">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-fire-orange/50 shadow-lg shadow-fire-orange/20" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                          <User size={16} className="text-slate-400" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-200 hidden sm:block">{user.displayName}</span>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <button
                      onClick={() => signOut(auth)}
                      className="text-slate-400 hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/10"
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <Login />
                )}
              </div>
            </div>
          </header>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowSettings(false)}>
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings size={24} className="text-slate-400" /> Settings
            </h3>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    {hapticsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-white">Haptic Feedback</div>
                    <div className="text-xs text-slate-500">Vibrate on interactions</div>
                  </div>
                </div>
                <button
                  onClick={() => setHapticsEnabled(!hapticsEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${hapticsEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${hapticsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button
                  onClick={handleResetProgress}
                  className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 size={18} /> Reset All Progress
                </button>
                <p className="text-center text-[10px] text-slate-600 mt-2 uppercase tracking-wider">Danger Zone</p>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-8 w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <main className="w-full flex-grow max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 pb-20 sm:pb-10">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 backdrop-blur-md"
            >
              <ShieldCheck size={20} />
              {error}
            </motion.div>
          )}

          {gameMode ? (
            <motion.div
              key="game-mode"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "circOut" }}
              className="w-full"
            >
              <div className="w-full">
                {gameMode === 'rapid10' && (
                  <Rapid10
                    questions={filteredQuestions}
                    onExit={() => setGameMode(null)}
                    onFinish={handleGameFinish}
                  />
                )}
                {gameMode === 'review' && (
                  <Rapid10
                    questions={reviewQuestions}
                    onExit={() => setGameMode(null)}
                    onFinish={handleGameFinish}
                    mode="review"
                  />
                )}
                {gameMode === 'firemarshal' && (
                  <FireMarshal
                    questions={questions}
                    onExit={() => setGameMode(null)}
                    onFinish={(score, total, missedIds, allIds) => handleGameFinish(score, total, missedIds, allIds)}
                  />
                )}
                {gameMode === 'flashcards' && (
                  <Flashcards
                    questions={filteredQuestions}
                    onExit={() => setGameMode(null)}
                    user={user}
                  />
                )}
                {gameMode === 'review' && (
                  <Rapid10
                    questions={reviewQuestions}
                    onExit={() => setGameMode(null)}
                    onFinish={(score, total, missedQuestionIds, allQuestionIds) =>
                      handleGameFinish(score, total, missedQuestionIds, allQuestionIds)
                    }
                    isGauntletMode={true}
                  />
                )}
                {gameMode === 'full' && (
                  <FullQuiz
                    questions={questions}
                    onExit={() => setGameMode(null)}
                    onFinish={(score, total, missedQuestionIds, allQuestionIds, categoryStats) =>
                      handleGameFinish(score, total, missedQuestionIds, allQuestionIds, categoryStats)
                    }
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2 space-y-6">
                {/* Mobile Exam Schedule */}
                <div className="lg:hidden">
                  <ExamSchedule />
                </div>

                {/* Stats Section */}
                <section>
                  <div className="grid grid-cols-1 gap-4">
                    <UserProgress userStats={userStats} />
                  </div>
                </section>

                {/* Game Modes */}
                <section>
                  <GameModeSelector
                    onSelectMode={handleModeSelect}
                    missedCount={userStats?.missedQuestions?.length || 0}
                  />
                </section>

                {/* Filters */}
                <section>
                  <FilterBar
                    filters={filters}
                    onFilterChange={setFilters}
                    categories={categories}
                  />
                </section>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <div className="hidden lg:block">
                    <ExamSchedule />
                  </div>
                  <Leaderboard />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      {!gameMode && (
        <footer className="mt-auto py-4 border-t border-white/5 text-center relative z-10 bg-black/20 backdrop-blur-sm">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-fire-red/20 to-transparent"></div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            © 2025 Sprinkler Fitter Exam Prep. <span className="text-slate-600 ml-1">Built for Minnesota Journeyman Candidates. By Minnesota Journeyman Candidates.</span>
          </p>
        </footer>
      )}
    </div>
  );
}

export default App;
