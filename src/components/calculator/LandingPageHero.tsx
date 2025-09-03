
import { Database, Target, Zap } from "lucide-react";

const LandingPageHero = () => {
  return (
    <section className="bg-gradient-to-r from-background to-secondary py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-foreground">
            How Much Revenue Are You Losing Every Month? (Free 5-Minute Report Reveals All)
          </h1>
          <p className="text-xl text-gray-400 mb-8">
            Calculate how many leads you're missing and the revenue impact with our free estimation tool
          </p>
          
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
