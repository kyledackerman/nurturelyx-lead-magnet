
import { Loader2, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface LoadingStateProps {
  calculationProgress: number;
  onReset: () => void;
}

const LoadingState = ({ calculationProgress, onReset }: LoadingStateProps) => {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processing your domain data...</h2>
          <p className="text-gray-400 mb-6">
            We're analyzing your website domain with SpyFu data.
            This usually takes around 30 seconds.
          </p>
          
          <div className="w-full max-w-md mx-auto mb-4">
            <Progress value={calculationProgress} className="h-2" />
          </div>
          
          <p className="text-sm text-gray-500">
            {calculationProgress < 30 && "Initializing search..."}
            {calculationProgress >= 30 && calculationProgress < 60 && "Fetching domain statistics..."}
            {calculationProgress >= 60 && calculationProgress < 90 && "Analyzing traffic data..."}
            {calculationProgress >= 90 && "Calculating opportunity metrics..."}
          </p>
        </div>
        
        <div className="space-y-6 animate-pulse">
          <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          
          <Skeleton className="h-64 mt-8" />
          <Skeleton className="h-40 mt-8" />
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="flex items-center gap-2 border-accent text-accent hover:bg-accent/10"
          >
            <RefreshCw size={16} />
            Restart Calculation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
