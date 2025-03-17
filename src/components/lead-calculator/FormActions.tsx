
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface FormActionsProps {
  onReset?: () => void;
  isCalculating: boolean;
  canCalculate: boolean;
}

export const FormActions = ({ onReset, isCalculating, canCalculate }: FormActionsProps) => {
  return (
    <>
      <div className="flex gap-4">
        {onReset && (
          <Button 
            type="button" 
            variant="outline"
            className="flex items-center gap-2 w-1/4 border-accent text-accent hover:bg-accent/10"
            onClick={onReset}
          >
            <RefreshCw size={16} />
            Restart
          </Button>
        )}
        
        <Button 
          type="submit" 
          className={`${onReset ? 'w-3/4' : 'w-full'} ${!canCalculate ? 'opacity-70 cursor-not-allowed' : ''} gradient-bg text-xl py-6`}
          disabled={isCalculating || !canCalculate}
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              Processing...
            </span>
          ) : (
            "Calculate My Missing Leads"
          )}
        </Button>
      </div>
      
      <p className="text-xs text-center text-gray-400 mt-2">
        We identify 20% of your combined organic and paid traffic
      </p>
    </>
  );
};
