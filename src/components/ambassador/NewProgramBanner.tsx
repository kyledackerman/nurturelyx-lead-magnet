import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Rocket } from "lucide-react";

export function NewProgramBanner() {
  return (
    <Alert className="mb-8 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
      <Rocket className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-400 font-bold text-lg">
        🚀 BRAND NEW OPPORTUNITY
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300 space-y-2 mt-2">
        <p>
          You're looking at a ground-floor opportunity. The NurturelyX Ambassador Program launched in 2025, 
          and <strong>NO ONE has reached Gold tier yet.</strong>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span>Less competition for high-value clients</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span>First-mover advantage in your network</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span>Opportunity to be #1 on the leaderboard</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-600 dark:text-green-400">✅</span>
            <span>Help shape how the program evolves</span>
          </div>
        </div>
        <p className="mt-3 text-sm">
          The product is proven (customers recover $50K-$500K in lost revenue). The ambassador program is new. Big difference.
        </p>
      </AlertDescription>
    </Alert>
  );
}
