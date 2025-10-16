import { IndustryHero } from "@/components/industry/IndustryHero";
import { IndustryReportGrid } from "@/components/industry/IndustryReportGrid";
import { IndustryROICalculator } from "@/components/industry/IndustryROICalculator";
import { IndustryFAQ } from "@/components/industry/IndustryFAQ";
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

export default function RealEstateIndustryPage() {
  usePageViewTracking('marketing');
  const industry = getIndustryData('real-estate');

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
        title="Real Estate Visitor Identification | Property Lead Tracking - NurturelyX"
        description="Identify anonymous property browsers and real estate website visitors. Track potential buyers and sellers researching properties and convert more leads."
        canonical="https://x1.nurturely.io/industries/real-estate"
        keywords="real estate lead generation, property visitor tracking, real estate website leads, buyer identification"
      />
      
      <ServiceSchema
        name="Real Estate Visitor Identification Service"
        description="Identify anonymous website visitors for real estate companies. Track potential buyers and sellers researching properties and capture high-value leads."
        serviceType="Professional Service"
      />
      
      <LocalBusinessSchema
        name="NurturelyX Real Estate Visitor Identification"
        description="Visitor identification technology for real estate companies and property professionals"
        businessType="ProfessionalService"
        areaServed={["United States"]}
      />
      
      <WebPageSchema
        name="Real Estate Visitor Identification & Property Lead Generation"
        description="Track anonymous website visitors at real estate companies and identify potential buyers researching properties"
        url="https://x1.nurturely.io/industries/real-estate"
        breadcrumbs={[
          { name: "Industries", url: "/industries" },
          { name: "Real Estate", url: "/industries/real-estate" }
        ]}
        keywords={["real estate leads", "property visitor tracking", "buyer identification", "real estate marketing"]}
      />

      <Header />
      
      <main className="min-h-screen">
        <div className="container max-w-6xl py-6">
          <Breadcrumb items={[
            { label: "Industries", href: "/industries" },
            { label: "Real Estate", href: "/industries/real-estate" }
          ]} />
        </div>

        <IndustryHero
        name={industry.name}
        headline={industry.headline}
        subheadline={industry.subheadline}
      />

        <section className="py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Real Estate Lead Generation Challenges
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Convert property browsers into qualified buyers
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
                Real Estate Companies Tracking Visitors
              </h2>
              <p className="text-lg text-muted-foreground">
                See how much potential commission is being lost
              </p>
            </div>
            <IndustryReportGrid industry="real-estate" />
          </div>
        </section>

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
                What NurturelyX Provides Real Estate Professionals
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

        <IndustryFAQ faqs={industry.faqs} />
        <FAQSchema questions={industry.faqs} />

        <CallToActionSection />
      </main>
      
      <Footer />
    </>
  );
}
