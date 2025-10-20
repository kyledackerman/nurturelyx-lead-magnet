import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, Home, Scale, Hammer, Car, HeartPulse, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface UseCase {
  industry: string;
  industrySlug: string;
  icon: LucideIcon;
  scenario: string;
  description: string;
  hasPage: boolean;
}

const useCases: UseCase[] = [
  {
    industry: "HVAC Companies",
    industrySlug: "hvac",
    icon: Wrench,
    scenario: "Emergency AC Repair Leads",
    description: "Sarah visits 5 HVAC sites comparing AC repair pricing but doesn't call anyone. You identify her as a homeowner in Phoenix, 43 years old, $95K income. Your team calls within 30 minutes—she books the $4,200 repair because you followed up first.",
    hasPage: true
  },
  {
    industry: "Real Estate",
    industrySlug: "real-estate",
    icon: Home,
    scenario: "Home Buyer Intent Signals",
    description: "Mark spends 8 minutes on your listing pages, views 3 properties in the $400-500K range, then leaves. You identify him as a pre-qualified buyer, married, household income $120K. Your agent reaches out with matching listings—he schedules showings with you, not competitors.",
    hasPage: true
  },
  {
    industry: "Legal Services",
    industrySlug: "legal",
    icon: Scale,
    scenario: "High-Value Case Prospects",
    description: "Jennifer researches personal injury attorneys, spends 6 minutes reading your case results page. You identify her as a 38-year-old professional with strong credit, perfect plaintiff profile. You call before she contacts other firms—she retains you for a $40K case.",
    hasPage: true
  },
  {
    industry: "Home Services",
    industrySlug: "home-services",
    icon: Hammer,
    scenario: "Roofing Replacement Leads",
    description: "David visits your roofing page after a hailstorm, checks pricing, leaves without calling. You identify him as a homeowner with $850K home value and insurance claim potential. You reach out offering free inspection—he books a $28K roof replacement.",
    hasPage: true
  },
  {
    industry: "Automotive",
    industrySlug: "automotive",
    icon: Car,
    scenario: "Service Appointment Recovery",
    description: "Lisa researches brake repair on your site, views pricing, abandons. You identify her as a 2019 Honda owner, 15K miles overdue for service. Your service advisor calls offering brake special—she books $1,800 in maintenance work that day.",
    hasPage: true
  },
  {
    industry: "Healthcare",
    industrySlug: "healthcare",
    icon: HeartPulse,
    scenario: "Medical Device Procurement",
    description: "Hospital procurement officer researches your surgical equipment, reviews 12 product pages. You identify the hospital system, department, and decision-maker contact. Your sales rep reaches out with custom pricing—closes $140K order.",
    hasPage: true
  }
];

export const IndustryUseCases = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In Action: Real Scenarios From Your Industry
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Here's exactly how businesses like yours turn anonymous visitors into customers—with real names, phone numbers, and buying intent.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = useCase.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:border-accent/50 bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-accent/10 rounded-lg group-hover:bg-accent/20 transition-colors">
                      <Icon className="w-10 h-10 md:w-12 md:h-12 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-muted-foreground mb-1">
                        {useCase.industry}
                      </h3>
                      <p className="font-bold text-base text-foreground">
                        {useCase.scenario}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {useCase.description}
                  </p>

                  {useCase.hasPage ? (
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-between group-hover:bg-accent/10"
                    >
                      <Link to={`/industries/${useCase.industrySlug}`}>
                        See {useCase.industry} Solutions
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm"
                      className="w-full justify-between group-hover:bg-accent/10"
                    >
                      <Link to="/">
                        Get Your Free Report
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
