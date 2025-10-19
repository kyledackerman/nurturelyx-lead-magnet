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
  // Coerce all props to numbers for safe rendering
  const organic = Number(organicTraffic || 0);
  const paid = Number(paidTraffic || 0);
  const keywords = Number(organicKeywords || 0);
  const power = Number(domainPower || 0);
  const totalTraffic = organic + paid;
  
  const trafficData = [
    {
      name: "Organic",
      value: organic,
      fill: "#10b981", // green
    },
    {
      name: "Paid",
      value: paid,
      fill: "#9b87f5", // purple
    },
  ];

  return (
    <div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-lg font-medium mb-4">Domain Statistics</h3>
            <dl className="space-y-4">
              <div className="flex flex-row justify-between py-3 border-b-2 border-primary/30 bg-primary/5">
                <dt className="font-bold text-primary text-base">Total Monthly Traffic</dt>
                <dd className="text-right font-bold text-primary text-lg">{totalTraffic.toLocaleString()}</dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-border">
                <dt className="font-medium text-foreground">Domain</dt>
                <dd className="text-right text-foreground">{domain}</dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-border">
                <dt className="font-medium text-foreground">Domain Authority</dt>
                <dd className="text-right text-foreground">{power}/100</dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-border">
                <dt className="font-medium text-foreground">Organic Keywords</dt>
                <dd className="text-right text-foreground">
                  {keywords.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-border">
                <dt className="font-medium text-foreground">
                  Monthly Organic Traffic
                </dt>
                <dd className="text-right text-foreground">
                  {organic.toLocaleString()}
                </dd>
              </div>
              <div className="flex flex-row justify-between py-2 border-b border-border">
                <dt className="font-medium text-foreground">Monthly Paid Traffic</dt>
                <dd className="text-right text-foreground">
                  {paid.toLocaleString()}
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
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Your traffic sources show{" "}
              {organic > paid
                ? "more organic than paid traffic"
                : "more paid than organic traffic"}
              {" "}({totalTraffic > 0 ? Math.round((organic / totalTraffic) * 100) : 0}% organic, {totalTraffic > 0 ? Math.round((paid / totalTraffic) * 100) : 0}% paid). This indicates{" "}
              {organic > paid
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
