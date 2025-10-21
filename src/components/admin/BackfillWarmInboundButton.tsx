import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Flame, Loader2 } from "lucide-react";

export const BackfillWarmInboundButton = () => {
  const [isRunning, setIsRunning] = useState(false);

  const handleBackfill = async () => {
    setIsRunning(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('backfill-warm-inbound', {
        body: {}
      });

      if (error) throw error;

      const successCount = data?.successCount || 0;
      const domains = data?.domains || [];

      if (successCount > 0) {
        toast.success(
          `🔥 Recovered ${successCount} warm inbound lead${successCount !== 1 ? 's' : ''}!`,
          {
            description: domains.length > 0 ? `Including: ${domains.slice(0, 3).join(', ')}${domains.length > 3 ? ` and ${domains.length - 3} more` : ''}` : undefined,
            duration: 6000,
          }
        );
      } else {
        toast.info('No missed warm inbound leads found', {
          description: 'All self-service reports are already in the CRM',
        });
      }

      console.log('Backfill results:', data);
    } catch (error: any) {
      console.error('Backfill error:', error);
      toast.error('Failed to backfill warm inbound leads', {
        description: error.message || 'Unknown error occurred',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      onClick={handleBackfill}
      disabled={isRunning}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {isRunning ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Recovering Warm Inbounds...
        </>
      ) : (
        <>
          <Flame className="h-4 w-4" />
          Recover Missed Warm Inbounds
        </>
      )}
    </Button>
  );
};
