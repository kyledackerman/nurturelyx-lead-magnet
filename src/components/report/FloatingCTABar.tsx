import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, X } from "lucide-react";

const FloatingCTABar = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 800px down
      if (window.scrollY > 800 && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed]);

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden animate-slide-up">
      <div className="bg-primary text-primary-foreground shadow-2xl border-t-4 border-accent">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-bold">Stop Losing Revenue Today</p>
            <p className="text-xs opacity-90">Get your pixel in 5 minutes</p>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-background text-foreground hover:bg-background/90 font-bold shadow-lg"
          >
            <a
              href="https://link.nurturely.io/payment-link/68b9eb412197091d91e19a17"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Zap className="w-4 h-4 mr-1" />
              Get Started
            </a>
          </Button>
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1 hover:opacity-70 transition-opacity"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloatingCTABar;
