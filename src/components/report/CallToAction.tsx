
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
    <Card className="bg-gradient-to-br from-red-950/50 to-red-900/30 border-red-500/30 mt-8 px-8 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Shocking headline */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">REVENUE HEMORRHAGING ALERT</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            You're Losing {formatCurrency(dailyLoss)}
            <span className="text-red-400"> Every Single Day</span>
          </h2>
          <p className="text-xl text-red-200">
            That's {formatCurrency(hourlyLoss)} per hour. While you're reading this, money is walking out the door.
          </p>
        </div>

        {/* The cost of inaction */}
        <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Here's What Doing Nothing Costs You:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(dailyLoss)}</div>
              <div className="text-red-200">Lost Today</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(dailyLoss * 7)}</div>
              <div className="text-red-200">Lost This Week</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-red-400">{formatCurrency(dailyLoss * 30)}</div>
              <div className="text-red-200">Lost This Month</div>
            </div>
          </div>
        </div>

        {/* Solution section */}
        <div className="text-center space-y-4">
          <h3 className="text-3xl font-bold text-white">Here's How to Fix This (It's Cheaper Than Your Coffee)</h3>
          <p className="text-xl text-gray-300">
            Stop the bleeding with NurturelyX. Here's exactly what it costs:
          </p>
        </div>

        {/* Pricing options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Option 1 - Per Lead */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-6 text-center relative">
            <div className="text-lg font-semibold text-gray-300 mb-2">Pay Per Lead</div>
            <div className="text-4xl font-bold text-white mb-2">$1</div>
            <div className="text-gray-400 mb-4">per verified lead</div>
            <div className="text-sm text-gray-500">Good for: Testing the waters</div>
          </div>

          {/* Option 2 - Platform Fee Monthly */}
          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">MOST POPULAR</span>
            </div>
            <div className="text-lg font-semibold text-blue-300 mb-2">Platform Fee</div>
            <div className="text-4xl font-bold text-white mb-2">$18</div>
            <div className="text-blue-300 mb-4">per month</div>
            <div className="text-sm text-blue-200">Unlimited leads + $0.005 per email verification</div>
          </div>

          {/* Option 3 - Annual */}
          <div className="bg-green-900/30 border border-green-500 rounded-lg p-6 text-center relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">BEST VALUE</span>
            </div>
            <div className="text-lg font-semibold text-green-300 mb-2">Annual Plan</div>
            <div className="text-4xl font-bold text-white mb-2">$150</div>
            <div className="text-green-300 mb-4">per year</div>
            <div className="text-sm text-green-200">Save $30 + unlimited leads</div>
          </div>
        </div>

        {/* Value stack */}
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white text-center mb-4">What You Get When You Join Today:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">Identify every anonymous visitor</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">Real-time lead notifications</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">Email verification at $0.005 each</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">$10 = 2,000 verifications</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">Complete contact information</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
              <span className="text-white">Behavioral tracking & insights</span>
            </div>
          </div>
        </div>

        {/* Urgency and social proof */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-orange-400">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">ONLY 47 SPOTS LEFT IN BETA</span>
          </div>
          <p className="text-gray-300">
            347 businesses already saving an average of {formatCurrency(85000)} per year
          </p>
        </div>

        {/* Risk reversal */}
        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 text-center">
          <p className="text-yellow-200">
            <strong>Zero Risk Guarantee:</strong> If you don't identify at least 10x more leads in your first 30 days, 
            we'll refund every penny and let you keep all the data we found.
          </p>
        </div>

        {/* CTA buttons */}
        <div className="text-center space-y-4">
          <Button className="bg-red-600 hover:bg-red-700 text-white px-12 py-4 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all">
            <Zap className="w-6 h-6 mr-2" />
            Stop The Bleeding Now - Join Beta
          </Button>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <UserRound size={16} />
            <span>Spots filling fast - 23 applications in the last 24 hours</span>
          </div>
          
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            The longer you wait, the more money walks out your door. Every day you delay costs you {formatCurrency(dailyLoss)}. 
            That's more than most people pay for NurturelyX in an entire year.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CallToAction;
