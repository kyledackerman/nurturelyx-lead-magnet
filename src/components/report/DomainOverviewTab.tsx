import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import TrafficStatsCards from "./TrafficStatsCards";

interface DomainOverviewTabProps {
  domain: string;
  domainPower: number;
  organicTraffic: number;
  organicKeywords: number;
  paidTraffic: number;
}

const DomainOverviewTab = ({
  domain,
  domainPower,
  organicTraffic,
  organicKeywords,
  paidTraffic,
}: DomainOverviewTabProps) => {
  const totalTraffic = organicTraffic + paidTraffic;
  
  // Prepare enhanced chart data with 3 bars
  const trafficData = [
    {
      name: "Organic",
      value: organicTraffic,
      fill: "#10b981", // green
      label: `${organicTraffic.toLocaleString()}`,
    },
    {
      name: "Paid",
      value: paidTraffic,
      fill: "#9b87f5", // purple
      label: `${paidTraffic.toLocaleString()}`,
    },
    {
      name: "Total",
      value: totalTraffic,
      fill: "#81e6d9", // teal - emphasized
      label: `${totalTraffic.toLocaleString()}`,
    },
  ];

  return (
    <div>
      {/* Traffic Stats Cards - Hero Section */}
      <TrafficStatsCards
        totalTraffic={totalTraffic}
        organicTraffic={organicTraffic}
        paidTraffic={paidTraffic}
      />

      {/* Domain Details Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-medium mb-4">Domain Statistics</h3>
            <dl className="space-y-4">
              <div className="flex flex-row justify-between py-2 border-b border-gray-800">
                <dt className="font-medium text-white">Domain</dt>
                <dd className="text-right text-white">{domain}</dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-gray-800">
                <dt className="font-medium text-white">Domain Authority</dt>
                <dd className="text-right text-white">{domainPower}/100</dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-gray-800">
                <dt className="font-medium text-white">Organic Keywords</dt>
                <dd className="text-right text-white">
                  {organicKeywords.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-gray-800">
                <dt className="font-medium text-white">
                  Monthly Organic Traffic
                </dt>
                <dd className="text-right text-white">
                  {organicTraffic.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-gray-800">
                <dt className="font-medium text-white">Monthly Paid Traffic</dt>
                <dd className="text-right text-white">
                  {paidTraffic.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4 text-foreground">
              Traffic Breakdown
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trafficData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      color: "hsl(var(--foreground))",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                    formatter={(value: number) => [value.toLocaleString(), "Visitors"]}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {trafficData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.fill}
                        fillOpacity={entry.name === "Total" ? 1 : 0.85}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Total monthly traffic: <span className="font-bold text-primary">{totalTraffic.toLocaleString()}</span> visitors.
              {" "}Your traffic sources show{" "}
              {organicTraffic > paidTraffic
                ? "more organic than paid traffic"
                : "more paid than organic traffic"}
              {" "}({Math.round((organicTraffic / totalTraffic) * 100)}% organic). This could indicate{" "}
              {organicTraffic > paidTraffic
                ? "strong SEO performance"
                : "a reliance on paid acquisition"}
              .
            </p>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DomainOverviewTab;
