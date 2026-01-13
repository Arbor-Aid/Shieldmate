
import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Bell, Mail, FileText, Clipboard, AlertTriangle, User, UserCheck } from "lucide-react";
import { markNotificationAsRead } from "@/services/notificationService";

export interface Notification {
  id: string;
  userId: string;
  type: "message" | "document" | "case_update" | "profile_change" | "new_match" | "system";
  title: string;
  message: string;
  read: boolean;
  createdAt: any;
  link?: string;
  entityId?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "message":
        return <Mail className="h-4 w-4" />;
      case "document":
        return <FileText className="h-4 w-4" />;
      case "case_update":
        return <Clipboard className="h-4 w-4" />;
      case "profile_change":
        return <User className="h-4 w-4" />;
      case "new_match":
        return <UserCheck className="h-4 w-4" />;
      case "system":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    try {
      await markNotificationAsRead(notification.id);
      if (onRead) {
        onRead(notification.id);
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <Link
      to={notification.link || "#"}
      className="flex items-start space-x-4 py-3 border-b hover:bg-gray-50 transition-colors duration-200"
      onClick={handleMarkAsRead}
    >
      <div className="flex-shrink-0">
        <div className="rounded-full bg-gray-200 p-2">
          {getIcon(notification.type)}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{notification.title}</h4>
          <time className="text-xs text-gray-500">
            {notification.createdAt && format(notification.createdAt.toDate(), "MMM d, yyyy h:mm a")}
          </time>
        </div>
        <p className="text-sm text-gray-700">{notification.message}</p>
      </div>
    </Link>
  );
};

export default NotificationItem;
export type { NotificationItemProps };
export { NotificationItem };
