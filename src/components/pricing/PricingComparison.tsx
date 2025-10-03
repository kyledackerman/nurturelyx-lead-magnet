import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Zap, Crown, Mail } from "lucide-react";

const PricingComparison = () => {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {/* Self-Service Plan */}
      <Card className="border-2 border-primary/30 relative">
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
        <CardHeader className="text-center pt-8">
          <div className="flex justify-center mb-4">
            <Zap className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Self-Service</CardTitle>
          <CardDescription>Perfect for growing businesses</CardDescription>
          <div className="mt-6">
            <div className="text-5xl font-bold text-foreground">$100</div>
            <div className="text-muted-foreground mt-2">per month</div>
            <div className="text-sm text-muted-foreground mt-2">
              + $1 per identified lead
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {[
              "Instant pixel installation",
              "Real-time dashboard access",
              "Unlimited visitors tracked",
              "30+ data points per lead",
              "Email verification included",
              "CSV export functionality",
              "Email support",
              "Cancel anytime"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
          
          <Button 
            asChild
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
          >
            <a 
              href="https://link.nurturely.io/payment-link/68b9eb412197091d91e19a17" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Get Started Now
            </a>
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            No credit card required for trial
          </p>
        </CardContent>
      </Card>

      {/* White Glove Plan */}
      <Card className="border-2 border-accent/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Crown className="w-12 h-12 text-accent" />
          </div>
          <CardTitle className="text-2xl">White Glove</CardTitle>
          <CardDescription>For high-volume enterprises</CardDescription>
          <div className="mt-6">
            <div className="text-5xl font-bold text-foreground">Custom</div>
            <div className="text-muted-foreground mt-2">based on volume</div>
            <div className="text-sm text-muted-foreground mt-2">
              Volume discounts available
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {[
              "Everything in Self-Service",
              "Dedicated account manager",
              "Priority 24/7 support",
              "Custom integrations",
              "Advanced analytics & reporting",
              "Volume pricing (< $1/lead)",
              "White-label options",
              "Custom data enrichment"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
          
          <Button 
            asChild
            variant="outline"
            size="lg" 
            className="w-full border-2 border-accent text-accent hover:bg-accent/10"
          >
            <a href="mailto:hi@nurturely.io?subject=NurturelyX%20question">
              Send us an email
              <Mail className="w-4 h-4 ml-2" />
            </a>
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            Ideal for 1,000+ leads/month
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingComparison;
