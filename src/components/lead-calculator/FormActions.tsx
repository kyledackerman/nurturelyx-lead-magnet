
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  onReset?: () => void;
  isCalculating: boolean;
  canCalculate: boolean;
}

export const FormActions = ({ onReset, isCalculating, canCalculate }: FormActionsProps) => {
  return (
    <>
      <div className="flex gap-4 mt-6 md:mt-8 lg:mt-10">
        <Button 
          type="submit" 
          className={`w-full gradient-bg text-lg md:text-xl lg:text-2xl xl:text-3xl py-4 px-6 md:py-5 md:px-7 lg:py-6 lg:px-8 xl:py-7 xl:px-9 h-auto`}
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
    </>
  );
};
