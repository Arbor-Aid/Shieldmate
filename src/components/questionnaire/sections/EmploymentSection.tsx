
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from '@/types/questionnaire';

interface EmploymentSectionProps {
  data: QuestionnaireData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const EmploymentSection: React.FC<EmploymentSectionProps> = ({
  data,
  handleChange
}) => {
  const handleSelectChange = (name: string, value: string) => {
    const syntheticEvent = {
      target: {
        name,
        value,
        type: "select"
      }
    } as unknown as React.ChangeEvent<HTMLSelectElement>;
    handleChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Employment Information</h3>
      
      <div>
        <Label htmlFor="employmentStatus">Employment Status</Label>
        <Select 
          onValueChange={(value) => handleSelectChange("employmentStatus", value)}
          defaultValue={data.employmentStatus}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="employed">Employed</SelectItem>
            <SelectItem value="unemployed">Unemployed</SelectItem>
            <SelectItem value="part-time">Part-Time</SelectItem>
            <SelectItem value="self-employed">Self-Employed</SelectItem>
            <SelectItem value="retired">Retired</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="occupation">Occupation</Label>
        <Input
          id="occupation"
          name="occupation"
          type="text"
          value={data.occupation || ''}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="employer">Employer</Label>
        <Input
          id="employer"
          name="employer"
          type="text"
          value={data.employer || ''}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default EmploymentSection;
