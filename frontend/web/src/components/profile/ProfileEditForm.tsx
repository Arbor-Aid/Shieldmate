import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UserProfile } from "@/services/userProfileService";
import { Button } from "@/components/ui/button";
import { ReferralSource } from "@/types/questionnaire";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const needsOptions = [
  { id: "housing", label: "Housing" },
  { id: "employment", label: "Employment" },
  { id: "healthcare", label: "Healthcare" },
  { id: "benefits", label: "VA Benefits" },
  { id: "legal", label: "Legal Assistance" },
  { id: "education", label: "Education" },
  { id: "financial", label: "Financial Planning" },
  { id: "mentalHealth", label: "Mental Health" },
];

const referralOptions: ReferralSource[] = [
  "VA",
  "Social Worker",
  "Friend/Family",
  "Healthcare Provider",
  "Other Veterans",
  "Online Search",
  "Social Media",
  "Other",
];

const ProfileFormSchema = z.object({
  firstName: z.string().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().min(1, {
    message: "Last name is required",
  }),
  email: z.string().email({
    message: "Please enter a valid email",
  }),
  branch: z.string().optional(),
  serviceYears: z.string().optional(),
  referralSource: z.enum([
    "VA",
    "Social Worker",
    "Friend/Family",
    "Healthcare Provider",
    "Other Veterans",
    "Online Search",
    "Social Media",
    "Other"
  ]).optional(),
  needsAssistance: z.array(z.string()).optional(),
  immediateHelp: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof ProfileFormSchema>;

interface ProfileEditFormProps {
  profile: UserProfile | null;
  onSave: (values: Partial<UserProfile>) => Promise<boolean>;
  isLoading: boolean;
}

export function ProfileEditForm({ profile, onSave, isLoading }: ProfileEditFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      branch: profile?.branch || "",
      serviceYears: profile?.serviceYears || "",
      referralSource: profile?.referralSource || "Other",
      needsAssistance: profile?.needsAssistance || [],
      immediateHelp: profile?.immediateHelp || false,
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSaving(true);
    const updatedProfile: Partial<UserProfile> = {
      ...data,
      referralSource: data.referralSource as ReferralSource,
    };
    await onSave(updatedProfile);
    setIsSaving(false);
  }

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading profile data...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>
          Update your profile information below
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Military Branch</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceYears"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Service</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="referralSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How did you hear about us?</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {referralOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="needsAssistance"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Areas you need assistance with</FormLabel>
                    <FormDescription>
                      Select all that apply
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    {needsOptions.map((option) => (
                      <FormField
                        key={option.id}
                        control={form.control}
                        name="needsAssistance"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, option.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.id
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option.label}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="immediateHelp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I need immediate assistance
                    </FormLabel>
                    <FormDescription>
                      Check this if you require urgent support
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
