import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Phone, 
  Calendar, 
  Search, 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Clock,
  ThermometerSun,
  Wrench,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Shield,
  Zap
} from "lucide-react";

const HvacLeadsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const problems = [
    {
      icon: Phone,
      title: "Emergency Service Seekers",
      description: "Homeowner's AC breaks on a 95° day. They visit your site, check pricing, but call a competitor who answered faster. You never knew they were there."
    },
    {
      icon: Calendar,
      title: "Seasonal Shoppers",
      description: "Family researches new HVAC systems in February. They visit 5 contractor sites including yours, but you have no way to follow up when they're ready to buy in March."
    },
    {
      icon: Search,
      title: "Maintenance Browsers",
      description: "Property manager checks your tune-up packages for their 12 rental units. They bookmark your site but get distracted. Without their contact info, that $3,000 contract opportunity vanishes."
    },
    {
      icon: DollarSign,
      title: "System Researchers",
      description: "Business owner researches commercial HVAC replacement ($25K+ project). They download your guide but don't fill out the form. You lose a high-value lead because you couldn't identify them."
    }
  ];

  const useCases = [
    {
      icon: Phone,
      title: "Emergency Service Follow-Up",
      description: "Identify homeowners who visited your emergency service pages during peak heat/cold but didn't call. Reach out within hours while the need is urgent.",
      example: "A homeowner visits your '24/7 Emergency AC Repair' page at 11 PM. Next morning, you call offering same-day service before they book with someone else."
    },
    {
      icon: Calendar,
      title: "Seasonal Installation Campaigns",
      description: "Capture visitors researching system replacements during off-peak months. Follow up when they're ready to schedule installation.",
      example: "Someone browses your 'HVAC System Replacement' page in winter. You email in March with spring installation specials and schedule a free estimate."
    },
    {
      icon: Wrench,
      title: "Maintenance Plan Conversion",
      description: "Identify visitors who checked your maintenance packages but didn't sign up. Convert them with targeted follow-up calls.",
      example: "A property manager views your commercial maintenance pricing. You reach out offering a multi-property discount, closing a $4,000/year contract."
    },
    {
      icon: DollarSign,
      title: "Quote Follow-Up Automation",
      description: "Know who visited your site after receiving a quote. Prioritize follow-up calls based on their level of interest.",
      example: "After sending a $8,000 system replacement quote, you see they visited your financing page 3 times. You call offering flexible payment options and close the deal."
    },
    {
      icon: MapPin,
      title: "Geographic Service Area Targeting",
      description: "Identify high-value prospects in your service area who visited your site but didn't convert. Focus your marketing on ready-to-buy locals.",
      example: "Discover 50 homeowners in your city visited your site last week. Launch a targeted Facebook ad campaign specifically to those addresses with a limited-time offer."
    }
  ];

  const dataExamples = [
    { label: "Full Name", value: "John Smith" },
    { label: "Address", value: "123 Oak Street, Austin, TX" },
    { label: "Phone Number", value: "(512) 555-0123" },
    { label: "Email", value: "john.smith@email.com" },
    { label: "Pages Viewed", value: "Emergency AC Repair, Pricing, Service Area" },
    { label: "Time on Site", value: "4 minutes 32 seconds" },
    { label: "Visit Time", value: "June 15, 2024 at 2:43 PM" },
    { label: "Property Type", value: "Single Family Home" }
  ];

  const faqs = [
    {
      question: "Can this help me convert emergency service calls faster?",
      answer: "Absolutely. When someone visits your emergency service pages, you'll know within minutes. This lets you proactively call them while they're still searching for help—often before they've contacted any competitors. Many HVAC companies report closing 30-40% of these urgent leads simply by being first to call."
    },
    {
      question: "What about people researching new HVAC systems?",
      answer: "This is where identity resolution shines. Homeowners typically research HVAC replacement for weeks or months before buying. You'll capture their contact info during their first visit, then you can nurture them with helpful content, seasonal promotions, and financing options until they're ready to schedule an estimate."
    },
    {
      question: "How quickly can I start calling these leads?",
      answer: "Most HVAC companies integrate this data into their CRM within 24-48 hours. From there, you can call leads the same day they visit your site. For emergency services, some companies set up instant notifications to call within the hour."
    },
    {
      question: "Does this work for commercial HVAC leads?",
      answer: "Yes. Commercial property managers and business owners research even more thoroughly than residential customers. You'll identify facility managers visiting your commercial services pages, see which equipment they're researching, and reach out with relevant proposals. These high-value leads ($10K-$100K+ projects) are worth the investment."
    },
    {
      question: "Can I target specific cities or neighborhoods?",
      answer: "Yes. You'll see the full address of visitors, so you can focus on your highest-value service areas. Only want to pursue leads within 20 miles? Filter by location. Want to prioritize wealthier neighborhoods? Sort by area. This prevents wasting time on leads outside your coverage zone."
    },
    {
      question: "Is this legal for HVAC companies?",
      answer: "Yes, when done correctly. Identity resolution providers operate under strict privacy compliance (GDPR, CCPA, TCPA). You're identifying people who voluntarily visited your public website—no different than if they had filled out a contact form. However, always follow telemarketing laws when calling leads."
    },
    {
      question: "What's the typical ROI for HVAC companies?",
      answer: "HVAC companies typically see 5-15x ROI. If you close just 2-3 additional system replacements per month ($5K-$15K each), that's $120K-$540K in annual revenue. Even with modest conversion rates, the cost of identity resolution is minimal compared to the value of high-ticket HVAC jobs."
    },
    {
      question: "How much does this cost?",
      answer: "Pricing varies by website traffic volume, but most HVAC companies pay $200-$800/month. Given that a single furnace replacement ($4K-$8K) or AC install ($3K-$7K) pays for months of service, the ROI math is compelling. Start by calculating how many leads you're currently losing—that's your opportunity cost."
    }
  ];

  const integrations = [
    { name: "ServiceTitan", logo: "🔧" },
    { name: "Housecall Pro", logo: "📱" },
    { name: "Jobber", logo: "📋" },
    { name: "ServiceM8", logo: "⚙️" },
    { name: "Salesforce", logo: "☁️" },
    { name: "HubSpot", logo: "🎯" }
  ];

  return (
    <>
      <Helmet>
        <title>How HVAC Companies Generate Leads from Anonymous Website Traffic | Identity Resolution</title>
        <meta name="description" content="HVAC companies are losing $15K-$50K monthly in service calls and system replacements. Learn how identity resolution helps you identify and convert anonymous website visitors into booked jobs." />
        <meta name="keywords" content="HVAC lead generation, HVAC marketing, air conditioning leads, furnace installation leads, HVAC website visitors, emergency HVAC service marketing" />
        <link rel="canonical" href="https://yoursite.com/generate-leads-hvac" />
        
        {/* Open Graph */}
        <meta property="og:title" content="How HVAC Companies Are Losing $15K-$50K Monthly in Invisible Website Visitors" />
        <meta property="og:description" content="Learn how top HVAC contractors identify anonymous website visitors and convert them into emergency service calls and system installations." />
        <meta property="og:type" content="article" />
        
        {/* Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "How HVAC Companies Generate Leads from Anonymous Website Traffic",
            "description": "Comprehensive guide to identity resolution technology for HVAC contractors",
            "author": {
              "@type": "Organization",
              "name": "Your Company Name"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Your Company Name"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
                How HVAC Companies Are Losing <span className="text-primary">$15K-$50K Monthly</span> in Invisible Website Visitors
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-4">
                Every day, homeowners and businesses visit your website researching emergency repairs, system replacements, and maintenance plans—then disappear without a trace.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                What if you could identify these anonymous visitors and follow up before they call your competitors?
              </p>
              <Link to="/?industry=hvac">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  Calculate Your Lost HVAC Revenue
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                The Problem Every HVAC Business Faces
              </h2>
              <p className="text-xl text-muted-foreground">
                These scenarios happen every single day—and you're powerless to stop them:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {problems.map((problem, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <problem.icon className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-xl font-semibold mb-3 text-foreground">{problem.title}</h3>
                    <p className="text-muted-foreground">{problem.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-6">
                You invested in a professional website, SEO, and paid ads to drive traffic. But without capturing visitor identities, you're watching potential customers slip away to competitors who reach out first.
              </p>
            </div>
          </div>
        </section>

        {/* The Reality Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                The Reality: Your Website Visitors Are Worth Thousands
              </h2>
            </div>

            <div className="max-w-3xl mx-auto mb-12">
              <Card className="border-2 border-primary/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center text-foreground">Quick Math on Lost Revenue:</h3>
                  <div className="space-y-4 text-lg">
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-muted-foreground">Average service call value:</span>
                      <span className="font-semibold text-foreground">$150 - $400</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-muted-foreground">Average system replacement:</span>
                      <span className="font-semibold text-foreground">$5,000 - $15,000</span>
                    </div>
                    <div className="flex items-center justify-between border-b pb-3">
                      <span className="text-muted-foreground">Maintenance plan (annual):</span>
                      <span className="font-semibold text-foreground">$200 - $600</span>
                    </div>
                    <div className="flex items-center justify-between pt-3">
                      <span className="text-muted-foreground">Commercial contract (annual):</span>
                      <span className="font-semibold text-primary">$2,000 - $20,000+</span>
                    </div>
                  </div>

                  <div className="mt-8 p-6 bg-primary/10 rounded-lg">
                    <p className="text-center text-lg font-semibold text-foreground">
                      If just <span className="text-primary">2-5%</span> of your anonymous visitors become customers, that's <span className="text-primary">$15,000 - $50,000+</span> in monthly revenue you're currently losing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution Intro Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                The Solution: Identity Resolution for HVAC Companies
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Identity resolution technology lets you identify 20-40% of your anonymous website visitors by name, address, phone number, and email—so you can follow up with qualified leads before they disappear.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center border-2">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">1. Visitor Arrives</h3>
                  <p className="text-muted-foreground">
                    Homeowner researches emergency AC repair or new furnace installation on your website
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">2. Identity Matched</h3>
                  <p className="text-muted-foreground">
                    Technology matches their device to real contact information (name, address, phone, email)
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2">
                <CardContent className="p-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">3. You Follow Up</h3>
                  <p className="text-muted-foreground">
                    Call or email them while they're still researching—before competitors get there first
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                5 Ways HVAC Companies Use Identity Resolution
              </h2>
            </div>

            <div className="space-y-8">
              {useCases.map((useCase, index) => (
                <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <useCase.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-3 text-foreground">{useCase.title}</h3>
                        <p className="text-lg text-muted-foreground mb-4">{useCase.description}</p>
                        <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
                          <p className="text-sm font-medium text-muted-foreground">
                            <span className="text-primary font-semibold">Real Example:</span> {useCase.example}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Explanation Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                How Does This Technology Work?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                You don't need to be a tech expert. Here's the simple explanation:
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Visitor Identification</h3>
                      <p className="text-muted-foreground">
                        When someone visits your HVAC website, identity resolution technology analyzes their device, IP address, and browsing patterns. It then matches this data against extensive databases containing hundreds of millions of consumer records.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Data Enrichment</h3>
                      <p className="text-muted-foreground">
                        The system appends full contact details: name, physical address, phone number, email, and household information. For HVAC companies, this often includes property type (single family, condo, commercial) and homeowner vs. renter status.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-foreground">Behavioral Insights</h3>
                      <p className="text-muted-foreground">
                        You'll see exactly which pages they viewed (emergency services vs. new installations), how long they stayed, and when they visited. This tells you their intent level and what type of HVAC service they need.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Data Examples Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                What Information Do You Actually Get?
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Here's an example of the data you receive for each identified website visitor:
              </p>
            </div>

            <Card className="max-w-2xl mx-auto border-2">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {dataExamples.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-b-0">
                      <span className="text-muted-foreground font-medium">{item.label}:</span>
                      <span className="font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                  <p className="text-sm text-center text-foreground">
                    <Shield className="inline h-4 w-4 mr-1 text-primary" />
                    All data collection is GDPR and CCPA compliant
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ROI Calculator Widget */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Calculate Your Potential ROI
              </h2>
              <p className="text-xl text-muted-foreground">
                Here's a realistic example for a typical HVAC company:
              </p>
            </div>

            <Card className="max-w-3xl mx-auto border-2 border-primary/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Monthly Website Visitors</label>
                      <div className="text-3xl font-bold text-foreground">1,000</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">Visitors Identified (30%)</label>
                      <div className="text-3xl font-bold text-primary">300</div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Average Transaction Value:</span>
                        <span className="text-xl font-semibold text-foreground">$250</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Conversion Rate (1%):</span>
                        <span className="text-xl font-semibold text-foreground">3 jobs</span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="text-lg font-semibold text-foreground">Monthly Recovered Revenue:</span>
                        <span className="text-3xl font-bold text-primary">$750</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-foreground">Annual Recovered Revenue:</span>
                        <span className="text-3xl font-bold text-primary">$9,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/10 p-6 rounded-lg text-center mt-6">
                    <p className="text-lg font-semibold text-foreground mb-4">
                      That's an extra $9,000 per year from leads you're currently losing
                    </p>
                    <Link to="/?industry=hvac">
                      <Button size="lg">
                        Calculate Your Specific Numbers
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Common Questions from HVAC Business Owners
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3 text-foreground flex items-start gap-3">
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground pl-9">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Works With Your Existing HVAC Software
              </h2>
              <p className="text-xl text-muted-foreground">
                Seamlessly integrates with the tools you already use:
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-4xl mx-auto">
              {integrations.map((integration, index) => (
                <Card key={index} className="text-center border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-2">{integration.logo}</div>
                    <p className="text-sm font-medium text-foreground">{integration.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to Stop Losing HVAC Leads?
              </h2>
              <p className="text-xl text-muted-foreground">
                Start by calculating how much revenue you're currently leaving on the table:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">1. Calculate</h3>
                <p className="text-muted-foreground">Enter your domain and average job value</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">2. See Results</h3>
                <p className="text-muted-foreground">Get a detailed report on your lost revenue</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">3. Take Action</h3>
                <p className="text-muted-foreground">Learn how to capture these leads</p>
              </div>
            </div>

            <div className="text-center">
              <Link to="/?industry=hvac">
                <Button size="lg" className="text-xl px-10 py-7 h-auto">
                  Calculate My Lost HVAC Revenue Now
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground mt-4">
                Free calculation • No credit card required • Results in 60 seconds
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HvacLeadsPage;