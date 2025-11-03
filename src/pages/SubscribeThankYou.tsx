import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { MetaTags } from "@/components/seo/MetaTags";

const SubscribeThankYou = () => {
  return (
    <>
      <MetaTags
        title="Thank You for Subscribing"
        description="Welcome to Nurturely"
        canonical="https://nurturely.io/subscribe/thank-you"
      />
      
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold mb-4">
            Welcome to Nurturely!
          </h1>
          
          <p className="text-muted-foreground mb-6">
            Your subscription is being processed. Check your email for confirmation and next steps.
          </p>

          <div className="bg-muted p-4 rounded-lg mb-6 text-left">
            <h3 className="font-semibold mb-2">What's Next?</h3>
            <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
              <li>Check your email for account details</li>
              <li>Log in to your dashboard</li>
              <li>Start identifying your visitors</li>
              <li>Need more credits? Purchase anytime</li>
            </ol>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/buy-credits">Buy Additional Credits</Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Go to Login</Link>
            </Button>
          </div>
        </Card>
      </div>
    </>
  );
};

export default SubscribeThankYou;
