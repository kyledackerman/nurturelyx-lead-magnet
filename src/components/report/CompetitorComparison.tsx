
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportData } from "@/types/report";

interface CompetitorComparisonProps {
  data: ReportData;
}

const CompetitorComparison = ({ data }: CompetitorComparisonProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Calculate estimated monthly costs based on traffic
  const monthlyVisitors = data.monthlyVisitors;
  const tier = monthlyVisitors <= 10000 ? 'starter' : monthlyVisitors <= 50000 ? 'growth' : 'enterprise';
  
  const competitors = [
    {
      name: "NurturelyX",
      identificationRate: "20%",
      installComplexity: "Simple",
      crmIntegration: true,
      monthlyPrice: tier === 'starter' ? 299 : tier === 'growth' ? 599 : 1299,
      highlight: true
    },
    {
      name: "Opensend",
      identificationRate: "15%",
      installComplexity: "Moderate",
      crmIntegration: true,
      monthlyPrice: tier === 'starter' ? 399 : tier === 'growth' ? 799 : 1599,
      highlight: false
    },
    {
      name: "Retention.com",
      identificationRate: "12%",
      installComplexity: "Complex",
      crmIntegration: true,
      monthlyPrice: tier === 'starter' ? 499 : tier === 'growth' ? 999 : 1999,
      highlight: false
    },
    {
      name: "Customers.ai",
      identificationRate: "10%",
      installComplexity: "Moderate",
      crmIntegration: false,
      monthlyPrice: tier === 'starter' ? 249 : tier === 'growth' ? 599 : 1499,
      highlight: false
    },
    {
      name: "ID-Match",
      identificationRate: "8%",
      installComplexity: "Complex",
      crmIntegration: false,
      monthlyPrice: tier === 'starter' ? 199 : tier === 'growth' ? 499 : 1299,
      highlight: false
    }
  ];

  return (
    <Card className="bg-secondary mt-8">
      <CardHeader>
        <CardTitle>Competitor Comparison</CardTitle>
        <CardDescription className="text-white">
          How NurturelyX stacks up against alternatives for websites with {data.monthlyVisitors.toLocaleString()} monthly visitors
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="border-collapse w-full">
          <TableHeader>
            <TableRow className="bg-secondary-foreground/5">
              <TableHead className="text-base font-semibold text-white">Platform</TableHead>
              <TableHead className="text-base font-semibold text-right text-white">ID Rate</TableHead>
              <TableHead className="text-base font-semibold text-center text-white">Setup</TableHead>
              <TableHead className="text-base font-semibold text-center text-white">CRM Integration</TableHead>
              <TableHead className="text-base font-semibold text-right text-white">Monthly Cost</TableHead>
              <TableHead className="text-base font-semibold text-right text-white">Est. Monthly ROI</TableHead>
              <TableHead className="text-base font-semibold text-right text-white">ROI %</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((competitor, index) => {
              // Calculate estimated ROI based on the real data
              const identificationRate = parseFloat(competitor.identificationRate) / 100;
              const identifiedVisitors = Math.round(data.monthlyVisitors * identificationRate);
              const conversionRate = 0.01; // Assuming 1% conversion
              const potentialSales = Math.round(identifiedVisitors * conversionRate);
              const potentialRevenue = potentialSales * data.avgTransactionValue;
              
              // Calculate ROI: Revenue - Cost
              const roi = potentialRevenue - competitor.monthlyPrice;
              const roiPercentage = roi / competitor.monthlyPrice;
              
              return (
                <TableRow 
                  key={index} 
                  className={`${index % 2 === 0 ? "bg-secondary-foreground/5" : ""} ${competitor.highlight ? "border-l-4 border-l-accent" : ""}`}
                >
                  <TableCell className={`font-medium text-base text-white ${competitor.highlight ? "text-accent" : ""}`}>
                    {competitor.name}
                    {competitor.highlight && <span className="text-xs ml-2">(Best)</span>}
                  </TableCell>
                  <TableCell className="text-right text-base font-medium text-white">
                    {competitor.identificationRate}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium text-white">
                    {competitor.installComplexity}
                  </TableCell>
                  <TableCell className="text-center text-base font-medium">
                    {competitor.crmIntegration ? 
                      <Check className="mx-auto h-5 w-5 text-green-500" /> : 
                      <X className="mx-auto h-5 w-5 text-red-500" />}
                  </TableCell>
                  <TableCell className="text-right text-base font-medium text-white">
                    {formatCurrency(competitor.monthlyPrice)}
                  </TableCell>
                  <TableCell className={`text-right text-base font-medium ${roi > 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatCurrency(roi)}
                  </TableCell>
                  <TableCell className={`text-right text-base font-medium ${roiPercentage > 0 ? "text-green-500" : "text-red-500"}`}>
                    {formatPercent(roiPercentage)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="flex justify-between mt-4">
          <div className="text-xs text-white">
            * ROI calculations based on your reported average transaction value of {formatCurrency(data.avgTransactionValue)} and 1% conversion rate.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompetitorComparison;
