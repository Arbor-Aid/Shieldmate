import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Save, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { 
  QuestionnaireData, 
  initialQuestionnaireData 
} from "@/types/questionnaire";
import { 
  createClientRecord, 
  updateClientRecord 
} from "@/services/referralService";
import HousingSection from "./sections/HousingSection";
import EmploymentSection from "./sections/EmploymentSection";
import BenefitsSection from "./sections/BenefitsSection";
import HealthSection from "./sections/HealthSection";
import PersonalInformationSection from "./sections/PersonalInformationSection";

const Questionnaire = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { profile } = useUserProfile();
  const [data, setData] = useState<QuestionnaireData>(initialQuestionnaireData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setData({
        ...data,
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        zipCode: profile.zipCode || "",
        dateOfBirth: profile.dateOfBirth || null,
        householdSize: profile.householdSize ? Number(profile.householdSize) : 1,
        monthlyIncome: profile.monthlyIncome ? Number(profile.monthlyIncome) : 0,
        hasHealthInsurance: profile.hasHealthInsurance || false,
        hasChildren: profile.hasChildren || false,
        wantsRecoveryHelp: profile.wantsRecoveryHelp || false,
        isCurrentlySober: profile.isCurrentlySober || false,
        faithPreference: profile.faithPreference || "no-preference",
        preferredReferralMethod: profile.preferredReferralMethod || "email",
        needsAssistance: profile.needsAssistance || [],
        immediateHelp: profile.immediateHelp || false,
        isVeteran: true,
        inWashtenawCounty: profile.inWashtenawCounty !== undefined ? profile.inWashtenawCounty : true
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const checked = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;

    setData(prevData => ({
      ...prevData,
      [name]: e.target.type === 'checkbox' ? checked : value
    }));
  };
  
  const handleMultiSelectChange = (name: string, value: string[]) => {
    setData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setData(prevData => ({
      ...prevData,
      [name]: date
    }));
  };

  const nextSection = () => {
    setCurrentSection(prevSection => Math.min(prevSection + 1, 4));
  };

  const prevSection = () => {
    setCurrentSection(prevSection => Math.max(prevSection - 1, 0));
  };

  const handleSubmit = async () => {
    if (!currentUser) return;

    setIsSaving(true);

    try {
      // Ensure needsAssistance is always an array
      if (!data.needsAssistance) {
        data.needsAssistance = [];
      }
      
      // Set fullName based on first and last name
      data.fullName = `${data.firstName} ${data.lastName}`;

      if (profile?.uid) {
        // Update existing client record
        await updateClientRecord(profile.uid, data);
        toast({
          title: "Questionnaire Updated",
          description: "Your questionnaire has been successfully updated.",
        });
      } else {
        // Create new client record
        await createClientRecord(currentUser.uid, null, data);
        toast({
          title: "Questionnaire Submitted",
          description: "Thank you! Your questionnaire has been successfully submitted.",
        });
      }

      navigate("/profile");
    } catch (error) {
      console.error("Error submitting questionnaire:", error);
      toast({
        title: "Error",
        description: "Failed to submit questionnaire. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 0:
        return (
          <PersonalInformationSection
            data={data}
            handleChange={handleChange}
            handleDateChange={handleDateChange}
          />
        );
      case 1:
        return (
          <HousingSection
            data={data}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <EmploymentSection
            data={data}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <BenefitsSection
            data={data}
            handleChange={handleChange}
            handleMultiSelectChange={handleMultiSelectChange}
          />
        );
      case 4:
        return (
          <HealthSection
            data={data}
            handleChange={handleChange}
            handleMultiSelectChange={handleMultiSelectChange}
          />
        );
      default:
        return <div>Invalid section</div>;
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-3xl">
      <Card>
        <CardHeader className="place-items-start">
          <CardTitle>Questionnaire</CardTitle>
          <CardDescription>
            Please fill out the form to help us connect you with the right
            resources.
          </CardDescription>
        </CardHeader>
        <CardContent>{renderSection()}</CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevSection}
            disabled={currentSection === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          {currentSection === 4 ? (
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          ) : (
            <Button type="button" onClick={nextSection}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Questionnaire;
