
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CallToActionProps {
  yearlyRevenueLost: number;
}

const CallToAction = ({ yearlyRevenueLost }: CallToActionProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card className="bg-accent/10 border-accent mt-8 px-6 py-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-white">Ready to Stop Losing {formatCurrency(yearlyRevenueLost)} Each Year?</h2>
        <p className="text-white">
          Join the NurturelyX beta and start converting your anonymous traffic into real revenue.
          Only a limited number of spots available.
        </p>
        <Button className="gradient-bg mt-4 mx-auto" size="lg">
          Apply for Beta Access Now
        </Button>
      </div>
    </Card>
  );
};

export default CallToAction;
