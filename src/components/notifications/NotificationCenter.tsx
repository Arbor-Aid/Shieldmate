
import { useEffect, useState } from "react";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp,
  getDocs, 
  writeBatch,
  doc
} from "firebase/firestore";
import { X, Bell, CheckCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationItem, Notification } from "./NotificationItem";

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationCenter({ open, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  useEffect(() => {
    if (!currentUser?.uid || !open) return;
    
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );
    
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationList: Notification[] = [];
      
      snapshot.forEach((doc) => {
        notificationList.push({
          id: doc.id,
          ...doc.data()
        } as Notification);
      });
      
      setNotifications(notificationList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [currentUser, open, toast]);
  
  const markAllAsRead = async () => {
    if (!currentUser?.uid) return;
    
    try {
      const unreadQuery = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        where("read", "==", false)
      );
      
      const unreadSnapshot = await getDocs(unreadQuery);
      
      if (unreadSnapshot.empty) return;
      
      const batch = writeBatch(db);
      
      unreadSnapshot.forEach((document) => {
        batch.update(doc(db, "notifications", document.id), {
          read: true
        });
      });
      
      await batch.commit();
      
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast({
        title: "Error",
        description: "Failed to mark notifications as read",
        variant: "destructive"
      });
    }
  };
  
  const getFilteredNotifications = () => {
    if (activeTab === "all") return notifications;
    if (activeTab === "unread") return notifications.filter(n => !n.read);
    return notifications.filter(n => n.type === activeTab);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Card className="w-full max-w-md shadow-lg animate-in fade-in slide-in-from-top-5 duration-300">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xl flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
              {unreadCount} new
            </span>
          )}
        </CardTitle>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              className="h-8 text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-4 border-b">
            <TabsList className="w-full justify-start mb-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">Unread</TabsTrigger>
              <TabsTrigger value="case_update" className="text-xs">Cases</TabsTrigger>
              <TabsTrigger value="message" className="text-xs">Messages</TabsTrigger>
              <TabsTrigger value="document" className="text-xs">Documents</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeTab} className="mt-0">
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="mt-2">No notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {activeTab === "all" 
                      ? "You're all caught up!" 
                      : activeTab === "unread"
                        ? "No unread notifications"
                        : `No ${activeTab.replace('_', ' ')} notifications`}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
