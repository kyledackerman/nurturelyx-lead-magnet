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

export default function HowItWorksPage() {
  usePageViewTracking('marketing');
  
  return (
    <>
      <Helmet>
        <title>How It Works - Turn Anonymous Visitors Into Leads | NurturelyX</title>
        <meta 
          name="description" 
          content="Discover how NurturelyX identifies anonymous website visitors and turns them into qualified B2B leads. See the complete process from tracking pixel to lead generation." 
        />
        <meta name="keywords" content="how visitor identification works, website visitor tracking, b2b lead generation, anonymous visitor identification" />
      </Helmet>

      <Header />

      <main className="min-h-screen">
        <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-accent/5">
          <div className="container max-w-5xl text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Turn Anonymous Traffic Into Leads
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover who's visiting your website, what they're interested in, and how to reach them - 
              even if they never fill out a form.
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
