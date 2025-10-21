import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReportData } from "@/types/report";

interface CompetitorComparisonProps {
  data: ReportData;
}

const CompetitorComparison = ({ data }: CompetitorComparisonProps) => {
  // Get the actual monthly visitors from data
  const monthlyVisitors = data.monthlyVisitors;

  const competitors = [
    {
      name: "NurturelyX",
      type: "Identity Resolution",
      identificationRate: "35%",
      contactInfo: true,
      installComplexity: "Simple",
      crmIntegration: true,
      startingPrice: "$100/mo + $1/lead",
      highlight: true,
    },
    {
      name: "OpenSend",
      type: "Identity Resolution",
      identificationRate: "25%",
      contactInfo: true,
      installComplexity: "Moderate",
      crmIntegration: true,
      startingPrice: "$149/mo",
      highlight: false,
    },
    {
      name: "Retention.com",
      type: "Email Recovery",
      identificationRate: "18%",
      contactInfo: true,
      installComplexity: "Moderate",
      crmIntegration: true,
      startingPrice: "$299/mo",
      highlight: false,
    },
    {
      name: "Leadfeeder",
      type: "IP-Based",
      identificationRate: "20%",
      contactInfo: false,
      installComplexity: "Simple",
      crmIntegration: true,
      startingPrice: "$199/mo",
      highlight: false,
    },
    {
      name: "Clearbit Reveal",
      type: "IP-Based",
      identificationRate: "25%",
      contactInfo: false,
      installComplexity: "Complex",
      crmIntegration: true,
      startingPrice: "$999/mo",
      highlight: false,
    },
    {
      name: "Koala",
      type: "ABM Platform",
      identificationRate: "22%",
      contactInfo: false,
      installComplexity: "Moderate",
      crmIntegration: true,
      startingPrice: "$500/mo",
      highlight: false,
    },
    {
      name: "Warmly",
      type: "Engagement Tool",
      identificationRate: "18%",
      contactInfo: false,
      installComplexity: "Moderate",
      crmIntegration: false,
      startingPrice: "$700/mo",
      highlight: false,
    },
    {
      name: "6sense",
      type: "Enterprise ABM",
      identificationRate: "30%",
      contactInfo: false,
      installComplexity: "Complex",
      crmIntegration: true,
      startingPrice: "Custom",
      highlight: false,
    },
    {
      name: "Demandbase",
      type: "Enterprise ABM",
      identificationRate: "28%",
      contactInfo: false,
      installComplexity: "Complex",
      crmIntegration: true,
      startingPrice: "Custom",
      highlight: false,
    },
    {
      name: "RB2B",
      type: "LinkedIn-Based",
      identificationRate: "15%",
      contactInfo: false,
      installComplexity: "Simple",
      crmIntegration: false,
      startingPrice: "$99/mo",
      highlight: false,
    },
    {
      name: "Albacross",
      type: "IP-Based",
      identificationRate: "22%",
      contactInfo: false,
      installComplexity: "Moderate",
      crmIntegration: true,
      startingPrice: "$215/mo",
      highlight: false,
    },
    {
      name: "Customers.ai",
      type: "Email Recovery",
      identificationRate: "12%",
      contactInfo: true,
      installComplexity: "Simple",
      crmIntegration: false,
      startingPrice: "$197/mo",
      highlight: false,
    },
  ];

  return (
    <Card className="bg-secondary mt-8">
      <CardHeader>
        <CardTitle>Competitor Comparison</CardTitle>
        <CardDescription className="text-white">
          How NurturelyX stacks up against alternatives for websites with{" "}
          {monthlyVisitors.toLocaleString()} monthly visitors
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-secondary-foreground/5">
              <TableHead className="text-base font-semibold text-white">
                Platform
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                Type
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                ID Rate
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                Contact Info?
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                Price
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                CRM
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((competitor, index) => {
              return (
                <TableRow
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-secondary-foreground/5" : ""
                  } ${
                    competitor.highlight ? "border-l-4 border-l-accent" : ""
                  }`}
                >
                  <TableCell
                    className={`font-medium text-base text-white ${
                      competitor.highlight ? "text-accent" : ""
                    }`}
                  >
                    {competitor.name}
                    {competitor.highlight && (
                      <span className="text-xs ml-2 text-green-400">(Best Value)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-sm text-white/80">
                    {competitor.type}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-white">
                    {competitor.identificationRate}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium">
                    {competitor.contactInfo ? (
                      <Check className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-white">
                    {competitor.startingPrice}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium">
                    {competitor.crmIntegration ? (
                      <Check className="mx-auto h-5 w-5 text-green-500" />
                    ) : (
                      <X className="mx-auto h-5 w-5 text-red-500" />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <div className="text-xs text-white">
            * Data based on public information and competitive analysis.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorComparison;
