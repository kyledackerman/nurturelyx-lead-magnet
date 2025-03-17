
import { HelpCircle, LineChart } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface DomainOverviewTabProps {
  domain: string;
  domainPower: number;
  backlinks: number;
  organicTraffic: number;
  organicKeywords: number;
  paidTraffic?: number;
}

const DomainOverviewTab = ({
  domain,
  domainPower,
  backlinks,
  organicTraffic,
  organicKeywords,
  paidTraffic = 0
}: DomainOverviewTabProps) => {
  // Data for traffic comparison chart
  const trafficData = [
    {
      name: "Traffic Sources",
      Organic: organicTraffic,
      Paid: paidTraffic,
    }
  ];

  const totalTraffic = organicTraffic + paidTraffic;
  const organicPercentage = Math.round((organicTraffic / totalTraffic) * 100) || 0;
  const paidPercentage = Math.round((paidTraffic / totalTraffic) * 100) || 0;

  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle>Domain Performance</CardTitle>
        <CardDescription className="text-gray-400">
          Metrics for {domain}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Domain Power</p>
            <p className="text-2xl font-bold text-accent">{domainPower}/100</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Backlinks</p>
            <p className="text-2xl font-bold text-accent">{backlinks.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="h-80 bg-background rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <LineChart className="h-4 w-4 mr-2 text-accent" />
            Traffic Source Breakdown
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={trafficData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" hide />
              <Tooltip
                formatter={(value: number) => [value.toLocaleString(), ""]}
                labelFormatter={() => "Monthly Visitors"}
              />
              <Legend />
              <Bar dataKey="Organic" fill="#3b82f6" name={`Organic (${organicPercentage}%)`} />
              <Bar dataKey="Paid" fill="#10b981" name={`Paid (${paidPercentage}%)`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Organic Traffic</p>
            <p className="text-2xl font-bold text-accent">{organicTraffic.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Paid Traffic</p>
            <p className="text-2xl font-bold text-accent">{paidTraffic.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Organic Keywords</p>
            <p className="text-2xl font-bold text-accent">{organicKeywords.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="methodology-card mt-6">
          <div className="flex items-center mb-2">
            <HelpCircle size={16} className="mr-2 text-accent" />
            <h3 className="methodology-title">What is Identity Resolution?</h3>
          </div>
          <p className="methodology-text">
            Identity resolution technology identifies anonymous website visitors without requiring them to opt-in. 
            While traditional lead capture methods only convert 2-5% of visitors, NurturelyX can identify up to 20% 
            of your website traffic, dramatically increasing your lead generation potential.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainOverviewTab;
