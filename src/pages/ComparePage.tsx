import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Filter, ArrowRight, Building2, User, Target, MessageSquare, TrendingUp } from "lucide-react";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { ComparisonSchema } from "@/components/seo/ComparisonSchema";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { InternalLinkingWidget } from "@/components/seo/InternalLinkingWidget";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ComparePage = () => {
  usePageViewTracking("marketing");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toolCategories = [
    {
      name: "Identity Resolution",
      icon: User,
      description: "Get actual contact information (names, emails, phones) for individual visitors",
      color: "text-green-500",
      bestFor: "B2B companies needing immediate lead follow-up",
    },
    {
      name: "IP-Based Tracking",
      icon: Building2,
      description: "Old-school: Only shows company names, no individual contact info",
      color: "text-blue-500",
      bestFor: "Enterprise ABM teams tracking account engagement",
    },
    {
      name: "ABM Platforms",
      icon: Target,
      description: "Track engagement from target accounts with intent signals",
      color: "text-purple-500",
      bestFor: "Large enterprises with defined account lists",
    },
    {
      name: "Engagement Tools",
      icon: MessageSquare,
      description: "Real-time chat and engagement when high-intent visitors arrive",
      color: "text-orange-500",
      bestFor: "Sales teams wanting live conversations",
    },
  ];

  const allTools = [
    {
      name: "NurturelyX",
      category: "Identity Resolution",
      idRate: "35%",
      contactInfo: true,
      setup: "Simple",
      price: "$100/mo + $1/lead",
      crm: true,
      bestFor: "B2B Lead Generation",
      highlight: true,
      pros: ["Highest ID rate", "Actual contact info", "Lowest price", "Immediate follow-up"],
      cons: ["US/Canada focus", "Lower B2C rates"],
    },
    {
      name: "OpenSend",
      category: "Identity Resolution",
      idRate: "25%",
      contactInfo: true,
      setup: "Moderate",
      price: "$149/mo",
      crm: true,
      bestFor: "Email Marketing",
      highlight: false,
      pros: ["Email-focused", "Good deliverability"],
      cons: ["Lower ID rate", "Limited phone data"],
    },
    {
      name: "Retention.com",
      category: "Identity Resolution",
      idRate: "18%",
      contactInfo: true,
      setup: "Moderate",
      price: "$299/mo",
      crm: true,
      bestFor: "Ecommerce Recovery",
      highlight: false,
      pros: ["Ecommerce focus", "Cart abandonment"],
      cons: ["Expensive", "Limited B2B features"],
    },
    {
      name: "Leadfeeder",
      category: "IP-Based Tracking",
      idRate: "20%",
      contactInfo: false,
      setup: "Simple",
      price: "$199/mo",
      crm: true,
      bestFor: "Company Tracking",
      highlight: false,
      pros: ["Easy setup", "Good CRM integrations"],
      cons: ["No contact info", "Manual research needed"],
    },
    {
      name: "Clearbit Reveal",
      category: "IP-Based Tracking",
      idRate: "25%",
      contactInfo: false,
      setup: "Complex",
      price: "$999/mo",
      crm: true,
      bestFor: "Enterprise Enrichment",
      highlight: false,
      pros: ["Best firmographic data", "Form enrichment"],
      cons: ["Very expensive", "No anonymous contact info"],
    },
    {
      name: "Koala",
      category: "ABM Platforms",
      idRate: "22%",
      contactInfo: false,
      setup: "Moderate",
      price: "$500/mo",
      crm: true,
      bestFor: "PLG Companies",
      highlight: false,
      pros: ["Intent signals", "Product usage tracking"],
      cons: ["No contact info", "Complex setup"],
    },
    {
      name: "6sense",
      category: "ABM Platforms",
      idRate: "30%",
      contactInfo: false,
      setup: "Complex",
      price: "Custom ($50k+/yr)",
      crm: true,
      bestFor: "Enterprise ABM",
      highlight: false,
      pros: ["Predictive AI", "Intent data"],
      cons: ["Extremely expensive", "Long implementation"],
    },
    {
      name: "Demandbase",
      category: "ABM Platforms",
      idRate: "28%",
      contactInfo: false,
      setup: "Complex",
      price: "Custom ($40k+/yr)",
      crm: true,
      bestFor: "Enterprise ABM",
      highlight: false,
      pros: ["Account orchestration", "Advertising platform"],
      cons: ["Very expensive", "Overkill for SMB"],
    },
    {
      name: "Warmly",
      category: "Engagement Tools",
      idRate: "18%",
      contactInfo: false,
      setup: "Moderate",
      price: "$700/mo",
      crm: false,
      bestFor: "Real-Time Sales",
      highlight: false,
      pros: ["Live engagement", "Video prospecting"],
      cons: ["Requires SDR team", "No contact export"],
    },
    {
      name: "RB2B",
      category: "IP-Based Tracking",
      idRate: "15%",
      contactInfo: false,
      setup: "Simple",
      price: "$99/mo",
      crm: false,
      bestFor: "LinkedIn Outreach",
      highlight: false,
      pros: ["Affordable", "LinkedIn integration"],
      cons: ["Very low ID rate", "Limited features"],
    },
    {
      name: "Albacross",
      category: "IP-Based Tracking",
      idRate: "22%",
      contactInfo: false,
      setup: "Moderate",
      price: "$215/mo",
      crm: true,
      bestFor: "European Markets",
      highlight: false,
      pros: ["GDPR compliant", "Good for Europe"],
      cons: ["No contact info", "Lower US accuracy"],
    },
    {
      name: "Customers.ai",
      category: "Identity Resolution",
      idRate: "12%",
      contactInfo: true,
      setup: "Simple",
      price: "$197/mo",
      crm: false,
      bestFor: "Facebook Ads",
      highlight: false,
      pros: ["Facebook integration", "Messenger bots"],
      cons: ["Low ID rate", "Limited CRM options"],
    },
  ];

  const filteredTools = selectedCategory === "all" 
    ? allTools 
    : allTools.filter(tool => tool.category === selectedCategory);

  const faqItems = [
    {
      question: "Why do some tools only show company names?",
      answer: "IP-based tools can only identify the company that owns an IP address. They cannot see which specific person from that company visited your site. This means you know 'Microsoft visited' but not which person at Microsoft, making immediate follow-up impossible without manual research.",
    },
    {
      question: "What's the difference between IP-based and identity resolution?",
      answer: "IP-based tools reverse-lookup the company associated with an IP address, giving you company names only. Identity resolution matches visitors across multiple data sources to provide individual contact information including names, emails, and phone numbers. Identity resolution enables immediate outreach while IP-based requires manual research.",
    },
    {
      question: "Is it legal to identify anonymous visitors?",
      answer: "Yes, when done correctly. Identity resolution uses publicly available data and follows GDPR, CCPA, and CAN-SPAM regulations. Reputable providers only work with compliant data sources and provide opt-out mechanisms. IP-based tracking is also legal as it only identifies companies, not individuals.",
    },
    {
      question: "How accurate is visitor identification?",
      answer: "Accuracy varies by technology. IP-based tools identify 15-25% of B2B traffic (company level only). Identity resolution tools identify 25-40% of traffic with full contact details. ABM platforms identify 20-30% with intent signals. Accuracy depends on data quality, visitor location, and whether they're on corporate or residential networks.",
    },
    {
      question: "Can I use multiple tools together?",
      answer: "Yes, many companies stack tools. Common combinations: Identity Resolution (NurturelyX) for contact info + ABM Platform (6sense) for intent scoring. Or IP-Based (Leadfeeder) for broad tracking + Engagement Tool (Warmly) for real-time conversations. However, this increases cost significantly.",
    },
    {
      question: "Which tool is best for small businesses?",
      answer: "Identity Resolution tools like NurturelyX ($100/month + $1/lead) offer the best ROI for small businesses because they provide actual contact information at an affordable price. IP-based tools require expensive research time, and ABM platforms are overkill for companies without large sales teams.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Compare All Website Visitor Identification Tools (2025) | NurturelyX</title>
        <meta
          name="description"
          content="Compare 12+ visitor identification tools: Leadfeeder, Clearbit, Koala, Warmly, 6sense, OpenSend, Retention.com. See which gives you actual contact info vs just company names."
        />
        <link rel="canonical" href="https://x1.nurturely.io/compare" />
      </Helmet>

      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://x1.nurturely.io" },
          { name: "Compare Tools", url: "https://x1.nurturely.io/compare" },
        ]}
      />

      <WebPageSchema
        name="Compare All Website Visitor Identification Tools (2025)"
        description="Comprehensive comparison of 12+ visitor identification tools including Leadfeeder, Clearbit, Koala, Warmly, 6sense, OpenSend, and Retention.com."
        url="https://x1.nurturely.io/compare"
      />

      <FAQSchema questions={faqItems} />

      <ComparisonSchema
        items={allTools.map(tool => ({
          name: tool.name,
          description: `${tool.category} tool with ${tool.idRate} identification rate`,
          pros: tool.pros,
          cons: tool.cons,
        }))}
      />

      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Every Website Visitor Identification Tool Compared (2025)
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Compare 12+ tools including Leadfeeder, Clearbit, Koala, Warmly, 6sense, OpenSend, and Retention.com. 
                See which gives you <span className="text-primary font-semibold">actual contact information</span> vs just company names.
              </p>
            </div>
          </div>
        </section>

        {/* Tool Categories Section */}
        <section className="py-12 bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              The 4 Types of Visitor Identification Tools
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Understanding these categories will help you choose the right tool for your business
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {toolCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.name} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Icon className={`h-8 w-8 ${category.color} mb-2`} />
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {category.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        <strong>Best for:</strong> {category.bestFor}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Complete Comparison Table */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Complete Comparison Table</h2>
                <p className="text-muted-foreground">All 12 tools compared side-by-side</p>
              </div>
              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-md px-3 py-2 bg-background"
                >
                  <option value="all">All Categories</option>
                  <option value="Identity Resolution">Identity Resolution</option>
                  <option value="IP-Based Tracking">IP-Based Tracking</option>
                  <option value="ABM Platforms">ABM Platforms</option>
                  <option value="Engagement Tools">Engagement Tools</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Tool</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="text-center font-semibold">ID Rate</TableHead>
                    <TableHead className="text-center font-semibold">Contact Info?</TableHead>
                    <TableHead className="text-center font-semibold">Setup</TableHead>
                    <TableHead className="text-center font-semibold">Price</TableHead>
                    <TableHead className="text-center font-semibold">CRM</TableHead>
                    <TableHead className="font-semibold">Best For</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTools.map((tool) => (
                    <TableRow
                      key={tool.name}
                      className={tool.highlight ? "bg-primary/5 border-l-4 border-l-primary" : ""}
                    >
                      <TableCell className="font-medium">
                        {tool.name}
                        {tool.highlight && (
                          <Badge variant="default" className="ml-2 text-xs">
                            Best Value
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">{tool.idRate}</TableCell>
                      <TableCell className="text-center">
                        {tool.contactInfo ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">{tool.setup}</TableCell>
                      <TableCell className="text-center font-medium">{tool.price}</TableCell>
                      <TableCell className="text-center">
                        {tool.crm ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{tool.bestFor}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* What Each Tool Actually Gives You */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              What Each Type of Tool Actually Gives You
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              This is the critical difference most companies don't understand
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    IP-Based Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-600">✓ You Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Company name</li>
                      <li>• Industry & size</li>
                      <li>• Location</li>
                      <li>• Pages viewed</li>
                    </ul>
                    <p className="font-semibold text-red-600 mt-4">✗ You Don't Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Person's name</li>
                      <li>• Email address</li>
                      <li>• Phone number</li>
                      <li>• Job title</li>
                    </ul>
                    <p className="text-xs italic mt-4">
                      Example: "Microsoft visited" - still need to find the right person
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    ABM Platforms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-600">✓ You Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Company name</li>
                      <li>• Intent score</li>
                      <li>• Engagement history</li>
                      <li>• Account insights</li>
                    </ul>
                    <p className="font-semibold text-red-600 mt-4">✗ You Don't Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Person's name</li>
                      <li>• Email address</li>
                      <li>• Phone number</li>
                      <li>• Direct contact</li>
                    </ul>
                    <p className="text-xs italic mt-4">
                      Example: "High intent: 8/10" - but who do you call?
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                    Engagement Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-600">✓ You Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Company name</li>
                      <li>• Real-time alerts</li>
                      <li>• Live chat option</li>
                      <li>• Engagement tools</li>
                    </ul>
                    <p className="font-semibold text-red-600 mt-4">✗ You Don't Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Offline contact info</li>
                      <li>• Email for follow-up</li>
                      <li>• Phone for calling</li>
                      <li>• Contact export</li>
                    </ul>
                    <p className="text-xs italic mt-4">
                      Example: "Chat now!" - but they leave before responding
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-green-500" />
                    Identity Resolution
                  </CardTitle>
                  <Badge variant="default" className="w-fit">Recommended</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-green-600">✓ You Get:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Company name</li>
                      <li>• <strong>Person's full name</strong></li>
                      <li>• <strong>Direct email</strong></li>
                      <li>• <strong>Phone number</strong></li>
                      <li>• Job title & seniority</li>
                      <li>• Demographics</li>
                    </ul>
                    <p className="text-xs italic mt-4 text-primary">
                      Example: "John Smith, VP Ops, john@company.com, (555) 123-4567" - call him today
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* ROI Comparison */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              ROI Comparison: What Really Matters
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              Same website traffic, different tools, dramatically different results
            </p>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Scenario: 10,000 monthly visitors, $10k average deal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      With IP-Based Tool ($199/mo)
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>• 2,000 companies identified (20%)</p>
                      <p>• <strong>0 contact info</strong> provided</p>
                      <p>• 40 hours researching contacts</p>
                      <p>• Find info for 200 companies (10%)</p>
                      <p>• 10 demos booked</p>
                      <p>• 2 deals closed = <strong>$20k revenue</strong></p>
                      <p className="pt-2 border-t">
                        <strong>Cost:</strong> $199 + $2,000 labor = $2,199
                      </p>
                      <p>
                        <strong>ROI:</strong> 9:1
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 border-l-2 border-primary pl-8">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-green-500" />
                      With Identity Resolution ($100/mo + $1/lead)
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>• 3,500 contacts identified (35%)</p>
                      <p>• <strong>3,500 emails & phones</strong> provided</p>
                      <p>• <strong>0 hours</strong> researching</p>
                      <p>• Reach 500 high-intent prospects</p>
                      <p>• 35 demos booked (7% - better timing)</p>
                      <p>• 7 deals closed = <strong>$70k revenue</strong></p>
                      <p className="pt-2 border-t">
                        <strong>Cost:</strong> $100 + $3,500 (3,500 leads) = $3,600 total (no labor)
                      </p>
                      <p>
                        <strong>ROI:</strong> <span className="text-primary font-bold">19:1</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                  <p className="text-center font-semibold">
                    <TrendingUp className="inline h-5 w-5 mr-2" />
                    <strong className="text-primary">3.5x more revenue</strong> at 15% of the cost with identity resolution
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Decision Tree */}
        <section className="py-16 bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">
              Which Tool Should You Choose?
            </h2>
            <p className="text-center text-muted-foreground mb-12">
              Quick decision guide based on your business needs
            </p>

            <div className="max-w-4xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Choose Identity Resolution (NurturelyX, OpenSend, Retention.com) if:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ You need actual contact information to follow up with leads</li>
                    <li>✅ You want to call/email prospects within 24 hours of their visit</li>
                    <li>✅ Your sales team doesn't have time to research every company</li>
                    <li>✅ You value lead generation over brand awareness metrics</li>
                    <li>✅ You have high-value B2B transactions ($5k+ deal size)</li>
                    <li>✅ You're a startup, SMB, or mid-market company focused on ROI</li>
                    <li>✅ You want to maximize revenue from existing website traffic</li>
                  </ul>
                  <Button className="mt-4" asChild>
                    <Link to="/">
                      Try NurturelyX Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    Choose IP-Based Tools (Leadfeeder, Clearbit, Albacross) if:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ You're running ABM campaigns with predefined target accounts</li>
                    <li>✅ You have a large sales/research team to manually find contacts</li>
                    <li>✅ You care more about tracking account engagement than generating leads</li>
                    <li>✅ Your sales cycle is 6+ months and immediate follow-up isn't critical</li>
                    <li>✅ You're an enterprise company with unlimited budget</li>
                    <li>✅ You primarily want to enrich form submissions, not identify anonymous visitors</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Choose ABM Platforms (6sense, Demandbase, Koala) if:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ You're an enterprise company with $50k+ budget</li>
                    <li>✅ You have a dedicated ABM strategy with target account lists</li>
                    <li>✅ You need predictive analytics and intent scoring</li>
                    <li>✅ You want to orchestrate multi-channel campaigns</li>
                    <li>✅ You have long enterprise sales cycles (12+ months)</li>
                    <li>✅ You need advertising platform integration</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-orange-500" />
                    Choose Engagement Tools (Warmly, Qualified) if:
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>✅ You have an SDR team available for real-time conversations</li>
                    <li>✅ You sell high-touch products requiring demos</li>
                    <li>✅ You want to engage visitors while they're on your site</li>
                    <li>✅ You're willing to combine with another tool for contact export</li>
                    <li>✅ Your ideal customers respond well to chat</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
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
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to See Who's Visiting Your Site?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Get actual contact information (not just company names) for 35% of your website visitors
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/">
                  Calculate Your Lost Revenue
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Internal Linking Widget */}
        <section className="container mx-auto px-4 pb-16">
          <InternalLinkingWidget />
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ComparePage;
