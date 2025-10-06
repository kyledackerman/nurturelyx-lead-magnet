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
import { ReportData } from "@/types/report";
import { formatCurrency } from "@/lib/utils";

const getFaqItems = (data: ReportData) => [
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
    answer: "✅ Our Commitment to Privacy and Compliance\n\nNurturelyX is fully compliant with GDPR, CCPA, and all major data privacy regulations. We do not use cookies, pixel tracking, or behavioral profiling of visitors.\n\nOur system works exclusively with first-party website data (data that your own website legitimately collects) and publicly available business information to identify which companies are visiting your site — nothing more.\n\nWe never sell, share, or store consumer data for advertising or remarketing purposes. All data processing follows legitimate interest principles under Article 6(1)(f) of the GDPR, and all resolved identities come from lawful, consent-based, and opt-in sources in the business context (e.g., company email domains or professional contact data).\n\nEvery customer of NurturelyX receives a Data Processing Agreement (DPA) detailing: how data is matched and stored, retention periods, rights of access and erasure, and contact details for our Data Protection Officer.\n\nIf you're an EU or UK visitor, you may request access, correction, or deletion of any personal data associated with you at any time by contacting our DPO at privacy@nurturely.io."
  },
  {
    question: "What's the typical ROI for businesses using NurturelyX?",
    answer: `Based on your specific data, you're currently losing $${formatCurrency(data.yearlyRevenueLost)} annually from unidentified visitors. With NurturelyX, you could recover a significant portion of this lost revenue. Most clients see 3-5x ROI within 90 days, meaning for every dollar invested, you could see $3-5 in return. With your average transaction value of $${formatCurrency(data.avgTransactionValue)}, converting just a few additional leads per month creates substantial value.`
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
    answer: "Unlike forms or chatbots that require visitor action, we identify visitors who never filled out a form or engaged. This captures 20-35% of website traffic that traditional methods miss completely - visitors who browse your site but never take action."
  },
  {
    question: "What if I have low website traffic?",
    answer: "Even with modest traffic (500+ monthly visitors), you can generate significant additional leads. The key is that we're identifying visitors you're already getting - not requiring you to drive more traffic. To grow your traffic, consider partnering with a local SEO team to build authority in your market area. You can also create valuable social media content and helpful blog articles that draw visitors to your website to learn, giving you more opportunities for identification and outreach."
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

interface FAQProps {
  data: ReportData;
}

const FAQ = ({ data }: FAQProps) => {
  const faqItems = getFaqItems(data);
  
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