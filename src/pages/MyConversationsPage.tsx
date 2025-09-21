
import MyConversations from "@/components/conversations/MyConversations";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientRoute from "@/components/ClientRoute";

export default function MyConversationsPage() {
  return (
    <ProtectedRoute>
      <ClientRoute>
        <div className="min-h-screen flex flex-col">
          <NavigationWithNotifications />
          <main className="flex-1 pb-16">
            <MyConversations />
          </main>
        </div>
      </ClientRoute>
    </ProtectedRoute>
  );
}
