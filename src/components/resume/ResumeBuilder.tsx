
import React, { useState, useEffect } from 'react';
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ResumeData, ResumeSection } from "@/types/resume";
import { getResumeData, generateResumeFromProfile, saveResumeData } from "@/services/resumeService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Edit,
  Download,
  Eye,
  Plus,
  Trash,
  Save,
  RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ResumePreview from "./ResumePreview";
import { trackEvent } from "@/lib/firebase";

const ResumeBuilder = () => {
  const { currentUser } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");
  const [savingResume, setSavingResume] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
  
  useEffect(() => {
    async function loadResumeData() {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        const data = await getResumeData(currentUser.uid);
        
        if (data) {
          setResumeData(data);
        } else if (profile) {
          // If no resume exists but we have profile data, generate one
          const generatedResume = await generateResumeFromProfile(profile);
          setResumeData(generatedResume);
        }
      } catch (error) {
        console.error("Error loading resume data:", error);
        toast({
          title: "Error",
          description: "Failed to load resume data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    
    loadResumeData();
  }, [currentUser, profile, toast]);
  
  const handleSaveResume = async () => {
    if (!currentUser || !resumeData) return;
    
    setSavingResume(true);
    try {
      const success = await saveResumeData(currentUser.uid, resumeData);
      
      if (success) {
        toast({
          title: "Success",
          description: "Resume saved successfully",
        });
        trackEvent('resume_saved', { userId: currentUser.uid });
      } else {
        toast({
          title: "Error",
          description: "Failed to save resume",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving resume:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingResume(false);
    }
  };
  
  const handleGenerateResume = async () => {
    if (!profile) return;
    
    setGeneratingResume(true);
    try {
      const generatedResume = await generateResumeFromProfile(profile);
      setResumeData(generatedResume);
      
      toast({
        title: "Success",
        description: "Resume generated from your profile data",
      });
      trackEvent('resume_generated', { userId: currentUser?.uid });
    } catch (error) {
      console.error("Error generating resume:", error);
      toast({
        title: "Error",
        description: "Failed to generate resume",
        variant: "destructive",
      });
    } finally {
      setGeneratingResume(false);
    }
  };
  
  const handleInputChange = (
    section: ResumeSection,
    field: string,
    value: string
  ) => {
    if (!resumeData) return;
    
    setResumeData({
      ...resumeData,
      [section]: {
        ...(resumeData[section] as object),
        [field]: value,
      },
    });
  };
  
  const handleAddEducation = () => {
    if (!resumeData) return;
    
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        { institution: "", degree: "", year: "" },
      ],
    });
  };
  
  const handleUpdateEducation = (
    index: number,
    field: string,
    value: string
  ) => {
    if (!resumeData) return;
    
    const updatedEducation = [...resumeData.education];
    updatedEducation[index] = {
      ...updatedEducation[index],
      [field]: value,
    };
    
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    });
  };
  
  const handleRemoveEducation = (index: number) => {
    if (!resumeData) return;
    
    const updatedEducation = [...resumeData.education];
    updatedEducation.splice(index, 1);
    
    setResumeData({
      ...resumeData,
      education: updatedEducation,
    });
  };
  
  const handleAddSkill = (skill: string) => {
    if (!resumeData || !skill.trim()) return;
    
    setResumeData({
      ...resumeData,
      skills: [...resumeData.skills, skill.trim()],
    });
  };
  
  const handleRemoveSkill = (index: number) => {
    if (!resumeData) return;
    
    const updatedSkills = [...resumeData.skills];
    updatedSkills.splice(index, 1);
    
    setResumeData({
      ...resumeData,
      skills: updatedSkills,
    });
  };
  
  const handleAddCertification = (certification: string) => {
    if (!resumeData || !certification.trim()) return;
    
    setResumeData({
      ...resumeData,
      certifications: [...resumeData.certifications, certification.trim()],
    });
  };
  
  const handleRemoveCertification = (index: number) => {
    if (!resumeData) return;
    
    const updatedCertifications = [...resumeData.certifications];
    updatedCertifications.splice(index, 1);
    
    setResumeData({
      ...resumeData,
      certifications: updatedCertifications,
    });
  };
  
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }
  
  if (!resumeData) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <FileText className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Resume Found</h3>
        <p className="text-gray-500 mb-4 text-center">
          Generate a resume based on your profile information
        </p>
        <Button onClick={handleGenerateResume} disabled={generatingResume}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Resume
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Resume Builder</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleGenerateResume}
            disabled={generatingResume || !profile}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button 
            onClick={handleSaveResume}
            disabled={savingResume}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Resume
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="edit" className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={resumeData.contactInfo.fullName}
                    onChange={(e) => 
                      handleInputChange("contactInfo", "fullName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={resumeData.contactInfo.email}
                    onChange={(e) => 
                      handleInputChange("contactInfo", "email", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={resumeData.contactInfo.phone}
                    onChange={(e) => 
                      handleInputChange("contactInfo", "phone", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={resumeData.contactInfo.location}
                    onChange={(e) => 
                      handleInputChange("contactInfo", "location", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Professional Summary</h3>
              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  rows={4}
                  placeholder="Briefly describe your professional background and strengths"
                  value={resumeData.summary}
                  onChange={(e) => 
                    setResumeData({
                      ...resumeData,
                      summary: e.target.value
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Military Experience */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Military Experience</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch</Label>
                  <Input
                    id="branch"
                    value={resumeData.militaryExperience.branch || ""}
                    onChange={(e) => 
                      handleInputChange("militaryExperience", "branch", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serviceYears">Years of Service</Label>
                  <Input
                    id="serviceYears"
                    value={resumeData.militaryExperience.serviceYears || ""}
                    onChange={(e) => 
                      handleInputChange("militaryExperience", "serviceYears", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rank">Rank</Label>
                  <Input
                    id="rank"
                    value={resumeData.militaryExperience.rank || ""}
                    onChange={(e) => 
                      handleInputChange("militaryExperience", "rank", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="duties">Duties & Responsibilities</Label>
                  <Textarea
                    id="duties"
                    rows={3}
                    value={resumeData.militaryExperience.duties || ""}
                    onChange={(e) => 
                      handleInputChange("militaryExperience", "duties", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Skills */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Skills</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    id="newSkill"
                    placeholder="Add a new skill"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('newSkill') as HTMLInputElement;
                      handleAddSkill(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills.map((skill, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                    >
                      <span>{skill}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1"
                        onClick={() => handleRemoveSkill(index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {resumeData.skills.length === 0 && (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Certifications */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Certifications</h3>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    id="newCertification"
                    placeholder="Add a new certification"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCertification(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById('newCertification') as HTMLInputElement;
                      handleAddCertification(input.value);
                      input.value = '';
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {resumeData.certifications.map((cert, index) => (
                    <div 
                      key={index} 
                      className="flex items-center bg-gray-100 rounded-md px-3 py-1"
                    >
                      <span>{cert}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1"
                        onClick={() => handleRemoveCertification(index)}
                      >
                        <Trash className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {resumeData.certifications.length === 0 && (
                    <p className="text-gray-500 text-sm">No certifications added yet</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Education */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddEducation}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Education
                </Button>
              </div>
              
              {resumeData.education.map((edu, index) => (
                <div key={index} className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium">Education #{index + 1}</h4>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleRemoveEducation(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`edu-institution-${index}`}>Institution</Label>
                      <Input
                        id={`edu-institution-${index}`}
                        value={edu.institution || ""}
                        onChange={(e) => 
                          handleUpdateEducation(index, "institution", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-degree-${index}`}>Degree/Certification</Label>
                      <Input
                        id={`edu-degree-${index}`}
                        value={edu.degree || ""}
                        onChange={(e) => 
                          handleUpdateEducation(index, "degree", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`edu-year-${index}`}>Year</Label>
                      <Input
                        id={`edu-year-${index}`}
                        value={edu.year || ""}
                        onChange={(e) => 
                          handleUpdateEducation(index, "year", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {resumeData.education.length === 0 && (
                <p className="text-gray-500 text-sm">No education entries added yet</p>
              )}
            </CardContent>
          </Card>
          
          {/* Objective */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Objective</h3>
              <div className="space-y-2">
                <Label htmlFor="objective">Career Objective</Label>
                <Textarea
                  id="objective"
                  rows={3}
                  placeholder="What are your career goals?"
                  value={resumeData.objective}
                  onChange={(e) => 
                    setResumeData({
                      ...resumeData,
                      objective: e.target.value
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <ResumePreview resumeData={resumeData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResumeBuilder;
