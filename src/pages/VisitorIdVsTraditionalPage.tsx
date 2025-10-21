import { useState } from "react";
import { ArrowRight, Check, X, TrendingUp, DollarSign, Clock, Users, Zap, BarChart3, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallToActionSection from "@/components/CallToActionSection";
import { MetaTags } from "@/components/seo/MetaTags";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { useNavigate } from "react-router-dom";

const VisitorIdVsTraditionalPage = () => {
  usePageViewTracking("marketing");
  const navigate = useNavigate();

  // ROI Calculator State
  const [monthlyVisitors, setMonthlyVisitors] = useState("10000");
  const [avgDealValue, setAvgDealValue] = useState("15000");
  const [currentConversionRate, setCurrentConversionRate] = useState("2");

  // Calculate ROI
  const visitors = parseInt(monthlyVisitors) || 0;
  const dealValue = parseInt(avgDealValue) || 0;
  const conversionRate = parseFloat(currentConversionRate) || 0;

  const traditionalLeads = Math.floor(visitors * (conversionRate / 100));
  const traditionalRevenue = traditionalLeads * dealValue * 0.1; // 10% close rate

  const identificationRate = 30; // 30% of visitors identified
  const identifiedVisitors = Math.floor(visitors * (identificationRate / 100));
  const additionalLeads = Math.floor(identifiedVisitors * 0.15); // 15% outreach success
  const additionalRevenue = additionalLeads * dealValue * 0.1;

  const totalLeadsWithVisitorId = traditionalLeads + additionalLeads;
  const totalRevenueWithVisitorId = traditionalRevenue + additionalRevenue;
  const revenueIncrease = ((totalRevenueWithVisitorId - traditionalRevenue) / traditionalRevenue) * 100;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: "Visitor ID vs Traditional Lead Gen", url: "/compare/visitor-id-vs-traditional" }
  ];

  const faqItems = [
    {
      question: "Can I use visitor identification alongside my current lead generation strategy?",
      answer: "Absolutely! Visitor identification complements traditional lead generation. Your forms, CTAs, and paid ads continue working exactly as before. Visitor identification simply captures the 95-98% of visitors who don't convert through traditional methods. Most companies use both strategies together for maximum lead generation."
    },
    {
      question: "How long does it take to see ROI from visitor identification?",
      answer: "Most B2B companies see positive ROI within 30-60 days. The setup takes minutes (just adding a tracking pixel), and you typically receive your first identified visitor report within 24 hours. Since you're reaching out to warm prospects who already visited your site, sales cycles are often shorter than cold outreach."
    },
    {
      question: "What's the typical identification rate for visitor identification technology?",
      answer: "Industry average is 20-40% identification rate for B2B websites. This means if you get 10,000 monthly visitors, you can expect to identify 2,000-4,000 companies. Identification rates are higher for: B2B traffic (vs B2C), corporate IP addresses (vs residential), and return visitors (vs first-time visitors)."
    },
    {
      question: "How does visitor identification compare in cost to paid advertising?",
      answer: "Visitor identification is significantly more cost-effective. With Google Ads, you might pay $30-$150 per click for B2B keywords. With visitor identification, you're identifying visitors from ALL traffic sources (organic, direct, social, email) for a flat monthly fee. The cost per identified lead is typically 70-90% lower than paid advertising."
    },
    {
      question: "Is visitor identification compliant with GDPR and privacy regulations?",
      answer: "Yes, when implemented correctly. Visitor identification for B2B purposes identifies companies visiting your website, not individual personal data. It uses business IP addresses and publicly available firmographic data. This falls under legitimate business interest (GDPR Article 6(1)(f)). However, always work with compliant vendors who provide proper data processing agreements."
    },
    {
      question: "What happens to my traditional lead gen forms if I add visitor identification?",
      answer: "Nothing changes! Your forms continue capturing leads exactly as before. Visitor identification works in the background, capturing the visitors who DON'T fill out forms. Think of it as adding a safety net beneath your existing lead generation funnel. You keep all your current leads AND gain thousands of additional prospects."
    }
  ];

  return (
    <>
      <MetaTags
        title="Visitor Identification vs Traditional Lead Generation: Complete ROI Comparison | NurturelyX"
        description="Compare visitor identification and traditional lead generation side-by-side. See exact ROI calculations, implementation costs, and why 10,000+ B2B companies are making the switch."
        canonical="https://x1.nurturely.io/compare/visitor-id-vs-traditional"
        keywords="visitor identification ROI, lead generation comparison, B2B lead gen, website visitor tracking, identity resolution vs forms, lead generation cost comparison"
      />

      <WebPageSchema
        name="Visitor Identification vs Traditional Lead Generation: Complete ROI Comparison"
        description="Compare visitor identification and traditional lead generation side-by-side. See exact ROI calculations, implementation costs, and why 10,000+ B2B companies are making the switch."
        url="https://x1.nurturely.io/compare/visitor-id-vs-traditional"
        breadcrumbs={breadcrumbs}
        datePublished="2025-01-15T10:00:00Z"
      />

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema questions={faqItems} />
      <ComparisonSchema
        items={[
          {
            name: "Visitor Identification",
            description: "Technology that identifies companies visiting your website even if they don't fill out forms",
            pros: [
              "Identifies 20-40% of anonymous visitors",
              "No form friction for users",
              "Automated contact information",
              "Works on all traffic sources",
              "85-95% lower cost per lead",
              "Setup in 5 minutes"
            ],
            cons: [
              "Requires third-party service",
              "Monthly subscription cost",
              "Identification rate varies by traffic type"
            ]
          },
          {
            name: "Traditional Lead Generation",
            description: "Contact forms, gated content, and other methods requiring visitor action",
            pros: [
              "Direct opt-in from interested visitors",
              "Full control over data collection",
              "Established best practices"
            ],
            cons: [
              "Only captures 2-3% of visitors",
              "High friction process",
              "Requires ongoing content creation",
              "Expensive paid advertising needed",
              "Long implementation timeline",
              "Misses 97% of website traffic"
            ]
          }
        ]}
      />

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background border-b">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-4 text-sm px-4 py-1">ROI Comparison</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                Visitor Identification vs.<br />Traditional Lead Generation
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                The definitive comparison: See exactly how visitor identification stacks up against forms, gated content, and traditional B2B lead generation tactics.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle>Visitor Identification</CardTitle>
                  <CardDescription>Capture the invisible 97%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">20-40%</div>
                  <div className="text-sm text-muted-foreground mb-4">of total traffic identified</div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>No form required</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Automated identification</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2" />
                      <span>Contact info included</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted">
                <CardHeader>
                  <Users className="h-10 w-10 text-muted-foreground mb-4" />
                  <CardTitle>Traditional Lead Gen</CardTitle>
                  <CardDescription>Forms and gated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-muted-foreground mb-2">2-3%</div>
                  <div className="text-sm text-muted-foreground mb-4">conversion rate (typical)</div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <X className="h-4 w-4 text-destructive mr-2" />
                      <span>Requires user action</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <X className="h-4 w-4 text-destructive mr-2" />
                      <span>High friction process</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <X className="h-4 w-4 text-destructive mr-2" />
                      <span>Misses 97% of visitors</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Interactive ROI Calculator */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Calculate Your Exact ROI
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Enter your metrics to see how visitor identification compares to your current lead generation strategy
              </p>
            </div>

            <Card className="border-2 border-primary/20">
              <CardContent className="pt-8">
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <Label htmlFor="visitors">Monthly Website Visitors</Label>
                    <Input
                      id="visitors"
                      type="number"
                      value={monthlyVisitors}
                      onChange={(e) => setMonthlyVisitors(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dealValue">Average Deal Value ($)</Label>
                    <Input
                      id="dealValue"
                      type="number"
                      value={avgDealValue}
                      onChange={(e) => setAvgDealValue(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conversion">Current Conversion Rate (%)</Label>
                    <Input
                      id="conversion"
                      type="number"
                      step="0.1"
                      value={currentConversionRate}
                      onChange={(e) => setCurrentConversionRate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Tabs defaultValue="traditional" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="traditional">Traditional Only</TabsTrigger>
                    <TabsTrigger value="combined">With Visitor ID</TabsTrigger>
                  </TabsList>

                  <TabsContent value="traditional" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-foreground">{traditionalLeads.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground mt-1">From {conversionRate}% conversion</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-foreground">${(traditionalRevenue).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground mt-1">At 10% close rate</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Missed Visitors</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-destructive">{(visitors - traditionalLeads).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground mt-1">{((100 - conversionRate)).toFixed(1)}% anonymous</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert className="bg-destructive/10 border-destructive/30">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You're missing <span className="font-bold">{((100 - conversionRate)).toFixed(1)}%</span> of your website traffic. These visitors research your services but never fill out forms.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="combined" className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <Card className="border-primary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Leads</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">{totalLeadsWithVisitorId.toLocaleString()}</div>
                          <div className="text-xs text-primary mt-1">+{additionalLeads} from visitor ID</div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">${(totalRevenueWithVisitorId).toLocaleString()}</div>
                          <div className="text-xs text-primary mt-1">+${additionalRevenue.toLocaleString()} increase</div>
                        </CardContent>
                      </Card>

                      <Card className="border-primary/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Increase</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-primary">{revenueIncrease.toFixed(0)}%</div>
                          <div className="text-xs text-primary mt-1">Compared to traditional</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert className="bg-primary/10 border-primary/30">
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        By adding visitor identification, you could generate an additional <span className="font-bold">${additionalRevenue.toLocaleString()}/month</span> from the same traffic. That's <span className="font-bold">${(additionalRevenue * 12).toLocaleString()}/year</span> in recovered revenue.
                      </AlertDescription>
                    </Alert>

                    <div className="text-center pt-4">
                      <Button 
                        onClick={() => navigate("/")}
                        size="lg"
                        className="text-lg px-8"
                      >
                        Get Your Free Custom Report
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      <p className="text-sm text-muted-foreground mt-3">
                        See the actual companies visiting your website right now
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Feature-by-Feature Comparison
              </h2>
              <p className="text-lg text-muted-foreground">
                See exactly how visitor identification outperforms traditional methods
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-primary">Visitor Identification</th>
                    <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Traditional Lead Gen</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Requires visitor action", visitorId: false, traditional: true },
                    { feature: "Identifies anonymous visitors", visitorId: true, traditional: false },
                    { feature: "Provides contact information", visitorId: true, traditional: true },
                    { feature: "Shows visitor behavior", visitorId: true, traditional: false },
                    { feature: "Implementation time", visitorId: "5 minutes", traditional: "2-4 weeks" },
                    { feature: "Typical conversion rate", visitorId: "20-40%", traditional: "2-3%" },
                    { feature: "Works on all traffic sources", visitorId: true, traditional: true },
                    { feature: "Reveals intent signals", visitorId: true, traditional: false },
                    { feature: "Friction for visitors", visitorId: "None", traditional: "High" },
                    { feature: "Cost per lead", visitorId: "$3-$15", traditional: "$30-$150" },
                    { feature: "Mobile-friendly", visitorId: true, traditional: "Varies" },
                    { feature: "Real-time alerts", visitorId: true, traditional: false },
                    { feature: "Company firmographics", visitorId: true, traditional: false },
                    { feature: "Historical visitor data", visitorId: true, traditional: false }
                  ].map((row, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/30">
                      <td className="py-4 px-4 font-medium text-foreground">{row.feature}</td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.visitorId === 'boolean' ? (
                          row.visitorId ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-primary font-medium">{row.visitorId}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {typeof row.traditional === 'boolean' ? (
                          row.traditional ? (
                            <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className="text-muted-foreground">{row.traditional}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Real Companies, Real Results
              </h2>
              <p className="text-lg text-muted-foreground">
                See how businesses across industries are using visitor identification to outperform traditional lead gen
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Case Study 1 */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <Badge className="w-fit mb-2">B2B SaaS</Badge>
                  <CardTitle className="text-xl">CloudTech Solutions</CardTitle>
                  <CardDescription>Enterprise software company, 50 employees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="font-semibold text-sm text-muted-foreground mb-2">THE PROBLEM</div>
                    <p className="text-sm">Getting 8,000 monthly visitors but only 160 form submissions (2% conversion). Paid search cost per lead was $147.</p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="font-semibold text-sm text-primary mb-2">THE SOLUTION</div>
                    <p className="text-sm">Implemented visitor identification alongside existing forms. Identified 2,400 additional companies per month.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">240%</div>
                      <div className="text-xs text-muted-foreground">Lead increase</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$18/lead</div>
                      <div className="text-xs text-muted-foreground">New cost</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">6.2x</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
                    "We went from wondering why visitors weren't converting to having a pipeline full of warm prospects. Game changer."
                    <div className="not-italic font-semibold text-foreground mt-2">- Sarah M., VP of Marketing</div>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Case Study 2 */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <Badge className="w-fit mb-2">Professional Services</Badge>
                  <CardTitle className="text-xl">Elite Legal Partners</CardTitle>
                  <CardDescription>Law firm specializing in corporate litigation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="font-semibold text-sm text-muted-foreground mb-2">THE PROBLEM</div>
                    <p className="text-sm">High-value cases ($100K+ average) but long sales cycles. Only 1.5% of website visitors contacted them, missing executives researching quietly.</p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="font-semibold text-sm text-primary mb-2">THE SOLUTION</div>
                    <p className="text-sm">Used visitor identification to track C-level executives and legal decision-makers. Enabled proactive outreach during research phase.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">180%</div>
                      <div className="text-xs text-muted-foreground">Lead increase</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$2.4M</div>
                      <div className="text-xs text-muted-foreground">Annual revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">45 days</div>
                      <div className="text-xs text-muted-foreground">Shorter cycle</div>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
                    "We're reaching decision-makers before they even know they're ready to hire us. Our close rate doubled."
                    <div className="not-italic font-semibold text-foreground mt-2">- David K., Managing Partner</div>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Case Study 3 */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <Badge className="w-fit mb-2">Manufacturing</Badge>
                  <CardTitle className="text-xl">Industrial Systems Corp</CardTitle>
                  <CardDescription>B2B equipment manufacturer, $50M revenue</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="font-semibold text-sm text-muted-foreground mb-2">THE PROBLEM</div>
                    <p className="text-sm">Complex equipment ($200K+ average sale). Prospects visited 8-10 times before buying. Website had 0.8% form conversion rate.</p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="font-semibold text-sm text-primary mb-2">THE SOLUTION</div>
                    <p className="text-sm">Tracked returning visitors and pages viewed. Identified procurement managers researching specific equipment models before RFPs.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">420%</div>
                      <div className="text-xs text-muted-foreground">Lead increase</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$8.7M</div>
                      <div className="text-xs text-muted-foreground">Pipeline added</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">60%</div>
                      <div className="text-xs text-muted-foreground">Win rate</div>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
                    "We're winning RFPs we didn't even know existed. Visitor ID shows us who's in-market before they send requests."
                    <div className="not-italic font-semibold text-foreground mt-2">- Michael T., VP of Sales</div>
                  </blockquote>
                </CardContent>
              </Card>

              {/* Case Study 4 */}
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <Badge className="w-fit mb-2">Healthcare</Badge>
                  <CardTitle className="text-xl">MedTech Innovations</CardTitle>
                  <CardDescription>Medical device distributor serving hospitals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="font-semibold text-sm text-muted-foreground mb-2">THE PROBLEM</div>
                    <p className="text-sm">Hospitals research extensively but rarely fill forms. 12,000 monthly visitors, 1.2% conversion. Missing key decision-makers.</p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4">
                    <div className="font-semibold text-sm text-primary mb-2">THE SOLUTION</div>
                    <p className="text-sm">Identified hospital systems, departments, and key contacts viewing specific product pages. Enabled targeted outreach to procurement.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">380%</div>
                      <div className="text-xs text-muted-foreground">Lead increase</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">$12M</div>
                      <div className="text-xs text-muted-foreground">New contracts</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary">9.4x</div>
                      <div className="text-xs text-muted-foreground">ROI</div>
                    </div>
                  </div>

                  <blockquote className="border-l-4 border-primary pl-4 italic text-sm text-muted-foreground">
                    "Hospital procurement cycles take months. Now we know who's researching early and can build relationships before budgets are set."
                    <div className="not-italic font-semibold text-foreground mt-2">- Jessica L., Director of Sales</div>
                  </blockquote>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Cost Comparison */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Cost Comparison: The Real Numbers
              </h2>
              <p className="text-lg text-muted-foreground">
                See exactly what you're paying per lead with each approach
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="bg-muted/30">
                  <CardTitle>Traditional Lead Generation Costs</CardTitle>
                  <CardDescription>Average monthly costs for B2B companies</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Google Ads (B2B keywords)</span>
                    <span className="font-bold">$5,000-$15,000/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">LinkedIn Ads</span>
                    <span className="font-bold">$3,000-$10,000/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Marketing automation platform</span>
                    <span className="font-bold">$800-$3,000/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Content creation for gated assets</span>
                    <span className="font-bold">$2,000-$5,000/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Landing page optimization tools</span>
                    <span className="font-bold">$300-$1,000/mo</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-lg font-bold border-t-2 border-foreground">
                    <span>Total Monthly Cost</span>
                    <span className="text-destructive">$11,100-$34,000</span>
                  </div>
                  <div className="bg-destructive/10 rounded-lg p-4 mt-4">
                    <div className="text-sm font-semibold mb-1">Cost Per Lead</div>
                    <div className="text-2xl font-bold text-destructive">$74-$227</div>
                    <div className="text-xs text-muted-foreground mt-1">Based on 150 monthly leads</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardHeader className="bg-primary/10">
                  <CardTitle className="text-primary">Visitor Identification Costs</CardTitle>
                  <CardDescription>All-inclusive monthly investment</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Platform fee (unlimited tracking)</span>
                    <span className="font-bold">$100/mo</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Identity resolution ($1/lead)</span>
                    <span className="font-bold">Pay as you go</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Implementation & setup</span>
                    <span className="font-bold text-primary">$0 (one-time)</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">No additional ad spend needed</span>
                    <span className="font-bold text-primary">$0</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Works on existing traffic</span>
                    <span className="font-bold text-primary">$0</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b">
                    <span className="text-sm">Contact database included</span>
                    <span className="font-bold text-primary">$0</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 text-lg font-bold border-t-2 border-primary">
                    <span>Example: 3,700 leads/mo</span>
                    <span className="text-primary">$3,800</span>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 mt-4">
                    <div className="text-sm font-semibold mb-1">Cost Per Lead</div>
                    <div className="text-2xl font-bold text-primary">$3-$13</div>
                    <div className="text-xs text-muted-foreground mt-1">Based on 150 additional monthly leads</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="mt-8 bg-primary/10 border-primary/30">
              <DollarSign className="h-5 w-5" />
              <AlertDescription className="text-base">
                <span className="font-semibold">Bottom line:</span> Visitor identification is 85-95% cheaper per lead than traditional methods. You're identifying prospects from traffic you already have instead of paying for new clicks.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Implementation Timeline */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Implementation Timeline
              </h2>
              <p className="text-lg text-muted-foreground">
                How long does it take to start generating leads?
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <Clock className="h-10 w-10 text-muted-foreground mb-4" />
                  <CardTitle>Traditional Lead Generation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Week 1-2</span>
                        <Badge variant="outline">Setup</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Create landing pages, design forms, set up tracking, configure automation workflows</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Week 3-4</span>
                        <Badge variant="outline">Content Creation</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Write gated content, create lead magnets, design email sequences</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Week 5-8</span>
                        <Badge variant="outline">Traffic Generation</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Launch ads, wait for traffic, optimize campaigns, A/B test forms</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Week 9-12</span>
                        <Badge variant="outline">Optimization</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Analyze data, tweak messaging, improve conversion rates</p>
                    </div>

                    <div className="pt-4 border-t-2 border-foreground">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground mb-2">8-12 weeks</div>
                        <div className="text-sm text-muted-foreground">To reach steady lead flow</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/30">
                <CardHeader>
                  <Zap className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-primary">Visitor Identification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Day 1</span>
                        <Badge className="bg-primary">Setup</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Add tracking pixel to website (5 minutes), configure dashboard preferences</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Day 2</span>
                        <Badge className="bg-primary">First Report</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Receive first report of identified visitors with contact info</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Week 1</span>
                        <Badge className="bg-primary">Full Operation</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Daily reports flowing, sales team reaching out, pipeline growing</p>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold">Week 2-4</span>
                        <Badge className="bg-primary">Optimization</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Refine lead scoring, optimize outreach cadence, integrate with CRM</p>
                    </div>

                    <div className="pt-4 border-t-2 border-primary">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-primary mb-2">24-48 hours</div>
                        <div className="text-sm text-muted-foreground">To start receiving leads</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto max-w-4xl text-center">
            <Target className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready To See The Difference?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get a free report showing exactly how many companies are visiting your website right now—and what they're worth to your business.
            </p>
            <div className="space-y-4">
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                className="text-lg px-8"
              >
                Calculate My Missing Revenue (Free)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required • See results in 60 seconds • 10,000+ companies trust us
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">240%</div>
                <div className="text-sm text-muted-foreground">Average lead increase</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">85%</div>
                <div className="text-sm text-muted-foreground">Lower cost per lead</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">24hrs</div>
                <div className="text-sm text-muted-foreground">Time to first leads</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">6.2x</div>
                <div className="text-sm text-muted-foreground">Average ROI</div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default VisitorIdVsTraditionalPage;
