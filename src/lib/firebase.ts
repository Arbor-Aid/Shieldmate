
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Firebase configuration from your Firebase project
const firebaseConfig = {
  apiKey: 'AIzaSyDd8o8XH4vd4MmOtE_RH7qnl22kxNcl8zk',
  authDomain: 'marines-ai-agent.firebaseapp.com',
  projectId: 'marines-ai-agent',
  storageBucket: 'marines-ai-agent.appspot.com',
  messagingSenderId: '779610430003',
  appId: '1:779610430003:web:6a6e0de1a2f12630ee6146',
  measurementId: 'G-9MBFJZQLGY',
  databaseURL: 'https://marines-ai-agent-default-rtdb.firebaseio.com'
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
