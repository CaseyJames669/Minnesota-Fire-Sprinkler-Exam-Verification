import React from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

export function Login({ user }) {
    const handleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const handleLogout = () => signOut(auth);

    if (user) {
        return (
            <div className="glass-panel rounded-2xl p-1 flex items-center gap-2 pr-4 pl-1 border border-white/10">
                {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-xl border border-white/20" />
                ) : (
                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                        <User size={16} className="text-white" />
                    </div>
                )}
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-white leading-none mb-0.5">{user.displayName?.split(' ')[0]}</span>
                    <button onClick={handleLogout} className="text-[10px] text-slate-400 hover:text-fire-red transition-colors text-left flex items-center gap-1">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={handleLogin}
            className="glass-button h-10 px-3 sm:px-6 rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-transform"
        >
            <LogIn size={18} />
            <span className="hidden sm:inline">Apprentice Login</span>
        </button>
    );
}
