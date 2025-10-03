import { IndustryHero } from "@/components/industry/IndustryHero";
import { IndustryReportGrid } from "@/components/industry/IndustryReportGrid";
import { IndustryROICalculator } from "@/components/industry/IndustryROICalculator";
import { IndustryFAQ } from "@/components/industry/IndustryFAQ";
import CallToActionSection from "@/components/CallToActionSection";
import { getIndustryData } from "@/data/industryData";
import { AlertCircle } from "lucide-react";

export default function AutomotiveIndustryPage() {
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
    <div className="min-h-screen">
      <IndustryHero
        name={industry.name}
        headline={industry.headline}
        subheadline={industry.subheadline}
      />

      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Automotive Industry Challenges
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Identify fleet buyers and service customers before competitors do
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
              Automotive Businesses Tracking Website Visitors
            </h2>
            <p className="text-lg text-muted-foreground">
              Fleet sales and service opportunities being missed
            </p>
          </div>
          <IndustryReportGrid industry="automotive" />
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
              Automotive Visitor Intelligence Benefits
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

      <CallToActionSection />
    </div>
  );
}
