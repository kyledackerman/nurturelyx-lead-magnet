import { Code, Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { scrollToTop } from "@/lib/scroll";

export const IntegrationSteps = () => {
  return (
    <section className="py-16">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Setup Takes 5 Minutes
          </h2>
          <p className="text-lg text-muted-foreground">
            No technical expertise required. If you can paste text, you can install NurturelyX.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex items-start gap-6 p-6 bg-background rounded-lg border">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              1
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Code className="h-5 w-5" />
                Get Your Tracking Code
              </h3>
              <p className="text-muted-foreground mb-4">
                Sign up and instantly receive your unique tracking pixel. It's a single line of JavaScript code.
              </p>
              <div className="bg-muted p-4 rounded font-mono text-sm overflow-x-auto">
                {`<script src="https://track.nurturex.io/pixel.js?id=YOUR_ID"></script>`}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-6 p-6 bg-background rounded-lg border">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              2
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Check className="h-5 w-5" />
                Add It To Your Website
              </h3>
              <p className="text-muted-foreground mb-4">
                Paste the code into your website's header. Works with any platform:
              </p>
              <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['WordPress', 'Shopify', 'Wix', 'Squarespace', 'Webflow', 'Custom HTML'].map((platform) => (
                  <li key={platform} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {platform}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-6 p-6 bg-background rounded-lg border">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl">
              3
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Start Receiving Leads
              </h3>
              <p className="text-muted-foreground">
                Within 24 hours, you'll start seeing identified visitors in your dashboard. Daily email reports 
                arrive each morning with all new leads, complete with contact information.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="gradient-bg">
            <Link to="/">Get Started Now - Free Report</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • See your results in 5 minutes
          </p>
        </div>
      </div>
    </section>
  );
};
