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

export default function HomeServicesIndustryPage() {
  usePageViewTracking('marketing');
  const industry = getIndustryData('home-services');

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
        title="Home Services Visitor Identification 2025 | HVAC, Plumbing Leads - NurturelyX"
        description="Identify anonymous home services website visitors researching plumbing, HVAC & contractors. Convert browsers into booked jobs—get your free lead report today."
        canonical="https://x1.nurturely.io/industries/home-services"
        keywords="home services lead generation, HVAC leads, plumbing visitor tracking, contractor marketing"
      />
      
      <ServiceSchema
        name="Home Services Visitor Identification Service"
        description="Identify anonymous website visitors for home service businesses including HVAC, plumbing, electrical, and general contractors."
        serviceType="Professional Service"
      />
      
      <LocalBusinessSchema
        name="NurturelyX Home Services Visitor Identification"
        description="Visitor identification technology for home service businesses and contractors"
        businessType="ProfessionalService"
        areaServed={["United States"]}
      />
      
      <WebPageSchema
        name="Home Services Visitor Identification & Lead Generation"
        description="Track anonymous website visitors for home service businesses and identify potential customers researching services"
        url="https://x1.nurturely.io/industries/home-services"
        breadcrumbs={[
          { name: "Industries", url: "/industries" },
          { name: "Home Services", url: "/industries/home-services" }
        ]}
        keywords={["home service leads", "HVAC visitor tracking", "plumbing lead generation", "contractor marketing"]}
      />

      <Header />
      
      <main className="min-h-screen">
        <div className="container max-w-6xl py-6">
          <Breadcrumb items={[
            { label: "Industries", href: "/industries" },
            { label: "Home Services", href: "/industries/home-services" }
          ]} />
        </div>

        <IndustryHero
          name={industry.name}
          headline={industry.headline}
          subheadline={industry.subheadline}
        />

        <IndustrySocialProof industry="home-services" industryName={industry.name} />

        <section className="py-16 bg-muted/30">
          <div className="container max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Home Services Marketing Challenges
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Turn website traffic into booked jobs
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
                Home Service Businesses Losing Revenue
              </h2>
              <p className="text-lg text-muted-foreground">
                Real examples of missed opportunities
              </p>
            </div>
            <IndustryReportGrid industry="home-services" />
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
                How Visitor Identification Helps Home Services
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

        <RelatedIndustries currentIndustry="home-services" />

        <CallToActionSection />
        
        <StickyIndustryCTA industryName={industry.name} />
      </main>
      
      <Footer />
    </>
  );
}
