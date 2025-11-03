import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { MetaTags } from "@/components/seo/MetaTags";

const SubscribeCheckout = () => {
  const handleSubscribe = () => {
    window.open("https://link.nurturely.io/payment-link/68b9eb412197091d91e19a17", "_blank");
  };

  return (
    <>
      <MetaTags
        title="Subscribe to Nurturely"
        description="Get unlimited access to visitor identification and lead generation"
        canonical="https://nurturely.io/subscribe"
      />
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* VSL Placeholder */}
          <Card className="p-8 mb-8 bg-card">
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
              <p className="text-muted-foreground">Video Sales Letter Placeholder</p>
            </div>
            <h1 className="text-4xl font-bold text-center mb-4">
              Turn Anonymous Visitors Into Revenue
            </h1>
            <p className="text-xl text-center text-muted-foreground mb-8">
              Join hundreds of businesses identifying their website visitors
            </p>
          </Card>

          {/* Pricing Card */}
          <Card className="p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold mb-2">$100/month</h2>
              <p className="text-muted-foreground">Platform Access + 1,000 Credits</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>1,000 visitor identification credits per month</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Full access to lead generation tools</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>CRM integration and reporting</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
            </ul>

            <Button 
              onClick={handleSubscribe}
              size="lg"
              className="w-full"
            >
              Subscribe Now
            </Button>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Cancel anytime. No long-term contracts.
            </p>
          </Card>

          {/* Social Proof */}
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground mb-4">Trusted by businesses worldwide</p>
            <div className="flex items-center justify-center gap-8 text-muted-foreground">
              <span>⭐⭐⭐⭐⭐</span>
              <span>500+ Active Users</span>
              <span>$2M+ Revenue Tracked</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubscribeCheckout;
