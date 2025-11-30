import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs, arrayUnion, runTransaction } from 'firebase/firestore';

export async function saveMissedQuestions(userId, questionIds) {
    if (!userId || !questionIds || questionIds.length === 0) return;

    const userRef = doc(db, 'users', userId);
    try {
        await setDoc(userRef, {
            missedQuestions: arrayUnion(...questionIds)
        }, { merge: true });
    } catch (error) {
        console.error("Error saving missed questions:", error);
    }
}

export async function getMissedQuestions(userId) {
    if (!userId) return [];
    try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
            return docSnap.data().missedQuestions || [];
        }
    } catch (error) {
        console.error("Error fetching missed questions:", error);
    }
    return [];
}

export async function saveScore(userId, mode, score, total) {
    if (!userId) return;

    const userRef = doc(db, 'users', userId);
    const historyRef = doc(db, 'users', userId, 'history', Date.now().toString());
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    try {
        // 1. Save detailed history
        await setDoc(historyRef, {
            mode,
            score,
            total,
            timestamp: now
        });

        // 2. Get current stats to calculate streak
        const userDoc = await getDoc(userRef);
        let currentStreak = 1;
        let lastActiveDate = 0;

        if (userDoc.exists()) {
            const data = userDoc.data();
            lastActiveDate = data.lastActiveDate || 0;
            const lastActive = new Date(lastActiveDate);
            const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();

            const oneDay = 24 * 60 * 60 * 1000;

            if (today === lastActiveDay) {
                // Already played today, keep streak
                currentStreak = data.streak || 1;
            } else if (today - lastActiveDay <= oneDay + 1000) { // Allow slight buffer
                // Played yesterday, increment streak
                currentStreak = (data.streak || 0) + 1;
            } else {
                // Missed a day, reset streak
                currentStreak = 1;
            }
        }

        // 3. Update user stats
        const updates = {
            [`stats.${mode}.played`]: increment(1),
            [`stats.${mode}.totalScore`]: increment(score),
            [`stats.${mode}.totalQuestions`]: increment(total),
            lastActive: now,
            lastActiveDate: today,
            streak: currentStreak,
            totalScore: increment(score),
            gamesPlayed: increment(1)
        };

        // 4. Update Category Stats (if provided)
        // categoryStats format: { "NFPA 13": { correct: 2, total: 5 }, ... }
        if (arguments[4]) { // Check for 5th argument (categoryStats)
            const catStats = arguments[4];
            Object.entries(catStats).forEach(([category, stats]) => {
                const safeCat = category.replace(/\//g, '_'); // Sanitize path
                updates[`categoryStats.${safeCat}.correct`] = increment(stats.correct);
                updates[`categoryStats.${safeCat}.total`] = increment(stats.total);
            });
        }

        await setDoc(userRef, updates, { merge: true });

    } catch (error) {
        console.error("Error saving score:", error);
    }
}

export async function getUserStats(userId) {
    if (!userId) return null;

    try {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
            return docSnap.data();
        }
    } catch (error) {
        console.error("Error fetching stats:", error);
    }
    return null;
}

export async function updateMastery(userId, correctQuestionIds) {
    if (!userId || !correctQuestionIds || correctQuestionIds.length === 0) return;

    const userRef = doc(db, 'users', userId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) return;

            const data = userDoc.data();
            const questionStats = data.questionStats || {};
            const mastered = new Set(data.masteredQuestions || []);

            correctQuestionIds.forEach(id => {
                const current = questionStats[id] || { correct: 0 };
                current.correct = (current.correct || 0) + 1;
                questionStats[id] = current;

                if (current.correct >= 3) {
                    mastered.add(id);
                }
            });

            transaction.update(userRef, {
                questionStats: questionStats,
                masteredQuestions: Array.from(mastered)
            });
        });

    } catch (error) {
        console.error("Error updating mastery:", error);
    }
}

export async function getExamHistory(userId) {
    if (!userId) return [];
    try {
        const historyRef = collection(db, 'users', userId, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(20));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() // Convert Firestore Timestamp to JS Date
        }));
    } catch (error) {
        console.error("Error fetching history:", error);
        return [];
    }
}

export async function getLeaderboard(limitCount = 10) {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('totalScore', 'desc'), limit(limitCount));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName || 'Anonymous',
                gamesPlayed: data.gamesPlayed || 0,
                totalScore: data.totalScore || 0,
                streak: data.streak || 0
            };
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
}

import { onSnapshot } from 'firebase/firestore';

export function subscribeToLeaderboard(callback, limitCount = 10) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('totalScore', 'desc'), limit(limitCount));

    return onSnapshot(q, (snapshot) => {
        const leaders = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName || 'Anonymous',
                gamesPlayed: data.gamesPlayed || 0,
                totalScore: data.totalScore || 0,
                streak: data.streak || 0
            };
        });
        callback(leaders);
    }, (error) => {
        console.error("Leaderboard subscription error:", error);
    });
}
