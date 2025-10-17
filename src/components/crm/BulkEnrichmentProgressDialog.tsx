import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export interface EnrichmentProgress {
  prospectId: string;
  domain: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'rate_limited';
  contactsFound?: number;
  hasEmails?: boolean;
  error?: string;
}

interface BulkEnrichmentProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: Map<string, EnrichmentProgress>;
  jobId?: string | null;
}

export default function BulkEnrichmentProgressDialog({
  open,
  onOpenChange,
  progress,
  jobId,
}: BulkEnrichmentProgressDialogProps) {
  const [dbProgress, setDbProgress] = useState<Map<string, EnrichmentProgress>>(progress);
  
  // Subscribe to realtime updates if jobId is provided
  useEffect(() => {
    if (!jobId) {
      setDbProgress(progress);
      return;
    }

    const channel = supabase
      .channel(`enrichment-job-${jobId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrichment_job_items',
          filter: `job_id=eq.${jobId}`
        },
        (payload) => {
          const item = payload.new as any;
          if (item) {
            setDbProgress(prev => {
              const newMap = new Map(prev);
              newMap.set(item.prospect_id, {
                prospectId: item.prospect_id,
                domain: item.domain,
                status: item.status,
                contactsFound: item.contacts_found,
                hasEmails: item.has_emails,
                error: item.error_message,
              });
              return newMap;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [jobId]);
  
  const progressArray = Array.from(jobId ? dbProgress.values() : progress.values());
  const total = progressArray.length;
const withContacts = progressArray.filter(p => p.status === 'success' && (((p.contactsFound || 0) > 0) || p.hasEmails)).length;
const noContacts = progressArray.filter(p => p.status === 'success' && ((p.contactsFound || 0) === 0) && !p.hasEmails).length;
const failed = progressArray.filter(p => ['failed', 'rate_limited'].includes(p.status)).length;
const completed = withContacts + noContacts + failed;
const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  const getStatusIcon = (status: EnrichmentProgress['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rate_limited':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (item: EnrichmentProgress) => {
    switch (item.status) {
      case 'success':
        const contactCount = item.contactsFound || 0;
        if (contactCount === 0) {
          return <Badge className="bg-orange-500 text-white">No contacts found</Badge>;
        }
        return <Badge className="bg-green-500 text-white">{contactCount} contacts</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'rate_limited':
        return <Badge className="bg-orange-500 text-white">Rate Limited</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500 text-white">Processing...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Bulk Enrichment Progress</DialogTitle>
          <DialogDescription>
            Enriching {total} prospect{total !== 1 ? 's' : ''} with AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {completed} of {total} completed
              </span>
              <span className="font-medium">
                {withContacts} with contacts · {noContacts} no contacts · {failed} failed
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Prospect List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {progressArray.map((item) => (
                <div
                  key={item.prospectId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(item.status)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.domain}</div>
                      {item.error && (
                        <div className="text-xs text-red-500 truncate mt-1">
                          {item.error}
                        </div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(item)}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Info Message */}
          {completed < total && (
            <div className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded">
              Enrichment continues in background. You can close this dialog.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
