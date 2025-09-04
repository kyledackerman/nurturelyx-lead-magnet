
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
    <Card className="bg-gradient-to-br from-primary/20 to-accent/15 border-primary/50 mt-8 px-8 py-10 shadow-2xl" data-cta-section="true">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Shocking headline */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full shadow-lg mb-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">REVENUE HEMORRHAGING ALERT</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
            You're Losing {formatCurrency(dailyLoss)}
            <span className="text-primary"> Every Single Day</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            That's {formatCurrency(hourlyLoss)} per hour. While you're reading this, money is walking out the door.
          </p>
        </div>

        {/* The cost of inaction */}
        <div className="bg-primary text-primary-foreground border-2 border-primary rounded-lg p-6 text-center shadow-xl">
          <h3 className="text-2xl font-bold mb-3">Here's What Doing Nothing Costs You:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-3xl font-bold bg-background text-foreground px-3 py-1 rounded-lg inline-block shadow-md">{formatCurrency(dailyLoss)}</div>
              <div className="text-primary-foreground/80 mt-2 font-medium">Lost Today</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-3xl font-bold bg-background text-foreground px-3 py-1 rounded-lg inline-block shadow-md">{formatCurrency(dailyLoss * 7)}</div>
              <div className="text-primary-foreground/80 mt-2 font-medium">Lost This Week</div>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4">
              <div className="text-3xl font-bold bg-background text-foreground px-3 py-1 rounded-lg inline-block shadow-md">{formatCurrency(dailyLoss * 30)}</div>
              <div className="text-primary-foreground/80 mt-2 font-medium">Lost This Month</div>
            </div>
          </div>
        </div>

        {/* Solution section */}
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-foreground">Here's How to Fix This: Get Your Pixel First</h3>
          <p className="text-xl text-muted-foreground">
            Step 1: Get your NurturelyX pixel to start tracking visitors<br/>
            Step 2: Load credits to identify and convert them into leads
          </p>
        </div>

        {/* Step 1: Platform Fee for Pixel */}
        <div className="bg-secondary text-secondary-foreground border border-border rounded-lg p-6 shadow-lg">
          <h4 className="text-xl font-bold text-center mb-4">Step 1: Get Your Pixel (Platform Fee)</h4>
          <p className="text-center text-muted-foreground mb-6">
            Choose your platform fee plan to access your tracking pixel:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Monthly Platform Fee */}
            <div className="bg-primary text-primary-foreground border-2 border-primary rounded-lg p-6 text-center relative shadow-xl transform hover:scale-105 transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-background text-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-primary">MOST POPULAR</span>
              </div>
              <div className="text-lg font-semibold mb-2">Monthly Platform Fee</div>
              <div className="bg-primary-foreground text-primary px-4 py-2 rounded-lg inline-block shadow-lg mb-2">
                <div className="text-4xl font-bold">$18</div>
              </div>
              <div className="mb-4 font-medium">per month</div>
              <div className="text-sm text-primary-foreground/90">Access to pixel + dashboard</div>
            </div>

            {/* Annual Platform Fee */}
            <div className="bg-accent text-accent-foreground border-2 border-accent rounded-lg p-6 text-center relative shadow-xl transform hover:scale-105 transition-all">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-background text-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 border-accent">SAVE $66</span>
              </div>
              <div className="text-lg font-semibold mb-2">Annual Platform Fee</div>
              <div className="bg-accent-foreground text-accent px-4 py-2 rounded-lg inline-block shadow-lg mb-2">
                <div className="text-4xl font-bold">$150</div>
              </div>
              <div className="mb-4 font-medium">per year</div>
              <div className="text-sm text-accent-foreground/90">Save $66 annually</div>
            </div>
          </div>
        </div>

        {/* Step 2: Credits for Identity Resolution */}
        <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 shadow-lg">
          <h4 className="text-xl font-bold text-foreground text-center mb-4">Step 2: Load Credits to Resolve Identities</h4>
          <p className="text-center text-muted-foreground mb-6">
            Once you have your pixel, load credits to start identifying visitors and converting them to leads:
          </p>
          
          <div className="bg-primary text-primary-foreground border-2 border-primary rounded-lg p-6 text-center max-w-md mx-auto shadow-xl">
            <div className="text-lg font-semibold mb-2">Identity Resolution Credits</div>
            <div className="bg-primary-foreground text-primary px-4 py-2 rounded-lg inline-block shadow-lg mb-2">
              <div className="text-4xl font-bold">$1</div>
            </div>
            <div className="mb-4 font-medium">per verified lead</div>
            <div className="text-sm text-primary-foreground/90">
              + $0.005 per email verification<br/>
              (Load as needed - no minimum purchase)
            </div>
          </div>
        </div>

        {/* What's included breakdown */}
        <div className="bg-secondary text-secondary-foreground border border-border rounded-lg p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-6">Here's What You Get:</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Included with Platform Fee */}
            <div className="space-y-4 bg-primary/10 rounded-lg p-4 border border-primary/30">
              <h4 className="text-lg font-semibold text-primary bg-primary/20 px-3 py-2 rounded-lg text-center">✅ Included with Platform Fee:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">NurturelyX tracking pixel</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Real-time visitor dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Behavioral tracking & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">Anonymous visitor analytics</span>
                </div>
              </div>
            </div>
            
            {/* Requires Credits */}
            <div className="space-y-4 bg-accent/10 rounded-lg p-4 border border-accent/30">
              <h4 className="text-lg font-semibold text-accent bg-accent/20 px-3 py-2 rounded-lg text-center">🔓 Unlocked with Credits:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Identify anonymous visitors ($1/lead)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Email verification ($0.005 each)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Complete contact information</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">Real-time lead notifications</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-primary text-primary-foreground rounded-lg text-center shadow-lg">
            <p className="text-sm">
              <strong>Example:</strong> $10 in credits = 2,000 email verifications or 10 verified leads
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center space-y-4">
          <div className="bg-primary text-primary-foreground px-6 py-3 rounded-lg inline-block shadow-lg">
            <p className="text-lg font-semibold">
              <strong>115+ businesses</strong> using NurturelyX to capture lost revenue
            </p>
          </div>
        </div>

        {/* Risk reversal */}
        <div className="bg-primary text-primary-foreground border-2 border-primary rounded-lg p-6 text-center shadow-xl">
          <p className="text-lg">
            <strong className="bg-primary-foreground text-primary px-2 py-1 rounded">Zero Risk Guarantee:</strong> If you have more than 500 visitors per month and don't get at least 100 resolved identities, 
            we'll refund every penny and let you keep all the data we found.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="text-center space-y-4">
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground px-12 py-6 text-2xl font-bold shadow-2xl transform hover:scale-105 transition-all border-2 border-accent">
            <Zap className="w-7 h-7 mr-3" />
            Get Your Pixel Now
          </Button>
          
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-foreground font-medium">
              The longer you wait, the more money walks out your door. Every day you delay costs you {formatCurrency(dailyLoss)}. 
              That's more than most people pay for NurturelyX in an entire year.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CallToAction;
