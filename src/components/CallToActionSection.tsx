import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const CallToActionSection = () => {
  const scrollToForm = () => {
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth' 
    });
  };

  return (
    <section className="bg-primary/5 py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">
          How Many Leads Are You Losing Right Now?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Every day, qualified prospects visit your website, check out your services, and leave without a trace. Get your free custom report to see exactly how many leads you're missing—and what they're worth.
        </p>
        <Button 
          onClick={scrollToForm}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ArrowUp className="w-5 h-5 mr-2" />
          Calculate My Missing Leads (Free)
        </Button>
      </div>
    </section>
  );
};

export default CallToActionSection;