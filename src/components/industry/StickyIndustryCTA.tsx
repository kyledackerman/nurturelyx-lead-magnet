import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { scrollToTop } from "@/lib/scroll";

interface StickyIndustryCTAProps {
  industryName: string;
}

export const StickyIndustryCTA = ({ industryName }: StickyIndustryCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 50% down the page
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercentage = (scrolled / height) * 100;
      
      if (scrolledPercentage > 50 && !isDismissed) {
        setIsVisible(true);
      } else if (scrolledPercentage <= 50) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border shadow-lg p-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="container max-w-6xl flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="text-sm font-semibold">
            🔓 Find out how many {industryName} leads you're losing every month
          </div>
          <div className="text-xs text-muted-foreground">
            Free custom report • See your missed opportunity
          </div>
        </div>
        
        <Button asChild size="lg" className="gradient-bg">
          <Link to="/">
            See How Many Leads You're Missing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        
        <button 
          onClick={handleDismiss} 
          className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
