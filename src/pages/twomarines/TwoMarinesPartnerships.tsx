import { useState } from "react";
import { TwoMarinesLayout } from "@/components/layout/TwoMarinesLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const partnerGroups = [
  {
    title: "For nonprofits",
    bullets: [
      "Verified program outcomes",
      "Shared intake and referral workflows",
      "Audit-ready reporting",
    ],
  },
  {
    title: "For businesses",
    bullets: [
      "Corporate giving alignment",
      "Employee volunteer coordination",
      "Transparent impact summaries",
    ],
  },
  {
    title: "For government and community",
    bullets: [
      "Program compliance tracking",
      "Cross-agency visibility",
      "Clear partner accountability",
    ],
  },
];

const partnerTiers = [
  {
    tier: "Community",
    focus: "Local program delivery",
    onboarding: "Lightweight intake and reporting",
  },
  {
    tier: "Program",
    focus: "Multi-program coordination",
    onboarding: "Joint approvals and shared dashboards",
  },
  {
    tier: "Strategic",
    focus: "Enterprise sponsorship",
    onboarding: "Dedicated governance and impact cadence",
  },
];

export default function TwoMarinesPartnerships() {
  const [submitted, setSubmitted] = useState(false);
  const [formState, setFormState] = useState({
    orgName: "",
    contactName: "",
    email: "",
    phone: "",
    partnershipType: "",
    message: "",
  });

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    console.log("Partnership inquiry:", formState);
  };

  const fieldIds = {
    orgName: "partner-org-name",
    contactName: "partner-contact-name",
    email: "partner-email",
    phone: "partner-phone",
    partnershipType: "partner-type",
    message: "partner-message",
  };

  return (
    <TwoMarinesLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">Partnerships</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          We partner with nonprofits, businesses, and community organizations to
          deliver accountable support for veterans.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {partnerGroups.map((group) => (
            <Card key={group.title}>
              <CardHeader>
                <CardTitle>{group.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {group.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-2xl font-semibold">Partner tiers</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Tier</th>
                  <th className="py-2">Focus</th>
                  <th className="py-2">Onboarding</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                {partnerTiers.map((tier) => (
                  <tr key={tier.tier} className="border-t border-border">
                    <td className="py-3 font-medium text-foreground">{tier.tier}</td>
                    <td className="py-3">{tier.focus}</td>
                    <td className="py-3">{tier.onboarding}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-2xl font-semibold">Partner inquiry</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Share your organization details and we will follow up with next
              steps. This form is client-side only for now.
            </p>
            {submitted ? (
              <p className="mt-4 text-sm font-medium text-primary" aria-live="polite">
                Thanks for reaching out. We will respond shortly.
              </p>
            ) : (
              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-medium" htmlFor={fieldIds.orgName}>
                    Organization name
                  </label>
                  <Input
                    id={fieldIds.orgName}
                    value={formState.orgName}
                    onChange={(event) => handleChange("orgName", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor={fieldIds.contactName}>
                    Contact name
                  </label>
                  <Input
                    id={fieldIds.contactName}
                    value={formState.contactName}
                    onChange={(event) => handleChange("contactName", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor={fieldIds.email}>
                    Email
                  </label>
                  <Input
                    id={fieldIds.email}
                    type="email"
                    value={formState.email}
                    onChange={(event) => handleChange("email", event.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor={fieldIds.phone}>
                    Phone (optional)
                  </label>
                  <Input
                    id={fieldIds.phone}
                    value={formState.phone}
                    onChange={(event) => handleChange("phone", event.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor={fieldIds.partnershipType}>
                    Partnership type
                  </label>
                  <select
                    id={fieldIds.partnershipType}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formState.partnershipType}
                    onChange={(event) => handleChange("partnershipType", event.target.value)}
                    required
                  >
                    <option value="">Select one</option>
                    <option value="nonprofit">Nonprofit</option>
                    <option value="business">Business</option>
                    <option value="government">Government or community</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium" htmlFor={fieldIds.message}>
                    Message
                  </label>
                  <Textarea
                    id={fieldIds.message}
                    value={formState.message}
                    onChange={(event) => handleChange("message", event.target.value)}
                  />
                </div>
                <Button type="submit">Send inquiry</Button>
              </form>
            )}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">What we provide</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Secure intake, approvals, and audit logging</li>
              <li>Partner dashboards and visibility</li>
              <li>Clear onboarding and compliance guidance</li>
              <li>Shared reporting for sponsors and stakeholders</li>
            </ul>
          </div>
        </div>
      </section>
    </TwoMarinesLayout>
  );
}
