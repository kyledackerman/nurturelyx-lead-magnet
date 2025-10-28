import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingComparison from "@/components/pricing/PricingComparison";
import ROICalculator from "@/components/pricing/ROICalculator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2 } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { InternalLinkingWidget } from "@/components/seo/InternalLinkingWidget";

const PricingPage = () => {
  usePageViewTracking('marketing');
  
  const faqItems = [
    {
      question: "How does the pricing work?",
      answer: "You pay $100/month for platform access, plus $1 for each visitor we successfully identify. For example, if we identify 500 visitors in a month, your total would be $600 ($100 + $500)."
    },
    {
      question: "What happens if you identify more visitors than expected?",
      answer: "That's great news! You only pay for successful identifications. If your traffic grows, so does your lead generation. Most clients see this as a positive ROI since each identified visitor is a potential customer."
    },
    {
      question: "Is there a contract or can I cancel anytime?",
      answer: "No long-term contracts required. You can cancel anytime with 30 days notice. We believe in earning your business every month through great results."
    },
    {
      question: "What information do I get for each identified visitor?",
      answer: "Each identified visitor includes: Full name, email, phone number, physical address, age, income level, education, household composition, credit score range, buying power, and property ownership status."
    },
    {
      question: "How accurate is the visitor identification?",
      answer: "We use multiple data sources and validation methods to ensure high accuracy. Our identification rate averages 15-25% of your website visitors, with a data accuracy rate of over 90%."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes! For businesses identifying over 1,000 visitors per month, we offer custom enterprise pricing. Contact our sales team to discuss volume pricing options."
    },
    {
      question: "How do I integrate NurturelyX with my website?",
      answer: "Integration is simple - just add our tracking pixel to your website (similar to Google Analytics). Most clients complete setup in under 10 minutes. We provide detailed documentation and support."
    },
    {
      question: "Is my data secure and compliant?",
      answer: "Absolutely. We're fully GDPR, CCPA, and TCPA compliant. All data is encrypted at rest and in transit. We follow SOC 2 security standards and never sell your data to third parties."
    }
  ];
  
  return (
    <>
      <MetaTags
        title="$1 Per Lead Pricing | No Contracts | 500+ Companies Trust Us - NurturelyX"
        description="Simple, transparent pricing for visitor identification. $100/month + $1 per identified lead. No hidden fees, no contracts. Calculate your ROI and start identifying website visitors today."
        canonical="https://x1.nurturely.io/pricing"
        keywords="visitor identification pricing, lead generation cost, identity resolution pricing, B2B lead pricing, website visitor tracking cost"
        ogType="website"
      />
      
      <ProductSchema
        name="NurturelyX Visitor Identification Platform"
        description="Turn anonymous website visitors into qualified leads with our visitor identification platform"
        offers={[
          {
            price: "100",
            priceCurrency: "USD",
            name: "Platform Access",
            description: "Monthly platform access fee",
            url: "https://x1.nurturely.io/pricing"
          },
          {
            price: "1",
            priceCurrency: "USD",
            name: "Per Identified Lead",
            description: "Cost per successfully identified website visitor",
            url: "https://x1.nurturely.io/pricing"
          }
        ]}
      />
      
      <WebPageSchema
        name="Pricing - NurturelyX Visitor Identification"
        description="Transparent pricing for turning anonymous website visitors into qualified leads"
        url="https://x1.nurturely.io/pricing"
        breadcrumbs={[{ name: "Pricing", url: "/pricing" }]}
        keywords={["pricing", "visitor identification", "lead generation cost"]}
      />
      
      <FAQSchema questions={faqItems} />

      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <nav className="container mx-auto px-4 pt-6">
          <Breadcrumb items={[{ label: "Pricing", href: "/pricing" }]} />
        </nav>

        <main role="main" className="flex-1" itemScope itemType="https://schema.org/WebPage">
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
                {faqItems.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <InternalLinkingWidget 
            title="Learn More About Visitor Identification"
            links={[
              {
                title: "All Resources & Guides",
                href: "/resources",
                description: "Access our complete library of lead generation guides and tools"
              },
              {
                title: "How It Works",
                href: "/how-it-works",
                description: "Understand the technology behind visitor identification"
              },
              {
                title: "Calculate Your ROI",
                href: "/",
                description: "Get a free analysis of your missed opportunities"
              }
            ]}
          />
        </main>

        <Footer />
      </div>
    </>
  );
};

export default PricingPage;
