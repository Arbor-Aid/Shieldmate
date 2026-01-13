
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import AIAssistant from '@/components/AIAssistant';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import ProfileHeader from '@/components/profile/ProfileHeader';
import DocumentUploader from '@/components/profile/DocumentUploader';
import ProfileDashboard from '@/components/dashboard/ProfileDashboard';
import ResumeBuilder from '@/components/resume/ResumeBuilder';
import RoleCheck from '@/components/RoleCheck';
import { AppointmentRequest, getAppointmentsByUserId } from '@/services/appointmentService';

const Profile = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { profile, loading } = useUserProfile();
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadAppointments = async () => {
      if (!currentUser) return;
      
      try {
        const userAppointments = await getAppointmentsByUserId(currentUser.uid);
        setAppointments(userAppointments);
      } catch (error) {
        console.error("Error loading appointments:", error);
      }
    };
    
    if (currentUser) {
      loadAppointments();
    }
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    if (status === 'confirmed') {
      return <Badge className="bg-green-500 text-white hover:bg-green-600">Confirmed</Badge>;
    } else if (status === 'pending') {
      return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">Pending</Badge>;
    } else if (status === 'canceled') {
      return <Badge className="bg-red-500 text-white hover:bg-red-600">Canceled</Badge>;
    } else {
      return <Badge>Unknown</Badge>;
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold mb-4 text-navy">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            We couldn't find your profile information. Please complete the questionnaire to get started.
          </p>
          <Button asChild className="bg-navy hover:bg-navy-light text-white">
            <a href="/questionnaire">Complete Questionnaire</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-6 px-4 space-y-8">
        {profile && (
          <ProfileHeader 
            displayName={`${profile.firstName} ${profile.lastName}`}
            photoURL={profile.photoURL}
          />
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="text-sm md:text-base">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="text-sm md:text-base">Appointments</TabsTrigger>
            <TabsTrigger value="documents" className="text-sm md:text-base">Documents</TabsTrigger>
            <TabsTrigger value="resume" className="text-sm md:text-base">Resume Builder</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <ProfileDashboard />
          </TabsContent>
          
          <TabsContent value="appointments" className="space-y-6">
            <Card className="shadow-md">
              <CardHeader className="bg-gray-50 border-b pb-4">
                <CardTitle className="text-xl text-navy">Your Appointments</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {appointments.length > 0 ? (
                  <div className="space-y-4">
                    {appointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <h3 className="font-medium text-navy">{appointment.purpose} Appointment</h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1 flex-wrap gap-3">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>{appointment.preferredDate instanceof Date ? 
                                  format(appointment.preferredDate, 'MM/dd/yyyy') : 
                                  appointment.preferredDate?.toDate ? 
                                  format(appointment.preferredDate.toDate(), 'MM/dd/yyyy') : 'N/A'}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{appointment.preferredTime}</span>
                              </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground mt-2">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{appointment.location}</span>
                            </div>
                            {appointment.notes && (
                              <div className="flex items-start text-sm mt-3 bg-gray-50 p-2 rounded-md">
                                <FileText className="h-4 w-4 mr-1 mt-0.5 text-navy-light" />
                                <span className="text-gray-700">{appointment.notes}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            {getStatusBadge(appointment.status)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-muted-foreground mb-4">You don't have any appointments scheduled.</p>
                    <Button className="bg-navy hover:bg-navy-light">Request Appointment</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="space-y-6">
            {currentUser && <DocumentUploader />}
          </TabsContent>
          
          <TabsContent value="resume" className="space-y-6">
            <ResumeBuilder />
          </TabsContent>
        </Tabs>
      </div>
      
      <AIAssistant />
    </div>
  );
};

export default Profile;
