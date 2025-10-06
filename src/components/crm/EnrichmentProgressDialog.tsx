import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EnrichmentResult {
  prospectId: string;
  domain?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  contactsFound?: number;
  error?: string;
}

interface EnrichmentProgressDialogProps {
  open: boolean;
  onClose: () => void;
  prospectIds: string[];
}

export function EnrichmentProgressDialog({ open, onClose, prospectIds }: EnrichmentProgressDialogProps) {
  const [results, setResults] = useState<EnrichmentResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (open && prospectIds.length > 0) {
      startEnrichment();
    }
  }, [open, prospectIds]);

  const startEnrichment = async () => {
    setIsProcessing(true);
    
    // Initialize results
    const initialResults: EnrichmentResult[] = prospectIds.map(id => ({
      prospectId: id,
      status: 'pending',
    }));
    setResults(initialResults);

    // Set up real-time subscription for status updates
    const channel = supabase
      .channel('enrichment-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'prospect_activities',
          filter: `id=in.(${prospectIds.join(',')})`,
        },
        (payload) => {
          const updated = payload.new as any;
          setResults(prev => prev.map(r => 
            r.prospectId === updated.id
              ? {
                  ...r,
                  status: updated.enrichment_status === 'in_progress' ? 'processing'
                    : updated.enrichment_status === 'completed' ? 'completed'
                    : updated.enrichment_status === 'failed' ? 'failed'
                    : r.status,
                  contactsFound: updated.total_contacts_found || r.contactsFound,
                }
              : r
          ));
        }
      )
      .subscribe();

    // Fetch domain names for display
    const { data: prospects } = await supabase
      .from('prospect_activities')
      .select('id, reports!inner(domain)')
      .in('id', prospectIds);

    if (prospects) {
      setResults(prev => prev.map(r => {
        const prospect = prospects.find(p => p.id === r.prospectId);
        return prospect ? { ...r, domain: prospect.reports.domain } : r;
      }));
    }

    // Call enrichment function
    try {
      const { data, error } = await supabase.functions.invoke('enrich-contacts', {
        body: { prospectIds },
      });

      if (error) {
        console.error('Enrichment error:', error);
        setResults(prev => prev.map(r => ({ ...r, status: 'failed', error: error.message })));
      }
    } catch (error) {
      console.error('Enrichment error:', error);
      setResults(prev => prev.map(r => ({ ...r, status: 'failed', error: 'Network error' })));
    } finally {
      setIsProcessing(false);
      supabase.removeChannel(channel);
    }
  };

  const completedCount = results.filter(r => r.status === 'completed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;
  const totalContactsFound = results.reduce((sum, r) => sum + (r.contactsFound || 0), 0);
  const progressPercentage = (completedCount + failedCount) / results.length * 100;

  const getStatusIcon = (status: EnrichmentResult['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const isDone = completedCount + failedCount === results.length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Contact Enrichment
          </DialogTitle>
          <DialogDescription>
            {isDone
              ? `Enrichment complete! Found ${totalContactsFound} contacts.`
              : `Enriching ${results.length} prospects...`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress: {completedCount + failedCount} of {results.length}</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          {isDone && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{completedCount}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{failedCount}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{totalContactsFound}</div>
                <div className="text-sm text-muted-foreground">Contacts Found</div>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {results.map((result) => (
              <div
                key={result.prospectId}
                className="flex items-center justify-between p-3 bg-card border rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.domain || 'Loading...'}</div>
                    {result.status === 'completed' && (
                      <div className="text-sm text-muted-foreground">
                        {result.contactsFound || 0} contacts found
                      </div>
                    )}
                    {result.status === 'failed' && (
                      <div className="text-sm text-red-500">
                        {result.error || 'Enrichment failed'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose} disabled={!isDone}>
              {isDone ? 'Close' : 'Processing...'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
