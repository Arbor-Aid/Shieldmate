
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration relies entirely on runtime environment variables to avoid leaking secrets.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Simplified analytics tracking function
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  try {
    if (!analytics) return;
    
    // Add user ID to the event parameters if available
    const userId = auth.currentUser?.uid;
    const enhancedParams = userId 
      ? { ...eventParams, userId } 
      : eventParams;
    
    logEvent(analytics, eventName, enhancedParams);
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

export { auth, db, storage, analytics };
