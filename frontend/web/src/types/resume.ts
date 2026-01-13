
export interface ResumeData {
  contactInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  militaryExperience: {
    branch?: string;
    serviceYears?: string;
    rank?: string;
    duties?: string;
  };
  skills: string[];
  certifications: string[];
  education: {
    institution?: string;
    degree?: string;
    year?: string;
  }[];
  objective: string;
}

export type ResumeSection = 
  | "contactInfo" 
  | "summary" 
  | "militaryExperience" 
  | "skills" 
  | "certifications" 
  | "education" 
  | "objective";

export interface ResumePDF {
  id: string;
  fileName: string;
  downloadUrl: string;
  createdAt: Date;
  userId: string;
}
