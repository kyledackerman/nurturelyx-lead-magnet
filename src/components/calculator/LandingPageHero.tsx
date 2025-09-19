
import { TrendingDown, DollarSign, Target, Zap } from "lucide-react";

const LandingPageHero = () => {
  return (
    <section className="relative bg-black py-16 md:py-24 overflow-hidden">
      {/* Background accent elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline with visual emphasis */}
          <div className="relative mb-4 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground relative">
              Your Website Is Leaking
              <span className="block text-transparent bg-gradient-to-r from-red-500 to-red-400 bg-clip-text">
                Cash.
              </span>
            </h1>
            <div className="absolute -top-4 -right-4 text-red-500">
              <TrendingDown className="w-8 h-8 md:w-12 md:h-12 animate-pulse" />
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-gray-300 animate-fade-in animation-delay-200">
            What if you could find out—in 2 minutes—exactly how much?
          </h2>
          
          <p className="text-xl text-accent mb-8 font-medium animate-fade-in animation-delay-300">
            This free report runs your real traffic data and shows:
          </p>
          
          {/* Enhanced bullet points with icons and containers */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in animation-delay-400">
            <div className="space-y-4">
              <div className="bg-card/50 border border-accent/10 rounded-lg p-4 text-left hover:bg-card/70 transition-colors">
                <div className="flex items-start">
                  <div className="bg-accent/20 p-2 rounded-full mr-4 mt-1">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-lg text-gray-300 font-medium">
                    How many buyers are slipping through your fingers
                  </span>
                </div>
              </div>
              
              <div className="bg-card/50 border border-accent/10 rounded-lg p-4 text-left hover:bg-card/70 transition-colors">
                <div className="flex items-start">
                  <div className="bg-accent/20 p-2 rounded-full mr-4 mt-1">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-lg text-gray-300 font-medium">
                    What those lost sales are worth in $$$
                  </span>
                </div>
              </div>
              
              <div className="bg-card/50 border border-accent/10 rounded-lg p-4 text-left hover:bg-card/70 transition-colors">
                <div className="flex items-start">
                  <div className="bg-accent/20 p-2 rounded-full mr-4 mt-1">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-lg text-gray-300 font-medium">
                    How to fix it starting today
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xl font-semibold text-red-500 animate-fade-in animation-delay-500">
            Don't spend another dollar on ads until you see this.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LandingPageHero;
