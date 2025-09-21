
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireData } from '@/types/questionnaire';
import { Input } from '@/components/ui/input';

interface HousingSectionProps {
  data: QuestionnaireData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const HousingSection: React.FC<HousingSectionProps> = ({
  data,
  handleChange
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
      <h3 className="text-lg font-medium">Housing Information</h3>
      
      <div>
        <Label htmlFor="householdSize">Household Size</Label>
        <Input
          id="householdSize"
          name="householdSize"
          type="number"
          min="1"
          value={data.householdSize}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label htmlFor="monthlyIncome">Monthly Income ($)</Label>
        <Input
          id="monthlyIncome"
          name="monthlyIncome"
          type="number"
          min="0"
          step="100"
          value={data.monthlyIncome}
          onChange={handleChange}
        />
      </div>
      
      <div>
        <Label className="mb-2 block">Do you need immediate housing assistance?</Label>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="immediateHelp"
            checked={data.immediateHelp}
            onCheckedChange={(checked) => 
              handleCheckboxChange('immediateHelp', !!checked)
            }
          />
          <label
            htmlFor="immediateHelp"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Yes, I need immediate assistance
          </label>
        </div>
      </div>
      
      <div>
        <Label>Current Housing Challenges (if any)</Label>
        <Textarea
          id="currentChallenges"
          name="currentChallenges"
          placeholder="Please describe any housing challenges you're facing..."
          value={data.currentChallenges ? data.currentChallenges.join('\n') : ''}
          onChange={(e) => {
            // Split the textarea input by new lines to create an array
            const value = e.target.value.split('\n');
            
            // Create a synthetic event with modified value
            const modifiedEvent = {
              ...e,
              target: {
                ...e.target,
                name: "currentChallenges",
                value: value
              }
            };
            
            // Pass the event to the parent handler
            handleChange(modifiedEvent as unknown as React.ChangeEvent<HTMLTextAreaElement>);
          }}
          className="h-24"
        />
      </div>
      
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
    </div>
  );
};

export default HousingSection;
