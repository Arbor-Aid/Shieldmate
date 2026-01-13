
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Notification } from "@/components/notifications/NotificationItem";

export type CreateNotificationParams = Omit<Notification, 'id' | 'createdAt' | 'read'>;

/**
 * Creates a new notification for a user
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notificationData = {
      ...params,
      read: false,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "notifications"), notificationData);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Creates notifications for multiple users (e.g., for system-wide announcements)
 */
export const createBulkNotifications = async (userIds: string[], notificationData: Omit<CreateNotificationParams, 'userId'>) => {
  try {
    const batch = [];
    
    for (const userId of userIds) {
      batch.push(
        createNotification({
          ...notificationData,
          userId
        })
      );
    }
    
    await Promise.all(batch);
    return true;
  } catch (error) {
    console.error("Error creating bulk notifications:", error);
    throw error;
  }
};

/**
 * Marks a notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true
    });
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Marks all notifications for a user as read
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const updatePromises = querySnapshot.docs.map(document => {
      return updateDoc(doc(db, "notifications", document.id), {
        read: true
      });
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Deletes a notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
    return true;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Deletes all notifications for a user
 */
export const deleteAllNotifications = async (userId: string) => {
  try {
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    const deletePromises = querySnapshot.docs.map(document => {
      return deleteDoc(doc(db, "notifications", document.id));
    });
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};

/**
 * Utility function to generate notification for case status changes
 */
export const createCaseStatusNotification = async (
  userId: string, 
  caseId: string, 
  caseName: string, 
  oldStatus: string,
  newStatus: string
) => {
  try {
    return await createNotification({
      userId,
      type: "case_update",
      title: "Case Status Updated",
      message: `Your case "${caseName}" status changed from ${oldStatus} to ${newStatus}.`,
      link: `/profile?tab=cases&caseId=${caseId}`,
      entityId: caseId
    });
  } catch (error) {
    console.error("Error creating case status notification:", error);
    throw error;
  }
};

/**
 * Utility function to generate notification for new messages
 */
export const createNewMessageNotification = async (
  userId: string,
  messageId: string,
  senderName: string,
  previewText: string,
  chatId: string
) => {
  try {
    return await createNotification({
      userId,
      type: "message",
      title: `New message from ${senderName}`,
      message: previewText.length > 60 ? `${previewText.slice(0, 60)}...` : previewText,
      link: `/profile?tab=messages&chatId=${chatId}`,
      entityId: messageId
    });
  } catch (error) {
    console.error("Error creating new message notification:", error);
    throw error;
  }
};

/**
 * Utility function to generate notification for document updates
 */
export const createDocumentNotification = async (
  userId: string,
  documentId: string,
  documentName: string,
  action: "uploaded" | "updated" | "shared" | "approved" | "rejected",
  organizationName?: string
) => {
  let title = "";
  let message = "";
  
  switch (action) {
    case "uploaded":
      title = "Document Uploaded";
      message = `Your document "${documentName}" has been successfully uploaded.`;
      break;
    case "updated":
      title = "Document Updated";
      message = `Your document "${documentName}" has been updated.`;
      break;
    case "shared":
      title = "Document Shared";
      message = `Your document "${documentName}" has been shared with ${organizationName || "an organization"}.`;
      break;
    case "approved":
      title = "Document Approved";
      message = `Your document "${documentName}" has been approved by ${organizationName || "an organization"}.`;
      break;
    case "rejected":
      title = "Document Needs Attention";
      message = `Your document "${documentName}" needs revisions from ${organizationName || "an organization"}.`;
      break;
  }
  
  try {
    return await createNotification({
      userId,
      type: "document",
      title,
      message,
      link: `/profile?tab=documents&documentId=${documentId}`,
      entityId: documentId
    });
  } catch (error) {
    console.error("Error creating document notification:", error);
    throw error;
  }
};

/**
 * Utility function to generate notification for profile changes
 */
export const createProfileChangeNotification = async (
  userId: string,
  changeType: "updated" | "verified" | "information_needed"
) => {
  let title = "";
  let message = "";
  
  switch (changeType) {
    case "updated":
      title = "Profile Updated";
      message = "Your profile has been successfully updated.";
      break;
    case "verified":
      title = "Profile Verified";
      message = "Your profile information has been verified.";
      break;
    case "information_needed":
      title = "Profile Information Needed";
      message = "Additional information is needed to complete your profile.";
      break;
  }
  
  try {
    return await createNotification({
      userId,
      type: "profile_change",
      title,
      message,
      link: "/profile?tab=personal"
    });
  } catch (error) {
    console.error("Error creating profile change notification:", error);
    throw error;
  }
};
