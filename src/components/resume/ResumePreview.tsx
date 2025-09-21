
import { useRef, useState } from "react";
import { ResumeData } from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Save } from "lucide-react";
import { trackEvent } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import html2pdf from "html2pdf.js";
import { saveResumePDF } from "@/services/resumeService";

interface ResumePreviewProps {
  resumeData: ResumeData;
}

const ResumePreview = ({ resumeData }: ResumePreviewProps) => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadAsPdf = () => {
    if (!resumeRef.current) return;

    setIsDownloading(true);
    toast({
      title: "Generating PDF",
      description: "Your resume is being prepared for download...",
    });

    const element = resumeRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `${resumeData.contactInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      html2pdf().set(opt).from(element).save().then(() => {
        trackEvent('resume_downloaded', {
          resumeName: opt.filename,
        });
        
        toast({
          title: "PDF Generated",
          description: "Your resume has been downloaded",
        });
        setIsDownloading(false);
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
      setIsDownloading(false);
    }
  };

  const savePdfToStorage = async () => {
    if (!resumeRef.current || !currentUser) return;

    setIsSaving(true);
    toast({
      title: "Saving Resume",
      description: "Your resume is being saved to your account...",
    });

    const element = resumeRef.current;
    const opt = {
      margin: [0.5, 0.5, 0.5, 0.5],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    try {
      // Generate PDF blob instead of downloading it
      const pdfBlob = await html2pdf().set(opt).from(element).outputPdf('blob');
      
      // Save to Firebase Storage
      await saveResumePDF(currentUser.uid, pdfBlob);
      
      toast({
        title: "Success",
        description: "Your resume has been saved to your account",
      });
    } catch (error) {
      console.error("Error saving PDF:", error);
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4 gap-2">
        <Button onClick={savePdfToStorage} disabled={isSaving || !currentUser}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save to My Documents"}
        </Button>
        <Button onClick={downloadAsPdf} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? "Generating..." : "Download as PDF"}
        </Button>
      </div>
      
      <Card className="p-8 max-w-4xl mx-auto bg-white shadow-lg">
        <div ref={resumeRef} className="space-y-6 text-gray-800">
          {/* Header / Contact Info */}
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-center mb-3">
              {resumeData.contactInfo.fullName}
            </h1>
            <div className="flex flex-wrap justify-center gap-x-4 text-sm">
              {resumeData.contactInfo.email && (
                <span>{resumeData.contactInfo.email}</span>
              )}
              {resumeData.contactInfo.phone && (
                <span>{resumeData.contactInfo.phone}</span>
              )}
              {resumeData.contactInfo.location && (
                <span>{resumeData.contactInfo.location}</span>
              )}
            </div>
          </div>
          
          {/* Objective (if provided) */}
          {resumeData.objective && (
            <div>
              <h2 className="text-lg font-bold border-b pb-1 mb-2">OBJECTIVE</h2>
              <p>{resumeData.objective}</p>
            </div>
          )}
          
          {/* Summary Section */}
          {resumeData.summary && (
            <div>
              <h2 className="text-lg font-bold border-b pb-1 mb-2">PROFESSIONAL SUMMARY</h2>
              <p>{resumeData.summary}</p>
            </div>
          )}
          
          {/* Military Experience */}
          {(resumeData.militaryExperience.branch || 
            resumeData.militaryExperience.serviceYears ||
            resumeData.militaryExperience.rank ||
            resumeData.militaryExperience.duties) && (
            <div>
              <h2 className="text-lg font-bold border-b pb-1 mb-2">MILITARY EXPERIENCE</h2>
              <div className="space-y-2">
                {resumeData.militaryExperience.branch && (
                  <div>
                    <span className="font-semibold">Branch: </span>
                    <span>{resumeData.militaryExperience.branch}</span>
                    {resumeData.militaryExperience.serviceYears && (
                      <span> ({resumeData.militaryExperience.serviceYears})</span>
                    )}
                  </div>
                )}
                
                {resumeData.militaryExperience.rank && (
                  <div>
                    <span className="font-semibold">Rank: </span>
                    <span>{resumeData.militaryExperience.rank}</span>
                  </div>
                )}
                
                {resumeData.militaryExperience.duties && (
                  <div>
                    <span className="font-semibold">Duties & Responsibilities: </span>
                    <p className="mt-1">{resumeData.militaryExperience.duties}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-1 mb-2">SKILLS</h2>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Education */}
          {resumeData.education.some(
            (edu) => edu.institution || edu.degree || edu.year
          ) && (
            <div>
              <h2 className="text-lg font-bold border-b pb-1 mb-2">EDUCATION</h2>
              <div className="space-y-3">
                {resumeData.education.map((edu, index) => {
                  if (!edu.institution && !edu.degree && !edu.year) return null;
                  
                  return (
                    <div key={index}>
                      {edu.institution && (
                        <div className="font-semibold">{edu.institution}</div>
                      )}
                      <div className="flex justify-between">
                        {edu.degree && <div>{edu.degree}</div>}
                        {edu.year && <div>{edu.year}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Certifications */}
          {resumeData.certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold border-b pb-1 mb-2">CERTIFICATIONS</h2>
              <ul className="list-disc pl-5">
                {resumeData.certifications.map((cert, index) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResumePreview;
