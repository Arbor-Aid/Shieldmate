import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserRole } from "@/services/roleService";

interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  role?: UserRole;
  lastLogin?: unknown;
}

export function UserRolesTable() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);
      return snapshot.docs.map((document) => ({
        uid: document.id,
        ...document.data(),
      })) as UserData[];
    },
    staleTime: 30 * 1000,
  });

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">User Role Metadata</CardTitle>
        <p className="text-sm text-muted-foreground">
          Profile roles are display-only and do not grant authorization. Manage
          token claims in{" "}
          <Link to="/admin/rbac" className="text-primary underline">
            RBAC Administration
          </Link>
          .
        </p>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4 w-full">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or name..."
            className="pl-8"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Email</th>
                <th className="px-4 py-3 text-left font-medium">
                  Profile Role
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    No users found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const displayRole = user.role ?? "Not set";
                  const roleClass =
                    user.role === "admin" ||
                    user.role === "super_admin"
                      ? "bg-purple-100 text-purple-800"
                      : user.role === "organization" ||
                          user.role === "org_admin" ||
                          user.role === "staff" ||
                          user.role === "case_worker"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800";

                  return (
                    <tr key={user.uid} className="border-b">
                      <td className="px-4 py-3">
                        {user.displayName || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        {user.email || "N/A"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleClass}`}
                        >
                          {displayRole}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
