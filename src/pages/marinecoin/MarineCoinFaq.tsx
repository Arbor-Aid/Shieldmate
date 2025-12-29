import { MarineCoinLayout } from "@/components/layout/MarineCoinLayout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is MarineCoin a cryptocurrency?",
    answer:
      "No. MarineCoin is a controlled impact credit issued only after verified support actions.",
  },
  {
    question: "Who can issue MarineCoin?",
    answer:
      "Only authorized org admins and super_admins can approve issuance through ShieldMate.",
  },
  {
    question: "How are credits redeemed?",
    answer:
      "Credits are redeemed for approved veteran services and partner programs.",
  },
  {
    question: "Is there a public exchange?",
    answer:
      "No. MarineCoin is not tradable and is never offered as an investment.",
  },
  {
    question: "How is impact verified?",
    answer:
      "Every action is recorded with audit logs and approvals inside ShieldMate.",
  },
  {
    question: "When can we join the pilot?",
    answer:
      "Join the waitlist to be considered for the next pilot cohort.",
  },
];

export default function MarineCoinFaq() {
  return (
    <MarineCoinLayout>
      <section className="container mx-auto py-16">
        <h1 className="text-4xl font-semibold">FAQ</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Answers to common questions about MarineCoin and impact governance.
        </p>
        <div className="mt-8 max-w-3xl">
          <Accordion type="single" collapsible>
            {faqs.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </MarineCoinLayout>
  );
}
