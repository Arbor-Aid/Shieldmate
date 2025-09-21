
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getUserProfile, updateUserProfile, UserProfile } from "@/services/userProfileService";
import { ReferralSource } from "@/types/questionnaire";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchUserProfile() {
      if (!currentUser?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userProfile = await getUserProfile(currentUser.uid);
        
        // Merge Firebase Auth user data with Firestore profile data
        if (userProfile) {
          setProfile({
            ...userProfile,
            email: currentUser.email || userProfile.email,
            displayName: currentUser.displayName || userProfile.displayName,
            photoURL: currentUser.photoURL || userProfile.photoURL,
          });
        } else {
          // If no profile exists yet, create a basic one from Auth data
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "",
            photoURL: currentUser.photoURL || "",
            firstName: "",
            lastName: "",
            branch: "",
            serviceYears: "",
            referralSource: "Other" as ReferralSource,
            needsAssistance: [],
            immediateHelp: false,
          });
        }
      } catch (error) {
        console.error("Error in useUserProfile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
  }, [currentUser, toast]);

  const updateProfile = async (updatedData: Partial<UserProfile>): Promise<boolean> => {
    if (!currentUser?.uid || !profile) return false;
    
    try {
      const success = await updateUserProfile(currentUser.uid, updatedData);
      
      if (success) {
        setProfile({ ...profile, ...updatedData });
        toast({
          title: "Success",
          description: "Profile updated successfully",
        });
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    }
  };

  return { profile, loading, updateProfile };
}
