
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Clock, DollarSign, Zap, CheckCircle2, AlertTriangle } from "lucide-react";

interface CallToActionProps {
  yearlyRevenueLost: number;
}

const CallToAction = ({ yearlyRevenueLost }: CallToActionProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const dailyLoss = yearlyRevenueLost / 365;
  const hourlyLoss = dailyLoss / 24;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 mt-8 px-6 py-8" data-cta-section="true">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Shocking headline */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">REVENUE HEMORRHAGING ALERT</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            You're Losing <span className="text-red-500">{formatCurrency(dailyLoss)}</span>
            <span className="text-primary"> Every Single Day</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            That's <span className="text-red-500">{formatCurrency(hourlyLoss)}</span> per hour. While you're reading this, money is walking out the door.
          </p>
        </div>

        {/* The cost of inaction */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Here's What Doing Nothing Costs You:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-red-500">{formatCurrency(dailyLoss)}</div>
              <div className="text-muted-foreground">Lost Today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{formatCurrency(dailyLoss * 7)}</div>
              <div className="text-muted-foreground">Lost This Week</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-500">{formatCurrency(dailyLoss * 30)}</div>
              <div className="text-muted-foreground">Lost This Month</div>
            </div>
          </div>
        </div>

        {/* Solution section */}
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-foreground">Here's How to Fix This: Get Your Pixel First</h3>
        </div>

        {/* Step 1: Platform Fee for Pixel */}
        <div className="bg-secondary/50 border border-border rounded-lg p-4">
          <h4 className="text-xl font-bold text-foreground text-center mb-3">Step 1: Get Your Pixel (Platform Fee)</h4>
          <p className="text-center text-muted-foreground mb-4">
            Choose your platform fee plan to access your tracking pixel:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly Platform Fee */}
            <div className="bg-primary/10 border-2 border-primary rounded-lg p-4 text-center relative">
              <div className="text-lg font-semibold text-primary mb-2">Monthly Platform Fee</div>
              <div className="text-4xl font-bold text-foreground mb-2">$18</div>
              <div className="text-primary mb-4">per month</div>
              <div className="text-sm text-muted-foreground">Access to pixel + dashboard</div>
            </div>

            {/* Annual Platform Fee */}
            <div className="bg-primary/5 border border-primary/50 rounded-lg p-4 text-center relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">SAVE $66</span>
              </div>
              <div className="text-lg font-semibold text-primary mb-2">Annual Platform Fee</div>
              <div className="text-4xl font-bold text-foreground mb-2">$150</div>
              <div className="text-primary mb-4">per year</div>
              <div className="text-sm text-muted-foreground">Save $66 annually</div>
            </div>
          </div>
        </div>

        {/* Step 2: Credits for Identity Resolution */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h4 className="text-xl font-bold text-foreground text-center mb-3">Step 2: Load Credits to Resolve Identities</h4>
          <p className="text-center text-muted-foreground mb-4">
            Once you have your pixel, load credits to start identifying visitors and converting them to leads:
          </p>
          
          <div className="bg-secondary/30 border border-border rounded-lg p-4 text-center max-w-md mx-auto">
            <div className="text-lg font-semibold text-foreground mb-2">Identity Resolution Credits</div>
            <div className="text-4xl font-bold text-primary mb-2">$1</div>
            <div className="text-muted-foreground mb-4">per verified lead</div>
            <div className="text-sm text-muted-foreground">
              + $0.005 per email verification<br/>
              (Load as needed - no minimum purchase)
            </div>
          </div>
        </div>

        {/* What's included breakdown */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <h3 className="text-2xl font-bold text-foreground text-center mb-4">Here's What You Get:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Included with Platform Fee */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">✅ Included with Platform Fee:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">NurturelyX tracking pixel</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Secured & Encrypted Database of Leads</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Anonymous visitor analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Email verifications ($0.005 each)</span>
                </div>
              </div>
            </div>
            
            {/* Requires Credits */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-primary">🔓 Unlocked with Credits:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Know their exact age, income level, and lifestyle preferences</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">See their household size and family composition</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Discover their credit score and spending power</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Find out if they're homeowners and their property value</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Target them by precise location and neighborhood</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Understand their political views and lifestyle choices</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Learn about their children's ages and family dynamics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk reversal */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
          <p className="text-foreground">
            <strong className="text-primary">Zero Risk Guarantee:</strong> If you have more than 500 visitors per month and don't get at least 100 resolved identities within the first 30 days of pixel installation, 
            we'll refund every penny and let you keep all the data we found.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="text-center space-y-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground 
                         px-4 py-4 text-base
                         sm:px-6 sm:py-5 sm:text-lg  
                         md:px-8 md:py-6 md:text-xl
                         lg:px-16 lg:py-8 lg:text-3xl
                         xl:px-36 xl:py-12 xl:text-5xl
                         font-bold shadow-2xl transform hover:scale-105 transition-all w-full">
            <Zap className="w-4 h-4 mr-2 sm:w-5 sm:h-5 sm:mr-2 md:w-6 md:h-6 md:mr-3 lg:w-12 lg:h-12 lg:mr-4 xl:w-18 xl:h-18 xl:mr-6" />
            Get Your Pixel Now
          </Button>
          
          <p className="text-muted-foreground text-lg">
            <strong className="text-primary">115+ businesses</strong> using NurturelyX to capture lost revenue
          </p>
          
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The longer you wait, the more money walks out your door. Every day you delay costs you <span className="text-red-500">{formatCurrency(dailyLoss)}</span>. 
            That's more than most people pay for NurturelyX in an entire year.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CallToAction;
