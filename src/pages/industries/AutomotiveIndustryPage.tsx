import { IndustryHero } from "@/components/industry/IndustryHero";
import { IndustryReportGrid } from "@/components/industry/IndustryReportGrid";
import { IndustryROICalculator } from "@/components/industry/IndustryROICalculator";
import { IndustryFAQ } from "@/components/industry/IndustryFAQ";
import { IndustrySocialProof } from "@/components/industry/IndustrySocialProof";
import { IndustryDataOwnership } from "@/components/industry/IndustryDataOwnership";
import { IndustryTestimonial } from "@/components/industry/IndustryTestimonial";
import { StickyIndustryCTA } from "@/components/industry/StickyIndustryCTA";
import CallToActionSection from "@/components/CallToActionSection";
import { getIndustryData } from "@/data/industryData";
import { AlertCircle } from "lucide-react";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { MetaTags } from "@/components/seo/MetaTags";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AutomotiveIndustryPage() {
  usePageViewTracking('marketing');
  const industry = getIndustryData('automotive');

  if (!industry) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Industry data not found</h1>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title="Automotive Visitor Identification | Dealership Lead Generation - NurturelyX"
        description="Identify anonymous website visitors for automotive dealerships. Track fleet managers and car buyers researching vehicles."
        canonical="https://x1.nurturely.io/industries/automotive"
        keywords="automotive lead generation, dealership visitor tracking, fleet sales leads, automotive marketing"
      />
      
      <ServiceSchema
        name="Automotive Visitor Identification Service"
        description="Identify anonymous website visitors for automotive dealerships and vehicle sales businesses."
        serviceType="Professional Service"
      />
      
      <LocalBusinessSchema
        name="NurturelyX Automotive Visitor Identification"
        description="Visitor identification technology for automotive dealerships and vehicle sales"
        businessType="ProfessionalService"
        areaServed={["United States"]}
      />
      
      <WebPageSchema
        name="Automotive Visitor Identification & Lead Generation"
        description="Track anonymous website visitors for automotive dealerships and identify potential buyers researching vehicles"
        url="https://x1.nurturely.io/industries/automotive"
        breadcrumbs={[
          { name: "Industries", url: "/industries" },
          { name: "Automotive", url: "/industries/automotive" }
        ]}
        keywords={["automotive leads", "dealership visitor tracking", "fleet sales lead generation", "automotive marketing"]}
      />

      <Header />
      
      <main className="min-h-screen">
        <div className="container max-w-6xl py-6">
          <Breadcrumb items={[
            { label: "Industries", href: "/industries" },
            { label: "Automotive", href: "/industries/automotive" }
          ]} />
        </div>

        <IndustryHero
          name={industry.name}
          headline={industry.headline}
          subheadline={industry.subheadline}
        />

        <IndustrySocialProof industry="automotive" industryName={industry.name} />

        <section className="py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Automotive Marketing Challenges
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Common issues facing automotive dealerships
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {industry.painPoints.map((point, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <p className="text-lg">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Automotive Businesses Losing Revenue
              </h2>
              <p className="text-lg text-muted-foreground">
                Real examples of missed opportunities
              </p>
            </div>
            <IndustryReportGrid industry="automotive" />
          </div>
        </section>

        {industry.testimonials && industry.testimonials[0] && (
          <section className="py-12">
            <div className="container max-w-6xl">
              <IndustryTestimonial {...industry.testimonials[0]} />
            </div>
          </section>
        )}

        <section className="py-16 bg-muted/30">
          <div className="container max-w-4xl">
            <IndustryROICalculator
              industryName={industry.name}
              avgConversionRate={industry.avgConversionRate}
              avgTransactionValue={industry.avgTransactionValue}
            />
          </div>
        </section>

        <section className="py-16">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How Visitor Identification Helps Automotive Dealerships
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {industry.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <p className="text-lg">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <IndustryDataOwnership />

        <IndustryFAQ faqs={industry.faqs} />
        <FAQSchema questions={industry.faqs} />

        <CallToActionSection />
        
        <StickyIndustryCTA industryName={industry.name} />
      </main>
      
      <Footer />
    </>
  );
}
