
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getContextualSuggestions } from "@/services/aiGuidanceService";
import { useRoleAuth } from "@/hooks/useRoleAuth";

interface PromptHelperProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptHelper({ onSelectPrompt }: PromptHelperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();
  const { userRole } = useRoleAuth();

  // Check if user has seen the welcome modal before
  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!currentUser) return;
      
      try {
        const userPrefsRef = doc(db, "user_preferences", currentUser.uid);
        const userPrefs = await getDoc(userPrefsRef);
        
        if (userPrefs.exists()) {
          setHasSeenWelcome(userPrefs.data().hasSeenChatWelcome || false);
        } else {
          // New user, hasn't seen welcome
          setHasSeenWelcome(false);
          // Show the welcome modal
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error checking welcome status:", error);
        // Fallback to showing the welcome if we can't check
        setHasSeenWelcome(false);
        setIsOpen(true);
      }
    };
    
    checkWelcomeStatus();
  }, [currentUser]);

  // Generate personalized suggestions based on profile
  useEffect(() => {
    if (!profile) return;
    
    let customSuggestions: string[] = [];
    
    // Add suggestions based on user profile data
    if (profile.needsAssistance?.includes("housing")) {
      if (profile.zipCode) {
        customSuggestions.push(`Find housing options near ${profile.zipCode}`);
      } else {
        customSuggestions.push("Help me find affordable housing options");
      }
    }
    
    if (profile.needsAssistance?.includes("employment")) {
      customSuggestions.push("Help me write a resume");
      customSuggestions.push("Show me job opportunities for veterans");
    }
    
    if (profile.needsAssistance?.includes("benefits")) {
      customSuggestions.push("What VA benefits am I eligible for?");
      customSuggestions.push("Help me understand my veteran benefits");
    }
    
    if (profile.needsAssistance?.includes("health")) {
      customSuggestions.push("Find mental health resources near me");
      customSuggestions.push("What healthcare options are available for veterans?");
    }
    
    // Fallback to standard suggestions if we don't have enough custom ones
    if (customSuggestions.length < 3) {
      const fallbackSuggestions = getContextualSuggestions([], userRole);
      customSuggestions = [...customSuggestions, ...fallbackSuggestions];
    }
    
    // Limit to 5 suggestions
    setSuggestedPrompts(customSuggestions.slice(0, 5));
  }, [profile, userRole]);

  const markWelcomeAsSeen = async () => {
    if (!currentUser) return;
    
    try {
      const userPrefsRef = doc(db, "user_preferences", currentUser.uid);
      await setDoc(userPrefsRef, { hasSeenChatWelcome: true }, { merge: true });
      setHasSeenWelcome(true);
    } catch (error) {
      console.error("Error saving welcome preference:", error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (!hasSeenWelcome) {
      markWelcomeAsSeen();
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    onSelectPrompt(prompt);
    setIsOpen(false);
    if (!hasSeenWelcome) {
      markWelcomeAsSeen();
    }
  };

  return (
    <>
      {/* Help button to open prompt suggestions */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8 rounded-full"
        data-test-id="prompt-helper-button"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* Dialog for welcome and prompt suggestions */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {!hasSeenWelcome ? "Welcome to the 2Marines AI Assistant!" : "Need help getting started?"}
            </DialogTitle>
            <DialogDescription>
              {!hasSeenWelcome 
                ? "Here are some ways you can interact with our AI assistant based on your needs."
                : "Here are some suggested prompts to help you get started with our AI assistant."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3"
                onClick={() => handleSelectPrompt(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>
              {!hasSeenWelcome ? "Got it" : "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
