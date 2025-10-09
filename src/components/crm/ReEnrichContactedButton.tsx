import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import BulkEnrichmentProgressDialog from "./BulkEnrichmentProgressDialog";

interface EnrichmentProgress {
  prospectId: string;
  domain: string;
  status: "pending" | "processing" | "success" | "failed" | "rate_limited";
  contactsFound?: number;
  error?: string;
}

export default function ReEnrichContactedButton() {
  const [isEnriching, setIsEnriching] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState<Map<string, EnrichmentProgress>>(new Map());

  const handleReEnrich = async () => {
    setIsEnriching(true);
    setShowProgress(true);
    setProgress(new Map());

    try {
      const { data, error } = await supabase.functions.invoke('re-enrich-contacted');

      if (error) {
        console.error('Error invoking re-enrich function:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to start re-enrichment",
          variant: "destructive",
        });
        setIsEnriching(false);
        return;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "No response from server",
          variant: "destructive",
        });
        setIsEnriching(false);
        return;
      }

      // Parse SSE stream
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'progress' || event.type === 'success' || event.type === 'error') {
              setProgress(prev => {
                const newMap = new Map(prev);
                newMap.set(event.prospectId, {
                  prospectId: event.prospectId,
                  domain: event.domain,
                  status: event.type === 'error' ? 'failed' : event.type === 'success' ? 'success' : 'processing',
                  contactsFound: event.contactsFound,
                  error: event.error,
                });
                return newMap;
              });
            } else if (event.type === 'complete') {
              toast({
                title: "Re-enrichment Complete",
                description: `Successfully re-enriched ${event.total} prospects. Added ${event.contactsAdded} new contacts.`,
              });
              setIsEnriching(false);
            }
          } catch (e) {
            console.error('Failed to parse SSE event:', e, jsonStr);
          }
        }
      }
    } catch (error: any) {
      console.error('Re-enrichment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete re-enrichment",
        variant: "destructive",
      });
      setIsEnriching(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleReEnrich}
        disabled={isEnriching}
        variant="outline"
        className="gap-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
      >
        {isEnriching ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isEnriching ? "Re-Enriching..." : "Re-Enrich Contacted (One-Time)"}
        </span>
        <span className="sm:hidden">Re-Enrich</span>
      </Button>

      <BulkEnrichmentProgressDialog
        open={showProgress}
        onOpenChange={setShowProgress}
        progress={progress}
      />
    </>
  );
}
