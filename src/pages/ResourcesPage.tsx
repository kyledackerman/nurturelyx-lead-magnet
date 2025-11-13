import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MetaTags } from "@/components/seo/MetaTags";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { ItemListSchema } from "@/components/seo/ItemListSchema";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { GlobalSchemas } from "@/components/seo/GlobalSchemas";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, FileText, Calculator, TrendingUp, Users, Building2, HeartPulse, Home, Car, Scale, Briefcase, Key, Wrench } from "lucide-react";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { getAllBlogPosts } from "@/data/blogPosts";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const ResourcesPage = () => {
  usePageViewTracking("marketing");
  const blogPosts = getAllBlogPosts();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const getCategoryCount = (category: string) => {
    if (category === "all") {
      return educationalGuides.length + industryResources.length + 
             freeTools.length + comparisonGuides.length + blogPosts.length;
    }
    if (category === "guide") return educationalGuides.length;
    if (category === "industry") return industryResources.length;
    if (category === "tool") return freeTools.length;
    if (category === "comparison") return comparisonGuides.length;
    if (category === "blog") return blogPosts.length;
    return 0;
  };

  const trackResourceClick = (resourceTitle: string, category: string, url: string) => {
    // Analytics tracking placeholder - can be implemented with your analytics solution
    console.log('Resource clicked:', { resourceTitle, category, url, searchQuery, selectedCategory });
  };

  const educationalGuides = [
    {
      title: "Complete Guide to Visitor Identification",
      description: "Master visitor identification technology, identity resolution, and lead generation strategies for B2B companies.",
      url: "/learn",
      icon: BookOpen,
      category: "guide"
    },
    {
      title: "How It Works: Technology Deep Dive",
      description: "Understand the technical architecture behind visitor tracking, data enrichment, and identity resolution.",
      url: "/how-it-works",
      icon: TrendingUp,
      category: "guide"
    },
    {
      title: "Why Your Website Isn't Getting Leads",
      description: "Discover why 98% of visitors leave without converting and how to fix it with visitor identification.",
      url: "/why-website-not-getting-leads",
      icon: FileText,
      category: "guide"
    },
    {
      title: "Google Analytics Is Lying to You",
      description: "The uncomfortable truth about web analytics and the 97% blind spot most businesses don't see.",
      url: "/learn/google-analytics-lying",
      icon: FileText,
      category: "guide"
    },
  ];

  const industryResources = [
    {
      title: "HVAC Lead Generation 2025",
      description: "Identify homeowners researching HVAC services and convert them before they call competitors.",
      url: "/industries/hvac",
      icon: Building2,
      category: "industry"
    },
    {
      title: "Legal Services Lead Generation",
      description: "Capture potential clients researching legal services and convert them into consultations.",
      url: "/industries/legal",
      icon: Scale,
      category: "industry"
    },
    {
      title: "Real Estate Lead Generation",
      description: "Identify property buyers and sellers visiting your listings and convert them into clients.",
      url: "/industries/real-estate",
      icon: Key,
      category: "industry"
    },
    {
      title: "Healthcare Lead Generation",
      description: "Connect with patients researching healthcare services and convert them into appointments.",
      url: "/industries/healthcare",
      icon: HeartPulse,
      category: "industry"
    },
    {
      title: "Home Services Lead Generation",
      description: "Identify homeowners seeking repairs and maintenance services before they book competitors.",
      url: "/industries/home-services",
      icon: Wrench,
      category: "industry"
    },
    {
      title: "Automotive Lead Generation",
      description: "Capture car buyers researching dealerships and service centers in your area.",
      url: "/industries/automotive",
      icon: Car,
      category: "industry"
    },
  ];

  const freeTools = [
    {
      title: "Lost Revenue Calculator",
      description: "Calculate exactly how much revenue you're losing from anonymous website visitors every month.",
      url: "/",
      icon: Calculator,
      category: "tool"
    },
    {
      title: "Sales Call ROI Calculator",
      description: "Calculate the true cost and return on investment of your sales calling efforts. Understand cost per conversion, revenue per hour, and optimize your sales team's time.",
      url: "/tools/sales-call-roi-calculator",
      icon: Calculator,
      category: "tool"
    },
    {
      title: "Visitor ID vs Traditional Forms",
      description: "Compare visitor identification technology to traditional lead capture methods side-by-side.",
      url: "/compare/visitor-id-vs-traditional",
      icon: TrendingUp,
      category: "tool"
    },
    {
      title: "Pricing & ROI Calculator",
      description: "See how visitor identification ROI compares to your current lead generation costs.",
      url: "/pricing",
      icon: Calculator,
      category: "tool"
    },
  ];

  const comparisonGuides = [
    {
      title: "NurturelyX vs LeadFeeder",
      description: "See how NurturelyX compares to LeadFeeder for visitor identification and lead generation.",
      url: "/compare/leadfeeder-alternative",
      icon: TrendingUp,
      category: "comparison"
    },
    {
      title: "Full Platform Comparison",
      description: "Compare all major visitor identification platforms and find the best fit for your business.",
      url: "/compare",
      icon: FileText,
      category: "comparison"
    },
  ];

  const schemaItems = [
    ...educationalGuides.map(item => ({
      name: item.title,
      url: item.url,
      description: item.description
    })),
    ...industryResources.map(item => ({
      name: item.title,
      url: item.url,
      description: item.description
    })),
    ...freeTools.map(item => ({
      name: item.title,
      url: item.url,
      description: item.description
    })),
  ];

  const categories = [
    { value: "all", label: "All Resources" },
    { value: "guide", label: "Guides" },
    { value: "industry", label: "Industries" },
    { value: "tool", label: "Tools" },
    { value: "comparison", label: "Comparisons" },
    { value: "blog", label: "Blog" },
  ];

  return (
    <>
      <GlobalSchemas />
      
      <MetaTags
        title="Lead Generation Resources Hub 2025 | Visitor Identification Guides & Tools"
        description="Access comprehensive guides, industry-specific resources, free tools, and expert insights on visitor identification and lead generation. Everything you need to convert anonymous traffic into qualified leads."
        canonical="https://x1.nurturely.io/resources"
        keywords="lead generation resources, visitor identification guides, B2B marketing tools, anonymous visitor tracking, identity resolution, lead gen strategies"
        ogImage="https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png"
      />
      
      <WebPageSchema
        name="Lead Generation Resources Hub"
        description="Comprehensive resource hub for visitor identification, lead generation strategies, and B2B marketing insights"
        url="https://x1.nurturely.io/resources"
        keywords={[
          "lead generation resources",
          "visitor identification guides",
          "B2B marketing tools",
          "anonymous visitor tracking",
          "identity resolution",
        ]}
        breadcrumbs={[{ name: "Resources", url: "/resources" }]}
      />

      <ItemListSchema
        items={schemaItems}
        listName="Lead Generation Resources"
        description="Comprehensive collection of guides, tools, and resources for visitor identification and lead generation"
      />

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb items={[{ label: "Resources", href: "/resources" }]} />

          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Lead Generation Resources & Guides
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Everything you need to identify anonymous visitors, generate qualified leads, and grow revenue. Free guides, tools, and industry-specific resources.
            </p>
            <Button asChild size="lg">
              <Link to="/">Calculate Your Lost Revenue</Link>
            </Button>
          </section>

          {/* Search Bar */}
          <section className="mb-8">
            <div className="max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Search resources, guides, tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </section>

          {/* Category Filter */}
          <section className="mb-12">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Badge
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2"
                  onClick={() => setSelectedCategory(category.value)}
                >
                  {category.label} ({getCategoryCount(category.value)})
                </Badge>
              ))}
            </div>
          </section>

          {/* Featured Resource */}
          {(selectedCategory === "all" || selectedCategory === "guide") && (
            <section className="mb-16">
              <HowToSchema
                name="Complete Guide to Visitor Identification"
                description="Master visitor identification technology, identity resolution, and lead generation strategies for B2B companies. Learn how to identify anonymous website visitors and convert them into qualified leads."
                steps={[
                  {
                    name: "Understand Identity Resolution",
                    text: "Learn the fundamentals of visitor identification technology and how identity resolution works to match anonymous visitors to real businesses.",
                    url: "https://x1.nurturely.io/learn#what-is-identity-resolution"
                  },
                  {
                    name: "Install Tracking Code",
                    text: "Set up the NurturelyX tracking pixel on your website to start capturing visitor data and behavior patterns.",
                    url: "https://x1.nurturely.io/learn#setup"
                  },
                  {
                    name: "Configure Lead Enrichment",
                    text: "Connect data sources and configure enrichment settings to automatically identify companies and contacts visiting your site.",
                    url: "https://x1.nurturely.io/learn#enrichment"
                  },
                  {
                    name: "Start Converting Leads",
                    text: "Use the identified visitor data to reach out to prospects, personalize outreach, and convert anonymous traffic into qualified leads.",
                    url: "https://x1.nurturely.io/learn#conversion"
                  }
                ]}
                totalTime="PT30M"
                estimatedCost={{
                  currency: "USD",
                  value: "0"
                }}
              />
              <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-transparent hover:shadow-xl hover:scale-[1.01] transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <Badge className="bg-primary text-primary-foreground">⭐ Start Here</Badge>
                  </div>
                  <CardTitle className="text-3xl">Complete Guide to Visitor Identification</CardTitle>
                  <CardDescription className="text-base">
                    Master the fundamentals of identity resolution, anonymous visitor tracking, and lead generation technology. Perfect starting point for businesses new to visitor identification.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild size="lg" className="text-lg px-8">
                    <Link to="/learn">Start Learning →</Link>
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Educational Guides */}
          {(selectedCategory === "all" || selectedCategory === "guide") && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Educational Guides</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {educationalGuides
                  .filter(guide => 
                    searchQuery === "" || 
                    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((guide) => (
                  <Card key={guide.url} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <guide.icon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                          <CardDescription>{guide.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        asChild 
                        variant="outline"
                        onClick={() => trackResourceClick(guide.title, 'guide', guide.url)}
                      >
                        <Link to={guide.url}>Read Guide</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Industry-Specific Resources */}
          {(selectedCategory === "all" || selectedCategory === "industry") && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Industry-Specific Resources</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {industryResources
                  .filter(resource => 
                    searchQuery === "" || 
                    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    resource.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((resource) => (
                  <Card key={resource.url} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <resource.icon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <CardTitle className="text-lg mb-2">{resource.title}</CardTitle>
                          <CardDescription className="text-sm">{resource.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm"
                        onClick={() => trackResourceClick(resource.title, 'industry', resource.url)}
                      >
                        <Link to={resource.url}>View Industry Guide</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Free Tools */}
          {(selectedCategory === "all" || selectedCategory === "tool") && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Free Tools & Calculators</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {freeTools
                  .filter(tool => 
                    searchQuery === "" || 
                    tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tool.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((tool) => (
                  <Card key={tool.url} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <tool.icon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <CardTitle className="text-lg mb-2">{tool.title}</CardTitle>
                          <CardDescription className="text-sm">{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        asChild 
                        variant="outline" 
                        size="sm"
                        onClick={() => trackResourceClick(tool.title, 'tool', tool.url)}
                      >
                        <Link to={tool.url}>Use Tool</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Comparison Guides */}
          {(selectedCategory === "all" || selectedCategory === "comparison") && (
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold">Comparison Guides</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {comparisonGuides
                  .filter(guide => 
                    searchQuery === "" || 
                    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    guide.description.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((guide) => (
                  <Card key={guide.url} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <guide.icon className="h-6 w-6 text-primary mt-1" />
                        <div>
                          <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                          <CardDescription>{guide.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        asChild 
                        variant="outline"
                        onClick={() => trackResourceClick(guide.title, 'comparison', guide.url)}
                      >
                        <Link to={guide.url}>Compare Now</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Blog Articles */}
          {(selectedCategory === "all" || selectedCategory === "blog") && (
            <section className="mb-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <h2 className="text-3xl font-bold">Latest Blog Articles</h2>
                </div>
                <Button asChild variant="outline">
                  <Link to="/blog">View All Posts</Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts
                  .filter(post => 
                    searchQuery === "" || 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.metaDescription.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .slice(0, 6).map((post) => (
                  <Card key={post.slug} className="hover:border-primary transition-colors">
                    <CardHeader>
                      <Badge className="w-fit mb-2">{post.category}</Badge>
                      <CardTitle className="text-lg mb-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {post.metaDescription}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{post.readTime}</span>
                        <Button 
                          asChild 
                          variant="ghost" 
                          size="sm"
                          onClick={() => trackResourceClick(post.title, 'blog', `/blog/${post.slug}`)}
                        >
                          <Link to={`/blog/${post.slug}`}>Read More</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* CTA Section */}
          <section className="text-center bg-gradient-to-br from-primary/10 to-transparent rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Not Sure Where to Start?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Talk to our team for personalized recommendations based on your industry, company size, and lead generation goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="outline">
                <Link to="/compare">Compare Solutions</Link>
              </Button>
              <Button asChild size="lg">
                <Link to="/">Calculate Lost Revenue</Link>
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ResourcesPage;
