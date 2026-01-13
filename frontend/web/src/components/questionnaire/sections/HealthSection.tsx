import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { QuestionnaireData } from '@/types/questionnaire';

interface HealthSectionProps {
  data: QuestionnaireData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleMultiSelectChange: (name: string, value: string[]) => void;
}

const HealthSection: React.FC<HealthSectionProps> = ({
  data,
  handleChange,
  handleMultiSelectChange
}) => {
  const handleCheckboxChange = (name: string, checked: boolean) => {
    const syntheticEvent = {
      target: {
        name,
        value: checked,
        type: "checkbox",
        checked
      }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleChange(syntheticEvent);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Health Information</h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasHealthInsurance"
          checked={data.hasHealthInsurance}
          onCheckedChange={(checked) => 
            handleCheckboxChange('hasHealthInsurance', !!checked)
          }
        />
        <label
          htmlFor="hasHealthInsurance"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have health insurance
        </label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasChildren"
          checked={data.hasChildren}
          onCheckedChange={(checked) => 
            handleCheckboxChange('hasChildren', !!checked)
          }
        />
        <label
          htmlFor="hasChildren"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have children
        </label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="wantsRecoveryHelp"
          checked={data.wantsRecoveryHelp}
          onCheckedChange={(checked) => 
            handleCheckboxChange('wantsRecoveryHelp', !!checked)
          }
        />
        <label
          htmlFor="wantsRecoveryHelp"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I want help with recovery
        </label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="isCurrentlySober"
          checked={data.isCurrentlySober}
          onCheckedChange={(checked) => 
            handleCheckboxChange('isCurrentlySober', !!checked)
          }
        />
        <label
          htmlFor="isCurrentlySober"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I am currently sober
        </label>
      </div>

      <div>
        <Label htmlFor="faithPreference">Faith Preference</Label>
        <Input
          type="text"
          id="faithPreference"
          name="faithPreference"
          value={data.faithPreference}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default HealthSection;
