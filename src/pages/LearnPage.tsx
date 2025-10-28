import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MetaTags } from "@/components/seo/MetaTags";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { scrollToTop } from "@/lib/scroll";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { 
  TrendingDown, 
  Users, 
  Target, 
  LineChart, 
  Shield, 
  Zap,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Brain,
  Workflow,
  DollarSign,
  UserCircle
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LearnPage = () => {
  usePageViewTracking('marketing');
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <MetaTags
        title="Website Visitor Identification Guide 2025: Convert Anonymous Traffic"
        description="Learn how to identify anonymous website visitors and convert 98% of lost traffic into qualified leads. Complete guide to visitor identification technology and ROI."
        canonical="https://x1.nurturely.io/learn"
        keywords="website visitor identification, anonymous traffic conversion, identify website visitors, visitor tracking software, lead generation technology"
      />

      <HowToSchema
        name="How to Identify Anonymous Website Visitors"
        description="Step-by-step guide to implementing visitor identification technology and converting anonymous traffic into qualified leads"
        steps={[
          {
            name: "Calculate Your Lost Revenue",
            text: "Use our calculator to see how much revenue you're losing from anonymous traffic and understand the financial impact"
          },
          {
            name: "Understand Your Traffic",
            text: "Analyze your visitor patterns and identify high-value anonymous visitors using analytics data"
          },
          {
            name: "Implement Identification",
            text: "Deploy visitor identification technology to capture anonymous visitor data automatically"
          },
          {
            name: "Convert to Revenue",
            text: "Use identified visitor data for targeted outreach and retargeting campaigns to convert leads into customers"
          }
        ]}
        totalTime="PT30M"
      />

      <ServiceSchema
        name="Website Visitor Identification Technology"
        description="Comprehensive visitor identification service that helps businesses identify anonymous website visitors and convert lost traffic into qualified leads"
        serviceType="Professional Service"
      />

      <ArticleSchema
        title="The Complete Guide to Website Visitor Identification & Anonymous Traffic Conversion"
        description="Comprehensive guide explaining how businesses identify anonymous website visitors and convert lost traffic into revenue"
        publishedAt="2025-01-01"
        updatedAt={new Date().toISOString().split('T')[0]}
        author="NurturelyX"
        url="https://x1.nurturely.io/learn"
        category="Lead Generation"
      />

      <WebPageSchema
        name="Website Visitor Identification Guide"
        description="Complete guide to identifying anonymous website visitors and converting lost traffic into qualified leads"
        url="https://x1.nurturely.io/learn"
        breadcrumbs={[
          { name: "Learn", url: "/learn" }
        ]}
        keywords={["visitor identification guide", "anonymous traffic conversion", "lead generation technology"]}
      />

      <Header />
      
      <main className="min-h-screen bg-background">
        <div className="container max-w-6xl py-6">
          <Breadcrumb items={[
            { label: "Learn", href: "/learn" }
          ]} />
        </div>
        
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                The Complete Guide to Website Visitor Identification & Anonymous Traffic Conversion
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Why 98% of your website traffic leaves without a trace—and how modern businesses are capturing these lost opportunities
              </p>
              <p className="text-lg text-muted-foreground/80 mb-8">
                For B2B, B2C, SaaS, Ecommerce, and Service Businesses
              </p>
              <Button asChild size="lg" className="text-lg px-8 py-6" onClick={scrollToTop}>
                <Link to="/">
                  Calculate Your Hidden Revenue <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-sm text-muted-foreground">of visitors never convert</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">80%</div>
                <div className="text-sm text-muted-foreground">never return to your site</div>
              </Card>
              <Card className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">$10K+</div>
                <div className="text-sm text-muted-foreground">average monthly lost revenue</div>
              </Card>
            </div>
          </div>
        </section>

        {/* Table of Contents */}
        <section className="py-8 px-4 bg-muted/30">
          <div className="container max-w-4xl mx-auto">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: "problem", title: "The Anonymous Traffic Problem" },
                  { id: "technology", title: "What is Visitor Identification?" },
                  { id: "math", title: "The Math Behind Lost Revenue" },
                  { id: "use-cases", title: "How Businesses Use This Data" },
                  { id: "implementation", title: "Implementation & Technical Details" },
                  { id: "roi", title: "ROI & Pricing Considerations" },
                  { id: "privacy", title: "Privacy & Compliance" },
                  { id: "getting-started", title: "Getting Started" }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                  >
                    → {item.title}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Main Content */}
        <div className="container max-w-4xl mx-auto px-4 py-12">
          
          {/* Section A: The Anonymous Traffic Problem */}
          <section id="problem" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TrendingDown className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">The Anonymous Traffic Problem</h2>
                <p className="text-lg text-muted-foreground">Understanding the scale of opportunity hidden in your analytics</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p>
                Every day, thousands of potential customers visit your website. They browse your products, read your content, 
                and evaluate your offerings. Then they leave—and you have no idea who they were.
              </p>

              <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <Users className="h-5 w-5" />
                  The Hard Truth About Website Conversion
                </h3>
                <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span><strong>98% of website visitors never fill out a form</strong> or provide contact information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span><strong>80% of first-time visitors never return</strong> to your website</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span><strong>67% of buyers</strong> research your company multiple times before engaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Traditional forms convert at 2-3%</strong> across industries</span>
                  </li>
                </ul>
              </Card>


              <h3 className="text-2xl font-semibold mt-8 mb-4">The Real Dollar Cost</h3>
              
              <p>
                Let's put this in perspective with real numbers. If your website receives <strong>10,000 monthly visitors</strong> 
                and your average transaction value is <strong>$5,000</strong>:
              </p>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="space-y-3 text-foreground">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span>Monthly visitors:</span>
                    <span className="font-semibold">10,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span>Typical form conversion rate:</span>
                    <span className="font-semibold">2%</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span>Leads captured with forms:</span>
                    <span className="font-semibold">200 leads</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <span className="text-amber-600 dark:text-amber-400">Anonymous visitors (lost):</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">9,800 visitors</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-semibold">Potential monthly lost revenue:</span>
                    <span className="text-2xl font-bold text-primary">$49,000</span>
                  </div>
                </div>
              </Card>

              <div className="my-8 text-center">
                <Button asChild 
                  size="lg" 
                  className="text-base"
                  onClick={scrollToTop}
                >
                  <Link to="/">
                    Calculate YOUR Lost Revenue <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Section B: What is Visitor Identification Technology? */}
          <section id="technology" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">What is Visitor Identification Technology?</h2>
                <p className="text-lg text-muted-foreground">Understanding how identity resolution works (in plain English)</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p>
                Visitor identification technology (also called "identity resolution" or "de-anonymization") is a method 
                of identifying anonymous website visitors without requiring them to fill out forms or provide information directly.
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">How It Works</h3>

              <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-foreground">
                  <Workflow className="h-5 w-5" />
                  The Identification Process
                </h4>
                <ol className="space-y-4 text-foreground">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</span>
                    <div>
                      <strong>Visitor arrives on your website</strong>
                      <p className="text-sm text-muted-foreground mt-1">A small tracking script on your site begins collecting behavioral data</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</span>
                    <div>
                      <strong>Data signals are collected</strong>
                      <p className="text-sm text-muted-foreground mt-1">IP address, device fingerprint, browsing behavior, and referral source</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</span>
                    <div>
                      <strong>Identity matching begins</strong>
                      <p className="text-sm text-muted-foreground mt-1">Signals are cross-referenced with proprietary databases containing millions of business and consumer profiles (both B2B and B2C visitors can be identified)</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">4</span>
                    <div>
                      <strong>Contact information revealed</strong>
                      <p className="text-sm text-muted-foreground mt-1">Email addresses, phone numbers, company details, and firmographic data are returned</p>
                    </div>
                  </li>
                </ol>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Comparison: Traditional vs. Modern Lead Capture</h3>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Feature</th>
                      <th className="border border-border p-3 text-left">Traditional Forms</th>
                      <th className="border border-border p-3 text-left">Visitor Identification</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3 font-medium">Capture Rate</td>
                      <td className="border border-border p-3">2-3% of visitors</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-foreground">15-40% of visitors</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">User Friction</td>
                      <td className="border border-border p-3">High (requires form fill)</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-foreground">None (automatic)</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Data Quality</td>
                      <td className="border border-border p-3">Variable (self-reported)</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-foreground">High (verified databases)</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Implementation</td>
                      <td className="border border-border p-3">Requires design & testing</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-foreground">Single script install</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Behavioral Data</td>
                      <td className="border border-border p-3">Limited to post-conversion</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-foreground">Full visitor journey</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Privacy & Compliance</h3>

              <Card className="p-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                <div className="flex gap-3 mb-3">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <h4 className="font-semibold text-lg text-foreground">Compliant Visitor Identification</h4>
                </div>
                  <p className="text-foreground mb-3">
                  Modern visitor identification solutions are designed to comply with major privacy regulations:
                </p>
                  <ul className="space-y-2 text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>GDPR compliant:</strong> Uses legitimate interest legal basis for visitor identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>CCPA compliant:</strong> Provides opt-out mechanisms and data deletion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Privacy-focused:</strong> Contact information is collected in compliance with privacy standards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Transparent:</strong> Clear privacy policies and user disclosures</span>
                  </li>
                </ul>
              </Card>
            </div>
          </section>

          {/* Section C: The Math Behind Lost Revenue */}
          <section id="math" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">The Math Behind Lost Revenue</h2>
                <p className="text-lg text-muted-foreground">How we calculate your hidden opportunity</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p>
                Understanding exactly how much revenue you're losing to anonymous traffic requires a methodical calculation. 
                Here's the detailed methodology we use in our calculator:
              </p>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 1: Calculate Total Addressable Visitors</h3>
              
              <Card className="p-6 bg-muted">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Total Monthly Visitors = Organic Traffic + Paid Traffic
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We combine both organic and paid traffic sources to get your total addressable audience. 
                    Each source has different intent levels and conversion potential.
                  </p>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 2: Identify Anonymous Visitors</h3>
              
              <Card className="p-6 bg-muted">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Anonymous Visitors = Total Visitors × (1 - Form Conversion Rate)
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Assuming a typical form conversion rate of 2%, that means 98% of your visitors remain anonymous. 
                    For 10,000 monthly visitors, that's 9,800 potential leads walking away.
                  </p>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 3: Calculate Recoverable Leads</h3>
              
              <Card className="p-6 bg-muted">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Recoverable Leads = Anonymous Visitors × Identification Rate
                    </div>
                  </div>
                  <div className="text-sm space-y-2 text-muted-foreground">
                    <p><strong>Identification Rate (25-40%):</strong> Percentage of visitors that can be successfully identified with company information</p>
                    <p><strong>Example:</strong> 9,800 anonymous visitors × 30% identification rate = 2,940 recoverable leads per month</p>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 4: Estimate Lost Sales</h3>
              
              <Card className="p-6 bg-muted">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Lost Sales = Recoverable Leads × Conversion Rate
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Using a standard 1% conversion rate as an example (1 sale per 100 leads), those 2,940 missed leads represent approximately 29 lost sales per month.
                  </p>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 5: Calculate Revenue Impact</h3>
              
              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Monthly Lost Revenue = Lost Sales × Average Transaction Value
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-background rounded-lg border border-primary/30">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground mb-1">Example Calculation:</div>
                      <div className="text-xl font-semibold text-foreground">29 sales × $5,000 = <span className="text-primary">$145,000</span></div>
                      <div className="text-sm text-muted-foreground mt-2">That's $145K in monthly lost revenue, or <strong>$1.74M annually</strong></div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="my-8 text-center bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-lg border border-primary/20">
                <h4 className="text-2xl font-bold mb-3 text-foreground">See Your Exact Numbers</h4>
                <p className="text-muted-foreground mb-6">Our calculator will show you the precise revenue opportunity for your business based on your actual traffic and transaction values.</p>
                <Button asChild size="lg" className="text-base" onClick={scrollToTop}>
                  <Link to="/">
                    Run Your Free Report <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Section D: How Businesses Use This Data */}
          <section id="use-cases" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">How Businesses Use This Data</h2>
                <p className="text-lg text-muted-foreground">Real-world applications and use cases</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p>
                Once you can identify anonymous visitors, the strategic possibilities multiply. Here are the most effective 
                ways businesses are using visitor identification data to drive revenue:
              </p>

              <div className="space-y-6 mt-8">
                {/* Use Case 1 */}
                <Card className="p-6 border-l-4 border-l-primary">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Zap className="h-6 w-6 text-primary" />
                    1. Targeted Sales Outreach
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Export high-intent visitor lists directly to your CRM and trigger personalized 
                    outreach sequences based on the pages they visited.
                  </p>
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">B2B Example:</p>
                      <p className="text-sm text-muted-foreground">
                        A SaaS company identified 437 visitors who viewed their pricing page 3+ times. Their sales 
                        team reached out within 24 hours with personalized demos. Result: <strong>18% conversion rate</strong> 
                        (vs. 2% from cold leads).
                      </p>
                    </Card>
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">Ecommerce Example:</p>
                      <p className="text-sm text-muted-foreground">
                        An online furniture store identified visitors browsing high-ticket items ($2K+). Personalized emails with 
                        limited-time offers converted at <strong>9.2%</strong> vs. 1.3% for generic campaigns.
                      </p>
                    </Card>
                  </div>
                </Card>

                {/* Use Case 2 */}
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-500" />
                    2. Email Retargeting Campaigns
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Build automated email sequences triggered by specific visitor behaviors, 
                    sending relevant content based on the exact products or pages they viewed.
                  </p>
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">Ecommerce Example:</p>
                      <p className="text-sm text-muted-foreground">
                        A fashion retailer captured emails of visitors who abandoned product pages. Their 3-email 
                        nurture sequence recovered <strong>$127K in monthly revenue</strong> from visitors who never filled out a form.
                      </p>
                    </Card>
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">Services Example:</p>
                      <p className="text-sm text-muted-foreground">
                        A home services company sent follow-up emails to visitors who viewed their service pages but didn't request quotes. 
                        Achieved <strong>$84K in additional monthly bookings</strong>.
                      </p>
                    </Card>
                  </div>
                </Card>

                {/* Use Case 3 */}
                <Card className="p-6 border-l-4 border-l-green-500">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-500" />
                    3. High-Value Customer Acquisition
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Identify and prioritize visitors showing high purchase intent or fitting your ideal 
                    customer profile, then create targeted campaigns to convert them.
                  </p>
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">B2B Example:</p>
                      <p className="text-sm text-muted-foreground">
                        An enterprise software company identified 63 Fortune 500 decision-makers visiting their site anonymously. 
                        Their sales team launched targeted campaigns and closed <strong>$2.1M in deals</strong> within 90 days.
                      </p>
                    </Card>
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">Luxury Retail Example:</p>
                      <p className="text-sm text-muted-foreground">
                        A high-end watch retailer identified affluent visitors (income $250K+) and sent VIP invitations to private shopping events. 
                        Converted <strong>23 customers averaging $12K</strong> each.
                      </p>
                    </Card>
                  </div>
                </Card>

                {/* Use Case 4 */}
                <Card className="p-6 border-l-4 border-l-purple-500">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-purple-500" />
                    4. Lookalike Audience Building
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Use identified visitor data to create highly qualified lookalike audiences 
                    for paid advertising on Facebook, LinkedIn, and Google Ads.
                  </p>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground">
                      A fitness equipment brand built Facebook lookalikes from 3,200 identified high-intent visitors. Their new campaigns 
                      achieved <strong>3.2x better ROAS</strong> and 47% lower cost-per-acquisition compared to generic targeting.
                    </p>
                  </Card>
                </Card>

                {/* Use Case 5 */}
                <Card className="p-6 border-l-4 border-l-orange-500">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-6 w-6 text-orange-500" />
                    5. Lead Scoring & Prioritization
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Score identified visitors based on behavioral signals (pages viewed, time on site, 
                    return visits) and demographic/firmographic data to prioritize outreach efforts.
                  </p>
                  <div className="space-y-3">
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">B2B Example:</p>
                      <p className="text-sm text-muted-foreground">
                        A marketing agency built a lead scoring model using visitor identification data. By focusing on the top 20% 
                        of scored leads, their close rate improved from <strong>12% to 34%</strong>.
                      </p>
                    </Card>
                    <Card className="p-4 bg-muted">
                      <p className="text-sm font-medium mb-2">B2C Example:</p>
                      <p className="text-sm text-muted-foreground">
                        An online course platform scored visitors by engagement level and purchasing power. Prioritizing the top segment 
                        increased conversion rates by <strong>2.8x</strong>.
                      </p>
                    </Card>
                  </div>
                </Card>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 mt-8">
                <h4 className="text-lg font-semibold mb-3 text-foreground">The Multi-Channel Advantage</h4>
                <p className="text-foreground">
                  The most successful companies don't pick just one use case—they layer multiple strategies together. By combining 
                  sales outreach, email nurture, paid retargeting, and ABM campaigns, you create a comprehensive system that 
                  captures value from every stage of the buyer journey.
                </p>
              </Card>
            </div>
          </section>

          {/* Section E: Implementation & Technical Details */}
          <section id="implementation" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Implementation & Technical Details</h2>
                <p className="text-lg text-muted-foreground">What you actually get and how it works</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <h3 className="text-2xl font-semibold mt-8 mb-4">How Easy Is It to Implement?</h3>
              
              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="flex gap-3 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2 text-foreground">One Simple Script</h4>
                    <p className="text-foreground">
                      Most visitor identification solutions require just a single JavaScript snippet added to your website—similar 
                      to installing Google Analytics. No complex integration, no developer resources required.
                    </p>
                  </div>
                </div>
                <div className="bg-background p-4 rounded-lg border border-border font-mono text-sm mt-4">
                  {`<script src="visitor-id.js"></script>`}
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Typical implementation time: <strong>5-10 minutes</strong>
                </p>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">What You Actually Get (Not Guesses, Real Data)</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Contact Information
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full names</li>
                    <li>• Email addresses</li>
                    <li>• Phone numbers</li>
                    <li>• Street addresses</li>
                    <li>• Job titles & companies</li>
                  </ul>
                </Card>

                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Financial Profile
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Net worth estimates</li>
                    <li>• Annual income ranges</li>
                    <li>• Mortgage values</li>
                    <li>• Credit rating indicators</li>
                    <li>• Property ownership</li>
                  </ul>
                </Card>

                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-primary" />
                    Demographics & More
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Age & family status</li>
                    <li>• Education level</li>
                    <li>• Lifestyle indicators</li>
                    <li>• Purchase behavior</li>
                    <li>• 10+ additional attributes</li>
                  </ul>
                </Card>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Integration with Your Tech Stack</h3>

              <p>
                Modern visitor identification platforms integrate seamlessly with your existing marketing and sales tools:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
                {['Salesforce', 'HubSpot', 'Shopify', 'WooCommerce', 'Mailchimp', 'ActiveCampaign', 'Klaviyo', 'Stripe', 'Slack', 'Zapier'].map(tool => (
                  <Card key={tool} className="p-3 text-center text-sm font-medium">
                    {tool}
                  </Card>
                ))}
              </div>

            </div>
          </section>

          {/* Section F: ROI & Pricing */}
          <section id="roi" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <LineChart className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">ROI & Pricing Considerations</h2>
                <p className="text-lg text-muted-foreground">Understanding the investment and returns</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <h3 className="text-2xl font-semibold mt-8 mb-4">How Most Competitors Charge</h3>

              <p>
                Most visitor identification platforms in the market use one of these pricing structures:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <Card className="p-5">
                  <h4 className="font-semibold mb-2">Per-Visitor</h4>
                  <p className="text-2xl font-bold text-primary mb-2">$0.50-$2</p>
                  <p className="text-sm text-muted-foreground">per identified visitor</p>
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-2">Monthly Flat</h4>
                  <p className="text-2xl font-bold text-primary mb-2">$500-$5K</p>
                  <p className="text-sm text-muted-foreground">per month + overages</p>
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-2">Annual Contract</h4>
                  <p className="text-2xl font-bold text-primary mb-2">$10K-$50K</p>
                  <p className="text-sm text-muted-foreground">per year (discounted)</p>
                </Card>
              </div>

              <div className="my-8 p-6 bg-primary/10 rounded-lg border-l-4 border-primary">
                <p className="text-lg font-semibold mb-2">
                  NurturelyX takes a different approach with transparent, affordable pricing:
                </p>
                <p className="text-muted-foreground">
                  Just $100/month platform fee + $1 per identified lead. No hidden fees, no annual contracts, no surprises.
                </p>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">NurturelyX ROI Example</h3>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-4 text-foreground">Real Numbers with NurturelyX</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Monthly platform fee:</span>
                    <span className="font-semibold">$100</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Visitors identified per month:</span>
                    <span className="font-semibold">2,940 leads</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Credit cost (2,940 × $1):</span>
                    <span className="font-semibold">$2,940</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Total monthly cost:</span>
                    <span className="font-semibold">$3,040</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Cost per identified lead:</span>
                    <span className="font-semibold">$1.03</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Close rate (1%):</span>
                    <span className="font-semibold">29 sales</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Average transaction value:</span>
                    <span className="font-semibold">$5,000</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-base">Monthly revenue generated:</span>
                    <span className="text-2xl font-bold text-primary">$145K</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-3 border-t-2 border-primary">
                    <span className="font-bold text-base">ROI:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">4,667%</span>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Payback Period</h3>

              <p>
                For most businesses with average transaction values above $1,000 (B2B contracts, ecommerce orders, service packages), the typical payback period is:
              </p>

              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">1-2 Days</div>
                  <p className="text-foreground">
                    That's right—most companies recover their monthly investment within the first 48 hours of implementation.
                  </p>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">What to Look for in a Solution</h3>

              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold">High Match Rate</h5>
                      <p className="text-sm text-muted-foreground">Look for 25-40% identification rate on your traffic</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold">Data Quality Guarantee</h5>
                      <p className="text-sm text-muted-foreground">Verified contact info with regular database updates</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold">CRM Integration</h5>
                      <p className="text-sm text-muted-foreground">Native integrations with your existing sales stack</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold">Behavioral Data</h5>
                      <p className="text-sm text-muted-foreground">Full visitor journey tracking, not just contact info</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-semibold">Compliance & Privacy</h5>
                      <p className="text-sm text-muted-foreground">GDPR and CCPA compliant with transparent policies</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="my-8 text-center">
                <Button 
                  size="lg" 
                  className="text-base"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  Calculate Your Potential ROI <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* Section G: Privacy & Compliance */}
          <section id="privacy" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Privacy & Compliance</h2>
                <p className="text-lg text-muted-foreground">How compliant solutions protect user privacy</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p>
                Privacy compliance isn't optional—it's essential. Here's how responsible visitor identification solutions 
                handle user privacy while staying fully compliant with major regulations.
              </p>

              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg mb-8">
                <h4 className="font-semibold text-lg mb-3 text-foreground">✅ Our Commitment to Privacy and Compliance</h4>
                <p className="text-foreground mb-3">
                  NurturelyX is fully compliant with GDPR, CCPA, and all major data privacy regulations.
                </p>
                <p className="text-foreground mb-3">
                  Our technology unlocks <strong>your first-party data</strong> - information your website already collects that is lawfully yours under Article 6(1)(f) legitimate interest principles. We simply reveal the identities behind your own website visitors by matching your data with verified business contact databases.
                </p>
                <p className="text-foreground">
                  We never sell, share, or use your data for advertising or remarketing purposes. This is your data - we just help you unlock it.
                </p>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">GDPR Compliance (EU)</h3>

              <Card className="p-6 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold mb-3 text-foreground">Legitimate Interest Legal Basis - Article 6(1)(f)</h4>
                <p className="text-foreground mb-4">
                  For visitor identification, NurturelyX relies on the "legitimate interest" legal basis under GDPR Article 6(1)(f). 
                  This allows processing of business contact data when there's a genuine business interest and the processing doesn't 
                  override individual rights.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>First-party data only:</strong> We process only data your website legitimately collects</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Consent-based sources:</strong> All identities from lawful, opt-in sources (company domains, professional contacts)</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Data Minimization:</strong> Only collect necessary business contact information</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Right to Object:</strong> Clear opt-out mechanisms available</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Transparency:</strong> Privacy policies clearly explain data usage</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Data Processing Agreement (DPA):</strong> Every customer receives comprehensive documentation</span>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">CCPA Compliance (California)</h3>

              <Card className="p-6 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
                <h4 className="font-semibold mb-3 text-foreground">Consumer Privacy Rights</h4>
                <p className="text-foreground mb-4">
                  The California Consumer Privacy Act requires specific disclosures and consumer rights. <strong>NurturelyX never sells consumer data</strong> and maintains full transparency:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>No Data Selling:</strong> We never sell, share, or store consumer data for advertising purposes</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Notice at Collection:</strong> Clear disclosure of data collection practices</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Right to Know:</strong> Provide access to collected business information</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Right to Delete:</strong> Honor deletion requests within 45 days</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>B2B Focus:</strong> Designed exclusively for business-to-business lead generation</span>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Your Data Processing Agreement (DPA)</h3>

              <Card className="p-6 bg-muted/50">
                <p className="text-foreground mb-4">
                  Every customer of NurturelyX receives a comprehensive Data Processing Agreement that details:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Data Matching & Storage</strong>
                      <p className="text-sm text-muted-foreground">How we match and securely store visitor data</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Retention Periods</strong>
                      <p className="text-sm text-muted-foreground">Clear timelines for data storage</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Access & Erasure Rights</strong>
                      <p className="text-sm text-muted-foreground">How visitors can request their data</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>DPO Contact Details</strong>
                      <p className="text-sm text-muted-foreground">Direct line to our compliance team</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-center mt-6 p-4 bg-background rounded-lg border">
                  For EU/UK visitors: Contact our Data Protection Officer at <a href="mailto:privacy@nurturely.io" className="text-primary hover:underline font-semibold">privacy@nurturely.io</a> to request access, correction, or deletion of any personal data associated with you.
                </p>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">IP Tracking vs. Identity Resolution</h3>

              <p>
                It's important to understand the difference between basic IP tracking (which most analytics tools do) and 
                identity resolution (which reveals personal contact information):
              </p>

              <div className="overflow-x-auto my-6">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Aspect</th>
                      <th className="border border-border p-3 text-left">IP Tracking</th>
                      <th className="border border-border p-3 text-left">Identity Resolution</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-3 font-medium">Data Revealed</td>
                      <td className="border border-border p-3">Company name, location OR visitor segment</td>
                      <td className="border border-border p-3">Full contact details (email, phone, address)</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Privacy Impact</td>
                      <td className="border border-border p-3">Low (anonymous)</td>
                      <td className="border border-border p-3">Higher (PII involved)</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Consent Required</td>
                      <td className="border border-border p-3">Generally no</td>
                      <td className="border border-border p-3">Depends on jurisdiction</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Use Cases</td>
                      <td className="border border-border p-3">Analytics, ABM targeting OR audience segmentation</td>
                      <td className="border border-border p-3">Direct outreach, email marketing, personalization</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Building Trust with Visitors</h3>

              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <h4 className="font-semibold mb-3 text-foreground">Best Practices for Ethical Implementation</h4>
                <div className="space-y-3 text-sm">
                  <p className="text-foreground">
                    <strong>1. Transparent Privacy Policy:</strong> Clearly explain what data you collect and how it's used
                  </p>
                  <p className="text-foreground">
                    <strong>2. Easy Opt-Out:</strong> Provide simple mechanisms for visitors to opt out of identification
                  </p>
                  <p className="text-foreground">
                    <strong>3. Relevant Outreach Only:</strong> Don't spam identified visitors—only reach out with genuinely valuable offers
                  </p>
                  <p className="text-foreground">
                    <strong>4. Secure Data Storage:</strong> Use encryption and follow security best practices
                  </p>
                  <p className="text-foreground">
                    <strong>5. Respect Preferences:</strong> Honor unsubscribe requests immediately
                  </p>
                </div>
              </Card>
            </div>
          </section>

          {/* Section H: Getting Started */}
          <section id="getting-started" className="mb-16 scroll-mt-20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
                <p className="text-lg text-muted-foreground">Your roadmap to capturing anonymous traffic</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <h3 className="text-2xl font-semibold mt-8 mb-4">Step-by-Step Implementation Plan</h3>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Calculate Your Opportunity",
                    description: "Use our free calculator to see exactly how much revenue you're losing to anonymous traffic. This gives you a baseline to measure success against.",
                    cta: "Run Your Free Report"
                  },
                  {
                    step: "2",
                    title: "Choose Your Solution",
                    description: "Research 2-3 visitor identification platforms. Compare match rates, pricing, and integration capabilities. Request demos and ask for case studies in your industry."
                  },
                  {
                    step: "3",
                    title: "Start with a Pilot",
                    description: "Begin with a 30-60 day pilot program. Track key metrics: identification rate, lead quality, cost per identified lead, and closed revenue."
                  },
                  {
                    step: "4",
                    title: "Set Up Workflows",
                    description: "Create automated processes for identified visitors: CRM enrichment, sales alerts, email sequences, and retargeting audiences."
                  },
                  {
                    step: "5",
                    title: "Train Your Team",
                    description: "Ensure sales and marketing teams understand the new data source and how to prioritize identified leads based on intent signals."
                  },
                  {
                    step: "6",
                    title: "Measure & Optimize",
                    description: "Track conversion rates, revenue attribution, and ROI. Continuously refine your approach based on what's working."
                  }
                ].map((item) => (
                  <Card key={item.step} className="p-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2">{item.title}</h4>
                        <p className="text-foreground mb-3">{item.description}</p>
                        {item.cta && (
                          <Button asChild variant="outline" size="sm" onClick={scrollToTop}>
                            <Link to="/">
                              {item.cta} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <h3 className="text-2xl font-semibold mt-12 mb-4">What to Measure</h3>

              <Card className="p-6 bg-muted">
                <h4 className="font-semibold mb-4">Key Performance Indicators</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium mb-1">📊 Identification Rate</p>
                    <p className="text-muted-foreground">% of traffic successfully identified</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">💰 Cost Per Lead</p>
                    <p className="text-muted-foreground">Total cost / identified leads</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">✅ Lead Quality Score</p>
                    <p className="text-muted-foreground">% matching your ICP criteria</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">🎯 Conversion Rate</p>
                    <p className="text-muted-foreground">Identified leads → closed customers</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">⏱️ Time to Close</p>
                    <p className="text-muted-foreground">Days from identification to sale</p>
                  </div>
                  <div>
                    <p className="font-medium mb-1">📈 Revenue Attribution</p>
                    <p className="text-muted-foreground">$ closed from identified visitors</p>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-12 mb-4">Timeline Expectations</h3>

              <div className="space-y-3">
                <Card className="p-4 border-l-4 border-l-green-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Week 1: Implementation</p>
                      <p className="text-sm text-muted-foreground">Install script, verify tracking, set up integrations</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Week 2-4: Initial Results</p>
                      <p className="text-sm text-muted-foreground">First identified leads, early outreach campaigns</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-purple-500">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Month 2-3: Optimization</p>
                      <p className="text-sm text-muted-foreground">Refine workflows, improve conversion rates</p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">Month 3+: Scale</p>
                      <p className="text-sm text-muted-foreground">Proven ROI, expand use cases, increase investment</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Final CTA Section */}
          <section className="my-16 p-12 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl border border-primary/20 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Ready to Capture Your Lost Revenue?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              See exactly how much money you're leaving on the table with anonymous traffic. 
              Get your personalized report in under 2 minutes.
            </p>
            <Button asChild size="lg" className="text-lg px-10 py-7" onClick={scrollToTop}>
              <Link to="/">
                Calculate Your Hidden Revenue Now <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Free report • No credit card required • Takes 60 seconds
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default LearnPage;
