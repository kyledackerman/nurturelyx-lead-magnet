import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BookOpen, TrendingUp, Users, Database, Shield, Zap, Target, BarChart3, Settings } from "lucide-react";

const AdminManual = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard Manual</h1>
            <p className="text-muted-foreground">Comprehensive guide to managing your lead generation platform</p>
          </div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This manual covers all aspects of the admin dashboard. Use the sections below to navigate to specific topics.
          </AlertDescription>
        </Alert>
      </div>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start Guide for Sales
          </CardTitle>
          <CardDescription>Master this tool in minutes to demonstrate value to prospects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">Step 1</Badge>
                Understand the Dashboard Metrics
              </h4>
              <p className="text-sm text-muted-foreground pl-16">
                Review the Overview tab to understand key metrics: total reports generated, unique domains analyzed, and high-value prospects identified. These numbers help you understand the scale of opportunity in your pipeline.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">Step 2</Badge>
                Generate Your First Report
              </h4>
              <p className="text-sm text-muted-foreground pl-16">
                Navigate to the Report Generation tab and enter a prospect's domain name. Add their traffic and conversion data to calculate missed lead opportunities and show the revenue they're leaving on the table.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">Step 3</Badge>
                Present the Value Story
              </h4>
              <p className="text-sm text-muted-foreground pl-16">
                Use the generated report to demonstrate concrete, quantified value to your prospect. Focus on the "missed revenue" numbers and how visitor identification can recover those lost opportunities.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Badge variant="outline">Step 4</Badge>
                Share & Follow Up in CRM
              </h4>
              <p className="text-sm text-muted-foreground pl-16">
                Share the report publicly with your prospect, add them to the CRM for follow-up tracking, and monitor their status through your sales pipeline using the CRM and Leaderboard tabs.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Accordion */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* System Overview */}
        <AccordionItem value="system-overview" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              System Overview & Purpose
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">What This Platform Does</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This lead generation platform helps businesses identify and quantify their invisible revenue leakage from unidentified website visitors. 
                  On average, only 2-5% of B2B website visitors fill out a form or contact sales. The remaining 95-98% leave without identifying themselves, 
                  representing significant lost revenue opportunities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">How Visitor Identification Works</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Modern visitor identification technology uses multiple data signals to determine which companies are visiting a website:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li><strong>IP Address Resolution:</strong> Corporate IP addresses are mapped to company databases</li>
                  <li><strong>Reverse DNS Lookups:</strong> Technical data reveals company network information</li>
                  <li><strong>Firmographic Enrichment:</strong> Company size, industry, revenue data is appended</li>
                  <li><strong>Intent Signals:</strong> Pages viewed and time spent indicate buying interest</li>
                  <li><strong>Contact Discovery:</strong> Decision-maker contact information is provided</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Business Value Proposition</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  When pitching to prospects, emphasize these key benefits:
                </p>
                <div className="grid gap-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Revenue Recovery</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Convert 95% of invisible traffic into actionable sales opportunities. Even a 1% conversion improvement can mean hundreds of thousands in new revenue.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Sales Intelligence</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Know exactly which companies are researching your solutions, what they're interested in, and when to reach out with perfect timing.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Marketing ROI Amplification</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Maximize the return on every dollar spent on SEO, PPC, content marketing, and advertising by capturing leads you're already paying to attract.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Key Insight:</strong> Most businesses are already investing heavily in driving traffic. 
                  Visitor identification is about maximizing the value of that existing investment, not replacing it.
                </AlertDescription>
              </Alert>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Dashboard Navigation */}
        <AccordionItem value="navigation" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Dashboard Navigation & Analytics
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Understanding the Statistics Cards</h3>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Total Reports Generated</h4>
                    <p className="text-sm text-muted-foreground">
                      Shows the total number of domain reports created across all time. This includes both admin-generated and customer-submitted reports.
                      Use this metric to track platform adoption and usage patterns.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Unique Domains Analyzed</h4>
                    <p className="text-sm text-muted-foreground">
                      Count of distinct domains in the database. Multiple reports may exist for the same domain (re-analysis, updated data).
                      This helps identify which prospects are most engaged or have multiple touchpoints.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Admin-Generated Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Reports created by admin users for prospecting purposes. These typically represent outbound sales efforts and proactive lead generation.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Customer-Generated Reports</h4>
                    <p className="text-sm text-muted-foreground">
                      Reports created by prospects who visited your public landing page and submitted their domain. These are high-intent inbound leads.
                      Prioritize following up with these prospects as they've already expressed interest.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Analytics Charts Interpretation</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Report Generation Trends Chart</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      This chart visualizes report creation patterns over time with three key metrics:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li><strong className="text-blue-500">Total Reports (Blue):</strong> Overall daily/weekly/monthly report volume</li>
                      <li><strong className="text-green-500">Admin Reports (Green):</strong> Proactive prospecting activity by your team</li>
                      <li><strong className="text-purple-500">Customer Reports (Purple):</strong> Inbound interest from potential customers</li>
                    </ul>
                    <Alert className="mt-3">
                      <AlertDescription className="text-sm">
                        <strong>Pro Tip:</strong> Spikes in customer-generated reports often indicate successful marketing campaigns or viral content. 
                        Cross-reference these dates with your marketing calendar to identify what's working.
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Revenue Loss Analysis Chart</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      This chart shows the aggregate potential revenue loss calculated across all reports over time. Key insights:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground ml-4">
                      <li>Higher revenue loss indicates larger enterprise prospects or high-traffic domains</li>
                      <li>Use this to identify the most lucrative time periods for prospecting</li>
                      <li>Compare revenue loss trends with actual closed deals to validate your models</li>
                      <li>Share these charts in team meetings to visualize pipeline opportunity</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Time Period Filtering</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Use the time period toggle (Day/Week/Month/All Time) to adjust the analytics view:
                </p>
                <div className="grid gap-2 text-sm">
                  <div className="flex gap-2">
                    <Badge>Day</Badge>
                    <span className="text-muted-foreground">Monitor daily activity, spot immediate trends, manage daily workload</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge>Week</Badge>
                    <span className="text-muted-foreground">Track weekly performance, identify patterns, plan weekly prospecting targets</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge>Month</Badge>
                    <span className="text-muted-foreground">Evaluate monthly goals, analyze seasonal trends, report to leadership</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge>All Time</Badge>
                    <span className="text-muted-foreground">View overall growth, historical trends, platform adoption metrics</span>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Report Generation */}
        <AccordionItem value="report-generation" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Report Generation Guide
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Step-by-Step Report Creation</h3>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">1. Domain Entry</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>Enter the target company's domain name (e.g., "example.com" or "www.example.com").</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>System automatically cleans and validates domain format</li>
                        <li>Accepts with or without "www" prefix</li>
                        <li>Removes http://, https://, and trailing slashes automatically</li>
                      </ul>
                      <Alert className="mt-2">
                        <AlertDescription className="text-xs">
                          <strong>Best Practice:</strong> Use the root domain (example.com) rather than subdomains for more accurate traffic data.
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">2. Average Transaction Value (ATV)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>Input the typical deal size or average revenue per customer.</p>
                      <div className="bg-muted/50 p-3 rounded-md space-y-2 mt-2">
                        <p className="font-semibold text-foreground">How to Estimate ATV:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li><strong>For SaaS:</strong> Annual contract value (ACV) of typical customer</li>
                          <li><strong>For E-commerce:</strong> Average order value from analytics</li>
                          <li><strong>For Services:</strong> Average project size or monthly retainer × 12</li>
                          <li><strong>For Unknown:</strong> Research similar companies or industry benchmarks</li>
                        </ul>
                        <p className="text-xs mt-2">
                          <strong>Pro Tip:</strong> When in doubt, err slightly higher. Decision-makers respond better to larger opportunity numbers.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">3. Estimated Close Rate</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>Percentage of identified leads that convert to customers (Default: 2%).</p>
                      <div className="bg-muted/50 p-3 rounded-md space-y-2 mt-2">
                        <p className="font-semibold text-foreground">Industry Benchmarks:</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li><strong>B2B SaaS:</strong> 2-5% (varies by sales cycle length)</li>
                          <li><strong>Enterprise Software:</strong> 1-3% (longer sales cycles)</li>
                          <li><strong>Professional Services:</strong> 3-8% (higher with warm leads)</li>
                          <li><strong>E-commerce B2B:</strong> 5-10% (shorter sales cycles)</li>
                        </ul>
                        <p className="text-xs mt-2">
                          <strong>Note:</strong> Conservative estimates (1-2%) are more credible with skeptical prospects.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">4. Traffic Data Sources</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                      <Tabs defaultValue="spyfu" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="spyfu">SpyFu API</TabsTrigger>
                          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="spyfu" className="space-y-2">
                          <p className="font-semibold text-foreground">Automated Data Fetching</p>
                          <p>When SpyFu API is configured, the system automatically retrieves:</p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Monthly organic search traffic</li>
                            <li>Organic keyword rankings (total keywords)</li>
                            <li>Paid search traffic estimates</li>
                            <li>Domain authority/power scores</li>
                          </ul>
                          <Alert className="mt-2">
                            <AlertDescription className="text-xs">
                              <strong>Setup Required:</strong> Enter your SpyFu API key in the SpyFu Configuration section below the form.
                              API keys are available from your SpyFu account dashboard.
                            </AlertDescription>
                          </Alert>
                        </TabsContent>
                        
                        <TabsContent value="manual" className="space-y-2">
                          <p className="font-semibold text-foreground">Manual Traffic Input</p>
                          <p>If SpyFu API is unavailable, you can manually enter traffic data:</p>
                          <ul className="list-disc list-inside ml-4 space-y-1 mb-3">
                            <li><strong>Organic Traffic:</strong> From SEMrush, Ahrefs, or SimilarWeb</li>
                            <li><strong>Paid Traffic:</strong> Google Ads estimates or competitive intelligence tools</li>
                            <li><strong>Total Traffic:</strong> Can be estimated from multiple sources</li>
                          </ul>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="font-semibold text-foreground text-xs mb-1">Alternative Data Sources:</p>
                            <ul className="list-disc list-inside ml-4 space-y-1 text-xs">
                              <li>SEMrush Traffic Analytics</li>
                              <li>Ahrefs Site Explorer</li>
                              <li>SimilarWeb (free tier available)</li>
                              <li>Cloudflare Radar (for some domains)</li>
                            </ul>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Understanding the Calculations</h3>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div>
                    <p className="font-semibold mb-1">Missed Leads Per Month</p>
                    <code className="text-xs bg-background px-2 py-1 rounded">Monthly Traffic × 98% (unidentified visitors)</code>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Estimated Sales Lost Per Month</p>
                    <code className="text-xs bg-background px-2 py-1 rounded">Missed Leads × Close Rate</code>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Monthly Revenue Lost</p>
                    <code className="text-xs bg-background px-2 py-1 rounded">Sales Lost × Average Transaction Value</code>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Yearly Revenue Lost</p>
                    <code className="text-xs bg-background px-2 py-1 rounded">Monthly Revenue Lost × 12</code>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Prospecting Best Practices</h3>
                <div className="grid gap-3">
                  <Alert>
                    <AlertDescription>
                      <strong>Target High-Value Domains:</strong> Focus on domains with 10,000+ monthly visitors and enterprise-level 
                      average transaction values ($5,000+) for the most compelling opportunities.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription>
                      <strong>Research Before Generating:</strong> Spend 2-3 minutes researching each domain. Check their LinkedIn, 
                      recent news, and tech stack to personalize your outreach.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription>
                      <strong>Batch Processing:</strong> Generate 10-20 reports per session for similar industries or company sizes. 
                      This allows you to create industry-specific messaging templates.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* CRM & Prospect Management */}
        <AccordionItem value="crm" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              CRM & Prospect Management
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Understanding the CRM Tab</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CRM tab provides a complete view of all generated reports with advanced filtering, assignment, and follow-up tracking capabilities.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Lead Qualification Framework</h3>
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="destructive">HOT</Badge>
                        High-Priority Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Customer-generated reports (inbound interest)</li>
                        <li>Monthly revenue loss &gt; $50,000</li>
                        <li>Traffic &gt; 50,000 monthly visitors</li>
                        <li>Enterprise companies (Fortune 1000, high employee count)</li>
                        <li>Recent report creation (within 7 days)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className="bg-orange-500">WARM</Badge>
                        Medium-Priority Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Monthly revenue loss $10,000 - $50,000</li>
                        <li>Traffic 10,000 - 50,000 monthly visitors</li>
                        <li>Mid-market companies</li>
                        <li>Growing domains (increasing traffic trends)</li>
                        <li>Tech-savvy industries (SaaS, Tech, Digital Marketing)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="secondary">COLD</Badge>
                        Lower-Priority Leads
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Monthly revenue loss &lt; $10,000</li>
                        <li>Traffic &lt; 10,000 monthly visitors</li>
                        <li>Small businesses (unless high ATV)</li>
                        <li>Very long sales cycles (6+ months typical)</li>
                        <li>Industries resistant to new technology adoption</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Assignment & Ownership</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The CRM includes a sophisticated assignment system for team collaboration:
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Auto-Assignment</p>
                    <p className="text-muted-foreground">
                      Reports are automatically assigned to the admin who generates them. This ensures clear ownership and accountability.
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Manual Re-Assignment</p>
                    <p className="text-muted-foreground">
                      Super admins can reassign prospects to other team members using the assignment dropdown. Use this for:
                    </p>
                    <ul className="list-disc list-inside ml-4 text-muted-foreground space-y-1 mt-1">
                      <li>Load balancing across sales team</li>
                      <li>Industry specialization (assign to relevant expert)</li>
                      <li>Geographic territory management</li>
                      <li>Transferring ownership when team members leave</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-1">Ownership Tracking</p>
                    <p className="text-muted-foreground">
                      The system tracks who assigned a prospect, when it was assigned, and maintains a full audit trail of all changes.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Activity Tracking & Follow-Up</h3>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Activity Types</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">Email</Badge>
                        <span className="text-muted-foreground">Track email outreach, open rates, and responses</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">Call</Badge>
                        <span className="text-muted-foreground">Log phone calls, conversations, and outcomes</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">Meeting</Badge>
                        <span className="text-muted-foreground">Schedule and track demos, discovery calls, and meetings</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">LinkedIn</Badge>
                        <span className="text-muted-foreground">Social selling activities and LinkedIn engagement</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="mt-0.5">Note</Badge>
                        <span className="text-muted-foreground">General notes, research findings, and internal communication</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Status Management</h4>
                    <div className="grid gap-2 text-sm">
                      <div>
                        <Badge>New</Badge>
                        <span className="text-muted-foreground ml-2">Freshly generated, not yet contacted</span>
                      </div>
                      <div>
                        <Badge className="bg-blue-500">Contacted</Badge>
                        <span className="text-muted-foreground ml-2">Initial outreach completed, awaiting response</span>
                      </div>
                      <div>
                        <Badge className="bg-yellow-500">Qualified</Badge>
                        <span className="text-muted-foreground ml-2">Prospect has shown interest, moving to sales process</span>
                      </div>
                      <div>
                        <Badge className="bg-green-500">Won</Badge>
                        <span className="text-muted-foreground ml-2">Deal closed, customer acquired</span>
                      </div>
                      <div>
                        <Badge variant="secondary">Lost</Badge>
                        <span className="text-muted-foreground ml-2">Opportunity lost, document reason for future reference</span>
                      </div>
                    </div>
                  </div>

                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Best Practice:</strong> Update activity status within 24 hours of any interaction. Set next follow-up 
                      dates during or immediately after calls/meetings while details are fresh.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Outreach Strategies & Templates</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Initial Email Template (Personalized)</h4>
                    <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                      <p className="font-mono text-xs">
                        Subject: [Company Name] - Are you losing $[Revenue Lost] monthly?
                      </p>
                      <div className="space-y-2 text-muted-foreground">
                        <p>Hi [First Name],</p>
                        <p>
                          I noticed [Company Name] gets about [Monthly Traffic] monthly visitors. That's impressive traffic for [their industry].
                        </p>
                        <p>
                          But here's something that might surprise you: on average, 98% of B2B website visitors leave without identifying themselves. 
                          For [Company Name], that could mean [Missed Leads] potential leads every month just... disappearing.
                        </p>
                        <p>
                          Based on your traffic and typical [industry] conversion rates, you could be missing out on approximately 
                          $[Monthly Revenue Lost] in monthly revenue. That's $[Yearly Revenue Lost] annually.
                        </p>
                        <p>
                          We've helped companies like [Similar Company] recover this invisible pipeline using visitor identification technology. 
                          I'd love to show you exactly which companies are visiting your site and what they're interested in.
                        </p>
                        <p>
                          Would you be open to a quick 15-minute call next week?
                        </p>
                        <p className="mt-4">Best regards,<br/>[Your Name]</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Follow-Up Sequence Timing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <Badge variant="outline">Day 1</Badge>
                        <span className="text-muted-foreground">Initial personalized email</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">Day 3</Badge>
                        <span className="text-muted-foreground">LinkedIn connection request with note</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">Day 5</Badge>
                        <span className="text-muted-foreground">Follow-up email with case study or additional value</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">Day 8</Badge>
                        <span className="text-muted-foreground">Phone call attempt (if number available)</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">Day 12</Badge>
                        <span className="text-muted-foreground">Final email - "break-up" email asking if wrong time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Admin Management */}
        <AccordionItem value="admin-management" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User & Admin Management
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Role Hierarchy & Permissions</h3>
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="destructive">Super Admin</Badge>
                        Full System Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p className="font-semibold">Capabilities:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                        <li>Create, read, update, delete all reports</li>
                        <li>Grant and revoke admin privileges</li>
                        <li>Reassign prospects between team members</li>
                        <li>View all audit logs and system activity</li>
                        <li>Manage system configuration and settings</li>
                        <li>Access all tabs and features</li>
                      </ul>
                      <Alert className="mt-3">
                        <AlertDescription className="text-xs">
                          <strong>Security Note:</strong> Super admin role should be limited to 1-2 trusted individuals (founders, CTO, VP Sales).
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge className="bg-blue-500">Admin</Badge>
                        Standard Admin Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p className="font-semibold">Capabilities:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                        <li>Generate new lead reports</li>
                        <li>View all reports in CRM</li>
                        <li>Manage their assigned prospects</li>
                        <li>Update activity status and notes for owned prospects</li>
                        <li>View leaderboard and analytics</li>
                        <li>Cannot reassign prospects or modify admin roles</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        <strong>Use Case:</strong> Sales team members, BDRs, account executives
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="secondary">User</Badge>
                        Standard User
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <p className="font-semibold">Capabilities:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                        <li>View their own generated reports</li>
                        <li>Access User Dashboard</li>
                        <li>Cannot access admin features or other users' data</li>
                      </ul>
                      <p className="text-muted-foreground mt-2">
                        <strong>Use Case:</strong> Customers who sign up to generate their own reports
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">How to Add New Admins</h3>
                <div className="space-y-3 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold">Step 1: User Registration</p>
                    <p className="text-muted-foreground">
                      New admin users must first create an account through the standard sign-up process. They'll receive email verification.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Step 2: Navigate to Admin Management Tab</p>
                    <p className="text-muted-foreground">
                      As a super admin, go to the Admin Management tab in the admin dashboard.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Step 3: Search for User</p>
                    <p className="text-muted-foreground">
                      Use the search function to find the user by email address. The system will display their user ID and current role.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="font-semibold">Step 4: Grant Admin Access</p>
                    <p className="text-muted-foreground">
                      Click "Grant Admin" to promote the user to admin status. They'll immediately gain access to the admin dashboard.
                    </p>
                  </div>

                  <Alert className="mt-3">
                    <AlertDescription>
                      <strong>Important:</strong> Always verify the email address belongs to a legitimate team member before granting admin access. 
                      Admin privileges cannot be granted to external email domains without explicit approval.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Revoking Admin Access</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    Super admins can revoke admin privileges at any time:
                  </p>
                  <ol className="list-decimal list-inside ml-4 space-y-2 text-muted-foreground">
                    <li>Navigate to Admin Management tab</li>
                    <li>Find the admin in the list</li>
                    <li>Click "Revoke Admin" button</li>
                    <li>Confirm the action</li>
                  </ol>
                  <Alert>
                    <AlertDescription className="text-xs">
                      <strong>Note:</strong> When admin access is revoked, the user retains access to their own generated reports but loses 
                      access to admin features, CRM, and other users' data.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Security Best Practices</h3>
                <div className="grid gap-3">
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Principle of Least Privilege:</strong> Only grant admin access to users who absolutely need it. 
                      Regularly audit your admin list and remove access for former employees.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Password Requirements:</strong> Enforce strong passwords (12+ characters, mixed case, numbers, symbols). 
                      Consider implementing 2FA for super admin accounts.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Activity Monitoring:</strong> Regularly review audit logs to detect unusual activity. 
                      The system tracks all admin actions including report access, modifications, and permission changes.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Offboarding Checklist:</strong> When team members leave, immediately revoke admin access, 
                      reassign their prospects, and review any reports they've accessed in the past 30 days.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Reports Database */}
        <AccordionItem value="reports-database" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Reports Database Management
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Understanding Report Data Structure</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Each report contains comprehensive domain analysis data stored in a structured format:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <div>
                    <span className="font-semibold">Domain:</span>
                    <span className="text-muted-foreground ml-2">Target company website</span>
                  </div>
                  <div>
                    <span className="font-semibold">Domain Power:</span>
                    <span className="text-muted-foreground ml-2">SEO authority score (0-100)</span>
                  </div>
                  <div>
                    <span className="font-semibold">Organic Traffic:</span>
                    <span className="text-muted-foreground ml-2">Monthly search engine visitors</span>
                  </div>
                  <div>
                    <span className="font-semibold">Organic Keywords:</span>
                    <span className="text-muted-foreground ml-2">Total ranking keywords</span>
                  </div>
                  <div>
                    <span className="font-semibold">Paid Traffic:</span>
                    <span className="text-muted-foreground ml-2">Monthly paid advertising visitors</span>
                  </div>
                  <div>
                    <span className="font-semibold">Missed Leads:</span>
                    <span className="text-muted-foreground ml-2">Unidentified visitors (98% of traffic)</span>
                  </div>
                  <div>
                    <span className="font-semibold">Revenue Calculations:</span>
                    <span className="text-muted-foreground ml-2">Monthly and yearly revenue loss estimates</span>
                  </div>
                  <div>
                    <span className="font-semibold">User ID:</span>
                    <span className="text-muted-foreground ml-2">Creator of the report (admin or customer)</span>
                  </div>
                  <div>
                    <span className="font-semibold">Timestamps:</span>
                    <span className="text-muted-foreground ml-2">Creation and last update dates</span>
                  </div>
                  <div>
                    <span className="font-semibold">Public Status:</span>
                    <span className="text-muted-foreground ml-2">Whether report is shareable via public link</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Searching & Filtering Reports</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Search Functionality</p>
                    <p className="text-muted-foreground">
                      The search bar at the top of the Reports tab allows you to filter reports by domain name. 
                      Search is case-insensitive and matches partial domain names.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Advanced Filtering Tips</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-muted-foreground">
                      <li>Search by industry keywords in domain names (e.g., "tech", "law", "medical")</li>
                      <li>Sort by creation date to find newest or oldest reports</li>
                      <li>Filter by user ID to see specific admin's generated reports</li>
                      <li>Look for patterns in successful domains for prospecting insights</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Public vs Private Reports</h3>
                <div className="grid gap-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Public Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>Reports with public sharing enabled can be accessed via a unique URL without authentication.</p>
                      <p className="font-semibold text-foreground mt-2">Use Cases:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Email outreach to prospects (include report link)</li>
                        <li>Sales presentations and demos</li>
                        <li>Marketing content and case studies</li>
                        <li>LinkedIn messages and social selling</li>
                      </ul>
                      <Alert className="mt-2">
                        <AlertDescription className="text-xs">
                          Public URLs use a unique slug format: /report/[domain-slug-timestamp]
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Private Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>Reports marked as private require authentication and are only visible to the creator and admins.</p>
                      <p className="font-semibold text-foreground mt-2">Use Cases:</p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>Internal research and competitive analysis</li>
                        <li>Confidential client data</li>
                        <li>Work-in-progress reports not ready for sharing</li>
                        <li>Sensitive competitive intelligence</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Data Export & Integration</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-muted-foreground">
                    While the system doesn't currently have built-in CSV export, you can integrate report data with external systems:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-2 text-muted-foreground">
                    <li><strong>CRM Integration:</strong> Use Zapier or Make.com to push new reports to Salesforce, HubSpot, or Pipedrive</li>
                    <li><strong>Slack Notifications:</strong> Set up webhooks to notify your team when high-value reports are generated</li>
                    <li><strong>Google Sheets:</strong> Export data for custom analysis and reporting</li>
                    <li><strong>Analytics Platforms:</strong> Track report generation and conversion metrics</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Data Retention & Cleanup</h3>
                <div className="space-y-3">
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Regular Cleanup:</strong> Archive or delete old test reports to keep the database organized. 
                      Consider deleting reports older than 12 months unless they're active opportunities.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Duplicate Detection:</strong> Before generating a new report, search to see if the domain already exists. 
                      Multiple reports for the same domain can indicate strong interest or should be consolidated.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Audit Trail:</strong> All report deletions are logged. Super admins can review deletion history 
                      in the audit logs to ensure data integrity.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Leaderboard */}
        <AccordionItem value="leaderboard" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Leaderboard & Performance Tracking
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Understanding the Leaderboard</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The Leaderboard tab provides competitive insights into which domains represent the highest-value opportunities 
                  based on calculated revenue loss potential.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Composite Score Formula</h3>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <code className="text-sm font-mono block text-center">
                    Composite Score = (Total Revenue Lost ÷ 1,000 × 0.7) + (Total Leads × 0.3)
                  </code>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <p>
                    This formula balances <strong className="text-foreground">revenue impact (70% weight)</strong> with <strong className="text-foreground">lead volume (30% weight)</strong>. 
                    It rewards both finding high-value opportunities and maintaining consistent prospecting activity.
                  </p>
                  <p>
                    <strong className="text-foreground">Why this matters:</strong> A salesperson who identifies one $500K opportunity scores higher than someone who generates 
                    ten $10K opportunities, but consistent lead generation is still rewarded to encourage ongoing activity.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Key Metrics Explained</h3>
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Total Revenue Loss</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>Aggregate estimated yearly revenue loss across all traffic sources. This represents the total market opportunity size.</p>
                      <p className="mt-2 font-semibold text-foreground">Why it matters:</p>
                      <p>Higher values indicate larger enterprises or high-traffic domains worth prioritizing for outreach.</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Traffic Volume</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>Combined organic and paid monthly visitors.</p>
                      <p className="mt-2 font-semibold text-foreground">Why it matters:</p>
                      <p>High traffic indicates strong brand awareness and marketing investment, suggesting a mature company with budget.</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Domain Authority</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <p>SEO strength indicator (0-100 scale).</p>
                      <p className="mt-2 font-semibold text-foreground">Why it matters:</p>
                      <p>Higher domain authority suggests established brands with credibility, making them ideal reference customers if you can close them.</p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Time-Based Analysis</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold mb-1">Daily View</p>
                    <p className="text-muted-foreground">
                      Track today's highest-value reports. Use this to prioritize same-day follow-up calls and strike while interest is hot.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Weekly View</p>
                    <p className="text-muted-foreground">
                      Identify patterns in weekly prospecting activity. Compare to team quotas and adjust outreach intensity accordingly.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">Monthly View</p>
                    <p className="text-muted-foreground">
                      Analyze monthly trends and seasonality. Some industries have stronger Q4 budgets, while others peak in Q1.
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-semibold mb-1">All-Time View</p>
                    <p className="text-muted-foreground">
                      See the biggest opportunities ever generated. These represent "white whale" prospects worth long-term relationship building.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Strategic Use Cases</h3>
                <div className="grid gap-3">
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Team Competitions:</strong> Use the leaderboard to gamify sales activity. Offer bonuses for closing top-10 leaderboard prospects 
                      to drive competitive performance.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Sales Coaching:</strong> Review why certain high-value prospects didn't convert. Use these as teaching moments 
                      for improving discovery calls and objection handling.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Marketing Alignment:</strong> Share leaderboard data with marketing to identify which industries or company sizes 
                      convert best, informing targeting and content strategy.
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <AlertDescription className="text-sm">
                      <strong>Case Study Identification:</strong> Top leaderboard prospects that convert make excellent case studies. 
                      Document their journey from report generation to closed deal.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      {/* Footer */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold">Need Additional Help?</h4>
              <p className="text-sm text-muted-foreground">
                This manual covers the core functionality of the admin dashboard. For technical issues, feature requests, 
                or questions not covered here, contact your system administrator or technical support team.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Remember:</strong> This platform is a tool to identify opportunities. Your sales skills, 
                relationship building, and value proposition are what ultimately close deals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminManual;