import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
  // Prepare chart data
  const trafficData = [
    {
      name: "Organic Traffic",
      value: organicTraffic,
      fill: "#81e6d9", // teal color
    },
    {
      name: "Paid Traffic",
      value: paidTraffic,
      fill: "#9b87f5", // purple-light color
    },
  ];

  return (
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
            <h3 className="text-lg font-medium mb-4 text-white">
              Traffic Breakdown
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trafficData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#ffffff", fontSize: 12 }}
                    tickLine={{ stroke: "#333" }}
                    axisLine={{ stroke: "#333" }}
                  />
                  <YAxis
                    tick={{ fill: "#ffffff", fontSize: 12 }}
                    tickLine={{ stroke: "#333" }}
                    axisLine={{ stroke: "#333" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#222",
                      borderColor: "#444",
                      color: "#ffffff",
                    }}
                    labelStyle={{ color: "#ffffff", fontWeight: "bold" }}
                  />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-white mt-4">
              Your traffic sources show{" "}
              {organicTraffic > paidTraffic
                ? "more organic than paid traffic"
                : "more paid than organic traffic"}
              . This could indicate{" "}
              {organicTraffic > paidTraffic
                ? "strong SEO performance"
                : "a reliance on paid acquisition"}
              .
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainOverviewTab;
