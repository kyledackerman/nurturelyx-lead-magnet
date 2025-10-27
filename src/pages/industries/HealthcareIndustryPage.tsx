import { IndustryHero } from "@/components/industry/IndustryHero";
import { IndustryReportGrid } from "@/components/industry/IndustryReportGrid";
import { IndustryROICalculator } from "@/components/industry/IndustryROICalculator";
import { IndustryFAQ } from "@/components/industry/IndustryFAQ";
import { IndustrySocialProof } from "@/components/industry/IndustrySocialProof";
import { IndustryDataOwnership } from "@/components/industry/IndustryDataOwnership";
import { IndustryTestimonial } from "@/components/industry/IndustryTestimonial";
import { StickyIndustryCTA } from "@/components/industry/StickyIndustryCTA";
import { IndustryCompetitorComparison } from "@/components/industry/IndustryCompetitorComparison";
import { IndustryCaseStudies } from "@/components/industry/IndustryCaseStudies";
import { IndustryStatistics } from "@/components/industry/IndustryStatistics";
import { IndustryImplementation } from "@/components/industry/IndustryImplementation";
import { IndustryContent } from "@/components/industry/IndustryContent";
import CallToActionSection from "@/components/CallToActionSection";
import { getIndustryData } from "@/data/industryData";
import { AlertCircle } from "lucide-react";
import { FAQSchema } from "@/components/seo/FAQSchema";
import { MetaTags } from "@/components/seo/MetaTags";
import { ServiceSchema } from "@/components/seo/ServiceSchema";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { WebPageSchema } from "@/components/seo/WebPageSchema";
import { Breadcrumb } from "@/components/report/Breadcrumb";
import { RelatedIndustries } from "@/components/seo/RelatedIndustries";
import { usePageViewTracking } from "@/hooks/usePageViewTracking";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function HealthcareIndustryPage() {
  usePageViewTracking('marketing');
  const industry = getIndustryData('healthcare');

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
        title="Healthcare B2B Visitor Identification 2025 | Medical Device Lead Generation - NurturelyX"
        description="Identify hospitals & clinics researching your medical devices. Turn anonymous healthcare visitors into qualified leads—get your free B2B lead report now."
        canonical="https://x1.nurturely.io/industries/healthcare"
        keywords="healthcare lead generation, medical device leads, hospital visitor tracking, B2B healthcare marketing"
      />
      
      <ServiceSchema
        name="Healthcare B2B Visitor Identification Service"
        description="Identify anonymous website visitors for healthcare B2B businesses, medical device companies, and healthcare IT providers."
        serviceType="Professional Service"
      />
      
      <LocalBusinessSchema
        name="NurturelyX Healthcare Visitor Identification"
        description="Visitor identification technology for B2B healthcare businesses and medical device companies"
        businessType="ProfessionalService"
        areaServed={["United States"]}
      />
      
      <WebPageSchema
        name="Healthcare B2B Visitor Identification & Lead Generation"
        description="Track anonymous website visitors for healthcare B2B businesses and identify healthcare facilities researching medical solutions"
        url="https://x1.nurturely.io/industries/healthcare"
        breadcrumbs={[
          { name: "Industries", url: "/industries" },
          { name: "Healthcare", url: "/industries/healthcare" }
        ]}
        keywords={["healthcare B2B leads", "medical device visitor tracking", "hospital lead generation", "healthcare IT marketing"]}
      />

      <Header />
      
      <main className="min-h-screen">
        <div className="container max-w-6xl py-6">
          <Breadcrumb items={[
            { label: "Industries", href: "/industries" },
            { label: "Healthcare", href: "/industries/healthcare" }
          ]} />
        </div>

        <IndustryHero
          name={industry.name}
          headline={industry.headline}
          subheadline={industry.subheadline}
        />

        <IndustrySocialProof industry="healthcare" industryName={industry.name} />

        <section className="py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Healthcare B2B Marketing Challenges
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Common issues facing healthcare B2B businesses
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

        <IndustryCompetitorComparison industryName={industry.name} />

        <section className="py-16">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Healthcare Businesses Losing Revenue
              </h2>
              <p className="text-lg text-muted-foreground">
                Real examples of missed opportunities
              </p>
            </div>
            <IndustryReportGrid industry="healthcare" />
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
                How Visitor Identification Helps Healthcare B2B
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

        {industry.contentSections && industry.contentSections.length > 0 && (
          <IndustryContent industryName={industry.name} sections={industry.contentSections} />
        )}

        {industry.statistics && (
          <IndustryStatistics 
            industryName={industry.name}
            statistics={industry.statistics.data}
            marketSize={industry.statistics.marketSize}
            growthRate={industry.statistics.growthRate}
          />
        )}

        {industry.caseStudies && industry.caseStudies.length > 0 && (
          <IndustryCaseStudies caseStudies={industry.caseStudies} industryName={industry.name} />
        )}

        <IndustryImplementation industryName={industry.name} />

        <IndustryFAQ faqs={industry.faqs} />
        <FAQSchema questions={industry.faqs} />

        <RelatedIndustries currentIndustry="healthcare" />

        <CallToActionSection />
        
        <StickyIndustryCTA industryName={industry.name} />
      </main>
      
      <Footer />
    </>
  );
}
