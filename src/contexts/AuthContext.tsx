
import { createContext, useState, useEffect, ReactNode } from "react";
import { User, UserCredential } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/firebase";
import { 
  signInWithGoogle as firebaseSignInWithGoogle,
  signInWithApple as firebaseSignInWithApple,
  signInWithFacebook as firebaseSignInWithFacebook,
  signInWithGithub as firebaseSignInWithGithub,
  signOut as firebaseSignOut,
  createUserDocument,
  onAuthStateChanged,
  signInWithEmail,
  registerWithEmail,
  getIdToken,
  emailAuthEnabled,
} from "@/lib/firebaseService";

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  emailAuthEnabled: boolean;
  getIdToken: (forceRefresh?: boolean) => Promise<string>;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  registerWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signInWithApple: () => Promise<UserCredential>;
  signInWithFacebook: () => Promise<UserCredential>;
  signInWithGithub: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        await createUserDocument(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await firebaseSignInWithGoogle();
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Google.",
      });
      
      // Navigate to the page they were trying to access or to profile
      const from = location.state?.from?.pathname || '/profile';
      navigate(from);
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEmailSignIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmail(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      const from = location.state?.from?.pathname || '/profile';
      navigate(from);
      return result;
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error?.message || "Unable to sign in with email/password.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleEmailRegistration = async (email: string, password: string) => {
    try {
      const result = await registerWithEmail(email, password);
      toast({
        title: "Account created",
        description: "You can now continue to your profile.",
      });
      const from = location.state?.from?.pathname || '/profile';
      navigate(from);
      return result;
    } catch (error: any) {
      toast({
        title: "Sign-up failed",
        description: error?.message || "Unable to create your account.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      const result = await firebaseSignInWithApple();
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Apple.",
      });
      
      // Navigate to the page they were trying to access or to profile
      const from = location.state?.from?.pathname || '/profile';
      navigate(from);
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Apple. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try { 
      const result = await firebaseSignInWithFacebook();
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with Facebook.",
      });
      
      // Navigate to the page they were trying to access or to profile
      const from = location.state?.from?.pathname || '/profile';
      navigate(from);
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with Facebook. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      const result = await firebaseSignInWithGithub();
      
      toast({
        title: "Welcome!",
        description: "You have successfully signed in with GitHub.",
      });
      
      // Navigate to the page they were trying to access or to profile
      const from = location.state?.from?.pathname || '/profile';
      navigate(from);
      
      return result;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with GitHub. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      emailAuthEnabled,
      getIdToken,
      signInWithEmail: handleEmailSignIn,
      registerWithEmail: handleEmailRegistration,
      signInWithGoogle,
      signInWithApple,
      signInWithFacebook,
      signInWithGithub,
      signOut
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
