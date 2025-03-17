import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportData } from "@/types/report";
import { 
  ArrowUpRight, 
  DollarSign, 
  Users, 
  ShoppingCart,
  HelpCircle,
  Info
} from "lucide-react";
import MonthlyRevenueTable from "./MonthlyRevenueTable";

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

const LeadReport = ({ data, onReset }: LeadReportProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <Card className="stat-card border-l-4 border-l-accent overflow-hidden bg-secondary">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Missed Leads Per Month</p>
              <h3 className="stat-value">{data.missedLeads.toLocaleString()}</h3>
              <p className="mt-2 text-sm text-gray-400">
                Based on a 20% visitor identification rate
              </p>
            </div>
            <div className="bg-accent p-3 rounded-full text-accent-foreground">
              <Users size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card border-l-4 border-l-accent overflow-hidden bg-secondary">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Estimated Lost Sales</p>
              <h3 className="stat-value">{data.estimatedSalesLost.toLocaleString()}</h3>
              <p className="mt-2 text-sm text-gray-400">
                Based on a 1% lead-to-sale conversion rate
              </p>
            </div>
            <div className="bg-accent p-3 rounded-full text-accent-foreground">
              <ShoppingCart size={24} />
            </div>
          </div>
        </Card>
        
        <Card className="stat-card border-l-4 border-l-accent overflow-hidden bg-secondary">
          <div className="flex justify-between items-start">
            <div>
              <p className="stat-label">Lost Revenue Per Month</p>
              <h3 className="stat-value">{formatCurrency(data.monthlyRevenueLost)}</h3>
              <p className="mt-2 text-sm text-gray-400">
                {formatCurrency(data.yearlyRevenueLost)} annually
              </p>
            </div>
            <div className="bg-accent p-3 rounded-full text-accent-foreground">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
      </div>
      
      {/* Methodology */}
      <Card className="bg-secondary methodology-card">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <Info size={16} className="mr-2 text-accent" />
            <CardTitle className="text-lg">Methodology</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-400">
            <p>
              <span className="font-medium text-accent">Visitor Identification:</span> Our technology identifies up to 20% of your anonymous website visitors.
            </p>
            <p>
              <span className="font-medium text-accent">Lead-to-Sale Conversion:</span> We estimate a 1% conversion rate from identified leads to closed sales.
            </p>
            <p>
              <span className="font-medium text-accent">Revenue Calculation:</span> Lost sales × Your average transaction value (${data.avgTransactionValue}).
            </p>
            <p className="text-xs opacity-75 mt-2 border-t border-border pt-2">
              Data is based on your reported monthly visitor volume of {data.monthlyVisitors.toLocaleString()} 
              and organic traffic for {data.domain}.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly revenue data table */}
      <Card className="bg-secondary animate-fade-in">
        <CardHeader>
          <CardTitle>Monthly Opportunity Breakdown</CardTitle>
          <CardDescription className="text-gray-400">
            Historical data for {data.domain} over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyRevenueTable data={data.monthlyRevenueData} />
        </CardContent>
      </Card>
      
      {/* Information and Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Domain Overview</TabsTrigger>
          <TabsTrigger value="solution">NurturelyX Solution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="animate-fade-in">
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle>Domain Performance</CardTitle>
              <CardDescription className="text-gray-400">
                Metrics for {data.domain}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Domain Power</p>
                  <p className="text-2xl font-bold text-accent">{data.domainPower}/100</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Backlinks</p>
                  <p className="text-2xl font-bold text-accent">{data.backlinks.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Organic Traffic</p>
                  <p className="text-2xl font-bold text-accent">{data.organicTraffic.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-background rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Organic Keywords</p>
                  <p className="text-2xl font-bold text-accent">{data.organicKeywords.toLocaleString()}</p>
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
        </TabsContent>
        
        <TabsContent value="solution" className="animate-fade-in">
          <Card className="bg-secondary">
            <CardHeader>
              <CardTitle>How NurturelyX Solves Your Lead Gap</CardTitle>
              <CardDescription className="text-gray-400">
                Turn anonymous traffic into identified leads with our one-line script
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Identify Up to 20% of Anonymous Visitors</h3>
                    <p className="text-gray-400">
                      Our proprietary technology identifies visitors without requiring them to opt-in
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Simple One-Line Installation</h3>
                    <p className="text-gray-400">
                      Add a single line of JavaScript to your website - no complex setup required
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Compliant and Ethical</h3>
                    <p className="text-gray-400">
                      Our solution is fully compliant with privacy regulations including GDPR and CCPA
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-accent/10 p-2 rounded-full">
                    <Check className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Seamless CRM Integration</h3>
                    <p className="text-gray-400">
                      Automatically push identified leads to your existing CRM or marketing automation platform
                    </p>
                  </div>
                </div>
                
                <div className="methodology-card mt-6">
                  <h3 className="methodology-title text-accent">
                    Stop Losing {formatCurrency(data.monthlyRevenueLost)} Every Month
                  </h3>
                  <p className="methodology-text">
                    With NurturelyX, you could be converting an additional {data.missedLeads.toLocaleString()} leads per month,
                    potentially resulting in {data.estimatedSalesLost.toLocaleString()} sales worth approximately {formatCurrency(data.monthlyRevenueLost)} 
                    in monthly revenue or {formatCurrency(data.yearlyRevenueLost)} annually.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button className="w-full gradient-bg text-accent-foreground" size="lg">
                Apply for Beta
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-center mt-8">
        <Button variant="outline" onClick={onReset} className="border-accent text-accent hover:text-accent">
          Start a New Calculation
        </Button>
      </div>
    </div>
  );
};

export default LeadReport;

