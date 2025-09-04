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
        className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg font-semibold shadow-lg"
      >
        <ArrowDown className="w-6 h-6 mr-2" />
        Ready to Get Started? See Your Options Below
      </Button>
    </div>
  );
};

export default ScrollToCTAButton;