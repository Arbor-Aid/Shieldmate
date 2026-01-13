
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { QuestionnaireData } from '@/types/questionnaire';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalInformationSectionProps {
  data: QuestionnaireData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleDateChange: (name: string, date: Date | null) => void;
}

const PersonalInformationSection: React.FC<PersonalInformationSectionProps> = ({
  data,
  handleChange,
  handleDateChange
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            value={data.firstName}
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={data.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          value={data.phoneNumber}
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <Label>Date of Birth</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !data.dateOfBirth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {data.dateOfBirth ? format(data.dateOfBirth, 'PP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={data.dateOfBirth || undefined}
              onSelect={(date) => handleDateChange('dateOfBirth', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      
      <div>
        <Label htmlFor="zipCode">Zip Code</Label>
        <Input
          id="zipCode"
          name="zipCode"
          value={data.zipCode}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="inWashtenawCounty"
          name="inWashtenawCounty"
          checked={data.inWashtenawCounty}
          onCheckedChange={(checked) => {
            const syntheticEvent = {
              target: {
                name: "inWashtenawCounty",
                value: checked,
                type: "checkbox",
                checked: checked
              }
            } as React.ChangeEvent<HTMLInputElement>;
            handleChange(syntheticEvent);
          }}
        />
        <Label htmlFor="inWashtenawCounty">I live in Washtenaw County</Label>
      </div>
    </div>
  );
};

export default PersonalInformationSection;
