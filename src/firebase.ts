
      // Import the functions you need from the SDKs you need
      import { initializeApp } from "firebase/app";
      import { getAnalytics, Analytics, setUserId } from "firebase/analytics";
      import { getMessaging, Messaging } from "firebase/messaging";
      import { 
          getAuth, 
          onAuthStateChanged, 
          Auth 
      } from "firebase/auth";
      
      // Your web app's Firebase configuration
      const firebaseConfig = {
        apiKey: "AIzaSyD7YdKh3IbwyPnltjg5hFbzYDDyDuMxcZw",
        authDomain: "focusfrog-2.firebaseapp.com",
        projectId: "focusfrog-2",
        storageBucket: "focusfrog-2.firebasestorage.app",
        messagingSenderId: "879951924390",
        appId: "1:879951924390:web:4b3a638d23fc0ae5c93867",
        measurementId: "G-19DSSCSLRS"
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
      
      // Analytics will only be initialized in the production environment
      export const getAnalyticsInstance = (): Analytics | null => {
          if (process.env.NODE_ENV !== 'production') {
              return null;
          }
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
      
      // Set user ID for Analytics when a user signs in, only in production.
      onAuthStateChanged(getAuthInstance(), (user) => {
          if (user) {
              const analyticsInstance = getAnalyticsInstance();
              if (analyticsInstance) {
                  setUserId(analyticsInstance, user.uid);
              }
          }
      });
      
      // Export the app instance if needed elsewhere
      export { app };
