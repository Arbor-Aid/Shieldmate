
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { listenToAllOrganizations } from "@/services/adminService";
import { Organization } from "@/types/organization";
import { format } from "date-fns";
import { Mail, Phone, ExternalLink } from "lucide-react";

interface OrganizationsTableProps {
  searchTerm: string;
}

export function OrganizationsTable({ searchTerm }: OrganizationsTableProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageSize] = useState(10);

  useEffect(() => {
    setLoading(true);
    
    // Listen to real-time organization updates
    const unsubscribe = listenToAllOrganizations((updatedOrgs) => {
      setOrganizations(updatedOrgs);
      setLoading(false);
    }, pageSize);
    
    return () => unsubscribe();
  }, [pageSize]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = organizations.filter(
        org => 
          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrgs(filtered);
    } else {
      setFilteredOrgs(organizations);
    }
  }, [searchTerm, organizations]);

  const loadMoreOrganizations = () => {
    // In a real application, you would implement pagination here
    // For now, we're just showing a loading state for demonstration
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Organizations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Info</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Clients</TableHead>
                <TableHead>Onboarded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-pulse">Loading organizations...</div>
                  </TableCell>
                </TableRow>
              ) : filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell className="font-medium">{org.name}</TableCell>
                    <TableCell>{org.contactPerson}</TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <a href={`mailto:${org.email}`} className="text-blue-600 hover:underline flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {org.email}
                        </a>
                        {org.phone && (
                          <a href={`tel:${org.phone}`} className="text-blue-600 hover:underline flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {org.phone}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.status)}`}>
                        {org.status}
                      </span>
                    </TableCell>
                    <TableCell>{org.type}</TableCell>
                    <TableCell>{org.clientCount}</TableCell>
                    <TableCell>
                      {org.createdAt ? format(new Date(org.createdAt), "MMM d, yyyy") : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {searchTerm ? "No organizations match your search." : "No organizations found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredOrgs.length >= pageSize && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={loadMoreOrganizations} 
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
