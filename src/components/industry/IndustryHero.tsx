import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { scrollToTopIfHomeLink } from "@/lib/scroll";

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
          <div className="inline-block px-4 py-2 bg-accent/10 rounded-full text-sm font-semibold mb-4">
            <span className="text-accent">🔓 Unlock YOUR First-Party Data</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
            Stop Losing 95% of Your {name} Website Traffic
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Identify anonymous visitors by name, email, and phone. 
            This is YOUR data from YOUR website—we just help you see it.
          </p>
          <div className="flex gap-6 justify-center text-sm pt-2">
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Identify 35% of anonymous traffic</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Full contact details included</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Your data, your leads</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="gradient-bg" onClick={scrollToTopIfHomeLink}>
              <Link to="/">
                See Who's Visiting My Site (Free)
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/how-it-works">
                How Identity Resolution Works
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
