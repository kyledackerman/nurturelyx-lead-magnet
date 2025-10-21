import { ArrowRight, AlertTriangle, Eye, Users, TrendingDown, BarChart3, Search, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CallToActionSection from "@/components/CallToActionSection";
import { MetaTags } from "@/components/seo/MetaTags";
import { ArticleSchema } from "@/components/seo/ArticleSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { useNavigate } from "react-router-dom";

const GoogleAnalyticsLyingPage = () => {
  usePageViewTracking("marketing");
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "Is Google Analytics really missing 97% of my visitors?",
      answer: "Yes. Google Analytics only shows you conversion data - the 3% who fill out forms or make purchases. The other 97% of visitors remain completely anonymous. They browse your site, check pricing, read reviews, and leave without a trace. This is the fundamental limitation of traditional web analytics."
    },
    {
      question: "Why doesn't Google Analytics track all visitors?",
      answer: "Google Analytics is designed to track behavior, not identity. It shows you pageviews, sessions, and conversions, but it cannot tell you WHO these visitors are unless they voluntarily identify themselves through a form submission or purchase. This is a privacy-first approach, but it leaves massive blind spots in your data."
    },
    {
      question: "How does visitor identification solve this problem?",
      answer: "Visitor identification technology (also called identity resolution) identifies the actual individuals visiting your website - even if they never fill out a form. You get real people's names, direct emails, phone numbers, and addresses - not just company names. This gives you verified contact information for the previously invisible 97%."
    },
    {
      question: "Can I use visitor identification alongside Google Analytics?",
      answer: "Absolutely. In fact, that's the recommended approach. Google Analytics excels at showing you behavior patterns, traffic sources, and conversion funnels. Visitor identification fills the massive gap by showing you WHO those visitors are. Together, they give you complete visibility into your website traffic."
    },
    {
      question: "Is visitor identification legal and compliant?",
      answer: "Yes. Identity resolution identifies actual individual visitors with their personal contact information - names, emails, phone numbers, and addresses. We provide consumer data, not just business/company identification. All data is sourced from verified public records and opt-in databases, fully compliant with GDPR, CCPA, and privacy regulations when implemented correctly."
    },
    {
      question: "How much revenue am I losing to the 97% problem?",
      answer: "The average B2B website converts 2-3% of visitors. If you're getting 10,000 monthly visitors and converting at 3%, that's 300 leads. But what about the other 9,700 visitors? Even if just 5% of them are qualified prospects (485 people), and your average deal is $10,000, you're potentially missing $4.85M in pipeline every month."
    }
  ];

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Learn", url: "/learn" },
    { name: "Google Analytics Is Lying", url: "/learn/google-analytics-lying" }
  ];

  return (
    <>
      <MetaTags
        title="Google Analytics Is Lying To You: The Hidden 97% Problem | NurturelyX"
        description="Your Google Analytics dashboard looks healthy, but you're only seeing 3% of the story. Discover why 97% of your website visitors are invisible and what it's costing you."
        canonical="https://x1.nurturely.io/learn/google-analytics-lying"
        keywords="google analytics limitations, website visitor tracking, anonymous website visitors, visitor identification, B2B lead generation, website analytics blind spots, de-anonymize website traffic, hidden website visitors"
      />

      <ArticleSchema
        title="Google Analytics Is Lying To You: The Hidden 97% Problem"
        description="Your Google Analytics dashboard looks healthy, but you're only seeing 3% of the story. Discover why 97% of your website visitors are invisible and what it's costing you."
        publishedAt="2025-01-15T10:00:00Z"
        updatedAt="2025-01-15T10:00:00Z"
        author="NurturelyX"
        url="https://x1.nurturely.io/learn/google-analytics-lying"
        category="Analytics & Tracking"
        wordCount={2400}
      />

      <WebPageSchema
        name="Google Analytics Is Lying To You: The Hidden 97% Problem"
        description="Your Google Analytics dashboard looks healthy, but you're only seeing 3% of the story. Discover why 97% of your website visitors are invisible and what it's costing you."
        url="https://x1.nurturely.io/learn/google-analytics-lying"
        breadcrumbs={breadcrumbs}
        datePublished="2025-01-15T10:00:00Z"
        dateModified="2025-01-15T10:00:00Z"
      />

      <BreadcrumbSchema items={breadcrumbs} />
      <FAQSchema questions={faqItems} />

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-destructive/10 via-background to-background border-b">
          <div className="container mx-auto max-w-4xl text-center">
            <Alert className="mb-8 border-destructive/50 bg-destructive/5">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-base font-semibold">
                Warning: Everything you think you know about your website traffic is incomplete
              </AlertDescription>
            </Alert>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground">
              Google Analytics Is <span className="text-destructive">Lying To You</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Your dashboard shows healthy traffic. Conversions look decent. But here's the truth they won't tell you: <span className="font-bold text-foreground">You're only seeing 3% of the story.</span>
            </p>

            <div className="bg-card border-2 border-destructive/20 rounded-lg p-8 mb-8">
              <div className="text-6xl font-bold text-destructive mb-2">97%</div>
              <div className="text-xl font-semibold text-foreground mb-2">of your website visitors are invisible</div>
              <div className="text-muted-foreground">And it's costing you millions in lost revenue</div>
            </div>

            <Button 
              onClick={() => navigate("/")}
              size="lg"
              className="text-lg px-8"
            >
              See Your Invisible Traffic Now (Free Report)
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* The Uncomfortable Truth */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              The Uncomfortable Truth About Web Analytics
            </h2>

            <div className="prose prose-lg max-w-none text-foreground/90 space-y-6 mb-12">
              <p className="text-lg leading-relaxed">
                Every day, business owners log into Google Analytics and feel good about their numbers. "We had 5,000 visitors this month!" they announce. "Traffic is up 15%!"
              </p>

              <p className="text-lg leading-relaxed">
                But here's what Google Analytics isn't showing you:
              </p>

              <div className="bg-muted/50 rounded-lg p-6 my-8 border-l-4 border-primary">
                <p className="text-lg font-semibold mb-4 text-foreground">
                  Of those 5,000 visitors, Google Analytics can only identify about 150 of them (the 3% who filled out a form or made a purchase).
                </p>
                <p className="text-base text-muted-foreground">
                  The other 4,850 visitors? They're represented in your analytics as anonymous sessions, pageviews, and bounce rates. You know they exist, but you have absolutely no idea who they are, what companies they work for, or how to follow up with them.
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                This isn't a bug. It's how Google Analytics was designed. It's brilliant for tracking behavior, but catastrophically inadequate for B2B lead generation.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="border-destructive/20">
                <CardHeader>
                  <Eye className="h-10 w-10 text-destructive mb-4" />
                  <CardTitle className="text-destructive">What Google Analytics Shows You (3%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>People who filled out contact forms</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Customers who made purchases</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Users who signed up for trials</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>People who voluntarily identified themselves</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-4" />
                  <CardTitle className="text-primary">What You're Missing (97%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-foreground/80">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Qualified prospects researching solutions</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Decision-makers checking your pricing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Competitors analyzing your offerings</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Hot leads who aren't ready to commit yet</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="bg-primary/10 rounded-lg p-8 text-center border border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Want to see who's actually visiting your website?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Get a free report showing the companies, contacts, and lost revenue hiding in your traffic
              </p>
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                variant="default"
              >
                Get My Free Visitor Intelligence Report
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Differentiation Callout */}
        <section className="py-12 px-4 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <div className="bg-primary/10 border-l-4 border-primary p-8 rounded-lg">
              <h4 className="font-bold text-2xl mb-4 text-foreground">🚫 Not Another "Company Visitor" Tool</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Old B2B tools like Leadfeeder and Clearbit show you "Acme Corp visited" - but no way to contact anyone. 
                <strong className="text-foreground"> We give you the actual person</strong>: John Smith, john@email.com, (555) 123-4567, 
                123 Main St. That's the difference between a company name and a lead you can actually call.
              </p>
            </div>
          </div>
        </section>

        {/* Real Cost Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              What The 97% Problem Is Really Costing You
            </h2>

            <p className="text-lg text-foreground/90 mb-8 leading-relaxed">
              Let's run the numbers with a typical B2B company:
            </p>

            <Card className="mb-8 border-primary/30">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">10,000</div>
                    <div className="text-sm text-muted-foreground">Monthly Visitors</div>
                  </div>
                  <div className="text-center">
                    <TrendingDown className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">3%</div>
                    <div className="text-sm text-muted-foreground">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <DollarSign className="h-12 w-12 text-primary mx-auto mb-4" />
                    <div className="text-3xl font-bold text-foreground mb-2">$15K</div>
                    <div className="text-sm text-muted-foreground">Average Deal Size</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6 mb-12">
              <div className="bg-card rounded-lg p-6 border">
                <div className="font-semibold text-lg mb-2 text-foreground">What Google Analytics Shows You:</div>
                <div className="text-muted-foreground mb-4">
                  10,000 visitors × 3% conversion rate = <span className="font-bold text-foreground">300 leads captured</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  This looks reasonable. You're generating leads, sales is working them, deals are closing. Life is good.
                </div>
              </div>

              <div className="bg-destructive/10 rounded-lg p-6 border border-destructive/30">
                <div className="font-semibold text-lg mb-2 text-foreground">What You're Actually Missing:</div>
                <div className="text-muted-foreground mb-4">
                  10,000 visitors × 97% anonymous = <span className="font-bold text-destructive">9,700 unidentified visitors</span>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Let's be conservative and say only 5% of these are qualified prospects (the rest are students, competitors, researchers, etc.)
                </div>
                <div className="text-foreground font-semibold mb-4">
                  9,700 × 5% qualified = <span className="text-destructive">485 missed opportunities</span>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  If your sales team could reach even 20% of these qualified visitors, and close at your normal 10% rate...
                </div>
                <div className="text-2xl font-bold text-destructive">
                  485 × 20% × 10% × $15,000 = $145,500 in monthly pipeline
                </div>
                <div className="text-destructive font-semibold text-lg mt-2">
                  That's $1.75M in annual revenue walking away anonymously
                </div>
              </div>
            </div>

            <Alert className="mb-12 bg-primary/10 border-primary/30">
              <Search className="h-5 w-5" />
              <AlertDescription className="text-base">
                <span className="font-semibold">The Worst Part?</span> Many of these "invisible" visitors are actively researching solutions, comparing vendors, and checking pricing. They're in-market buyers. They're just not filling out your form... yet.
              </AlertDescription>
            </Alert>

            <div className="bg-card rounded-lg p-8 text-center border-2 border-primary/20">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Stop Leaving Money On The Table
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Get a custom report showing exactly how many qualified prospects are visiting your site anonymously—and what they're worth
              </p>
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                className="text-lg px-8"
              >
                Calculate My Lost Revenue (Free)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Why This Happens */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              Why Google Analytics Can't Solve This Problem
            </h2>

            <div className="prose prose-lg max-w-none text-foreground/90 space-y-6 mb-12">
              <p className="text-lg leading-relaxed">
                Google Analytics was built to track behavior, not identity. It's designed to answer questions like:
              </p>

              <ul className="space-y-3 text-foreground/80 ml-6">
                <li>"How many people visited my homepage?"</li>
                <li>"What's my bounce rate on the pricing page?"</li>
                <li>"Which traffic sources convert best?"</li>
                <li>"How long do people stay on the site?"</li>
              </ul>

              <p className="text-lg leading-relaxed">
                These are important questions for optimizing user experience. But they don't help you generate revenue from the 97% of visitors who don't convert.
              </p>

              <div className="bg-muted/50 rounded-lg p-6 my-8 border-l-4 border-destructive">
                <p className="text-lg font-semibold mb-3 text-foreground">
                  The fundamental limitation:
                </p>
                <p className="text-base text-muted-foreground">
                  Google Analytics relies on cookies and voluntary identification. If a visitor doesn't fill out a form, make a purchase, or log in, they remain forever anonymous. You get a session ID and some behavioral data, but no way to identify WHO that visitor is or how to contact them.
                </p>
              </div>

              <p className="text-lg leading-relaxed">
                For consumer websites selling impulse purchases, this is fine. But for B2B companies with complex sales cycles and high-value deals? It's a catastrophic blind spot.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Privacy-First Design</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Google Analytics prioritizes user privacy, which means it cannot identify visitors without their explicit consent
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cookie Dependence</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Relies on browser cookies that are increasingly blocked by privacy tools and regulations
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Behavior Over Identity</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Built to track what users do, not who they are or how to reach them for sales follow-up
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Section */}
        <section className="py-16 px-4 bg-primary/5">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-8 text-foreground">
              The Solution: Visitor Intelligence
            </h2>

            <div className="prose prose-lg max-w-none text-foreground/90 space-y-6 mb-12">
              <p className="text-lg leading-relaxed">
                Here's the good news: You don't have to settle for seeing only 3% of your visitors. Visitor identification technology (also called de-anonymization or visitor intelligence) can reveal the companies and contacts behind your anonymous traffic.
              </p>

              <p className="text-lg leading-relaxed">
                Instead of just seeing "Session 1234567 viewed 5 pages," you see:
              </p>

              <div className="bg-card rounded-lg p-6 my-8 border border-primary/30">
                <div className="font-semibold text-lg mb-4 text-foreground">
                  Acme Corp (250 employees, $50M revenue)
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Viewed Pricing page 3 times</li>
                  <li>• Read case studies for their industry</li>
                  <li>• Checked integration documentation</li>
                  <li>• Visited 5 times in the last week</li>
                </ul>
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-semibold text-foreground mb-2">Decision maker contacts available:</div>
                  <div className="text-sm text-muted-foreground">VP of Marketing, Director of Sales, CTO</div>
                </div>
              </div>

              <p className="text-lg leading-relaxed">
                Now your sales team has actionable intelligence. They know who to call, when they're most interested, and what they've been researching. This isn't cold calling—it's warm outreach to in-market prospects.
              </p>
            </div>

            <div className="bg-card rounded-lg p-8 border-2 border-primary/20 text-center">
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                Ready To See Your Hidden Visitors?
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                Get a free custom report showing the actual people visiting your website - their names, emails, phone numbers, and what they're worth to your business
              </p>
              <Button 
                onClick={() => navigate("/")}
                size="lg"
                className="text-lg px-8"
              >
                Unmask My Website Traffic (Free Report)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Takes 60 seconds • No credit card required • See real data immediately
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-4xl font-bold mb-12 text-center text-foreground">
              Frequently Asked Questions
            </h2>

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

        <Footer />
      </div>
    </>
  );
};

export default GoogleAnalyticsLyingPage;
