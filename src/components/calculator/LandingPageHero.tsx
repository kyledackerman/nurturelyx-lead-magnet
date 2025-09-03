
import { Database, Target, Zap } from "lucide-react";

const LandingPageHero = () => {
  return (
    <section className="bg-gradient-to-r from-background to-secondary py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
            How Much Revenue Are You Losing Every Month? (Free 2-Minute Report Reveals All)
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Right now, as you read this, potential customers are visiting your website and leaving without buying. 
            Every day you wait is money walking out the door.
          </p>
          
          <div className="bg-destructive/20 border border-destructive/30 rounded-lg p-4 mb-8 max-w-2xl mx-auto">
            <p className="text-white font-semibold text-lg">
              📉 The average website loses 97% of visitors forever
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center">
              <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                <Database className="h-5 w-5 text-accent" />
              </div>
              <span className="ml-2 text-sm text-gray-400">Real Traffic Data Analysis</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <span className="ml-2 text-sm text-gray-400">Discover Your Lead Potential</span>
            </div>
            
            <div className="flex items-center">
              <div className="bg-accent bg-opacity-10 p-2 rounded-full">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <span className="ml-2 text-sm text-gray-400">Get Results in Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPageHero;
