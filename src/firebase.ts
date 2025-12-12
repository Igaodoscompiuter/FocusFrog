
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics, setUserId } from "firebase/analytics";
import { getMessaging, Messaging } from "firebase/messaging";
import { 
    getAuth, 
    onAuthStateChanged, 
    signInAnonymously, 
    Auth 
} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC4iDYWSOU9Naqp9O29f1pvzXfS8v6K5fU",
    authDomain: "focusfroggit-81838821-bbab8.firebaseapp.com",
    projectId: "focusfroggit-81838821-bbab8",
    storageBucket: "focusfroggit-81838821-bbab8.firebasestorage.app",
    messagingSenderId: "878346894346",
    appId: "1:878346894346:web:c0517918bd73569e1f73f3",
    measurementId: "G-REN0MZQYW6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create singletons for Firebase services
let auth: Auth | null = null;
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

export const getAuthInstance = (): Auth => {
    if (!auth) {
        auth = getAuth(app);
    }
    return auth;
};

export const getAnalyticsInstance = (): Analytics => {
    if (!analytics) {
        analytics = getAnalytics(app);
    }
    return analytics;
};

export const getMessagingInstance = (): Messaging | null => {
    if (typeof window !== 'undefined' && !messaging) {
        messaging = getMessaging(app);
    }
    return messaging;
};

// Ensure user is signed in and set user ID for Analytics
onAuthStateChanged(getAuthInstance(), (user) => {
    if (user) {
        // User is signed in.
        const analyticsInstance = getAnalyticsInstance();
        setUserId(analyticsInstance, user.uid);
    } else {
        // User is signed out. Sign in anonymously.
        signInAnonymously(getAuthInstance()).catch((error) => {
            console.error("Anonymous sign-in failed:", error);
        });
    }
});

// Export the app instance if needed elsewhere
export { app };
