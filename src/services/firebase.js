import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCrG8MNhgsu1c4AJKJkwbMWW4WQOmDLepg",
    authDomain: "mn-fire-prep-casey.firebaseapp.com",
    projectId: "mn-fire-prep-casey",
    storageBucket: "mn-fire-prep-casey.firebasestorage.app",
    messagingSenderId: "337649077092",
    appId: "1:337649077092:web:67ff5d275836b4e93ec871",
    measurementId: "G-MEASUREMENT_ID" // Placeholder, usually in config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        console.warn('Persistence not supported by browser');
    }
});
