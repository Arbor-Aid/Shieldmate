import { Link } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppUserDashboard() {
  return (
    <AppShell title="User Dashboard" subtitle="Your support workspace">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assistant</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Launch your support assistant to start a new request.
            <div className="mt-3">
              <Link to="/app/user/assistant" className="text-primary underline">
                Open assistant
              </Link>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Upload and track your documents securely.
            <div className="mt-3">
              <Link to="/app/user/documents" className="text-primary underline">
                View documents
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
