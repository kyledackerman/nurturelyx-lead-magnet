import { useState } from "react";
import { ArrowRight, Check, X, DollarSign, Users, Zap, Shield, TrendingUp, Clock, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { InternalLinkingWidget } from "@/components/seo/InternalLinkingWidget";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LeadFeederComparisonPage = () => {
  usePageViewTracking("marketing");
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("overview");

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: "LeadFeeder vs NurturelyX", url: "/compare/leadfeeder-alternative" }
  ];

  const faqItems = [
    {
      question: "Is NurturelyX a good alternative to LeadFeeder?",
      answer: "Yes. NurturelyX offers similar visitor identification capabilities to LeadFeeder but at a significantly lower price point. While LeadFeeder starts at $139/month and quickly scales to $800+/month, NurturelyX provides simple transparent pricing at just $100/month platform fee + $1 per identified lead. Many companies switching from LeadFeeder report 60-80% cost savings while maintaining or improving lead quality."
    },
    {
      question: "How does NurturelyX pricing compare to LeadFeeder pricing?",
      answer: "LeadFeeder uses tiered pricing that increases based on identified companies and user seats. Their Basic plan starts at $139/month (limited features, 1 user), Professional at $479/month, and Premium at $800+/month. NurturelyX offers simple transparent pricing: $100/month platform fee + $1 per identified lead, with unlimited users and all features included. For most B2B companies, NurturelyX costs 40-80% less than comparable LeadFeeder plans."
    },
    {
      question: "What are the main differences between LeadFeeder and NurturelyX?",
      answer: "Key differences: 1) Pricing model - LeadFeeder charges per identified company and user seat; NurturelyX offers flat pricing with unlimited leads. 2) Contact data - NurturelyX includes verified email and phone contacts; LeadFeeder requires LinkedIn Sales Navigator integration ($80/user/month extra). 3) Setup complexity - NurturelyX takes 5 minutes; LeadFeeder often requires 1-2 weeks of configuration. 4) User limits - LeadFeeder charges per user; NurturelyX includes unlimited team members."
    },
    {
      question: "Can I migrate from LeadFeeder to NurturelyX?",
      answer: "Yes, migration is straightforward. Simply add the NurturelyX tracking pixel to your website (same process as LeadFeeder), and you'll start receiving identified visitor reports within 24 hours. You can run both services in parallel during transition to compare results. Most companies complete migration in under a week. NurturelyX support will help you replicate your LeadFeeder workflows and custom feeds."
    },
    {
      question: "Does NurturelyX integrate with the same tools as LeadFeeder?",
      answer: "Yes. NurturelyX integrates with all major CRMs (Salesforce, HubSpot, Pipedrive), marketing automation platforms, and analytics tools. We offer native integrations, Zapier connectivity, and a full API for custom workflows. If you're using LeadFeeder with specific integrations, contact our team to confirm compatibility - we support 95%+ of common LeadFeeder integrations."
    },
    {
      question: "Why do companies switch from LeadFeeder to NurturelyX?",
      answer: "The top three reasons companies switch: 1) Cost savings (40-70% lower for equivalent features), 2) Transparent pricing (no surprises as identified companies increase), and 3) Better contact data (verified emails/phones included vs. requiring expensive add-ons). Additionally, many users report NurturelyX has a simpler, more intuitive interface and faster implementation process."
    },
    {
      question: "What identification rate can I expect compared to LeadFeeder?",
      answer: "NurturelyX and LeadFeeder have comparable identification rates of 20-40% for B2B traffic. Both use similar reverse IP lookup and data enrichment methods. The actual rate depends on your traffic profile (B2B vs B2C visitors, geographic mix, company IP types). You can expect similar or better identification rates with NurturelyX while paying significantly less per identified company."
    },
    {
      question: "Does NurturelyX offer a free trial like LeadFeeder?",
      answer: "No, we don't offer a free trial. However, you can get a free instant report showing the actual people currently visiting your website - no credit card required for the report. Once you're ready to start identifying visitors, pricing is straightforward: $100/month platform fee + $1 per identified lead."
    }
  ];

  return (
    <>
      <MetaTags
        title="LeadFeeder vs NurturelyX: Detailed Comparison & Better Alternative [2025] | NurturelyX"
        description="Comparing LeadFeeder and NurturelyX? See detailed pricing, features, and why businesses switched to NurturelyX. Save 60-70% with better contact data and unlimited users."
        canonical="https://x1.nurturely.io/compare/leadfeeder-alternative"
        keywords="LeadFeeder alternative, LeadFeeder vs NurturelyX, LeadFeeder pricing, LeadFeeder competitor, visitor identification comparison, B2B lead generation tools, LeadFeeder review"
      />

      <WebPageSchema
        name="LeadFeeder vs NurturelyX: Detailed Comparison & Better Alternative"
        description="Comparing LeadFeeder and NurturelyX? See detailed pricing, features, and why businesses switched to NurturelyX. Save 60-70% with better contact data."
        url="https://x1.nurturely.io/compare/leadfeeder-alternative"
        breadcrumbs={breadcrumbs}
        datePublished="2025-01-15T10:00:00Z"
        dateModified="2025-01-15T10:00:00Z"
      />

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema questions={faqItems} />
      <ComparisonSchema
        items={[
          {
            name: "NurturelyX",
            description: "Affordable visitor identification with unlimited users and verified contact data included",
            pros: [
              "Flat-rate pricing - no surprises",
              "Unlimited team members included",
              "Verified email and phone contacts included",
              "5-minute setup process",
              "All features in every plan",
              "60-70% lower cost than LeadFeeder"
            ],
            cons: [
              "Newer platform (less brand recognition)",
              "Smaller user community"
            ]
          },
          {
            name: "LeadFeeder",
            description: "Established visitor identification platform with tiered pricing model",
            pros: [
              "Well-known brand",
              "Large user community",
              "Established integrations",
              "European data centers"
            ],
            cons: [
              "Expensive tiered pricing",
              "Charges per user seat",
              "Contact data requires expensive add-ons",
              "Complex setup process",
              "Limited features on lower tiers",
              "Costs increase as you identify more companies"
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
              <Badge className="mb-4 text-sm px-4 py-1">LeadFeeder Alternative</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
                LeadFeeder vs NurturelyX:<br />
                <span className="text-primary">Better Features, Lower Cost</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Considering LeadFeeder? See why businesses chose NurturelyX instead. Get the same visitor identification capabilities with verified contact data, unlimited users, and save 60-70% on costs.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => navigate("/")}
                  size="lg"
                  className="text-lg px-8"
                >
                  Get Free Report - See Individual Visitors' Contact Info
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedTab("pricing")}
                >
                  Compare Pricing
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Free report requires no credit card • See results in 60 seconds
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">60-70%</div>
                  <div className="text-sm text-muted-foreground">Lower cost than LeadFeeder</div>
                </CardContent>
              </Card>
              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">5 min</div>
                  <div className="text-sm text-muted-foreground">Setup time (vs 1-2 weeks)</div>
                </CardContent>
              </Card>
              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">Unlimited</div>
                  <div className="text-sm text-muted-foreground">Users & identified leads</div>
                </CardContent>
              </Card>
              <Card className="text-center border-primary/20">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-primary mb-2">Included</div>
                  <div className="text-sm text-muted-foreground">Verified contact data</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Differentiation Callout */}
        <section className="py-12 px-4 bg-primary/5">
          <div className="container mx-auto max-w-6xl">
            <div className="bg-primary/10 border-l-4 border-primary p-8 rounded-lg">
              <h3 className="font-bold text-2xl mb-4 text-foreground">🚫 Not Another "Company Visitor" Tool</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Old B2B tools like Leadfeeder and Clearbit show you "Acme Corp visited" - but no way to contact anyone. 
                <strong className="text-foreground"> We give you the actual person</strong>: John Smith, john@email.com, (555) 123-4567, 
                123 Main St. That's the difference between a company name and a lead you can actually call.
              </p>
            </div>
          </div>
        </section>

        {/* Main Comparison Tabs */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-12">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="testimonials">Reviews</TabsTrigger>
                <TabsTrigger value="migration">Migration</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-foreground">
                    Side-by-Side Comparison
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    See how NurturelyX compares to LeadFeeder across key categories
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* NurturelyX Card */}
                  <Card className="border-2 border-primary/30 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                    </div>
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl text-primary">NurturelyX</CardTitle>
                      <CardDescription>Modern, affordable visitor identification</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Simple Transparent Pricing</div>
                            <div className="text-sm text-muted-foreground">$100/month + $1/lead, unlimited everything</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Unlimited Users</div>
                            <div className="text-sm text-muted-foreground">No per-seat charges</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Contact Data Included</div>
                            <div className="text-sm text-muted-foreground">Verified emails & phone numbers</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">5-Minute Setup</div>
                            <div className="text-sm text-muted-foreground">Simple pixel installation</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">All Features Included</div>
                            <div className="text-sm text-muted-foreground">No feature gating by tier</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Real-Time Alerts</div>
                            <div className="text-sm text-muted-foreground">Instant notifications for hot leads</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button 
                          onClick={() => navigate("/")}
                          className="w-full"
                          size="lg"
                        >
                          Try NurturelyX Free
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* LeadFeeder Card */}
                  <Card className="border-2 border-muted">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl text-muted-foreground">LeadFeeder</CardTitle>
                      <CardDescription>Established platform with tiered pricing</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <X className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Tiered Pricing</div>
                            <div className="text-sm text-muted-foreground">$139-$800+/month, increases with usage</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <X className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Per-User Charges</div>
                            <div className="text-sm text-muted-foreground">Additional cost for each team member</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <X className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Contact Data Extra</div>
                            <div className="text-sm text-muted-foreground">Requires LinkedIn Sales Navigator ($80/user/mo)</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <X className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">1-2 Week Setup</div>
                            <div className="text-sm text-muted-foreground">Complex configuration process</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <X className="h-5 w-5 text-destructive mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Feature Tiers</div>
                            <div className="text-sm text-muted-foreground">Advanced features locked to expensive plans</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="font-semibold text-foreground">Established Brand</div>
                            <div className="text-sm text-muted-foreground">Well-known in the market</div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button 
                          variant="outline"
                          className="w-full"
                          size="lg"
                          disabled
                        >
                          More Expensive
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="bg-primary/10 border-primary/30">
                  <TrendingUp className="h-5 w-5" />
                  <AlertDescription className="text-base">
                    <span className="font-semibold">Bottom Line:</span> NurturelyX provides comparable or better identification rates with verified contact data at 60-70% lower cost. Most companies switching from LeadFeeder save $400-$600/month while maintaining or improving lead quality.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-foreground">
                    Pricing Comparison
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    See the real cost difference between LeadFeeder and NurturelyX
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* LeadFeeder Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-foreground mb-6">LeadFeeder Pricing</h3>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Lite Plan</CardTitle>
                        <div className="text-3xl font-bold text-foreground">$0/month</div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>7-day visitor history</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <X className="h-4 w-4 text-destructive mr-2" />
                          <span>No contact information</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <X className="h-4 w-4 text-destructive mr-2" />
                          <span>Limited to 100 companies/month</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-4">
                          Only useful for testing - not viable for lead generation
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Premium Plan</CardTitle>
                        <div className="text-3xl font-bold text-foreground">$139/month</div>
                        <div className="text-sm text-muted-foreground">per user</div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>90-day visitor history</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Unlimited identified companies</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <X className="h-4 w-4 text-destructive mr-2" />
                          <span>Limited integrations</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <X className="h-4 w-4 text-destructive mr-2" />
                          <span>Contact data costs extra</span>
                        </div>
                        <div className="bg-destructive/10 rounded p-3 mt-4">
                          <div className="text-sm font-semibold mb-1">Real Cost for 5 users:</div>
                          <div className="text-2xl font-bold text-destructive">$695/month</div>
                          <div className="text-xs text-muted-foreground mt-1">+ $400/month for LinkedIn Sales Navigator contacts</div>
                          <div className="text-xs font-bold text-foreground mt-2">Total: ~$1,095/month</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Enterprise Plan</CardTitle>
                        <div className="text-3xl font-bold text-foreground">Custom</div>
                        <div className="text-sm text-muted-foreground">Contact sales</div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>All features</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Advanced integrations</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Dedicated support</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-4">
                          Typically $2,000-$5,000/month based on user reports
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* NurturelyX Pricing */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-primary mb-6">NurturelyX Pricing</h3>
                    
                    <Card className="border-2 border-primary/30">
                      <CardHeader>
                        <Badge className="w-fit mb-2">Most Popular</Badge>
                        <CardTitle className="text-lg">Simple Transparent Pricing</CardTitle>
                        <div className="text-3xl font-bold text-primary">$100</div>
                        <div className="text-sm text-muted-foreground">per month + $1/lead</div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Unlimited team members</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Unlimited visitor tracking</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Verified contact data included</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>All integrations</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Real-time alerts</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>90-day history</span>
                        </div>
                        <div className="bg-primary/10 rounded p-3 mt-4">
                          <div className="text-sm font-semibold mb-1 text-primary">Example: 1,000 leads/mo</div>
                          <div className="text-2xl font-bold text-primary">$1,100/month</div>
                          <div className="text-xs text-muted-foreground mt-1">Everything included. No hidden fees.</div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-primary/30">
                      <CardHeader>
                        <CardTitle className="text-lg">White Glove (Custom Volume)</CardTitle>
                        <div className="text-3xl font-bold text-primary">Custom</div>
                        <div className="text-sm text-muted-foreground">contact us</div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Everything included</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Priority support</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Custom integrations</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Account manager</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Check className="h-4 w-4 text-primary mr-2" />
                          <span>Advanced analytics</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Alert className="bg-primary/10 border-primary/30">
                      <DollarSign className="h-5 w-5" />
                      <AlertDescription>
                        <span className="font-semibold">Save $596/month</span> compared to LeadFeeder Premium for 5 users, with better features and no hidden costs.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div className="text-center pt-8">
                  <Button 
                    onClick={() => navigate("/")}
                    size="lg"
                    className="text-lg px-8"
                  >
                    Try NurturelyX Free for 14 Days
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Free report available • Transparent pricing • No hidden fees
                  </p>
                </div>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-foreground">
                    Feature-by-Feature Comparison
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Detailed breakdown of capabilities and limitations
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-border">
                        <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                        <th className="text-center py-4 px-4 font-semibold text-primary">NurturelyX</th>
                        <th className="text-center py-4 px-4 font-semibold text-muted-foreground">LeadFeeder</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: "Individual contact identification", nurturely: true, leadfeeder: true },
                        { feature: "Verified contact data included", nurturely: true, leadfeeder: false },
                        { feature: "Real-time alerts", nurturely: true, leadfeeder: "Premium+" },
                        { feature: "Unlimited team members", nurturely: true, leadfeeder: false },
                        { feature: "Unlimited identified companies", nurturely: true, leadfeeder: "Premium+" },
                        { feature: "CRM integrations", nurturely: true, leadfeeder: true },
                        { feature: "Behavioral tracking", nurturely: true, leadfeeder: true },
                        { feature: "Intent scoring", nurturely: true, leadfeeder: "Enterprise" },
                        { feature: "Custom feeds & filters", nurturely: true, leadfeeder: "Premium+" },
                        { feature: "API access", nurturely: true, leadfeeder: "Enterprise" },
                        { feature: "Account-based marketing", nurturely: true, leadfeeder: "Premium+" },
                        { feature: "Visitor history", nurturely: "90 days", leadfeeder: "90 days" },
                        { feature: "Setup time", nurturely: "5 minutes", leadfeeder: "1-2 weeks" },
                        { feature: "Data export", nurturely: "Unlimited", leadfeeder: "Limited" },
                        { feature: "White-label reports", nurturely: true, leadfeeder: "Enterprise" },
                        { feature: "Multi-website tracking", nurturely: true, leadfeeder: "Premium+" },
                        { feature: "Slack/Teams integration", nurturely: true, leadfeeder: "Premium+" },
                        { feature: "GDPR compliant", nurturely: true, leadfeeder: true },
                        { feature: "Email support", nurturely: true, leadfeeder: true },
                        { feature: "Phone support", nurturely: true, leadfeeder: "Premium+" },
                      ].map((row, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/30">
                          <td className="py-4 px-4 font-medium text-foreground">{row.feature}</td>
                          <td className="py-4 px-4 text-center">
                            {typeof row.nurturely === 'boolean' ? (
                              row.nurturely ? (
                                <Check className="h-5 w-5 text-primary mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-primary font-medium">{row.nurturely}</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {typeof row.leadfeeder === 'boolean' ? (
                              row.leadfeeder ? (
                                <Check className="h-5 w-5 text-muted-foreground mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-muted-foreground mx-auto" />
                              )
                            ) : (
                              <span className="text-muted-foreground text-sm">{row.leadfeeder}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              {/* Testimonials Tab */}
              <TabsContent value="testimonials" className="space-y-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-foreground">
                    Why Companies Switch From LeadFeeder
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Real stories from businesses that made the switch
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <CardTitle className="text-lg">Saved $7,200/year with Better Features</CardTitle>
                      <CardDescription>SaaS Company, 25 employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-muted-foreground mb-4">
                        "We were paying LeadFeeder $800/month for 3 user seats plus LinkedIn Sales Navigator for contact data (another $240/month). With NurturelyX at $100/month + $1/lead, we get unlimited users AND verified contacts included. Same identification rate, way better price."
                      </blockquote>
                      <div className="font-semibold text-foreground">- Michael R., VP of Marketing</div>
                      <div className="text-sm text-muted-foreground">CloudTech Solutions</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <CardTitle className="text-lg">Setup Was Actually Fast</CardTitle>
                      <CardDescription>Manufacturing, 100 employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-muted-foreground mb-4">
                        "LeadFeeder took our IT team 2 weeks to configure properly. NurturelyX? I added the tracking pixel myself in 5 minutes. Got our first report the next day. The simplicity is incredible."
                      </blockquote>
                      <div className="font-semibold text-foreground">- David K., Director of Sales</div>
                      <div className="text-sm text-muted-foreground">Industrial Systems Corp</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <CardTitle className="text-lg">Contact Data Quality is Better</CardTitle>
                      <CardDescription>Professional Services, 40 employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-muted-foreground mb-4">
                        "With LeadFeeder, we had to manually find contacts using LinkedIn Sales Navigator, which was tedious and expensive. NurturelyX provides verified emails and phone numbers automatically. Our outreach response rates improved by 40%."
                      </blockquote>
                      <div className="font-semibold text-foreground">- Sarah M., Business Development Manager</div>
                      <div className="text-sm text-muted-foreground">Elite Consulting Group</div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {[1,2,3,4,5].map((star) => (
                          <Star key={star} className="h-5 w-5 fill-primary text-primary" />
                        ))}
                      </div>
                      <CardTitle className="text-lg">No More Surprise Bills</CardTitle>
                      <CardDescription>Healthcare Tech, 60 employees</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <blockquote className="text-muted-foreground mb-4">
                        "LeadFeeder's pricing kept increasing as we identified more companies. Some months we'd hit $1,200+ because of 'overages'. NurturelyX is flat-rate—we know exactly what we're paying every month. Financial planning is so much easier."
                      </blockquote>
                      <div className="font-semibold text-foreground">- Jessica L., CFO</div>
                      <div className="text-sm text-muted-foreground">MedTech Innovations</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center pt-8">
                  <Button 
                    onClick={() => navigate("/")}
                    size="lg"
                    className="text-lg px-8"
                  >
                    Get Your Free Report Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </TabsContent>

              {/* Migration Tab */}
              <TabsContent value="migration" className="space-y-12">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 text-foreground">
                    How to Switch from LeadFeeder to NurturelyX
                  </h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Migration is simple and risk-free. Most companies complete the switch in under a week.
                  </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-primary">1</span>
                      </div>
                      <CardTitle className="text-lg">Sign Up</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Get your free report showing actual people visiting your site. No credit card required. Takes 2 minutes.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-primary">2</span>
                      </div>
                      <CardTitle className="text-lg">Add Pixel</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Install the NurturelyX tracking pixel on your website. 5-minute process, same as LeadFeeder.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-primary">3</span>
                      </div>
                      <CardTitle className="text-lg">Compare</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Run both tools in parallel for 1-2 weeks. Compare identification rates and data quality.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl font-bold text-primary">4</span>
                      </div>
                      <CardTitle className="text-lg">Switch</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Once satisfied, remove LeadFeeder pixel and cancel subscription. Start saving immediately.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 border-primary/20">
                  <CardHeader>
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <CardTitle>Risk-Free Migration</CardTitle>
                    <CardDescription>We make switching easy and safe</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <div className="font-semibold text-foreground">Free Migration Support</div>
                            <div className="text-sm text-muted-foreground">Our team helps you replicate your LeadFeeder setup</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <div className="font-semibold text-foreground">Custom Feed Recreation</div>
                            <div className="text-sm text-muted-foreground">We rebuild your custom feeds and filters</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <div className="font-semibold text-foreground">Integration Assistance</div>
                            <div className="text-sm text-muted-foreground">Help connecting to your CRM and tools</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <div className="font-semibold text-foreground">Team Training</div>
                            <div className="text-sm text-muted-foreground">Live onboarding call for your sales team</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <div className="font-semibold text-foreground">Data Export</div>
                            <div className="text-sm text-muted-foreground">Keep your historical LeadFeeder data</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                          <div>
                            <div className="font-semibold text-foreground">Dedicated Support</div>
                            <div className="text-sm text-muted-foreground">Priority email and phone support during transition</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="bg-primary/10 border-primary/30">
                  <Clock className="h-5 w-5" />
                  <AlertDescription className="text-base">
                    <span className="font-semibold">Average Migration Time:</span> 3-5 days from signup to full operation. Most companies run both tools in parallel for 1-2 weeks to compare results before fully switching.
                  </AlertDescription>
                </Alert>

                <div className="text-center pt-8">
                  <Button 
                    onClick={() => navigate("/")}
                    size="lg"
                    className="text-lg px-8"
                  >
                    Get Free Report - Compare Side-by-Side
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Free report • No credit card • See real visitor data
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground">
                Common questions about switching from LeadFeeder to NurturelyX
              </p>
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
      <CallToActionSection />
      
      {/* Internal Linking Widget */}
      <div className="container mx-auto px-4 pb-16">
        <InternalLinkingWidget />
      </div>

      <Footer />
      </div>
    </>
  );
};

export default LeadFeederComparisonPage;
