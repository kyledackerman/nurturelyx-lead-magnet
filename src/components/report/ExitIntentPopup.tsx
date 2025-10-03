import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap, X } from "lucide-react";

interface ExitIntentPopupProps {
  yearlyRevenueLost: number;
}

const ExitIntentPopup = ({ yearlyRevenueLost }: ExitIntentPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of viewport and hasn't shown yet
      if (e.clientY <= 0 && !hasShown) {
        setIsOpen(true);
        setHasShown(true);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const dailyLoss = yearlyRevenueLost / 365;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            Wait! Don't Leave Yet
          </DialogTitle>
          <DialogDescription className="text-base pt-4 space-y-4">
            <p className="text-foreground font-semibold text-xl">
              You're about to walk away from{" "}
              <span className="text-destructive">{formatCurrency(yearlyRevenueLost)}</span>{" "}
              in annual revenue.
            </p>
            <p className="text-muted-foreground">
              That's <span className="text-destructive font-bold">{formatCurrency(dailyLoss)}</span> lost 
              <span className="font-bold"> every single day</span> while your competitors are capturing these leads.
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-4">
              <p className="text-foreground font-semibold mb-2">Limited Time Offer:</p>
              <p className="text-sm text-muted-foreground">
                Start today and get <span className="text-primary font-bold">100 free identity resolutions</span> ($100 value) 
                with your first month.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
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
              <Zap className="w-5 h-5 mr-2" />
              Claim My Pixel + Bonus Credits
            </a>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground"
          >
            <X className="w-4 h-4 mr-1" />
            No thanks, I'll keep losing revenue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
