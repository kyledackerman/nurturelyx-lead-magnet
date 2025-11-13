import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, TrendingDown, Users, Eye, MousePointer, DollarSign, CheckCircle2, AlertTriangle } from "lucide-react";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { GlobalSchemas } from "@/components/seo/GlobalSchemas";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { InternalLinkingWidget } from "@/components/seo/InternalLinkingWidget";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const WhyNoLeadsPage = () => {
  usePageViewTracking('marketing');

  const publishedDate = "2025-01-15T08:00:00Z";
  const updatedDate = "2025-01-15T08:00:00Z";
  const canonicalUrl = "https://x1.nurturely.io/why-website-not-getting-leads";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Learn", url: "/learn" },
    { name: "Why Your Website Isn't Getting Leads", url: "/why-website-not-getting-leads" }
  ];

  const faqItems = [
    {
      question: "Why is my website getting traffic but no leads?",
      answer: "Your website is likely attracting visitors, but 98% leave without filling out forms. The real issue is visitor anonymity - you can't follow up with people you can't identify. Identity resolution technology reveals who these anonymous visitors are, giving you their contact information even when they don't fill out a form."
    },
    {
      question: "What's the average website conversion rate?",
      answer: "Most B2B websites convert only 2-3% of visitors into leads through form fills. This means 97-98% of your traffic is anonymous and unreachable. With identity resolution, you can identify 35-40% of these anonymous visitors, potentially increasing your lead volume by 15-20x."
    },
    {
      question: "How much revenue am I losing from anonymous visitors?",
      answer: "If your website gets 10,000 monthly visitors with a 2% conversion rate and $5,000 average transaction value, you're generating $1M in annual pipeline. However, you're leaving $49M on the table from the 98% of visitors you never identify. Use our free calculator to see your exact numbers."
    },
    {
      question: "What's the difference between identity resolution and traditional lead generation?",
      answer: "Traditional lead generation relies on visitors voluntarily filling out forms (2-3% conversion). Identity resolution uses reverse IP lookup and data enrichment to automatically identify 35-40% of visitors without requiring form fills. This gives you 15-20x more leads to follow up with."
    },
    {
      question: "Is identity resolution legal and compliant?",
      answer: "Yes. You're identifying individual consumers who visit your site and providing their contact information (names, emails, phones, addresses) - not tracking anonymous browsing behavior. This is consumer identity resolution, not corporate IP tracking. All data comes from verified public records and opt-in databases, fully compliant with GDPR, CCPA, and privacy regulations."
    }
  ];

  return (
    <>
      <GlobalSchemas />
      
      <BreadcrumbSchema items={breadcrumbs} />
      
      <Helmet>
        <title>Why Is My Website Not Getting Leads? [2025 Complete Guide]</title>
        <meta 
          name="description" 
          content="Your website gets traffic but no leads? Discover the hidden reason 98% of visitors leave without converting and how to identify them automatically. Free lead loss calculator included." 
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="keywords" content="website not getting leads, low website conversion, increase website leads, anonymous visitors, visitor identification, identity resolution, B2B lead generation" />
        <meta property="og:title" content="Why Is My Website Not Getting Leads? [2025 Complete Guide]" />
        <meta property="og:description" content="Your website gets traffic but no leads? Discover the hidden reason 98% of visitors leave without converting and how to identify them automatically." />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png" />
        <meta property="article:published_time" content={publishedDate} />
        <meta property="article:modified_time" content={updatedDate} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Why Is My Website Not Getting Leads? [2025 Complete Guide]" />
        <meta name="twitter:description" content="Discover why 98% of your website visitors leave without converting and how to identify them automatically." />
      </Helmet>

      <ArticleSchema
        title="Why Is My Website Not Getting Leads? The Complete 2025 Guide"
        description="A comprehensive analysis of why B2B websites fail to generate leads and the proven solution to identify 98% of anonymous visitors"
        publishedAt={publishedDate}
        updatedAt={updatedDate}
        author="NurturelyX"
        url={canonicalUrl}
        category="Lead Generation"
        wordCount={2800}
      />

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema questions={faqItems} />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Hero Section */}
          <article className="prose prose-lg max-w-none">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Why Is My Website Not Getting Leads?
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                The brutal truth about the 98% of visitors you're losing—and how to get them back
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>15 min read</span>
                <span>•</span>
                <span>Updated Jan 2025</span>
                <span>•</span>
                <span>2,800 words</span>
              </div>
            </div>

            {/* The Painful Reality */}
            <Alert className="mb-8 border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-base">
                <strong>The hard truth:</strong> If your website converts at 2% (industry average), you're losing 98% of your traffic to anonymity. For every 100 visitors, 98 leave without a trace—and you have no way to follow up with them.
              </AlertDescription>
            </Alert>

            {/* Calculate Your Lead Loss CTA */}
            <Card className="mb-12 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Calculate Your Exact Lead Loss</h3>
                    <p className="text-muted-foreground">
                      See how many leads and dollars you're leaving on the table every month
                    </p>
                  </div>
                  <Button asChild size="lg" className="whitespace-nowrap">
                    <Link to="/">
                      Get Free Report <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section 1: The Problem Everyone Faces */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
                <TrendingDown className="h-8 w-8 text-destructive" />
                The Problem Every Business Owner Faces
              </h2>
              
              <p className="text-lg mb-4">
                You've invested thousands in your website. Your SEO is solid. Traffic is flowing. Google Analytics shows hundreds or thousands of monthly visitors. But when you check your CRM, there's a painful gap between visitors and actual leads.
              </p>

              <p className="text-lg mb-6">
                Sound familiar? You're not alone—and more importantly, <strong>it's not your fault</strong>.
              </p>

              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      High Traffic
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">10,000</p>
                    <p className="text-sm text-muted-foreground">monthly visitors checking you out</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MousePointer className="h-5 w-5 text-warning" />
                      Low Conversion
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">2%</p>
                    <p className="text-sm text-muted-foreground">fill out your contact form</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-destructive" />
                      Lost Leads
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">9,800</p>
                    <p className="text-sm text-muted-foreground">vanish into thin air</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 2: Why Traditional Lead Gen Fails */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Why Traditional Lead Generation Fails in 2025
              </h2>

              <p className="text-lg mb-6">
                The traditional B2B lead generation playbook relies on one thing: <strong>getting visitors to fill out forms</strong>. But here's what nobody tells you:
              </p>

              <div className="space-y-6 mb-8">
                <Card className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">❌ Form Fatigue is Real</h3>
                    <p>Buyers are bombarded with forms. They've been burned by sales calls after downloading a simple PDF. Result? They research anonymously to avoid your sales team as long as possible.</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">❌ The Dark Funnel Exists</h3>
                    <p>72% of B2B buyers research entirely anonymously (Gartner). They check your pricing, read case studies, compare competitors—all without filling a single form. You never know they existed.</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">❌ Math Works Against You</h3>
                    <p>Even if you optimize forms obsessively, you'll hit a ceiling. Going from 2% to 4% conversion is nearly impossible—and still means losing 96% of visitors. The math simply doesn't scale.</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-3">❌ You're Fighting Buyer Behavior</h3>
                    <p>Modern buyers want to stay in control. They don't want to be "sold to" early. They want to research on their terms, and traditional lead capture forces their hand too soon.</p>
                  </CardContent>
                </Card>
              </div>

              <Alert className="mb-6 border-primary/50 bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <AlertDescription className="text-base">
                  <strong>The insight:</strong> The problem isn't your website, your content, or your offer. The problem is trying to force anonymous visitors to reveal themselves before they're ready. You need a different approach.
                </AlertDescription>
              </Alert>
            </section>

            {/* Section 3: The Hidden Revenue Leak */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-primary" />
                The Hidden Revenue Leak in Your Business
              </h2>

              <p className="text-lg mb-6">
                Let's talk real numbers. This isn't theoretical—this is money being flushed down the drain every single month.
              </p>

              <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Typical B2B Company: The Math</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Monthly website visitors</span>
                    <span className="font-semibold text-xl">10,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Form conversion rate</span>
                    <span className="font-semibold text-xl">2%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Leads per month</span>
                    <span className="font-semibold text-xl">200</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Sales conversion rate</span>
                    <span className="font-semibold text-xl">5%</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">New customers per month</span>
                    <span className="font-semibold text-xl">10</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Average transaction value</span>
                    <span className="font-semibold text-xl">$5,000</span>
                  </div>
                  <div className="flex justify-between items-center py-4 mt-4 bg-background/50 rounded-lg px-4">
                    <span className="font-bold text-lg">Current monthly revenue from website</span>
                    <span className="font-bold text-2xl text-primary">$50,000</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-destructive/10 rounded-lg px-4 border border-destructive/20">
                    <span className="font-bold text-lg">Anonymous visitors (98%)</span>
                    <span className="font-bold text-2xl text-destructive">9,800</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-destructive/20 rounded-lg px-4 border-2 border-destructive">
                    <span className="font-bold text-xl">Revenue left on table annually</span>
                    <span className="font-bold text-3xl text-destructive">$2.9M</span>
                  </div>
                </CardContent>
              </Card>

              <p className="text-lg mb-6">
                <strong>That's the real problem.</strong> Not that your website isn't converting well enough. It's that 98% of interested buyers are invisible to you, and you have zero ability to follow up.
              </p>
            </section>

            {/* CTA 2 */}
            <Card className="mb-12 border-primary/20 bg-primary/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold mb-3">Calculate Your Hidden Revenue Leak</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    Enter your website traffic and see exactly how much revenue you're leaving on the table from anonymous visitors. Takes 60 seconds.
                  </p>
                  <Button asChild size="lg">
                    <Link to="/">
                      Get My Free Lead Loss Report <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">No credit card • Instant results • See your numbers in 60 seconds</p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: The Solution */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                The Solution: Identity Resolution (Visitor Identification)
              </h2>

              <p className="text-lg mb-6">
                Here's the breakthrough: What if you didn't need visitors to fill out forms? What if you could automatically identify them when they land on your site?
              </p>

              <p className="text-lg mb-6">
                That's exactly what <strong>identity resolution technology</strong> does. Also called visitor identification or reverse IP lookup, this technology:
              </p>

              <div className="space-y-4 mb-8 ml-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-lg"><strong>Identifies anonymous visitors automatically</strong> using their business IP address</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-lg"><strong>Enriches data with contact information</strong> (company name, decision-maker emails, phone numbers)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-lg"><strong>Tracks pages viewed and intent signals</strong> to prioritize hot leads</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-lg"><strong>Gives you 15-20x more leads</strong> compared to form-only lead generation</p>
                  </div>
                </div>
              </div>

              <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl">Same Company, With Identity Resolution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Monthly website visitors</span>
                    <span className="font-semibold text-xl">10,000</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Form fills (2%)</span>
                    <span className="font-semibold text-xl">200</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-primary/30 bg-primary/5 rounded px-2">
                    <span className="text-foreground font-medium">+ Anonymous visitors identified (35%)</span>
                    <span className="font-semibold text-xl text-primary">3,500</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-bold">Total leads per month</span>
                    <span className="font-bold text-xl text-primary">3,700</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Sales conversion (5%)</span>
                    <span className="font-semibold text-xl">185</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Average deal size</span>
                    <span className="font-semibold text-xl">$5,000</span>
                  </div>
                  <div className="flex justify-between items-center py-4 mt-4 bg-primary/10 rounded-lg px-4 border-2 border-primary">
                    <span className="font-bold text-xl">New monthly revenue</span>
                    <span className="font-bold text-3xl text-primary">$925,000</span>
                  </div>
                  <div className="flex justify-between items-center py-4 bg-primary/20 rounded-lg px-4 border-2 border-primary">
                    <span className="font-bold text-xl">Additional annual revenue</span>
                    <span className="font-bold text-3xl text-primary">$10.5M</span>
                  </div>
                </CardContent>
              </Card>

              <Alert className="border-primary/50 bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <AlertDescription className="text-base">
                  <strong>The difference:</strong> Same traffic. Same website. But now you can identify and follow up with 18.5x more leads. That's the power of visibility.
                </AlertDescription>
              </Alert>
            </section>

            {/* Section 5: Real-World Examples */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                Real-World Examples: Who This Works For
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>HVAC Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Homeowners research 8-10 HVAC companies before calling. With visitor ID, you can call them first—before your competitors even know they exist.</p>
                    <p className="text-sm text-primary font-semibold">Typical uplift: 300-500% more booked appointments</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>SaaS Companies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Enterprise buyers research for weeks anonymously. Identify them early, see what features they're interested in, and reach out with personalized demos.</p>
                    <p className="text-sm text-primary font-semibold">Typical uplift: 15-20x more qualified pipeline</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Legal Services</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Clients research attorneys extensively before reaching out. Know who's comparing your firm to competitors and follow up proactively.</p>
                    <p className="text-sm text-primary font-semibold">Typical uplift: 200-400% more consultation bookings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Healthcare Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">Patients check multiple providers before scheduling. Identify interested visitors and reach out with personalized care options.</p>
                    <p className="text-sm text-primary font-semibold">Typical uplift: 250-350% more patient appointments</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Section 6: How to Get Started */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                How to Get Started (Free Lead Loss Report)
              </h2>

              <p className="text-lg mb-6">
                Before investing in any identity resolution tool, you need to know:
              </p>

              <div className="space-y-3 mb-8 ml-6">
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl font-bold mt-1">1.</span>
                  <p className="text-lg">How many leads are you actually losing to anonymity?</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl font-bold mt-1">2.</span>
                  <p className="text-lg">What's the dollar value of those lost leads?</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-primary text-xl font-bold mt-1">3.</span>
                  <p className="text-lg">What would your revenue look like if you could identify 35-40% of them?</p>
                </div>
              </div>

              <p className="text-lg mb-8">
                That's exactly what our <strong>Free Lead Loss Calculator</strong> shows you. In 60 seconds, you'll see:
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Your Current State</h3>
                    <p className="text-sm text-muted-foreground">Leads generated from form fills</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Your Hidden Opportunity</h3>
                    <p className="text-sm text-muted-foreground">Leads you're missing from anonymous traffic</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/30">
                  <CardContent className="pt-6">
                    <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-semibold mb-2">Your Revenue Potential</h3>
                    <p className="text-sm text-muted-foreground">Projected uplift with visitor identification</p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Final CTA */}
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-8 pb-8">
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">Stop Losing Leads to Anonymity</h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Get your free, personalized Lead Loss Report in 60 seconds. No credit card required. See exactly how many leads and dollars you're leaving on the table every month.
                  </p>
                  <Button asChild size="lg" className="text-lg px-8 py-6 h-auto">
                    <Link to="/">
                      Calculate My Lead Loss Now <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    ✓ Instant results  ✓ No signup required  ✓ Industry-specific benchmarks included
                  </p>
                </div>
              </CardContent>
            </Card>
          </article>

          {/* FAQ Section */}
          <div className="container mx-auto px-4 py-16">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-bold text-center">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Internal Linking Widget */}
          <div className="container mx-auto px-4 pb-16">
            <InternalLinkingWidget />
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default WhyNoLeadsPage;
