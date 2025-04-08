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
      identificationRate: "20%",
      installComplexity: "Simple",
      crmIntegration: true,
      highlight: true,
    },
    {
      name: "Opensend",
      identificationRate: "15%",
      installComplexity: "Moderate",
      crmIntegration: true,
      highlight: false,
    },
    {
      name: "Retention.com",
      identificationRate: "12%",
      installComplexity: "Complex",
      crmIntegration: true,
      highlight: false,
    },
    {
      name: "Customers.ai",
      identificationRate: "10%",
      installComplexity: "Moderate",
      crmIntegration: false,
      highlight: false,
    },
    {
      name: "ID-Match",
      identificationRate: "8%",
      installComplexity: "Complex",
      crmIntegration: false,
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
              <TableHead className="text-base font-semibold text-right text-white">
                ID Rate
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                Setup
              </TableHead>
              <TableHead className="text-base font-semibold text-center text-white">
                CRM Integration
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
                      <span className="text-xs ml-2">(Best)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-base font-medium text-white">
                    {competitor.identificationRate}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-white">
                    {competitor.installComplexity}
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
