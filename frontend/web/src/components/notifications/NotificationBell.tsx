
import { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot,
  orderBy,
  limit 
} from "firebase/firestore";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationCenter } from "./NotificationCenter";
import { useToast } from "@/hooks/use-toast";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Query to count unread notifications
    const unreadQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      where("read", "==", false),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(unreadQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    }, (error) => {
      console.error("Error fetching unread count:", error);
    });
    
    return () => unsubscribe();
  }, [currentUser]);
  
  // Track when a notification comes in to show a toast
  useEffect(() => {
    if (!currentUser?.uid) return;
    
    // Get only the newest notification
    const latestQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
      limit(1)
    );
    
    let firstLoad = true;
    
    const unsubscribe = onSnapshot(latestQuery, (snapshot) => {
      // Skip the first load to avoid showing toast for existing notifications
      if (firstLoad) {
        firstLoad = false;
        return;
      }
      
      if (!snapshot.empty) {
        const latestNotification = snapshot.docs[0].data();
        // Only show toast for new notification
        if (!latestNotification.read) {
          toast({
            title: latestNotification.title,
            description: latestNotification.message,
          });
        }
      }
    }, (error) => {
      console.error("Error watching for new notifications:", error);
    });
    
    return () => unsubscribe();
  }, [currentUser, toast]);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-[450px] p-0" align="end">
        <NotificationCenter open={open} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
