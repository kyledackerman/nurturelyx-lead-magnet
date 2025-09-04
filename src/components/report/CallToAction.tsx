
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
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30 mt-8 px-8 py-10" data-cta-section="true">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Shocking headline */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary mb-2">
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
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">Here's What Doing Nothing Costs You:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary">{formatCurrency(dailyLoss)}</div>
              <div className="text-muted-foreground">Lost Today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{formatCurrency(dailyLoss * 7)}</div>
              <div className="text-muted-foreground">Lost This Week</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">{formatCurrency(dailyLoss * 30)}</div>
              <div className="text-muted-foreground">Lost This Month</div>
            </div>
          </div>
        </div>

        {/* Solution section */}
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-foreground">Here's How to Fix This (It's Cheaper Than Your Coffee)</h3>
          <p className="text-xl text-muted-foreground">
            Stop the bleeding with NurturelyX. Choose your pricing model:
          </p>
        </div>

        {/* Pricing explanation */}
        <div className="bg-secondary/50 border border-border rounded-lg p-4 text-center">
          <p className="text-foreground font-medium mb-2">Two Simple Pricing Options:</p>
          <div className="text-muted-foreground text-sm">
            <strong>Option 1:</strong> Pay $1 per verified lead (no monthly fee)<br/>
            <strong>Option 2:</strong> Pay monthly platform fee + $0.005 per email verification
          </div>
        </div>

        {/* Pricing options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Option 1 - Per Lead */}
          <div className="bg-secondary/30 border border-border rounded-lg p-6 text-center relative">
            <div className="text-lg font-semibold text-foreground mb-2">Pay Per Lead</div>
            <div className="text-4xl font-bold text-primary mb-2">$1</div>
            <div className="text-muted-foreground mb-4">per verified lead</div>
            <div className="text-sm text-muted-foreground">No monthly fee • Good for: Testing</div>
          </div>

          {/* Option 2 - Platform Fee Monthly */}
          <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">MOST POPULAR</span>
            </div>
            <div className="text-lg font-semibold text-primary mb-2">Platform Fee (Monthly)</div>
            <div className="text-4xl font-bold text-foreground mb-2">$18</div>
            <div className="text-primary mb-4">per month</div>
            <div className="text-sm text-muted-foreground">Unlimited leads + $0.005 per email verification</div>
          </div>

          {/* Option 3 - Annual */}
          <div className="bg-primary/5 border border-primary/50 rounded-lg p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">BEST VALUE</span>
            </div>
            <div className="text-lg font-semibold text-primary mb-2">Platform Fee (Annual)</div>
            <div className="text-4xl font-bold text-foreground mb-2">$150</div>
            <div className="text-primary mb-4">per year</div>
            <div className="text-sm text-muted-foreground">Save $66 + unlimited leads</div>
          </div>
        </div>

        {/* Value stack */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-foreground text-center mb-4">What You Get When You Join Today:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Identify every anonymous visitor</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Real-time lead notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Email verification at $0.005 each</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">$10 = 2,000 verifications</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Complete contact information</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-foreground">Behavioral tracking & insights</span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground text-lg">
            <strong className="text-primary">115+ businesses</strong> using NurturelyX to capture lost revenue
          </p>
        </div>

        {/* Risk reversal */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
          <p className="text-foreground">
            <strong className="text-primary">Zero Risk Guarantee:</strong> If you don't identify at least 10x more leads in your first 30 days, 
            we'll refund every penny and let you keep all the data we found.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="text-center space-y-4">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all">
            <Zap className="w-6 h-6 mr-2" />
            Stop The Bleeding Now - Get Started
          </Button>
          
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            The longer you wait, the more money walks out your door. Every day you delay costs you {formatCurrency(dailyLoss)}. 
            That's more than most people pay for NurturelyX in an entire year.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CallToAction;
