import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MethodologyCardProps {
  domain: string;
  monthlyVisitors: number;
  avgTransactionValue: number;
  conversionRate?: number;
}

const MethodologyCard = ({
  domain,
  monthlyVisitors,
  avgTransactionValue,
  conversionRate = 1,
}: MethodologyCardProps) => {
  return (
    <Card className="bg-secondary methodology-card">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <Info size={16} className="mr-2 text-accent" />
          <CardTitle className="text-lg text-white">Methodology</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm text-white">
          <p>
            <span className="font-medium text-accent">
              Visitor Identification:
            </span>{" "}
            Our technology identifies up to 20% of your anonymous website
            visitors.
          </p>
          <p>
            <span className="font-medium text-accent">
              Lead-to-Sale Conversion:
            </span>{" "}
            Based on a {conversionRate}% conversion rate from identified leads to closed
            sales.
          </p>
          <p>
            <span className="font-medium text-accent">
              Revenue Calculation:
            </span>{" "}
            Lost sales × Your average transaction value (${avgTransactionValue}
            ).
          </p>
          <p className="text-xs opacity-75 mt-2 border-t border-border pt-2 text-white">
            Data is based on your reported monthly visitor volume of{" "}
            {monthlyVisitors.toLocaleString()}
            and organic traffic for {domain}.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MethodologyCard;
