import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const ScrollToCTAButton = () => {
  const scrollToCTA = () => {
    const ctaSection = document.querySelector('[data-cta-section="true"]');
    if (ctaSection) {
      ctaSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  return (
    <div className="text-center py-8">
      <Button 
        onClick={scrollToCTA}
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 md:px-8 md:py-4 text-sm md:text-lg font-semibold shadow-lg w-full max-w-xs md:max-w-none md:w-auto"
      >
        <ArrowDown className="w-4 h-4 md:w-6 md:h-6 mr-1 md:mr-2" />
        Fix this problem now
      </Button>
    </div>
  );
};

export default ScrollToCTAButton;