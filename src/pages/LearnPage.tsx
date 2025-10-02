import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Workflow
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LearnPage = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Helmet>
        <title>Website Visitor Identification Guide 2025: Convert Anonymous Traffic | Complete Guide</title>
        <meta 
          name="description" 
          content="Learn how to identify anonymous website visitors and convert 98% of lost traffic into qualified leads. Complete guide to visitor identification technology, ROI calculation, and implementation strategies." 
        />
        <meta name="keywords" content="website visitor identification, anonymous traffic conversion, identify website visitors, visitor tracking software, lead generation technology, visitor identification ROI" />
        <link rel="canonical" href={`${window.location.origin}/learn`} />
        
        {/* Schema.org markup for Article */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "The Complete Guide to Website Visitor Identification & Anonymous Traffic Conversion",
            "description": "Comprehensive guide explaining how businesses identify anonymous website visitors and convert lost traffic into revenue",
            "author": {
              "@type": "Organization",
              "name": "Lead Estimation Report"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Lead Estimation Report"
            },
            "datePublished": "2025-01-01",
            "dateModified": new Date().toISOString().split('T')[0]
          })}
        </script>

        {/* Schema.org markup for HowTo */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Identify Anonymous Website Visitors",
            "description": "Step-by-step guide to implementing visitor identification technology",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Calculate Your Lost Revenue",
                "text": "Use our calculator to see how much revenue you're losing from anonymous traffic"
              },
              {
                "@type": "HowToStep",
                "name": "Understand Your Traffic",
                "text": "Analyze your visitor patterns and identify high-value anonymous visitors"
              },
              {
                "@type": "HowToStep",
                "name": "Implement Identification",
                "text": "Deploy visitor identification technology to capture anonymous visitor data"
              },
              {
                "@type": "HowToStep",
                "name": "Convert to Revenue",
                "text": "Use identified visitor data for targeted outreach and retargeting campaigns"
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 bg-gradient-to-br from-primary/5 via-background to-background">
          <div className="container max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                The Complete Guide to Website Visitor Identification & Anonymous Traffic Conversion
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8">
                Why 98% of your website traffic leaves without a trace—and how modern businesses are capturing these lost opportunities
              </p>
              <Link to="/">
                <Button size="lg" className="text-lg px-8 py-6">
                  Calculate Your Hidden Revenue <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
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
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-foreground">
                  <Users className="h-5 w-5" />
                  The Hard Truth About Website Conversion
                </h3>
                <ul className="space-y-2 text-gray-900 dark:text-foreground">
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
                    <span><strong>67% of B2B buyers</strong> research your company multiple times before engaging</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Traditional forms convert at 2-3%</strong> in B2B industries</span>
                  </li>
                </ul>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Why Traditional Lead Capture Fails</h3>
              
              <p>
                Most businesses rely on forms, CTAs, and gated content to capture leads. While these tactics work for a small 
                percentage of highly motivated visitors, they completely miss the majority of your traffic:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <Card className="p-5">
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">❌ Early-Stage Researchers</h4>
                  <p className="text-sm text-muted-foreground">Not ready to provide contact info yet, but actively comparing solutions</p>
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">❌ Form-Fatigued Visitors</h4>
                  <p className="text-sm text-muted-foreground">Already receiving too many emails and avoiding more subscriptions</p>
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">❌ Mobile Browsers</h4>
                  <p className="text-sm text-muted-foreground">Less likely to fill out forms on mobile devices</p>
                </Card>
                <Card className="p-5">
                  <h4 className="font-semibold mb-2 text-red-600 dark:text-red-400">❌ High-Intent Silent Buyers</h4>
                  <p className="text-sm text-muted-foreground">Visit multiple times, research thoroughly, then buy from a competitor</p>
                </Card>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">The Real Dollar Cost</h3>
              
              <p>
                Let's put this in perspective with real numbers. If your website receives <strong>10,000 monthly visitors</strong> 
                and your average transaction value is <strong>$5,000</strong>:
              </p>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="space-y-3 text-gray-900 dark:text-foreground">
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
                <Link to="/">
                  <Button size="lg" className="text-base">
                    Calculate YOUR Lost Revenue <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
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
                <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-foreground">
                  <Workflow className="h-5 w-5" />
                  The Identification Process
                </h4>
                <ol className="space-y-4 text-gray-900 dark:text-foreground">
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
                      <p className="text-sm text-muted-foreground mt-1">Signals are cross-referenced with proprietary databases containing millions of business and consumer profiles</p>
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
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-gray-900 dark:text-foreground">15-40% of visitors</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">User Friction</td>
                      <td className="border border-border p-3">High (requires form fill)</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-gray-900 dark:text-foreground">None (automatic)</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Data Quality</td>
                      <td className="border border-border p-3">Variable (self-reported)</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-gray-900 dark:text-foreground">High (verified databases)</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Implementation</td>
                      <td className="border border-border p-3">Requires design & testing</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-gray-900 dark:text-foreground">Single script install</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3 font-medium">Behavioral Data</td>
                      <td className="border border-border p-3">Limited to post-conversion</td>
                      <td className="border border-border p-3 bg-green-50 dark:bg-green-950/20 text-gray-900 dark:text-foreground">Full visitor journey</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Privacy & Compliance</h3>

              <Card className="p-6 border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
                <div className="flex gap-3 mb-3">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-foreground">Compliant Visitor Identification</h4>
                </div>
                <p className="text-gray-900 dark:text-foreground mb-3">
                  Modern visitor identification solutions are designed to comply with major privacy regulations:
                </p>
                <ul className="space-y-2 text-gray-900 dark:text-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>GDPR compliant:</strong> Uses legitimate interest legal basis for B2B identification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>CCPA compliant:</strong> Provides opt-out mechanisms and data deletion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span><strong>No PII storage:</strong> Only business contact information is revealed</span>
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
                    Assuming a typical B2B form conversion rate of 2%, that means 98% of your visitors remain anonymous. 
                    For 10,000 monthly visitors, that's 9,800 potential leads walking away.
                  </p>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 3: Calculate Recoverable Leads</h3>
              
              <Card className="p-6 bg-muted">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Recoverable Leads = Anonymous Visitors × Identification Rate × Qualification Rate
                    </div>
                  </div>
                  <div className="text-sm space-y-2 text-muted-foreground">
                    <p><strong>Identification Rate (25-40%):</strong> Percentage of visitors that can be successfully identified</p>
                    <p><strong>Qualification Rate (40-60%):</strong> Percentage of identified visitors that match your ICP</p>
                    <p><strong>Example:</strong> 9,800 × 30% × 50% = 1,470 missed leads per month</p>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Step 4: Estimate Lost Sales</h3>
              
              <Card className="p-6 bg-muted">
                <div className="space-y-4">
                  <div>
                    <div className="font-mono text-sm bg-background p-3 rounded border border-border">
                      Lost Sales = Recoverable Leads × Close Rate
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Using a conservative B2B close rate of 10-15%, those 1,470 missed leads represent 147-220 lost sales per month.
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
                      <div className="text-xl font-semibold text-gray-900 dark:text-foreground">147 sales × $5,000 = <span className="text-primary">$735,000</span></div>
                      <div className="text-sm text-muted-foreground mt-2">That's $735K in monthly lost revenue, or <strong>$8.8M annually</strong></div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="my-8 text-center bg-gradient-to-r from-primary/10 to-primary/5 p-8 rounded-lg border border-primary/20">
                <h4 className="text-2xl font-bold mb-3 text-gray-900 dark:text-foreground">See Your Exact Numbers</h4>
                <p className="text-muted-foreground mb-6">Our calculator will show you the precise revenue opportunity for your business based on your actual traffic and transaction values.</p>
                <Link to="/">
                  <Button size="lg" className="text-base">
                    Run Your Free Report <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
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
                  <Card className="p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground">
                      A B2B SaaS company identified 437 anonymous visitors who viewed their pricing page 3+ times. Their sales 
                      team reached out within 24 hours with personalized demos. Result: <strong>18% conversion rate</strong> 
                      (vs. 2% from cold leads).
                    </p>
                  </Card>
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
                  <Card className="p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground">
                      An ecommerce brand captured emails of visitors who abandoned high-value product pages. Their 3-email 
                      nurture sequence recovered <strong>$127K in monthly revenue</strong> from visitors who never filled out a form.
                    </p>
                  </Card>
                </Card>

                {/* Use Case 3 */}
                <Card className="p-6 border-l-4 border-l-green-500">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-6 w-6 text-green-500" />
                    3. Lookalike Audience Building
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Use identified visitor data to create highly qualified lookalike audiences 
                    for paid advertising on Facebook, LinkedIn, and Google Ads.
                  </p>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground">
                      A consulting firm built Facebook lookalikes from 2,400 identified high-intent visitors. Their new campaigns 
                      achieved <strong>3.2x better ROAS</strong> and 47% lower cost-per-lead compared to generic targeting.
                    </p>
                  </Card>
                </Card>

                {/* Use Case 4 */}
                <Card className="p-6 border-l-4 border-l-purple-500">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <LineChart className="h-6 w-6 text-purple-500" />
                    4. Account-Based Marketing (ABM)
                  </h3>
                  <p className="text-foreground mb-3">
                    <strong>The Strategy:</strong> Identify companies (not just individuals) visiting your site and trigger 
                    multi-channel ABM campaigns targeting key decision-makers at those organizations.
                  </p>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground">
                      An enterprise software company identified 63 Fortune 500 companies visiting their site anonymously. 
                      Their ABM team launched targeted campaigns and closed <strong>$2.1M in deals</strong> within 90 days.
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
                    return visits) and firmographic data (company size, industry, revenue) to prioritize sales efforts.
                  </p>
                  <Card className="p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Real Example:</p>
                    <p className="text-sm text-muted-foreground">
                      A marketing agency built a lead scoring model using visitor identification data. By focusing on the top 20% 
                      of scored leads, their close rate improved from <strong>12% to 34%</strong>.
                    </p>
                  </Card>
                </Card>
              </div>

              <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 mt-8">
                <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-foreground">The Multi-Channel Advantage</h4>
                <p className="text-gray-900 dark:text-foreground">
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
                    <h4 className="font-semibold text-lg mb-2 text-gray-900 dark:text-foreground">One Simple Script</h4>
                    <p className="text-gray-900 dark:text-foreground">
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

              <h3 className="text-2xl font-semibold mt-8 mb-4">What Data Do You Actually Get?</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Contact Information
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Full name</li>
                    <li>• Email address</li>
                    <li>• Phone number</li>
                    <li>• Job title</li>
                    <li>• LinkedIn profile</li>
                  </ul>
                </Card>

                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Firmographic Data
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Company name</li>
                    <li>• Industry/vertical</li>
                    <li>• Company size</li>
                    <li>• Revenue range</li>
                    <li>• Location/HQ</li>
                  </ul>
                </Card>

                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" />
                    Behavioral Insights
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Pages visited</li>
                    <li>• Time on site</li>
                    <li>• Return visit frequency</li>
                    <li>• Content consumed</li>
                    <li>• Download activity</li>
                  </ul>
                </Card>

                <Card className="p-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Intent Signals
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Buying stage</li>
                    <li>• Interest level score</li>
                    <li>• Engagement metrics</li>
                    <li>• Conversion likelihood</li>
                    <li>• Urgency indicators</li>
                  </ul>
                </Card>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Integration with Your Tech Stack</h3>

              <p>
                Modern visitor identification platforms integrate seamlessly with your existing marketing and sales tools:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
                {['Salesforce', 'HubSpot', 'Marketo', 'Pardot', 'Mailchimp', 'ActiveCampaign', 'Slack', 'Zapier'].map(tool => (
                  <Card key={tool} className="p-3 text-center text-sm font-medium">
                    {tool}
                  </Card>
                ))}
              </div>

              <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-foreground">Real-Time Data Flow</h4>
                <p className="text-gray-900 dark:text-foreground text-sm">
                  Identified visitor data flows into your CRM within minutes of their visit. Set up automated workflows to 
                  trigger sales alerts, add to nurture sequences, or create retargeting audiences—all without manual intervention.
                </p>
              </Card>
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
              <h3 className="text-2xl font-semibold mt-8 mb-4">Typical Pricing Models</h3>

              <p>
                Visitor identification solutions typically use one of these pricing structures:
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

              <h3 className="text-2xl font-semibold mt-8 mb-4">ROI Calculation Framework</h3>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <h4 className="font-semibold mb-4 text-gray-900 dark:text-foreground">Example ROI Scenario</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Monthly software cost:</span>
                    <span className="font-semibold">$2,000</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Visitors identified per month:</span>
                    <span className="font-semibold">2,940 leads</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Cost per identified lead:</span>
                    <span className="font-semibold">$0.68</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Close rate (conservative 10%):</span>
                    <span className="font-semibold">294 sales</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-border">
                    <span className="text-muted-foreground">Average transaction value:</span>
                    <span className="font-semibold">$5,000</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-base">Monthly revenue generated:</span>
                    <span className="text-2xl font-bold text-primary">$1.47M</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-3 border-t-2 border-primary">
                    <span className="font-bold text-base">ROI:</span>
                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">73,500%</span>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Payback Period</h3>

              <p>
                For most B2B businesses with average transaction values above $1,000, the typical payback period is:
              </p>

              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <div className="text-center">
                  <div className="text-5xl font-bold text-green-600 dark:text-green-400 mb-2">1-2 Days</div>
                  <p className="text-gray-900 dark:text-foreground">
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
                <Link to="/">
                  <Button size="lg" className="text-base">
                    Calculate Your Potential ROI <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
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

              <h3 className="text-2xl font-semibold mt-8 mb-4">GDPR Compliance (EU)</h3>

              <Card className="p-6 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-foreground">Legitimate Interest Legal Basis</h4>
                <p className="text-gray-900 dark:text-foreground mb-4">
                  For B2B visitor identification, most solutions rely on the "legitimate interest" legal basis under GDPR Article 6(1)(f). 
                  This allows processing of business contact data when there's a genuine business interest and the processing doesn't 
                  override individual rights.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Legitimate Interest Assessment (LIA):</strong> Documented justification for processing</span>
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
                </div>
              </Card>

              <h3 className="text-2xl font-semibold mt-8 mb-4">CCPA Compliance (California)</h3>

              <Card className="p-6 border-purple-200 dark:border-purple-900 bg-purple-50 dark:bg-purple-950/20">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-foreground">Consumer Privacy Rights</h4>
                <p className="text-gray-900 dark:text-foreground mb-4">
                  The California Consumer Privacy Act requires specific disclosures and consumer rights for California residents:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Notice at Collection:</strong> Inform visitors about data collection practices</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Right to Know:</strong> Provide access to collected personal information</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Right to Delete:</strong> Honor deletion requests within 45 days</span>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Do Not Sell:</strong> Respect "Do Not Sell My Info" requests</span>
                  </div>
                </div>
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
                      <td className="border border-border p-3">Company name, location</td>
                      <td className="border border-border p-3">Full contact details</td>
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
                      <td className="border border-border p-3">Analytics, ABM targeting</td>
                      <td className="border border-border p-3">Direct outreach, personalization</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-2xl font-semibold mt-8 mb-4">Building Trust with Visitors</h3>

              <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                <h4 className="font-semibold mb-3 text-gray-900 dark:text-foreground">Best Practices for Ethical Implementation</h4>
                <div className="space-y-3 text-sm">
                  <p className="text-gray-900 dark:text-foreground">
                    <strong>1. Transparent Privacy Policy:</strong> Clearly explain what data you collect and how it's used
                  </p>
                  <p className="text-gray-900 dark:text-foreground">
                    <strong>2. Easy Opt-Out:</strong> Provide simple mechanisms for visitors to opt out of identification
                  </p>
                  <p className="text-gray-900 dark:text-foreground">
                    <strong>3. Relevant Outreach Only:</strong> Don't spam identified visitors—only reach out with genuinely valuable offers
                  </p>
                  <p className="text-gray-900 dark:text-foreground">
                    <strong>4. Secure Data Storage:</strong> Use encryption and follow security best practices
                  </p>
                  <p className="text-gray-900 dark:text-foreground">
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
                        <p className="text-gray-900 dark:text-foreground mb-3">{item.description}</p>
                        {item.cta && (
                          <Link to="/">
                            <Button variant="outline" size="sm">
                              {item.cta} <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-foreground">
              Ready to Capture Your Lost Revenue?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              See exactly how much money you're leaving on the table with anonymous traffic. 
              Get your personalized report in under 2 minutes.
            </p>
            <Link to="/">
              <Button size="lg" className="text-lg px-10 py-7">
                Calculate Your Hidden Revenue Now <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              Free report • No credit card required • Takes 60 seconds
            </p>
          </section>

        </div>

        <Footer />
      </div>
    </>
  );
};

export default LearnPage;
