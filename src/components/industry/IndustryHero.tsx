import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { scrollToTop } from "@/lib/scroll";

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
            Get a free custom report showing exactly how many qualified leads are slipping through the cracks every month. 
            This is YOUR visitor data—see what you're missing.
          </p>
          <div className="flex gap-6 justify-center text-sm pt-2">
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>See exactly how many leads you're missing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Calculate your lost revenue opportunity</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✓</span>
              <span>Free custom report for YOUR domain</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="gradient-bg">
              <Link to="/">
                See How Many Leads You're Missing (Free)
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
