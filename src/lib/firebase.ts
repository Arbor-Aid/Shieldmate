
import { getAnalytics, logEvent } from "firebase/analytics";
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { initializeAppCheck, ReCaptchaV3Provider, getToken as fetchAppCheckToken } from "firebase/app-check";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const readEnv = (key: string): string | undefined => {
  // Supports both Vite and process.env when available
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return typeof process !== "undefined" ? process.env?.[key] : undefined;
};

const firebaseConfig = {
  apiKey: readEnv("VITE_FIREBASE_API_KEY") || "AIzaSyDd8o8XH4vd4MmOtE_RH7qnl22kxNcl8zk",
  authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN") || "marines-ai-agent.firebaseapp.com",
  projectId: readEnv("VITE_FIREBASE_PROJECT_ID") || "marines-ai-agent",
  storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET") || "marines-ai-agent.appspot.com",
  messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "779610430003",
  appId: readEnv("VITE_FIREBASE_APP_ID") || "1:779610430003:web:6a6e0de1a2f12630ee6146",
  measurementId: readEnv("VITE_FIREBASE_MEASUREMENT_ID") || "G-9MBFJZQLGY",
  databaseURL: readEnv("VITE_FIREBASE_DATABASE_URL") || "https://marines-ai-agent-default-rtdb.firebaseio.com",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const appCheckKey = readEnv("VITE_FIREBASE_APPCHECK_KEY");
const appCheck =
  typeof window !== "undefined" && appCheckKey
    ? initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(appCheckKey),
        isTokenAutoRefreshEnabled: true,
      })
    : null;

const authPersistence = typeof window !== "undefined"
  ? setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("Failed to set auth persistence", error);
      return null;
    })
  : Promise.resolve(null);

const analytics =
  typeof window !== "undefined" && firebaseConfig.measurementId
    ? getAnalytics(app)
    : null;

export const getCurrentIdToken = async (forceRefresh = false) => {
  await authPersistence;
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated to fetch an ID token.");
  }
  return user.getIdToken(forceRefresh);
};

export const getAppCheckToken = async () => {
  if (!appCheck) return null;
  try {
    const { token } = await fetchAppCheckToken(appCheck, false);
    return token;
  } catch (error) {
    console.error("Failed to fetch App Check token", error);
    return null;
  }
};

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

export { app as firebaseApp, auth, db, storage, analytics, appCheck };
