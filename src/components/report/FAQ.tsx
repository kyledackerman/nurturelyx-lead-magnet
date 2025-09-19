import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "How accurate is your visitor identification?",
    answer: "Our identity resolution technology identifies 15-30% of anonymous website visitors using advanced data matching algorithms. We only provide verified contact information with high confidence scores, ensuring quality leads for your sales team."
  },
  {
    question: "How quickly can I start seeing results?",
    answer: "Implementation takes less than 30 minutes with a simple JavaScript snippet. You'll start seeing identified visitors within 24 hours, and most clients see a measurable increase in qualified leads within the first week."
  },
  {
    question: "Is this GDPR and privacy compliant?",
    answer: "Yes, we're fully compliant with GDPR, CCPA, and other privacy regulations. We don't use cookies or track personal behavior - we only match publicly available business information to help you identify companies visiting your website."
  },
  {
    question: "What's the typical ROI for businesses using NurturelyX?",
    answer: "Most clients see 3-5x ROI within 90 days. By converting previously anonymous visitors into qualified leads, you're essentially creating revenue from traffic that was previously lost forever."
  },
  {
    question: "Does this work with my existing CRM and tools?",
    answer: "Yes, we integrate seamlessly with 50+ CRMs and marketing platforms including Salesforce, HubSpot, Pipedrive, and more. Identified leads are automatically synced to your existing workflow."
  },
  {
    question: "What information do you provide about identified visitors?",
    answer: "We provide company name, contact details (email, phone), job titles, company size, industry, and website activity data. This gives you everything needed for personalized outreach and qualification."
  },
  {
    question: "How is this different from other lead generation tools?",
    answer: "Unlike forms or chatbots that require visitor action, we identify visitors who never filled out a form or engaged. This captures 85-95% of website traffic that traditional methods miss completely."
  },
  {
    question: "What if I have low website traffic?",
    answer: "Even with modest traffic (500+ monthly visitors), you can generate significant additional leads. The key is that we're identifying visitors you're already getting - not requiring you to drive more traffic."
  },
  {
    question: "Is there a long-term contract required?",
    answer: "No, we offer flexible month-to-month plans. Most clients see such strong results that they upgrade rather than cancel, but you're never locked into a long-term commitment."
  },
  {
    question: "What kind of support do you provide?",
    answer: "We provide dedicated onboarding, integration support, and ongoing optimization. Our customer success team helps you maximize lead quality and conversion rates from day one."
  }
];

const FAQ = () => {
  return (
    <Card className="bg-secondary mt-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-accent" />
          <CardTitle>Frequently Asked Questions</CardTitle>
        </div>
        <CardDescription className="text-white">
          Common questions about visitor identification and lead generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-accent/20">
              <AccordionTrigger className="text-white hover:text-accent text-left">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-white/90 text-sm leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default FAQ;