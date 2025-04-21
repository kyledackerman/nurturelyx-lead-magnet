
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserRound, Share2 } from "lucide-react";

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

  return (
    <Card className="bg-accent/10 border-accent mt-8 px-6 py-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white">
          Ready to Stop Losing {formatCurrency(yearlyRevenueLost)} Each Year?
        </h2>
        <p className="text-white">
          Join the NurturelyX beta and start converting your anonymous traffic
          into real revenue. Only a limited number of spots available.
        </p>
        <div className="flex flex-col items-center gap-4 mt-6">
          <Button className="gradient-bg mt-4 mx-auto" size="lg">
            Apply for Beta Access Now
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-accent mt-2">
            <UserRound size={16} />
            <span>Join over 500+ businesses already using NurturelyX</span>
          </div>
          
          <p className="text-sm text-white mt-4">
            Know someone who might benefit from this report? Share it with them!
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CallToAction;
