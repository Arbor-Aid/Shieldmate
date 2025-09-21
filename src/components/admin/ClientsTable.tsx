
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getAllClients } from "@/services/adminService";
import { Client } from "@/types/organization";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface ClientsTableProps {
  searchTerm: string;
}

export function ClientsTable({ searchTerm }: ClientsTableProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(
        client => 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  const loadClients = async (reset = false) => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (date) {
        // For simplicity, we're just using a single date to filter
        // In a real app, you'd likely want a date range
        filters.startDate = new Date(date.setHours(0, 0, 0, 0));
        filters.endDate = new Date(date.setHours(23, 59, 59, 999));
      }

      const { clients: newClients, lastDoc: newLastDoc } = await getAllClients(
        reset ? null : lastDoc, 
        10,
        filters
      );
      
      if (reset) {
        setClients(newClients);
        setFilteredClients(newClients);
      } else {
        setClients(prev => [...prev, ...newClients]);
        setFilteredClients(prev => [...prev, ...newClients]);
      }
      
      setLastDoc(newLastDoc);
      setHasMore(newClients.length === 10);
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(event.target.value);
  };

  const applyFilters = () => {
    loadClients(true);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setDate(undefined);
    loadClients(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>All Clients</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <select
                className="border border-gray-300 rounded-md p-1 text-sm"
                value={statusFilter}
                onChange={handleStatusFilterChange}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs px-2">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  {date ? format(date, "MMM d, yyyy") : "Date Filter"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button size="sm" onClick={applyFilters}>
              <Filter className="h-3 w-3 mr-1" />
              Apply
            </Button>
            
            <Button size="sm" variant="ghost" onClick={clearFilters}>
              Clear
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Service Type</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Date Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-pulse">Loading clients...</div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </TableCell>
                    <TableCell>{client.serviceType}</TableCell>
                    <TableCell>{client.organizationId}</TableCell>
                    <TableCell>
                      {client.createdAt ? format(new Date(client.createdAt), "MMM d, yyyy") : "Unknown"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? "No clients match your search." : "No clients found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {hasMore && (
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => loadClients()} 
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
