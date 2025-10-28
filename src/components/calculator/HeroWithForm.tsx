import { FormData } from "@/types/report";
import LeadCalculatorForm from "@/components/LeadCalculatorForm";
import { AlertCircle, ServerOff, AlertTriangle, TrendingDown, DollarSign, Target, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface HeroWithFormProps {
  apiError: string | null;
  formDataCache: FormData | null;
  onCalculate: (formData: FormData) => void;
  onReset: () => void;
  isCalculating: boolean;
}

const HeroWithForm = ({
  apiError,
  formDataCache,
  onCalculate,
  onReset,
  isCalculating,
}: HeroWithFormProps) => {
  return (
    <section className="relative bg-black py-12 md:py-16 lg:py-20 overflow-hidden" data-form-section="true">
      {/* Background accent elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 md:px-6 lg:px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
          
          {/* Hero Content - Left Side */}
          <div className="space-y-5 md:space-y-7 lg:space-y-10">
            {/* Main headline with visual emphasis */}
            <div className="relative animate-fade-in">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight md:leading-tight lg:leading-tight relative">
                Your Website Is Leaking
                <span className="block text-4xl md:text-6xl lg:text-7xl mt-2 md:mt-3 text-transparent bg-gradient-to-r from-red-500 to-red-400 bg-clip-text">
                  Cash.
                </span>
              </h1>
              <div className="absolute -top-2 -right-2 md:-top-2 md:-right-2 lg:-top-4 lg:-right-4 text-red-500">
                <TrendingDown className="w-7 h-7 md:w-10 md:h-10 lg:w-12 lg:h-12 animate-pulse" />
              </div>
            </div>
            
            <h2 className="text-lg md:text-2xl lg:text-3xl font-semibold text-gray-300 leading-relaxed animate-fade-in animation-delay-200">
              What if you could find out—in just 10 seconds—exactly how much?
            </h2>
            
            <p className="text-base md:text-xl text-accent font-medium leading-relaxed animate-fade-in animation-delay-300">
              This free report runs your real traffic data and shows:
            </p>
            
            {/* Enhanced bullet points with icons */}
            <div className="space-y-4 md:space-y-5 animate-fade-in animation-delay-400 my-6 md:my-10">
              <div className="bg-card/50 border border-accent/10 rounded-xl p-4 md:p-5 lg:p-6 hover:bg-card/70 active:bg-card/80 transition-all duration-200 touch-manipulation">
                <div className="flex items-start md:items-center gap-3 md:gap-5">
                  <div className="bg-accent/20 p-2.5 md:p-3 rounded-full flex-shrink-0 mt-0.5 md:mt-0">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm md:text-lg text-gray-300 font-medium leading-relaxed">
                    How many buyers are slipping through your fingers
                  </span>
                </div>
              </div>
              
              <div className="bg-card/50 border border-accent/10 rounded-xl p-4 md:p-5 lg:p-6 hover:bg-card/70 active:bg-card/80 transition-all duration-200 touch-manipulation">
                <div className="flex items-start md:items-center gap-3 md:gap-5">
                  <div className="bg-accent/20 p-2.5 md:p-3 rounded-full flex-shrink-0 mt-0.5 md:mt-0">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm md:text-lg text-gray-300 font-medium leading-relaxed">
                    What those lost sales are worth in $$$
                  </span>
                </div>
              </div>
              
              <div className="bg-card/50 border border-accent/10 rounded-xl p-4 md:p-5 lg:p-6 hover:bg-card/70 active:bg-card/80 transition-all duration-200 touch-manipulation">
                <div className="flex items-start md:items-center gap-3 md:gap-5">
                  <div className="bg-accent/20 p-2.5 md:p-3 rounded-full flex-shrink-0 mt-0.5 md:mt-0">
                    <Zap className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm md:text-lg text-gray-300 font-medium leading-relaxed">
                    How to fix it starting today
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-base md:text-xl font-semibold text-red-500 leading-relaxed animate-fade-in animation-delay-500">
              Don't spend another dollar on ads until you see this.
            </p>
          </div>

          {/* Form Section - Right Side */}
          <div className="lg:sticky lg:top-8 space-y-6">
            {apiError && (
              <div>
                <Alert
                  variant="destructive"
                  className="border-red-500 bg-red-50 mb-4"
                >
                  <ServerOff className="h-5 w-5 text-red-500" />
                  <AlertTitle className="text-red-800 text-lg">
                    API Connection Error
                  </AlertTitle>
                  <AlertDescription>
                    <p className="text-red-700">{apiError}</p>
                    <p className="mt-2 font-medium text-red-800">
                      Please enter your traffic data manually to continue.
                    </p>
                  </AlertDescription>
                </Alert>

                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <AlertTriangle
                        className="h-5 w-5 text-amber-500"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">
                        Technical Details (for Administrators)
                      </h3>
                      <div className="mt-1 text-sm text-amber-700">
                        <p>
                          The application is unable to connect to the SpyFu API
                          proxy server.
                        </p>
                        <p className="mt-1">
                          {apiError.includes("CORS") ||
                          apiError.includes("browser's security policy")
                            ? "This appears to be a CORS (Cross-Origin Resource Sharing) policy issue. The browser is blocking requests to the API for security reasons."
                            : "This could be a network connectivity issue or the proxy server may be unavailable."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center text-sm bg-blue-50 p-3 rounded-md border border-blue-200 mb-6">
                  <div className="flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-1 text-blue-500" />
                    <span className="font-medium text-blue-700">
                      Don't worry! You can still use the calculator by entering your
                      traffic data manually below.
                    </span>
                  </div>
                </div>
              </div>
            )}

            <LeadCalculatorForm
              onCalculate={onCalculate}
              onReset={onReset}
              isCalculating={isCalculating}
              initialData={formDataCache}
              apiError={apiError}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroWithForm;