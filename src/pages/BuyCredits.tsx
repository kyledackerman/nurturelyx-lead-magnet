import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MetaTags } from "@/components/seo/MetaTags";
import { Loader2, Coins } from "lucide-react";

// Replace these URLs with your actual Stripe checkout links
const CREDIT_PACKAGES = [
  { credits: 500, price: 45, stripeLink: "YOUR_STRIPE_LINK_500_CREDITS" },
  { credits: 1000, price: 85, stripeLink: "YOUR_STRIPE_LINK_1000_CREDITS", popular: true },
  { credits: 2500, price: 200, stripeLink: "YOUR_STRIPE_LINK_2500_CREDITS" },
  { credits: 5000, price: 375, stripeLink: "YOUR_STRIPE_LINK_5000_CREDITS" },
];

const BuyCredits = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from("subscriber_profiles")
        .select("credit_balance")
        .eq("user_id", user.id)
        .single();

      if (!error && data) {
        setCreditBalance(data.credit_balance);
      }
      setLoading(false);
    };

    fetchBalance();
  }, [user, navigate]);

  const handlePurchase = (stripeLink: string) => {
    window.open(stripeLink, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title="Buy Credits"
        description="Purchase visitor identification credits"
        canonical="https://nurturely.io/buy-credits"
      />
      
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Buy Credits</h1>
            <p className="text-xl text-muted-foreground mb-6">
              Purchase additional credits to identify more visitors
            </p>
            
            {creditBalance !== null && (
              <Card className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-semibold">Current Balance: {creditBalance.toLocaleString()} credits</span>
              </Card>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CREDIT_PACKAGES.map((pkg) => (
              <Card
                key={pkg.credits}
                className={`p-6 relative ${
                  pkg.popular ? "border-primary border-2" : ""
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    {pkg.credits.toLocaleString()}
                  </h3>
                  <p className="text-muted-foreground text-sm">credits</p>
                  <p className="text-3xl font-bold mt-4">${pkg.price}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(pkg.price / pkg.credits).toFixed(3)} per credit
                  </p>
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.stripeLink)}
                  className="w-full"
                  variant={pkg.popular ? "default" : "outline"}
                >
                  Purchase
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="p-6 bg-muted/50 max-w-2xl mx-auto">
              <h3 className="font-semibold mb-2">How Credits Work</h3>
              <p className="text-sm text-muted-foreground">
                Each credit allows you to identify one unique visitor on your website.
                Credits never expire and can be used anytime. Your subscription includes
                1,000 credits per month automatically.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyCredits;
