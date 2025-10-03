import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface IndustryHeroProps {
  name: string;
  headline: string;
  subheadline: string;
}

export const IndustryHero = ({ name, headline, subheadline }: IndustryHeroProps) => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container max-w-6xl">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            {name} Industry Solutions
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            {headline}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            {subheadline}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="gradient-bg">
              <Link to="/">
                Calculate Your Lost Revenue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/how-it-works">
                See How It Works
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
