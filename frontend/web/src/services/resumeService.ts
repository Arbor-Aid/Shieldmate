import { db, storage } from "@/lib/firebase";
import { collection, addDoc, doc, setDoc, serverTimestamp, getDoc, query, where, getDocs, updateDoc } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { trackEvent } from "@/lib/firebase";
import { ResumeData } from "@/types/resume";
import { UserProfile } from "@/services/userProfileService";
import { QuestionnaireData } from "@/types/questionnaire";

interface ResumeDataInput {
  userId: string;
  skills: string[];
  experience: string;
  education: string;
}

/**
 * Generate resume content based on user input
 */
export async function generateResume(data: ResumeDataInput): Promise<string> {
  try {
    // Track the event
    trackEvent("resume_generated", {
      userId: data.userId,
      skillsCount: data.skills.length
    });
    
    // Store resume data in Firestore
    await addDoc(collection(db, "resumes"), {
      userId: data.userId,
      skills: data.skills,
      experience: data.experience,
      education: data.education,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add document reference to user's documents collection
    await setDoc(doc(db, "user_documents", `resume-${Date.now()}-${data.userId}`), {
      userId: data.userId,
      title: "My Resume",
      type: "resume",
      createdAt: serverTimestamp(),
      content: formatResumeContent(data)
    });
    
    // Return formatted resume content
    return formatResumeContent(data);
  } catch (error) {
    console.error("Error generating resume:", error);
    throw new Error("Failed to generate resume");
  }
}

/**
 * Format resume content for display
 */
function formatResumeContent(data: ResumeDataInput): string {
  let content = "";
  
  // Skills section
  content += "SKILLS\n";
  content += "------\n";
  data.skills.forEach(skill => {
    content += `• ${skill}\n`;
  });
  
  // Experience section
  content += "\nEXPERIENCE\n";
  content += "---------\n";
  content += data.experience + "\n";
  
  // Education section
  content += "\nEDUCATION\n";
  content += "--------\n";
  content += data.education + "\n";
  
  return content;
}

/**
 * Get resume data for a user
 */
export async function getResumeData(userId: string): Promise<ResumeData | null> {
  try {
    // Check for existing resume in user_documents collection
    const userDocumentsRef = collection(db, "user_documents");
    const q = query(
      userDocumentsRef,
      where("userId", "==", userId),
      where("type", "==", "resume")
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // If a resume document exists, try to parse it
      const docData = snapshot.docs[0].data();
      
      try {
        // This would be a proper implementation to parse the resume data
        // In a real app, you'd have a more structured way to store/retrieve this
        return {
          contactInfo: {
            fullName: docData.fullName || "",
            email: docData.email || "",
            phone: docData.phone || "",
            location: docData.location || "",
          },
          summary: docData.summary || "",
          militaryExperience: {
            branch: docData.branch || "",
            serviceYears: docData.serviceYears || "",
            rank: "", // Removed reference to profile.rank since it doesn't exist
            duties: docData.duties || "",
          },
          skills: docData.skills || [],
          certifications: docData.certifications || [],
          education: docData.education || [],
          objective: docData.objective || "",
        };
      } catch (error) {
        console.error("Error parsing resume data:", error);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error fetching resume data:", error);
    return null;
  }
}

/**
 * Generate a resume from user profile data
 */
export async function generateResumeFromProfile(profile: UserProfile): Promise<ResumeData> {
  try {
    // Enhanced auto-population from profile/questionnaire data
    const skills = extractSkillsFromProfile(profile);
    
    // Create military experience summary
    let militaryDuties = "";
    if (profile.branch) {
      militaryDuties = `Served in the ${profile.branch} `;
      if (profile.serviceYears) {
        militaryDuties += `for ${profile.serviceYears}. `;
      }
      
      if (profile.needsAssistance && profile.needsAssistance.length > 0) {
        militaryDuties += `Developed expertise in ${profile.needsAssistance.join(", ")}.`;
      }
    }
    
    // Create a location string
    let location = "";
    if (profile.city && profile.zipCode) {
      location = `${profile.city}, ${profile.zipCode}`;
    } else if (profile.zipCode) {
      location = profile.zipCode;
    } else if (profile.city) {
      location = profile.city;
    }
    
    // Create an objective based on user's immediate needs
    let objective = "To leverage my military experience and skills in a civilian career.";
    if (profile.needsAssistance && profile.needsAssistance.includes("Employment")) {
      objective = "To secure stable employment that utilizes my military background and provides career advancement opportunities.";
    } else if (profile.needsAssistance && profile.needsAssistance.includes("Education")) {
      objective = "To further my education and training while applying my military experience to new career opportunities.";
    }
    
    // Build a more comprehensive resume structure
    const resumeData: ResumeData = {
      contactInfo: {
        fullName: profile.fullName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        email: profile.email || "",
        phone: profile.phoneNumber || "",
        location: location,
      },
      summary: generateSummary(profile),
      militaryExperience: {
        branch: profile.branch || "",
        serviceYears: profile.serviceYears || "",
        rank: "", // Removed reference to profile.rank since it doesn't exist
        duties: militaryDuties,
      },
      skills: skills,
      certifications: [],
      education: [
        {
          institution: profile.branch ? `${profile.branch} Training and Education` : "Military Training",
          degree: "",
          year: profile.serviceYears || "",
        }
      ],
      objective: objective,
    };
    
    // Track the event
    trackEvent("resume_generated_from_profile", {
      userId: profile.uid,
    });
    
    return resumeData;
  } catch (error) {
    console.error("Error generating resume from profile:", error);
    
    // Return a default empty resume structure if there's an error
    return {
      contactInfo: {
        fullName: "",
        email: "",
        phone: "",
        location: "",
      },
      summary: "",
      militaryExperience: {},
      skills: [],
      certifications: [],
      education: [],
      objective: "",
    };
  }
}

/**
 * Generate a professional summary based on profile data
 */
function generateSummary(profile: UserProfile): string {
  let summary = "";
  
  const firstName = profile.firstName || "";
  const branch = profile.branch || "military";
  
  if (firstName) {
    summary += `${firstName} is a `;
  } else {
    summary += "Professional ";
  }
  
  summary += `${branch} veteran `;
  
  if (profile.serviceYears) {
    summary += `with ${profile.serviceYears} of service. `;
  } else {
    summary += "with military experience. ";
  }
  
  if (profile.needsAssistance && profile.needsAssistance.length > 0) {
    summary += `Specialized in ${profile.needsAssistance.join(", ")}. `;
  }
  
  summary += "Seeking to leverage military training and experience in a civilian career.";
  
  return summary;
}

/**
 * Extract skills from user profile data
 */
function extractSkillsFromProfile(profile: UserProfile): string[] {
  const skills: string[] = [];
  
  // Add skills based on branch
  if (profile.branch) {
    switch(profile.branch.toLowerCase()) {
      case "army":
        skills.push("Leadership", "Adaptability", "Technical Proficiency");
        break;
      case "navy":
        skills.push("Technical Operations", "Teamwork", "Logistics");
        break;
      case "air force":
        skills.push("Technical Expertise", "Precision", "Problem Solving");
        break;
      case "marines":
        skills.push("Leadership", "Adaptability", "Strategic Planning");
        break;
      case "coast guard":
        skills.push("Emergency Response", "Maritime Operations", "Safety Protocols");
        break;
      default:
        skills.push("Leadership", "Teamwork", "Problem Solving");
    }
  } else {
    // Default military skills
    skills.push("Leadership", "Teamwork", "Problem Solving");
  }
  
  // Add skills based on needs assistance
  if (profile.needsAssistance) {
    if (profile.needsAssistance.includes("Employment")) {
      skills.push("Career Development", "Professional Communication");
    }
    if (profile.needsAssistance.includes("Housing")) {
      skills.push("Resource Management", "Planning");
    }
    if (profile.needsAssistance.includes("Benefits")) {
      skills.push("Administrative Skills", "Documentation");
    }
    if (profile.needsAssistance.includes("Health")) {
      skills.push("Self-Management", "Health Awareness");
    }
  }
  
  // Add generic valuable skills
  skills.push("Time Management", "Discipline", "Attention to Detail");
  
  return [...new Set(skills)]; // Remove duplicates
}

/**
 * Save resume data to Firestore
 */
export async function saveResumeData(
  userId: string, 
  resumeData: ResumeData
): Promise<boolean> {
  try {
    // Check if a resume document already exists
    const userDocumentsRef = collection(db, "user_documents");
    const q = query(
      userDocumentsRef,
      where("userId", "==", userId),
      where("type", "==", "resume")
    );
    
    const snapshot = await getDocs(q);
    let docId = "";
    
    if (!snapshot.empty) {
      // Update existing document
      docId = snapshot.docs[0].id;
      await updateDoc(doc(db, "user_documents", docId), {
        ...resumeData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Create new document
      const docRef = await addDoc(collection(db, "user_documents"), {
        userId,
        title: "My Resume",
        type: "resume",
        ...resumeData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      docId = docRef.id;
    }
    
    // Track the event
    trackEvent("resume_saved", { userId });
    
    return true;
  } catch (error) {
    console.error("Error saving resume data:", error);
    return false;
  }
}

/**
 * Save PDF resume to Firebase Storage
 */
export async function saveResumePDF(userId: string, pdfBlob: Blob): Promise<string> {
  try {
    // Create a reference to the file in Firebase Storage
    const filePath = `users/${userId}/resumes/resume_${Date.now()}.pdf`;
    const storageRef = ref(storage, filePath);
    
    // Convert blob to base64 string
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          // Upload as base64 data URL
          const base64String = reader.result as string;
          await uploadString(storageRef, base64String, 'data_url');
          
          // Get the download URL
          const downloadUrl = await getDownloadURL(storageRef);
          
          // Add document reference to user's documents collection
          await addDoc(collection(db, "userDocuments"), {
            userId,
            name: "My Resume.pdf",
            type: "application/pdf",
            size: pdfBlob.size,
            uploadDate: serverTimestamp(),
            storagePath: filePath,
            downloadUrl,
          });
          
          trackEvent("resume_pdf_saved", { userId });
          
          resolve(downloadUrl);
        } catch (error) {
          console.error("Error uploading PDF:", error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw error;
  }
}
