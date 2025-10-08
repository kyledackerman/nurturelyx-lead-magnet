import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auditService } from "@/services/auditService";

interface Contact {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedin_url?: string;
  notes?: string;
}

interface MatchedDomain {
  domain: string;
  contacts: Contact[];
}

interface ParsedResult {
  matched: MatchedDomain[];
  unmatched: Array<{ raw_text: string; reason: string }>;
}

interface BulkEnrichmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  knownDomains: string[];
  onSuccess: () => void;
}

export default function BulkEnrichmentDialog({
  open,
  onOpenChange,
  knownDomains,
  onSuccess,
}: BulkEnrichmentDialogProps) {
  const [rawText, setRawText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!rawText.trim()) {
      toast({
        title: "No data to parse",
        description: "Please paste some text containing contact information",
        variant: "destructive",
      });
      return;
    }

    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-bulk-contacts', {
        body: { rawText, knownDomains }
      });

      if (error) throw error;

      setParsedResult(data);

      if (data.matched.length === 0) {
        toast({
          title: "No matches found",
          description: "Could not match any contacts to your prospects. Try including domain names or email addresses.",
          variant: "destructive",
        });
      } else {
        const totalContacts = data.matched.reduce((sum: number, m: MatchedDomain) => sum + m.contacts.length, 0);
        toast({
          title: "Parsing complete",
          description: `Found ${totalContacts} contacts across ${data.matched.length} companies`,
        });
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      toast({
        title: "Parsing failed",
        description: error.message || "Failed to parse contact data",
        variant: "destructive",
      });
    } finally {
      setParsing(false);
    }
  };

  const handleSave = async () => {
    if (!parsedResult || parsedResult.matched.length === 0) return;

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const domainData of parsedResult.matched) {
        try {
          // Find the report and activity for this domain
          const { data: reports, error: reportError } = await supabase
            .from('reports')
            .select('id, domain, prospect_activities(id, status)')
            .eq('domain', domainData.domain)
            .single();

          if (reportError || !reports) {
            console.error(`Report not found for domain ${domainData.domain}`);
            errorCount++;
            continue;
          }

          const activityId = reports.prospect_activities?.[0]?.id;
          if (!activityId) {
            console.error(`No activity found for domain ${domainData.domain}`);
            errorCount++;
            continue;
          }

          // Check for existing contacts to avoid duplicates
          const { data: existingContacts } = await supabase
            .from('prospect_contacts')
            .select('email, first_name, last_name')
            .eq('report_id', reports.id);

          const existingEmails = new Set(existingContacts?.map(c => c.email?.toLowerCase()) || []);
          const existingNames = new Set(
            existingContacts?.map(c => `${c.first_name.toLowerCase()}_${c.last_name.toLowerCase()}`) || []
          );

          // Filter out duplicates
          const newContacts = domainData.contacts.filter(contact => {
            if (contact.email && existingEmails.has(contact.email.toLowerCase())) {
              return false;
            }
            const nameKey = `${contact.first_name.toLowerCase()}_${contact.last_name.toLowerCase()}`;
            if (existingNames.has(nameKey)) {
              return false;
            }
            return true;
          });

          if (newContacts.length === 0) {
            console.log(`All contacts already exist for ${domainData.domain}`);
            continue;
          }

          // Determine if this is the first contact (make it primary)
          const hasPrimaryContact = existingContacts && existingContacts.length > 0;

          // Insert contacts
          for (let i = 0; i < newContacts.length; i++) {
            const contact = newContacts[i];
            const { error: insertError } = await supabase
              .from('prospect_contacts')
              .insert({
                report_id: reports.id,
                prospect_activity_id: activityId,
                first_name: contact.first_name,
                last_name: contact.last_name,
                email: contact.email || null,
                phone: contact.phone || null,
                title: contact.title || null,
                linkedin_url: contact.linkedin_url || null,
                notes: contact.notes || null,
                is_primary: !hasPrimaryContact && i === 0,
              });

            if (insertError) {
              console.error(`Failed to insert contact for ${domainData.domain}:`, insertError);
              errorCount++;
            } else {
              successCount++;
            }
          }

          // Update activity status to enriched if it was enriching
          const currentStatus = reports.prospect_activities?.[0]?.status;
          if (currentStatus === 'enriching' || currentStatus === 'new') {
            await supabase
              .from('prospect_activities')
              .update({ status: 'enriched' })
              .eq('id', activityId);
          }

          // Log audit trail
          await auditService.logBusinessContext(
            'prospect_contacts',
            activityId,
            `Bulk AI enrichment added ${newContacts.length} contact(s) for ${domainData.domain}`
          );

        } catch (domainError: any) {
          console.error(`Error processing domain ${domainData.domain}:`, domainError);
          errorCount++;
        }
      }

      toast({
        title: "Enrichment complete",
        description: `Successfully added ${successCount} contacts${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });

      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: "Save failed",
        description: error.message || "Failed to save contacts",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setRawText("");
    setParsedResult(null);
    onOpenChange(false);
  };

  const totalContacts = parsedResult?.matched.reduce((sum, m) => sum + m.contacts.length, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Smart Paste Enrichment
          </DialogTitle>
          <DialogDescription>
            Paste raw contact data (emails, LinkedIn profiles, spreadsheet data, notes) and AI will extract and organize it
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col gap-4">
          {!parsedResult ? (
            <>
              <Textarea
                placeholder="Paste contact information here...&#10;&#10;Examples:&#10;- Email signatures&#10;- LinkedIn profile text&#10;- Spreadsheet cells&#10;- Meeting notes&#10;- Business card scans"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {knownDomains.length} prospect{knownDomains.length !== 1 ? 's' : ''} available for matching
                </p>
                <Button onClick={handleParse} disabled={parsing || !rawText.trim()}>
                  {parsing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Parsing with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Extract Contacts
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Found {totalContacts} contact{totalContacts !== 1 ? 's' : ''} across {parsedResult.matched.length} company{parsedResult.matched.length !== 1 ? 'ies' : ''}. Review and save below.
                </AlertDescription>
              </Alert>

              <ScrollArea className="flex-1 border rounded-lg p-4">
                <div className="space-y-6">
                  {parsedResult.matched.map((domainData, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-semibold text-lg">{domainData.domain}</h4>
                      {domainData.contacts.map((contact, cIdx) => (
                        <div key={cIdx} className="ml-4 p-3 border rounded-lg bg-muted/30">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Name:</span> {contact.first_name} {contact.last_name}
                            </div>
                            {contact.title && (
                              <div>
                                <span className="font-medium">Title:</span> {contact.title}
                              </div>
                            )}
                            {contact.email && (
                              <div>
                                <span className="font-medium">Email:</span> {contact.email}
                              </div>
                            )}
                            {contact.phone && (
                              <div>
                                <span className="font-medium">Phone:</span> {contact.phone}
                              </div>
                            )}
                            {contact.linkedin_url && (
                              <div className="col-span-2">
                                <span className="font-medium">LinkedIn:</span>{" "}
                                <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  {contact.linkedin_url}
                                </a>
                              </div>
                            )}
                            {contact.notes && (
                              <div className="col-span-2">
                                <span className="font-medium">Notes:</span> {contact.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}

                  {parsedResult.unmatched.length > 0 && (
                    <div className="mt-6">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="font-semibold mb-2">Unmatched data ({parsedResult.unmatched.length}):</div>
                          <div className="space-y-1 text-xs">
                            {parsedResult.unmatched.map((item, idx) => (
                              <div key={idx}>
                                • {item.reason}: {item.raw_text.substring(0, 100)}...
                              </div>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="outline" onClick={handleClose} disabled={saving}>
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setParsedResult(null)} disabled={saving}>
                    Start Over
                  </Button>
                  <Button onClick={handleSave} disabled={saving || totalContacts === 0}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Save All Contacts
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
