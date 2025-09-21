
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Organization } from "@/types/organization";
import { trackEvent } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface RequestSupportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: Organization;
}

export function RequestSupportDialog({ open, onOpenChange, organization }: RequestSupportDialogProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      // In a real app, this would send the support request to Firebase
      // For demo purposes, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Track the event
      trackEvent("organization_support_request", {
        organizationId: organization.id,
        organizationName: organization.name,
        messageLength: message.length
      });
      
      toast({
        title: "Support Request Sent",
        description: "Our team will review your request and respond shortly.",
      });
      
      // Reset form and close dialog
      setMessage("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending support request:", error);
      toast({
        title: "Error",
        description: "Failed to send support request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Support</DialogTitle>
          <DialogDescription>
            Send a message to the 2Marines admin team for assistance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Your Message
            </label>
            <Textarea
              id="message"
              placeholder="Describe what you need help with..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!message.trim() || sending}
          >
            {sending ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
