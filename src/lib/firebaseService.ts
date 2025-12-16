
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  OAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  UserCredential,
  onAuthStateChanged as firebaseAuthStateChanged
} from "firebase/auth";
import { auth, db, trackEvent, getCurrentIdToken } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { UserRole } from "@/services/roleService";

const readEnvFlag = (key: string, defaultValue: boolean) => {
  const value =
    (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) ??
    (typeof process !== "undefined" ? process.env?.[key] : undefined);

  if (value === undefined) return defaultValue;
  return value.toString().toLowerCase() === "true";
};

export const emailAuthEnabled = readEnvFlag("VITE_ENABLE_EMAIL_AUTH", true);

// Authentication methods
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    trackEvent('sign_in_attempt', {
      provider: 'google',
      success: true
    });
    
    return result;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    
    trackEvent('sign_in_attempt', {
      provider: 'google',
      success: false,
      errorCode: (error as any)?.code
    });
    
    throw error;
  }
};

export const signInWithApple = async (): Promise<UserCredential> => {
  try {
    const provider = new OAuthProvider("apple.com");
    provider.addScope('email');
    const result = await signInWithPopup(auth, provider);
    
    trackEvent('sign_in_attempt', {
      provider: 'apple',
      success: true
    });
    
    return result;
  } catch (error) {
    console.error("Error signing in with Apple:", error);
    
    trackEvent('sign_in_attempt', {
      provider: 'apple',
      success: false,
      errorCode: (error as any)?.code
    });
    
    throw error;
  }
};

export const signInWithFacebook = async (): Promise<UserCredential> => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    const result = await signInWithPopup(auth, provider);
    
    trackEvent('sign_in_attempt', {
      provider: 'facebook',
      success: true
    });
    
    return result;
  } catch (error) {
    console.error("Error signing in with Facebook:", error);
    
    trackEvent('sign_in_attempt', {
      provider: 'facebook',
      success: false,
      errorCode: (error as any)?.code
    });
    
    throw error;
  }
};

export const signInWithGithub = async (): Promise<UserCredential> => {
  try {
    const provider = new GithubAuthProvider();
    provider.addScope('user:email');
    const result = await signInWithPopup(auth, provider);
    
    trackEvent('sign_in_attempt', {
      provider: 'github',
      success: true
    });
    
    return result;
  } catch (error) {
    console.error("Error signing in with GitHub:", error);
    
    trackEvent('sign_in_attempt', {
      provider: 'github',
      success: false,
      errorCode: (error as any)?.code
    });
    
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (!emailAuthEnabled) {
    throw new Error("Email/password authentication is disabled for this deployment.");
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    trackEvent("sign_in_attempt", {
      provider: "email",
      success: true,
    });
    return credential;
  } catch (error: any) {
    trackEvent("sign_in_attempt", {
      provider: "email",
      success: false,
      errorCode: error?.code,
    });
    throw error;
  }
};

export const registerWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  if (!emailAuthEnabled) {
    throw new Error("Email/password authentication is disabled for this deployment.");
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    trackEvent("user_registration", {
      provider: "email",
      success: true,
    });
    return credential;
  } catch (error: any) {
    trackEvent("user_registration", {
      provider: "email",
      success: false,
      errorCode: error?.code,
    });
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    
    trackEvent('user_logout', {
      userId: auth.currentUser?.uid
    });
    
    return;
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Firestore User Profile Management
export const createUserDocument = async (user: User): Promise<void> => {
  if (!user) return;
  
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  
  if (!snapshot.exists()) {
    try {
      // Set default role as client
      const defaultRole: UserRole = "client";
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
        provider: user.providerData[0]?.providerId || 'unknown',
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        role: defaultRole
      });
      
      console.log("New user document created for:", user.uid);
      
      const questionnaireRef = doc(db, "questionnaires", user.uid);
      const questSnapshot = await getDoc(questionnaireRef);
      
      if (!questSnapshot.exists()) {
        const userQuestRef = doc(db, "user_questionnaires", user.uid);
        await setDoc(userQuestRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          completedAt: null,
          isComplete: false
        });
      }
      
      trackEvent('user_registration', {
        provider: user.providerData[0]?.providerId || 'unknown',
        hasEmail: !!user.email,
        hasDisplayName: !!user.displayName,
        role: defaultRole
      });
    } catch (error) {
      console.error("Error creating user document:", error);
      throw error;
    }
  } else {
    try {
      await setDoc(userRef, { 
        lastLogin: serverTimestamp(),
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber
      }, { merge: true });
      
      trackEvent('user_login', {
        provider: user.providerData[0]?.providerId || 'unknown',
        returning: true
      });
    } catch (error) {
      console.error("Error updating last login:", error);
      throw error;
    }
  }
};

// Auth state change subscription
export const onAuthStateChanged = (callback: (user: User | null) => void): (() => void) => {
  return firebaseAuthStateChanged(auth, callback);
};

export const getIdToken = async (forceRefresh = false): Promise<string> => {
  return getCurrentIdToken(forceRefresh);
};
