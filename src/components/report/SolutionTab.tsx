
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Lightbulb, Zap, BarChart } from "lucide-react";

interface SolutionTabProps {
  missedLeads: number;
  estimatedSalesLost: number;
  monthlyRevenueLost: number;
  yearlyRevenueLost: number;
}

const SolutionTab = ({
  missedLeads,
  estimatedSalesLost,
  monthlyRevenueLost,
  yearlyRevenueLost
}: SolutionTabProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="mr-2 text-accent" size={20} />
              <span className="text-black">The Problem: Anonymous Traffic</span>
            </h3>
            <p className="text-black mb-4">
              Your website is attracting valuable traffic, but you're missing out on {missedLeads.toLocaleString()} potential leads 
              each month because these visitors leave without identifying themselves.
            </p>
            <ul className="space-y-3 text-black">
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>You're spending money to drive traffic but capturing only a small percentage</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>This results in an estimated {estimatedSalesLost.toLocaleString()} lost sales opportunities monthly</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-red-500">•</span>
                <span>The revenue impact is substantial: {formatCurrency(yearlyRevenueLost)} annually</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-accent/10 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Zap className="mr-2 text-accent" size={20} />
              <span className="text-black">The Solution: NurturelyX</span>
            </h3>
            <p className="text-black mb-4">
              NurturelyX identifies up to 20% of your anonymous visitors, turning them into actionable leads for your sales team to pursue.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="mr-2 text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-black">5-minute implementation with a simple JavaScript snippet</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-black">Works with your existing CRM and marketing tools</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-black">GDPR and CCPA compliant with built-in privacy controls</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="mr-2 text-green-500 mt-0.5 flex-shrink-0" size={16} />
                <span className="text-black">Typical ROI of 5-10x in the first month</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-secondary p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <BarChart className="mr-2 text-accent" size={20} />
              <span className="text-black">The Results: Measurable Impact</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-background p-4 rounded-lg text-center">
                <p className="text-4xl font-bold text-accent">{missedLeads.toLocaleString()}</p>
                <p className="text-sm text-black">New Leads Per Month</p>
              </div>
              <div className="bg-background p-4 rounded-lg text-center">
                <p className="text-4xl font-bold text-accent">{estimatedSalesLost.toLocaleString()}</p>
                <p className="text-sm text-black">Additional Sales Per Month</p>
              </div>
              <div className="bg-background p-4 rounded-lg text-center">
                <p className="text-4xl font-bold text-accent">{formatCurrency(monthlyRevenueLost)}</p>
                <p className="text-sm text-black">Added Revenue Per Month</p>
              </div>
            </div>
            <p className="text-black text-center mt-6">
              Join our limited beta program today to start recovering your lost revenue potential.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SolutionTab;
