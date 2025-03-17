
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ReportData } from "@/types/report";
import { 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  TrendingUp, 
  BarChart3, 
  Check, 
  FileText 
} from "lucide-react";

interface LeadReportProps {
  data: ReportData;
  onReset: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const percentFormatter = (value: number): string => {
  return `${value}%`;
};

const LeadReport = ({ data, onReset }: LeadReportProps) => {
  const comparisonData = [
    {
      name: "Traditional",
      rate: 3,
      fill: "#94a3b8"
    },
    {
      name: "NurturelyX",
      rate: 20,
      fill: "#8B5CF6"
    }
  ];
  
  const trafficData = [
    {
      name: "Organic",
      value: data.organicTraffic,
      fill: "#94a3b8"
    },
    {
      name: "Paid",
      value: data.monthlyVisitors,
      fill: "#8B5CF6"
    }
  ];
  
  const domainMetricsData = [
    {
      month: "Jan",
      authority: data.domainAuthority * 0.9,
      power: data.domainPower * 0.85
    },
    {
      month: "Feb",
      authority: data.domainAuthority * 0.92,
      power: data.domainPower * 0.88
    },
    {
      month: "Mar",
      authority: data.domainAuthority * 0.95,
      power: data.domainPower * 0.92
    },
    {
      month: "Apr",
      authority: data.domainAuthority * 0.97,
      power: data.domainPower * 0.96
    },
    {
      month: "May",
      authority: data.domainAuthority,
      power: data.domainPower
    },
    {
      month: "Jun",
      authority: data.domainAuthority * 1.02,
      power: data.domainPower * 1.04
    }
  ];
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
        <Card className="stat-card border-l-4 border-l-brand-purple overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Missed Leads Per Month</p>
              <h3 className="stat-value">{data.missedLeads.toLocaleString()}</h3>
              <p className="mt-2 text-sm text-gray-600">
                Based on a 20% visitor-to-lead conversion rate
              </p>
            </div>
            <div className="bg-brand-purple p-3 rounded-full text-white">
              <Users size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card border-l-4 border-l-brand-purple overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Lost Revenue Per Month</p>
              <h3 className="stat-value">{formatCurrency(data.monthlyRevenueLost)}</h3>
              <p className="mt-2 text-sm text-gray-600">
                {formatCurrency(data.yearlyRevenueLost)} annually
              </p>
            </div>
            <div className="bg-brand-purple p-3 rounded-full text-white">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Information and Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Industry Comparison</TabsTrigger>
          <TabsTrigger value="solution">NurturelyX Solution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Lead Capture Opportunity</CardTitle>
              <CardDescription>
                Your website for {data.domain} is missing significant lead capture opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={comparisonData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={percentFormatter} />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value) => [`${value}%`, 'Conversion Rate']} />
                    <Bar dataKey="rate" name="Conversion Rate" radius={[0, 4, 4, 0]} fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">What is Identity Resolution?</h3>
                <p className="text-gray-700">
                  Identity resolution technology identifies anonymous website visitors without requiring them to opt-in. 
                  While traditional lead capture methods only convert 2-5% of visitors, NurturelyX can identify up to 20% 
                  of your website traffic, dramatically increasing your lead generation potential.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Analysis</CardTitle>
              <CardDescription>Organic vs Paid Traffic for {data.domain}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trafficData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Visitors']} />
                    <Bar dataKey="value" name="Visitors" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Domain Performance</CardTitle>
              <CardDescription>
                Domain Authority: {data.domainAuthority}/100 | 
                Domain Power: {data.domainPower}/100 | 
                Backlinks: {data.backlinks.toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={domainMetricsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="authority" 
                      name="Domain Authority" 
                      stroke="#8B5CF6" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="power" 
                      name="Domain Power" 
                      stroke="#94a3b8" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="solution" className="animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>How NurturelyX Solves Your Lead Gap</CardTitle>
              <CardDescription>
                Turn anonymous traffic into identified leads with our one-line script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-50 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Identify Up to 20% of Anonymous Visitors</h3>
                    <p className="text-gray-600">
                      Our proprietary technology identifies visitors without requiring them to opt-in
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-50 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Simple One-Line Installation</h3>
                    <p className="text-gray-600">
                      Add a single line of JavaScript to your website - no complex setup required
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-50 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Compliant and Ethical</h3>
                    <p className="text-gray-600">
                      Our solution is fully compliant with privacy regulations including GDPR and CCPA
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-green-50 p-2 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Seamless CRM Integration</h3>
                    <p className="text-gray-600">
                      Automatically push identified leads to your existing CRM or marketing automation platform
                    </p>
                  </div>
                </div>
                
                <div className="p-6 bg-brand-purple bg-opacity-5 rounded-lg mt-6">
                  <h3 className="text-lg font-medium mb-2 text-brand-purple">
                    Stop Losing {formatCurrency(data.monthlyRevenueLost)} Every Month
                  </h3>
                  <p className="text-gray-700">
                    With NurturelyX, you could be converting an additional {data.missedLeads} leads per month,
                    worth approximately {formatCurrency(data.monthlyRevenueLost)} in monthly revenue or {formatCurrency(data.yearlyRevenueLost)} annually.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full gradient-bg" size="lg">
                Apply for a 30-Day Free Trial
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={onReset}>
          Start a New Calculation
        </Button>
      </div>
    </div>
  );
};

export default LeadReport;
