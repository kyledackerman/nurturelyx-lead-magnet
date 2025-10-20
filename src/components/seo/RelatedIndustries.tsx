import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface RelatedIndustry {
  name: string;
  slug: string;
  description: string;
}

const industries: RelatedIndustry[] = [
  {
    name: "HVAC",
    slug: "hvac",
    description: "Heating, cooling, and HVAC service companies"
  },
  {
    name: "Home Services",
    slug: "home-services",
    description: "Plumbing, electrical, roofing, and general contractors"
  },
  {
    name: "Healthcare",
    slug: "healthcare",
    description: "Medical practices, dentists, and healthcare providers"
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    description: "Real estate agents, brokers, and property management"
  },
  {
    name: "Legal",
    slug: "legal",
    description: "Law firms, attorneys, and legal service providers"
  },
  {
    name: "Automotive",
    slug: "automotive",
    description: "Auto repair shops, dealerships, and automotive services"
  }
];

interface RelatedIndustriesProps {
  currentIndustry?: string;
  maxItems?: number;
}

export const RelatedIndustries = ({ currentIndustry, maxItems = 3 }: RelatedIndustriesProps) => {
  const filteredIndustries = industries
    .filter(ind => ind.slug !== currentIndustry)
    .slice(0, maxItems);

  if (filteredIndustries.length === 0) return null;

  return (
    <section className="py-16 border-t">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Other Industries</h2>
          <p className="text-lg text-muted-foreground">
            See how visitor identification works for different business types
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {filteredIndustries.map((industry) => (
            <Link 
              key={industry.slug} 
              to={`/industries/${industry.slug}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors flex items-center justify-between">
                    {industry.name}
                    <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{industry.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
