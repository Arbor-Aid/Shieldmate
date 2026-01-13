import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, X, CheckCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { MapPin, User, FileText } from "lucide-react";
import { AppointmentRequest, getAppointmentsByOrganizationId, updateAppointmentStatus } from "@/services/appointmentService";
import { useRoleAuth } from "@/hooks/useRoleAuth";

interface AppointmentRequestsProps {
  organizationId: string;
}

export function AppointmentRequests({ organizationId }: AppointmentRequestsProps) {
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
	const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRequest | null>(null);
	const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const { userRole } = useRoleAuth();

  useEffect(() => {
    fetchAppointments();
  }, [organizationId]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsData = await getAppointmentsByOrganizationId(organizationId);
      setAppointments(appointmentsData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointment requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

	const handleViewDetails = (appointment: AppointmentRequest) => {
		setSelectedAppointment(appointment);
		setOpenDialog(true);
	};

  const handleStatusUpdate = async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const success = await updateAppointmentStatus(
        appointmentId, 
        status, 
        status === 'confirmed' ? organizationId : undefined
      );
      
      if (success) {
        toast({
          title: `Appointment ${status === 'confirmed' ? 'Confirmed' : 'Cancelled'}`,
          description: `The appointment has been ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully.`,
        });
        
        // Update local state
        setAppointments(prev => prev.map(app => 
          app.id === appointmentId ? { ...app, status } : app
        ));
        
        if (openDialog) {
          setOpenDialog(false);
        }
      } else {
        throw new Error("Failed to update appointment status");
      }
    } catch (error) {
      console.error("Error updating appointment status:", error);
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    
    // If it's a Timestamp from Firestore
    if (date.toDate && typeof date.toDate === 'function') {
      return format(date.toDate(), 'MMM d, yyyy');
    }
    
    // If it's already a Date object or can be parsed as one
    try {
      return format(new Date(date), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading appointment requests...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">No appointment requests available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.userName}</TableCell>
                      <TableCell>{appointment.purpose.length > 30 
                        ? `${appointment.purpose.substring(0, 30)}...` 
                        : appointment.purpose}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" /> 
                            {formatDate(appointment.preferredDate)}
                          </span>
                          <span className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" /> 
                            {appointment.preferredTime}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Appointment Details Dialog */}
      {selectedAppointment && (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Appointment Request Details</DialogTitle>
              <DialogDescription>
                Review and manage this appointment request
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 my-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">Client</span>
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {selectedAppointment.userName}
                </span>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">Purpose</span>
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {selectedAppointment.purpose}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Preferred Date</span>
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(selectedAppointment.preferredDate)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Preferred Time</span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {selectedAppointment.preferredTime}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">Location</span>
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {selectedAppointment.location}
                </span>
              </div>
              
              {selectedAppointment.notes && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Additional Notes</span>
                  <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <div>
                  {getStatusBadge(selectedAppointment.status)}
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:justify-between">
              {selectedAppointment.status === 'pending' && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                    onClick={() => handleStatusUpdate(selectedAppointment.id!, 'cancelled')}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleStatusUpdate(selectedAppointment.id!, 'confirmed')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm
                  </Button>
                </div>
              )}
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
