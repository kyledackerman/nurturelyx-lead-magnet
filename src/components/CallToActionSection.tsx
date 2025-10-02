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
          Ready to Uncover Your Hidden Revenue?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Don't let another day pass wondering who's visiting your website. Get your personalized report and start turning anonymous traffic into paying customers.
        </p>
        <Button 
          onClick={scrollToForm}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ArrowUp className="w-5 h-5 mr-2" />
          Get My Free Report Now
        </Button>
      </div>
    </section>
  );
};

export default CallToActionSection;