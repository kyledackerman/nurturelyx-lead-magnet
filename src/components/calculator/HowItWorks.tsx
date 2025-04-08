
import { ArrowRight } from "lucide-react";

const HowItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground">How NurturelyX Works</h2>
          <p className="text-gray-400 mb-12">
            Our identity resolution technology identifies up to 20% of your anonymous website visitors
            without requiring them to fill out a form or opt-in.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-secondary p-6 rounded-lg shadow-md border border-border">
            <div className="rounded-full bg-accent bg-opacity-10 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-accent font-bold">1</span>
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">Install Our Script</h3>
            <p className="text-gray-400">
              Add a single line of JavaScript to your website that activates our proprietary visitor identification technology.
            </p>
          </div>
          
          <div className="bg-secondary p-6 rounded-lg shadow-md border border-border">
            <div className="rounded-full bg-accent bg-opacity-10 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-accent font-bold">2</span>
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">Identify Visitors</h3>
            <p className="text-gray-400">
              Our technology identifies up to 20% of your anonymous website visitors, revealing their contact information.
            </p>
          </div>
          
          <div className="bg-secondary p-6 rounded-lg shadow-md border border-border">
            <div className="rounded-full bg-accent bg-opacity-10 w-12 h-12 flex items-center justify-center mb-4">
              <span className="text-accent font-bold">3</span>
            </div>
            <h3 className="text-xl font-medium mb-2 text-foreground">Convert to Customers</h3>
            <p className="text-gray-400">
              Target these previously anonymous visitors with personalized marketing to convert them into paying customers.
            </p>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a href="#" className="inline-flex items-center text-accent font-medium">
            Learn more about our technology
            <ArrowRight className="ml-1 h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
