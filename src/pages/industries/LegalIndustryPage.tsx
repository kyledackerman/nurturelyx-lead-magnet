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

export default function LegalIndustryPage() {
  usePageViewTracking('marketing');
  const industry = getIndustryData('legal');

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
        title="Legal Visitor Identification | Law Firm Lead Generation - NurturelyX"
        description="Identify anonymous website visitors at law firms. Track potential clients researching legal services and convert 35% more website traffic into qualified leads."
        canonical="https://x1.nurturely.io/industries/legal"
        keywords="law firm lead generation, legal visitor identification, attorney website tracking, legal services marketing"
      />
      
      <ServiceSchema
        name="Legal Visitor Identification Service"
        description="Identify anonymous website visitors for law firms and legal practices. Track potential clients researching your legal services and capture high-value case opportunities."
        serviceType="Professional Service"
      />
      
      <LocalBusinessSchema
        name="NurturelyX Legal Visitor Identification"
        description="Visitor identification technology for law firms and legal practices"
        businessType="ProfessionalService"
        areaServed={["United States"]}
      />
      
      <WebPageSchema
        name="Legal Visitor Identification & Law Firm Lead Generation"
        description="Track anonymous website visitors at law firms and identify potential clients researching legal services"
        url="https://x1.nurturely.io/industries/legal"
        breadcrumbs={[
          { name: "Industries", url: "/industries" },
          { name: "Legal", url: "/industries/legal" }
        ]}
        keywords={["law firm leads", "legal visitor identification", "attorney marketing", "legal services tracking"]}
      />

      <Header />
      
      <main className="min-h-screen">
        <div className="container max-w-6xl py-6">
          <Breadcrumb items={[
            { label: "Industries", href: "/industries" },
            { label: "Legal", href: "/industries/legal" }
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
              Legal Marketing Challenges
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              High-value cases require immediate follow-up
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
              Law Firms Using Visitor Intelligence
            </h2>
            <p className="text-lg text-muted-foreground">
              See potential revenue being left on the table
            </p>
          </div>
            <IndustryReportGrid industry="legal" />
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
              Benefits for Law Firms
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
