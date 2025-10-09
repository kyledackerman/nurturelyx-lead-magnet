import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Check, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { auditService } from "@/services/auditService";
import { validateSalesEmail, getEmailTypeLabel, getEmailTypeBadgeVariant } from "@/lib/emailValidation";

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
  domainActivityMap?: Map<string, { activityId: string; reportId: string }>;
}

export default function BulkEnrichmentDialog({
  open,
  onOpenChange,
  knownDomains,
  onSuccess,
  domainActivityMap,
}: BulkEnrichmentDialogProps) {
  const [rawText, setRawText] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedResult | null>(null);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!rawText.trim() || !businessName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both business name and contact data",
        variant: "destructive",
      });
      return;
    }

    setParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-bulk-contacts', {
        body: { rawText, knownDomains, businessName }
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
          // Normalize domain to improve matching
          const normalizeDomain = (d: string) =>
            d.toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');

          const normalizedDomain = normalizeDomain(domainData.domain);

          let reportId: string;
          let activityId: string;
          let activityStatus: string | null = null;

          // First check if we have a mapped activity for this domain from the CRM table
          if (domainActivityMap && domainActivityMap.has(normalizedDomain)) {
            const mapped = domainActivityMap.get(normalizedDomain)!;
            reportId = mapped.reportId;
            activityId = mapped.activityId;
            
            // Fetch the status of the mapped activity
            const { data: activityData } = await supabase
              .from('prospect_activities')
              .select('status')
              .eq('id', activityId)
              .single();
            
            activityStatus = activityData?.status || null;
            console.info('Using mapped activity for domain', { domain: normalizedDomain, reportId, activityId, status: activityStatus });
          } else {
            // Fallback: find the most recent report and activity for this domain
            const { data: report, error: reportError } = await supabase
              .from('reports')
              .select('id, domain, created_at')
              .eq('domain', normalizedDomain)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (reportError || !report) {
              console.error(`Report not found for domain ${domainData.domain} (normalized: ${normalizedDomain})`, reportError);
              errorCount++;
              continue;
            }

            reportId = report.id;

            // Get or create activity
            const { data: existingActivity, error: activityError } = await supabase
              .from('prospect_activities')
              .select('id, status, created_at')
              .eq('report_id', reportId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (existingActivity) {
              activityId = existingActivity.id;
              activityStatus = existingActivity.status;
            } else {
              const { data: newActivity, error: insertActivityError } = await supabase
                .from('prospect_activities')
                .insert({
                  report_id: reportId,
                  activity_type: 'enrichment',
                  status: 'enriching',
                })
                .select('id, status')
                .single();

              if (insertActivityError || !newActivity) {
                console.error(`Failed to create activity for ${normalizedDomain}:`, insertActivityError);
                errorCount++;
                continue;
              }
              activityId = newActivity.id;
              activityStatus = newActivity.status;
            }
          }

          // Fetch ALL reports for this domain to check for existing contacts across all reports
          const { data: allDomainReports } = await supabase
            .from('reports')
            .select('id')
            .eq('domain', normalizedDomain);

          const allReportIds = allDomainReports?.map(r => r.id) || [reportId];

          // Check for existing contacts to avoid duplicates (check ALL reports for this domain)
          const { data: existingContacts } = await supabase
            .from('prospect_contacts')
            .select('email, first_name, last_name')
            .in('report_id', allReportIds);

          const existingEmails = new Set(existingContacts?.map(c => c.email?.toLowerCase()) || []);
          const existingNames = new Set(
            existingContacts?.map(c => `${c.first_name.toLowerCase()}_${(c.last_name || '').toLowerCase()}`) || []
          );

          // Filter out duplicates
          const newContacts = domainData.contacts.filter(contact => {
            if (contact.email && existingEmails.has(contact.email.toLowerCase())) {
              return false;
            }
            const nameKey = `${contact.first_name.toLowerCase()}_${(contact.last_name || '').toLowerCase()}`;
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
                report_id: reportId,
                prospect_activity_id: activityId,
                first_name: contact.first_name,
                last_name: contact.last_name || null,
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
          const currentStatus = activityStatus;
          if (currentStatus === 'enriching' || currentStatus === 'new' || currentStatus === 'review') {
            const { error: statusError } = await supabase
              .from('prospect_activities')
              .update({ status: 'enriched' })
              .eq('id', activityId);
            
            if (statusError) {
              console.error('Failed to update status to enriched:', statusError);
              toast({
                title: "Warning",
                description: `Contacts saved but status update failed for ${domainData.domain}`,
                variant: "destructive",
              });
            }
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
    setBusinessName("");
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
              <div className="space-y-2">
                <Label htmlFor="businessName">Business/Company Name *</Label>
                <Input
                  id="businessName"
                  placeholder="e.g., Stage Step Dance Floors"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used as contact name fallback when no person is identified
                </p>
              </div>
              
              <Textarea
                placeholder="Paste contact information here...&#10;&#10;Examples:&#10;- Email signatures&#10;- LinkedIn profile text&#10;- Spreadsheet cells&#10;- Meeting notes&#10;- Business card scans"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-[250px] font-mono text-sm"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {knownDomains.length} prospect{knownDomains.length !== 1 ? 's' : ''} available for matching
                </p>
                <Button onClick={handleParse} disabled={parsing || !rawText.trim() || !businessName.trim()}>
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

              {/* Email Quality Summary */}
              <div className="p-4 bg-muted rounded-md">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Email Quality Summary
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const allContacts = parsedResult.matched.flatMap(d => d.contacts);
                    const emailStats = {
                      personal: 0,
                      corporate: 0,
                      generic: 0,
                      noEmail: 0
                    };
                    
                    allContacts.forEach(contact => {
                      if (!contact.email) {
                        emailStats.noEmail++;
                      } else {
                        const validation = validateSalesEmail(contact.email);
                        if (validation.emailType === 'personal') emailStats.personal++;
                        else if (validation.emailType === 'corporate-person') emailStats.corporate++;
                        else if (validation.emailType === 'generic') emailStats.generic++;
                      }
                    });

                    return (
                      <>
                        <Badge variant="default">{emailStats.personal} Personal</Badge>
                        <Badge variant="secondary">{emailStats.corporate} Work</Badge>
                        {emailStats.generic > 0 && (
                          <Badge variant="destructive">{emailStats.generic} Generic (Filtered)</Badge>
                        )}
                        {emailStats.noEmail > 0 && (
                          <Badge variant="outline">{emailStats.noEmail} No Email</Badge>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              <ScrollArea className="flex-1 border rounded-lg p-4">
                <div className="space-y-6">
                  {parsedResult.matched.map((domainData, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="font-semibold text-lg">{domainData.domain}</h4>
                      {domainData.contacts.map((contact, cIdx) => {
                        const emailValidation = contact.email ? validateSalesEmail(contact.email) : null;
                        
                        return (
                          <div key={cIdx} className="ml-4 p-3 border rounded-lg bg-muted/30">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium">Name:</span> {contact.first_name}{contact.last_name ? ` ${contact.last_name}` : ''}
                              </div>
                              {contact.title && (
                                <div>
                                  <span className="font-medium">Title:</span> {contact.title}
                                </div>
                              )}
                              {contact.email && (
                                <div className="col-span-2 flex items-center gap-2">
                                  <span className="font-medium">Email:</span> {contact.email}
                                  {emailValidation && (
                                    <Badge variant={getEmailTypeBadgeVariant(emailValidation)} className="text-xs">
                                      {getEmailTypeLabel(emailValidation)}
                                    </Badge>
                                  )}
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
                        );
                      })}
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
