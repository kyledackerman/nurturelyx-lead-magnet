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

const getFaqItems = (data: ReportData): Array<{ question: string; answer: string | React.ReactNode }> => [
  {
    question: "How accurate is your visitor identification?",
    answer: "Our identity resolution technology identifies 15-30% of anonymous website visitors using advanced data matching algorithms. We only provide verified contact information with high confidence scores, ensuring quality leads for your sales team."
  },
  {
    question: "How quickly can I start seeing results?",
    answer: "Implementation takes less than 30 minutes with a simple JavaScript snippet. You'll start seeing identified visitors within 24 hours, and most clients see a measurable increase in qualified leads within the first week."
  },
  {
    question: "Is this my data? Do I own these leads?",
    answer: (
      <div className="space-y-3">
        <p className="font-semibold">Yes. This is 100% YOUR first-party data.</p>
        
        <p>
          When someone visits YOUR website, that's YOUR business interaction. 
          Under data privacy law (GDPR Article 6(1)(f) - legitimate interest), 
          you have the legal right to identify who's engaging with your business.
        </p>
        
        <p>
          We're not selling you leads from a database. We're revealing the identities 
          of people who ALREADY visited YOUR website. Your site, your visitors, your data.
        </p>
        
        <p>
          Think of it like security camera footage—you have the right to know 
          who walked into your (digital) storefront. These leads belong to you, 
          not us. We just provide the technology to unlock the identities.
        </p>
      </div>
    )
  },
  {
    question: "Is this GDPR and privacy compliant?",
    answer: (
      <div className="space-y-4">
        <p className="font-semibold text-base mb-3">
          ✅ 100% Compliant. This Is YOUR First-Party Data.
        </p>
        
        <p className="font-semibold">
          You Own This Data—It's From YOUR Website
        </p>
        <p>
          When someone visits your website, that's YOUR first-party data under 
          GDPR Article 6(1)(f) legitimate interest principles. You have the legal 
          right to identify business visitors engaging with your services.
        </p>
        
        <p className="font-semibold">How It Works</p>
        <p>
          Our identity resolution technology matches your website visitor data 
          with verified business contact databases. We reveal WHO visited 
          your site—but the visitor interaction itself is YOUR data, 
          collected on YOUR domain.
        </p>
        
        <p className="font-semibold">Your Rights, Your Data</p>
        <p>
          Unlike third-party lead generation (where companies sell you cold leads), 
          this is first-party identification. These people visited YOUR website. 
          We simply help you see who they are. You own this data completely.
        </p>
        
        <p className="font-semibold">Privacy Protections</p>
        <p>
          Fully compliant with GDPR, CCPA, and all major data privacy regulations. 
          We never sell, share, or use your visitor data for advertising or remarketing. 
          This data belongs to you and stays with you.
        </p>
        
        <p className="mt-4 pt-4 border-t border-white/20 text-sm">
          EU/UK visitors: Request access, correction, or deletion at 
          privacy@nurturely.io
        </p>
      </div>
    )
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