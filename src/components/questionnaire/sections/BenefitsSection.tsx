
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { QuestionnaireData } from '@/types/questionnaire';

interface BenefitsSectionProps {
  data: QuestionnaireData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleMultiSelectChange: (name: string, value: string[]) => void;
}

const BenefitsSection: React.FC<BenefitsSectionProps> = ({
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
      <h3 className="text-lg font-medium">Benefits and Family Support</h3>
      
      <div className="space-y-2">
        <Label className="text-base">Select the types of assistance you need:</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { id: 'va-benefits', label: 'VA Benefits Navigation' },
            { id: 'disability-claims', label: 'Disability Claims' },
            { id: 'healthcare', label: 'Healthcare Access' },
            { id: 'education', label: 'Education Benefits' },
            { id: 'legal', label: 'Legal Services' },
            { id: 'financial', label: 'Financial Assistance' },
            { id: 'food', label: 'Food Assistance' },
            { id: 'transportation', label: 'Transportation' }
          ].map((item) => (
            <div className="flex items-center space-x-2" key={item.id}>
              <Checkbox
                id={item.id}
                checked={data.needsAssistance?.includes(item.id)}
                onCheckedChange={(checked) => {
                  const currentNeeds = [...(data.needsAssistance || [])];
                  if (checked) {
                    if (!currentNeeds.includes(item.id)) {
                      currentNeeds.push(item.id);
                    }
                  } else {
                    const index = currentNeeds.indexOf(item.id);
                    if (index > -1) {
                      currentNeeds.splice(index, 1);
                    }
                  }
                  
                  handleMultiSelectChange("needsAssistance", currentNeeds);
                }}
              />
              <label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasChildren"
            checked={data.hasChildren}
            onCheckedChange={(checked) => 
              handleCheckboxChange('hasChildren', !!checked)
            }
          />
          <Label htmlFor="hasChildren">I have children under 18</Label>
        </div>
      </div>
      
      {data.hasChildren && (
        <div className="space-y-4 pl-6 border-l-2 border-gray-200">
          <div>
            <Label htmlFor="childrenAges">Children's Ages</Label>
            <Textarea
              id="childrenAges"
              name="childrenAges"
              placeholder="e.g., 2, 5, 13"
              value={data.childrenAges || ""}
              onChange={handleChange}
              className="h-16"
            />
          </div>
          
          <div>
            <Label className="mb-2 block">Support needed for children:</Label>
            {[
              { id: 'childcare', label: 'Childcare' },
              { id: 'education', label: 'Education Support' },
              { id: 'counseling', label: 'Counseling' },
              { id: 'healthcare', label: 'Healthcare' },
              { id: 'activities', label: 'After-school activities' }
            ].map((item) => (
              <div className="flex items-center space-x-2" key={item.id}>
                <Checkbox
                  id={`child-${item.id}`}
                  checked={data.childrenSupportNeeded?.includes(item.id)}
                  onCheckedChange={(checked) => {
                    const currentSupport = [...(data.childrenSupportNeeded || [])];
                    if (checked) {
                      if (!currentSupport.includes(item.id)) {
                        currentSupport.push(item.id);
                      }
                    } else {
                      const index = currentSupport.indexOf(item.id);
                      if (index > -1) {
                        currentSupport.splice(index, 1);
                      }
                    }
                    
                    handleMultiSelectChange("childrenSupportNeeded", currentSupport);
                  }}
                />
                <label
                  htmlFor={`child-${item.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BenefitsSection;
