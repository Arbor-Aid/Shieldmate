
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { User, FileText, Bookmark, Clock, ChevronRight, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Link } from "react-router-dom";

const ProfileDashboard = () => {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState("profile");

  const dashboardSections = [
    { 
      id: "profile", 
      label: "Profile", 
      icon: User,
      emptyMessage: "Complete your profile to get personalized support.",
      emptyAction: "Update Profile",
      emptyLink: "/profile/edit" 
    },
    { 
      id: "documents", 
      label: "Documents", 
      icon: FileText,
      emptyMessage: "Upload important documents for easy access.",
      emptyAction: "Upload Document",
      emptyLink: "/profile/documents" 
    },
    { 
      id: "saved", 
      label: "Saved Resources", 
      icon: Bookmark,
      emptyMessage: "Save resources for quick access later.",
      emptyAction: "Browse Resources",
      emptyLink: "/resources" 
    },
    { 
      id: "cases", 
      label: "Case Status", 
      icon: Clock,
      emptyMessage: "No active support cases.",
      emptyAction: "Request Assistance",
      emptyLink: "/request-support" 
    }
  ];

  return (
    <div className="container px-0 py-4">
      <h1 className="text-2xl font-bold text-navy mb-6">My Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <nav className="space-y-1">
              {dashboardSections.map((section) => (
                <Button
                  key={section.id}
                  variant={activeTab === section.id ? "default" : "ghost"}
                  className={`w-full justify-start font-medium ${
                    activeTab === section.id ? "bg-navy text-white" : "text-gray-700"
                  }`}
                  onClick={() => setActiveTab(section.id)}
                >
                  <section.icon className="mr-2 h-4 w-4" />
                  {section.label}
                </Button>
              ))}
            </nav>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {dashboardSections.map((section) => (
            activeTab === section.id && (
              <Card key={section.id} className="shadow-md">
                <CardHeader className="bg-gray-50 border-b pb-4">
                  <CardTitle className="text-xl text-navy">{section.label}</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {activeTab === "profile" && profile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <p className="mt-1 font-medium">{`${profile.firstName || ''} ${profile.lastName || ''}`}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="mt-1">{profile.email || currentUser?.email}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                            <p className="mt-1">{profile.phoneNumber || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600">Veteran Status</label>
                            <p className="mt-1">{profile.isVeteran ? 'Veteran' : 'Non-veteran'}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t mt-4">
                        <Link to="/profile/edit">
                          <Button className="w-full sm:w-auto bg-navy hover:bg-navy-light">
                            Edit Profile
                          </Button>
                        </Link>
                        <Link to="/questionnaire">
                          <Button variant="outline" className="w-full sm:w-auto border-navy text-navy hover:bg-navy-light hover:text-white">
                            Update Questionnaire
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <section.icon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-muted-foreground mb-4">{section.emptyMessage}</p>
                      <Button asChild className="bg-navy hover:bg-navy-light">
                        <Link to={section.emptyLink}>
                          {section.emptyAction}
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;
