import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingComparison from "@/components/pricing/PricingComparison";
import ROICalculator from "@/components/pricing/ROICalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";

const PricingPage = () => {
  return (
    <>
      <Helmet>
        <title>Pricing - NurturelyX Identity Resolution Platform</title>
        <meta
          name="description"
          content="Simple, transparent pricing for identity resolution. Start at $100/month + $1 per identified lead. No hidden fees, cancel anytime."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-1">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn anonymous website visitors into qualified leads. No contracts. Cancel anytime.
            </p>
          </section>

          {/* Pricing Comparison */}
          <section className="container mx-auto px-4 pb-16">
            <PricingComparison />
          </section>

          {/* ROI Calculator */}
          <section className="bg-primary/5 py-16">
            <div className="container mx-auto px-4">
              <ROICalculator />
            </div>
          </section>

          {/* What's Included */}
          <section className="container mx-auto px-4 py-16">
            <h2 className="text-3xl font-bold text-center text-foreground mb-12">
              Everything Included with Platform Access
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Platform Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "NurturelyX tracking pixel",
                    "Real-time visitor dashboard",
                    "Anonymous visitor analytics",
                    "Secured & encrypted database",
                    "Email verification ($0.005 each)",
                    "CSV export functionality",
                    "API access for integrations"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-primary">Per-Lead Data Points</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    "Full name & contact details",
                    "Email & phone number",
                    "Physical address",
                    "Age, income, education level",
                    "Household composition",
                    "Credit score & buying power",
                    "Property ownership status"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ */}
          <section className="bg-secondary/30 py-16">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                Pricing FAQs
              </h2>
              
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What's included in the $100/month platform fee?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    The platform fee includes your tracking pixel, dashboard access, anonymous visitor analytics, 
                    database storage, email verification, and all platform features. You only pay per-lead costs 
                    when you actually identify a visitor.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    How does the $1 per lead pricing work?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    You load credits into your account (no minimum purchase). Each time we successfully identify 
                    a visitor with full contact information, $1 is deducted from your credit balance. You only 
                    pay for successful identifications.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Is there a minimum credit purchase?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    No minimum! Load $50, $500, or $5,000 - whatever makes sense for your business. 
                    Credits never expire and you can add more anytime.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What if I want to cancel?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Cancel anytime, no questions asked. Your pixel will stop tracking at the end of your billing 
                    period, and you'll keep access to all previously identified leads. Any remaining credits 
                    can be used until they're depleted.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    Do you offer volume discounts?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes! For businesses identifying 1,000+ leads per month, we offer custom enterprise pricing 
                    with volume discounts, dedicated support, and white-glove onboarding. Email us to discuss.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="border border-border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    What's your money-back guarantee?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    If you have 1,000+ monthly visitors and don't get at least 100 identified leads in your first 
                    30 days, we'll refund 100% of your platform fee and let you keep all the data. No risk.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
