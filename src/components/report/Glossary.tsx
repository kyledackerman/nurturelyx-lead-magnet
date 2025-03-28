
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const glossaryItems = [
  {
    term: "Identity Resolution",
    definition: "The process of connecting fragmented user identifiers across devices and channels to create a unified profile of an individual for marketing purposes."
  },
  {
    term: "Missed Leads",
    definition: "Website visitors who show interest but leave without providing their contact information. NurturelyX identifies these visitors automatically."
  },
  {
    term: "Lost Sales",
    definition: "The estimated number of transactions that never occurred due to inability to follow up with anonymous visitors who left your site."
  },
  {
    term: "Revenue Lost",
    definition: "The calculated potential revenue from missed leads and lost sales based on your average transaction value."
  },
  {
    term: "Lead Identification Rate",
    definition: "The percentage of anonymous website visitors that can be successfully identified. Industry average is 2-5%, while NurturelyX achieves up to 20%."
  },
  {
    term: "Cookie-Less Tracking",
    definition: "Method of tracking website visitors that doesn't rely on browser cookies, allowing for more reliable visitor identification even with privacy blockers."
  },
  {
    term: "GDPR/CCPA Compliance",
    definition: "Adherence to privacy regulations including the General Data Protection Regulation (EU) and California Consumer Privacy Act (US)."
  }
];

const Glossary = () => {
  return (
    <Card className="bg-secondary mt-8">
      <CardHeader className="flex flex-row items-center gap-2">
        <HelpCircle className="h-5 w-5 text-accent" />
        <div>
          <CardTitle className="text-white">Glossary of Terms</CardTitle>
          <CardDescription className="text-white">
            Understanding the terminology used in this report
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {glossaryItems.map((item, index) => (
            <div key={index} className="border-b border-gray-700 pb-3 last:border-0">
              <h3 className="font-medium text-accent">{item.term}</h3>
              <p className="text-sm text-white mt-1">{item.definition}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Glossary;
