import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MetaTags } from "@/components/seo/MetaTags";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { HowToSchema } from "@/components/seo/HowToSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { SalesCallForm } from "@/components/sales-calculator/SalesCallForm";
import { SalesCallResults } from "@/components/sales-calculator/SalesCallResults";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalesCallInputs, SalesCallMetrics } from "@/types/salesCall";
import { calculateSalesCallROI } from "@/utils/salesCallCalculations";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import { PhoneCall, Target, TrendingUp, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";

const SalesCallROICalculator = () => {
  usePageViewTracking("marketing");
  const [metrics, setMetrics] = useState<SalesCallMetrics | null>(null);

  const handleCalculate = (inputs: SalesCallInputs) => {
    const calculatedMetrics = calculateSalesCallROI(inputs);
    setMetrics(calculatedMetrics);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <>
      <MetaTags
        title="Sales Call ROI Calculator - Calculate Your Sales Team Profitability | Free Tool"
        description="Calculate the true cost and ROI of your sales calling efforts. Understand cost per conversion, revenue per hour, break-even calls, and optimize your sales team's performance."
        canonical="https://x1.nurturely.io/tools/sales-call-roi-calculator"
        ogImage="https://x1.nurturely.io/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png"
      />

      <WebPageSchema
        name="Sales Call ROI Calculator"
        description="Free calculator to measure sales call profitability, cost per conversion, and return on investment for sales teams"
        url="https://x1.nurturely.io/tools/sales-call-roi-calculator"
        keywords={[
          "sales call ROI calculator",
          "cost per sales call",
          "sales team profitability",
          "sales conversion rate calculator",
          "sales productivity calculator",
          "cost per conversion"
        ]}
        breadcrumbs={[
          { name: "Resources", url: "/resources" },
          { name: "Sales Call ROI Calculator", url: "/tools/sales-call-roi-calculator" }
        ]}
      />

      <HowToSchema
        name="How to Calculate Sales Call ROI"
        description="Learn how to calculate the return on investment for your sales calling efforts and optimize team performance"
        steps={[
          {
            name: "Enter Your Call Volume",
            text: "Input how many sales calls your team makes per day, week, or month and the average duration of each call.",
            url: "https://x1.nurturely.io/tools/sales-call-roi-calculator#form"
          },
          {
            name: "Add Cost Information",
            text: "Enter your sales rep hourly rate to calculate the true cost of time spent on calls.",
            url: "https://x1.nurturely.io/tools/sales-call-roi-calculator#form"
          },
          {
            name: "Input Conversion Metrics",
            text: "Add your conversion rate (percentage of calls that lead to deals) and average deal value.",
            url: "https://x1.nurturely.io/tools/sales-call-roi-calculator#form"
          },
          {
            name: "Analyze Your ROI",
            text: "Review your ROI percentage, cost per conversion, revenue per hour, and annual projections to optimize performance.",
            url: "https://x1.nurturely.io/tools/sales-call-roi-calculator#results"
          }
        ]}
        totalTime="PT5M"
        estimatedCost={{
          currency: "USD",
          value: "0"
        }}
      />

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-8">
          <Breadcrumb 
            items={[
              { label: "Resources", href: "/resources" },
              { label: "Sales Call ROI Calculator", href: "/tools/sales-call-roi-calculator" }
            ]} 
          />

          {/* Hero Section */}
          <section className="text-center mb-12">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
              <PhoneCall className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Sales Call ROI Calculator
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Calculate the true cost and return on investment of your sales calling efforts. 
              Understand your cost per conversion, revenue per hour, and optimize your sales team's time.
            </p>
          </section>

          {/* Calculator Form */}
          <section id="form" className="mb-12 max-w-4xl mx-auto">
            <SalesCallForm onCalculate={handleCalculate} />
          </section>

          {/* Results */}
          {metrics && (
            <section id="results" className="mb-12">
              <SalesCallResults metrics={metrics} />
            </section>
          )}

          {/* Educational Content */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-8 text-center">
              Why Calculate Sales Call ROI?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <Target className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Optimize Time Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Understand whether your sales team's time is being spent profitably. 
                    Identify if you should make more calls, improve conversion rates, or target higher-value deals.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Justify Sales Investments</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Make data-driven decisions about hiring more sales reps, investing in training, 
                    or upgrading sales tools with clear ROI metrics.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <DollarSign className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Improve Profitability</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Identify your cost per conversion and break-even point. 
                    Focus on metrics that matter most to improve overall sales profitability.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 bg-gradient-to-br from-primary/10 to-transparent rounded-lg">
            <h2 className="text-3xl font-bold mb-4">
              Want to Increase Your Sales Without More Calls?
            </h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              NurturelyX identifies companies visiting your website, giving your sales team 
              warm leads without cold calling. Calculate how much you're missing.
            </p>
            <Button asChild size="lg">
              <Link to="/">Calculate Lost Revenue</Link>
            </Button>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default SalesCallROICalculator;
