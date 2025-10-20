import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { scrollToTopIfHomeLink } from "@/lib/scroll";
import { ProblemStatement } from "@/components/solution/ProblemStatement";
import { TrackingDiagram } from "@/components/solution/TrackingDiagram";
import { DataPointsShowcase } from "@/components/solution/DataPointsShowcase";
import { IntegrationSteps } from "@/components/solution/IntegrationSteps";
import { ComplianceBadges } from "@/components/solution/ComplianceBadges";
import FAQ from "@/components/report/FAQ";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { MetaTags } from "@/components/seo/MetaTags";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";

export default function HowItWorksPage() {
  usePageViewTracking('marketing');
  
  const howToSteps = [
    {
      name: "Install Tracking Pixel",
      text: "Add our lightweight tracking pixel to your website. It's similar to Google Analytics and takes less than 10 minutes to install. The pixel begins capturing visitor data immediately while maintaining full privacy compliance.",
    },
    {
      name: "Visitor Data Collection",
      text: "As visitors browse your site, our system collects behavioral data and digital fingerprints. This includes pages viewed, time spent, referral sources, and engagement patterns - all while maintaining GDPR and CCPA compliance.",
    },
    {
      name: "Identity Resolution",
      text: "Our advanced AI algorithms match anonymous visitor data with our database of 250+ million consumer profiles. We use multiple data points including IP addresses, device fingerprints, and behavioral patterns to identify visitors.",
    },
    {
      name: "Data Enrichment",
      text: "Once identified, we enrich each visitor profile with comprehensive demographic and firmographic data including full name, email, phone, physical address, income level, buying power, and more.",
    },
    {
      name: "Lead Delivery",
      text: "Qualified leads are instantly delivered to your CRM dashboard. You can export leads via CSV, integrate with your existing CRM through our API, or receive real-time notifications for high-value visitors.",
    },
  ];
  
  return (
    <>
      <MetaTags
        title="How It Works - Visitor Identification Technology | NurturelyX"
        description="Learn how NurturelyX identifies anonymous website visitors and converts them into qualified leads. Step-by-step guide to our visitor identification technology and process."
        canonical="https://x1.nurturely.io/how-it-works"
        keywords="how visitor identification works, website tracking technology, identity resolution process, lead generation technology, visitor tracking system, anonymous visitor identification"
        ogType="website"
      />
      
      <HowToSchema
        name="How to Identify Anonymous Website Visitors"
        description="Step-by-step guide to identifying anonymous website visitors and converting them into qualified B2B leads using NurturelyX"
        steps={howToSteps}
        totalTime="PT10M"
      />
      
      <ServiceSchema
        name="Visitor Identification Technology"
        description="Advanced technology to identify anonymous website visitors and convert them into qualified leads for B2B businesses"
        serviceType="Technology Service"
      />
      
      <WebPageSchema
        name="How It Works - Visitor Identification Process"
        description="Complete guide to how visitor identification technology works to convert anonymous traffic into qualified leads"
        url="https://x1.nurturely.io/how-it-works"
        breadcrumbs={[{ name: "How It Works", url: "/how-it-works" }]}
        keywords={["visitor identification", "lead generation process", "tracking technology"]}
      />

      <Header />
      
      <nav className="container max-w-5xl pt-6">
        <Breadcrumb items={[{ label: "How It Works", href: "/how-it-works" }]} />
      </nav>

      <main role="main" className="min-h-screen" itemScope itemType="https://schema.org/WebPage">
        <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-accent/5">
          <div className="container max-w-5xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Turn Anonymous Traffic Into Leads
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Discover who's visiting your website, what they're interested in, and how to reach them - 
              even if they never fill out a form.
            </p>
            <p className="text-2xl md:text-3xl font-bold text-destructive mb-8">
              97-98% of your website visitors are completely anonymous
            </p>
            <Button asChild size="lg" className="gradient-bg" onClick={scrollToTopIfHomeLink}>
              <Link to="/">
                Get Your Free Report
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        <ProblemStatement />
        <TrackingDiagram />
        <DataPointsShowcase />
        <IntegrationSteps />
        <ComplianceBadges />
        
        <section className="py-16">
          <div className="container max-w-4xl">
            <FAQ data={{
              domain: 'nurturex.io',
              organicTraffic: 1000,
              missedLeads: 150,
              yearlyRevenueLost: 127000,
              avgTransactionValue: 5000,
              monthlyRevenueLost: 10583,
              estimatedSalesLost: 150,
              organicKeywords: 500,
              domainPower: 45,
              backlinks: 1000,
              paidTraffic: 200,
              dataSource: 'api',
              monthlyRevenueData: []
            }} />
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="container max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to See Who's Visiting Your Website?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Get a free report showing exactly how much revenue you're losing to anonymous traffic
            </p>
            <Button asChild size="lg" className="gradient-bg" onClick={scrollToTopIfHomeLink}>
              <Link to="/">
                Calculate Your Lost Revenue Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
