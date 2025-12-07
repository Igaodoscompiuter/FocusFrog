// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getMessaging, Messaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4iDYWSOU9Naqp9O29f1pvzXfS8v6K5fU",
  authDomain: "focusfroggit-81838821-bbab8.firebaseapp.com",
  projectId: "focusfroggit-81838821-bbab8",
  storageBucket: "focusfroggit-81838821-bbab8.firebasestorage.app",
  messagingSenderId: "878346894346",
  appId: "1:878346894346:web:c0517918bd73569e1f73f3",
  measurementId: "G-JKRZJN6W6J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Create singletons for Firebase services
let analytics: Analytics | null = null;
let messaging: Messaging | null = null;

export const getAnalyticsInstance = (): Analytics => {
  if (!analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

export const getMessagingInstance = (): Messaging | null => {
  // Messaging is only supported in browsers
  if (typeof window !== 'undefined' && !messaging) {
    messaging = getMessaging(app);
  }
  return messaging;
};

// Export the app instance if needed elsewhere
export { app };

