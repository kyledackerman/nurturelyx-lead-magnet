import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeInput } from "@/lib/validation";
import { format } from "date-fns";
import { ExternalLink, ChevronDown, ChevronUp, Plus, Clock, Sparkles, Facebook, MessageSquare, Copy, Edit2, RefreshCw, Flame } from "lucide-react";
import { ProspectMetricsCard } from "./ProspectMetricsCard";
import { ProspectStatusBar } from "./ProspectStatusBar";
import { ProspectTaskPanel } from "./ProspectTaskPanel";
import { ProspectContactCard } from "./ProspectContactCard";
import { auditService } from "@/services/auditService";
import ContactsSection from "./ContactsSection";
import { formatCRMCurrency } from "@/lib/crmHelpers";

interface ProspectDetailPanelProps {
  prospectId: string;
  onClose: () => void;
}

export default function ProspectDetailPanel({ prospectId, onClose }: ProspectDetailPanelProps) {
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState<Date>();
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [auditTrailOpen, setAuditTrailOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [admins, setAdmins] = useState<Array<{ id: string; email: string }>>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [isEditingFacebookUrl, setIsEditingFacebookUrl] = useState(false);
  const [facebookUrlInput, setFacebookUrlInput] = useState("");
  const [isSavingFacebookUrl, setIsSavingFacebookUrl] = useState(false);
  const [isEditingIcebreaker, setIsEditingIcebreaker] = useState(false);
  const [icebreakerInput, setIcebreakerInput] = useState("");
  const [isRegeneratingIcebreaker, setIsRegeneratingIcebreaker] = useState(false);
  const [isSavingIcebreaker, setIsSavingIcebreaker] = useState(false);
  const [isEditingCompanyName, setIsEditingCompanyName] = useState(false);
  const [companyNameInput, setCompanyNameInput] = useState("");
  const [isSavingCompanyName, setIsSavingCompanyName] = useState(false);

  useEffect(() => {
    if (prospectId) {
      fetchProspectDetails();
      fetchPendingTasks();
      fetchAdmins();
    }

    // Real-time subscriptions removed - using CRMRealtimeContext instead
    return () => {};
  }, [prospectId]);

  const fetchProspectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          *,
          icebreaker_text,
          icebreaker_generated_at,
          icebreaker_edited_manually,
          reports!inner(
            id,
            domain,
            slug,
            report_data,
            industry,
            city,
            state,
            extracted_company_name,
            facebook_url
          )
        `)
        .eq("id", prospectId)
        .single();

      if (error) throw error;

      // Fetch activities
      const { data: activities } = await supabase
        .from("audit_logs")
        .select("*")
        .eq("table_name", "prospect_activities")
        .eq("record_id", prospectId)
        .order("changed_at", { ascending: false })
        .limit(20);

      // Fetch contacts
      const { data: contacts } = await supabase
        .from("prospect_contacts")
        .select("*")
        .eq("prospect_activity_id", prospectId)
        .order("is_primary", { ascending: false });

      setProspect({
        ...data,
        report: data.reports,
        activities: activities || [],
        contacts: contacts || []
      });
    } catch (error) {
      console.error("Error fetching prospect details:", error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeFacebookUrl = (url: string): string => {
    let normalized = url.trim();
    
    // Ensure https
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    
    // Replace http with https
    normalized = normalized.replace(/^http:\/\//i, 'https://');
    
    // Normalize domain variations
    normalized = normalized.replace(/fb\.com/gi, 'facebook.com');
    normalized = normalized.replace(/m\.facebook\.com/gi, 'www.facebook.com');
    normalized = normalized.replace(/web\.facebook\.com/gi, 'www.facebook.com');
    
    // Remove query params and hash
    try {
      const urlObj = new URL(normalized);
      normalized = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch (e) {
      // If URL parsing fails, just continue
    }
    
    // Remove trailing slash
    normalized = normalized.replace(/\/$/, '');
    
    return normalized;
  };

  const validateFacebookUrl = (url: string): { valid: boolean; error?: string } => {
    if (!url.trim()) {
      return { valid: false, error: "URL cannot be empty" };
    }
    
    const normalized = normalizeFacebookUrl(url);
    
    // Must contain facebook.com or fb.com
    if (!/(facebook\.com|fb\.com)/i.test(normalized)) {
      return { valid: false, error: "Must be a Facebook URL" };
    }
    
    // Reject sharer, plugins, dialogs
    if (/(sharer\.php|share\.php|plugins|dialog|\/sharer\/)/i.test(normalized)) {
      return { valid: false, error: "Cannot be a sharer or plugin URL" };
    }
    
    // Must be valid URL format
    try {
      new URL(normalized);
    } catch (e) {
      return { valid: false, error: "Invalid URL format" };
    }
    
    return { valid: true };
  };

  const saveFacebookUrl = async () => {
    const validation = validateFacebookUrl(facebookUrlInput);
    
    if (!validation.valid) {
      toast.error(validation.error || "Invalid Facebook URL");
      return;
    }
    
    const normalized = normalizeFacebookUrl(facebookUrlInput);
    setIsSavingFacebookUrl(true);
    
    try {
      const { error } = await supabase
        .from('reports')
        .update({ facebook_url: normalized })
        .eq('id', prospect.report.id);
      
      if (error) throw error;
      
      await auditService.logBusinessContext(
        'reports',
        prospect.report.id,
        `Set company Facebook URL to ${normalized}`
      );
      
      toast.success("Facebook URL saved");
      setIsEditingFacebookUrl(false);
      setFacebookUrlInput("");
      await fetchProspectDetails();
    } catch (error: any) {
      console.error("Error saving Facebook URL:", error);
      toast.error(error.message || "Failed to save Facebook URL");
    } finally {
      setIsSavingFacebookUrl(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'super_admin']);

      if (!error && data) {
        const userIds = data.map(r => r.user_id);
        const { data: authData } = await supabase.auth.admin.listUsers();
        if (authData?.users) {
          const adminUsers = authData.users
            .filter((u: any) => userIds.includes(u.id))
            .map((u: any) => ({ id: u.id, email: u.email || 'Unknown' }));
          setAdmins(adminUsers);
        }
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchPendingTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_tasks")
        .select("*")
        .eq("prospect_activity_id", prospectId)
        .eq("status", "pending")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setPendingTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const updatePriority = async (newPriority: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ priority: newPriority })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Priority updated to ${newPriority}`
      );

      toast.success("Priority updated");
      fetchProspectDetails();
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    } finally {
      setIsUpdating(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ status: newStatus })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Status updated to ${newStatus}`
      );

      toast.success("Status updated");
      fetchProspectDetails();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim() || !newTaskDueDate) {
      toast.error("Please provide a task title and due date");
      return;
    }

    setIsCreatingTask(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("prospect_tasks")
        .insert({
          title: newTaskTitle,
          description: newTaskDescription || null,
          due_date: newTaskDueDate.toISOString(),
          report_id: prospect.report_id,
          prospect_activity_id: prospectId,
          status: "pending",
          assigned_to: prospect.assigned_to,
          created_by: user.user?.id,
        });

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Created task: ${newTaskTitle}`
      );

      toast.success("Task created");
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskDueDate(undefined);
      fetchPendingTasks();
      fetchProspectDetails();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setIsCreatingTask(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("prospect_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString()
        })
        .eq("id", taskId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        "Completed task"
      );

      toast.success("Task completed");
      fetchPendingTasks();
    } catch (error) {
      console.error("Error completing task:", error);
      toast.error("Failed to complete task");
    } finally {
      setIsUpdating(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    setIsUpdating(true);
    try {
      const currentNotes = prospect.notes || "";
      const timestamp = format(new Date(), "MMM d 'at' HH:mm");
      const updatedNotes = currentNotes
        ? `${currentNotes}\n---\n${timestamp}\n${newNote}`
        : `${timestamp}\n${newNote}`;

      const { error } = await supabase
        .from("prospect_activities")
        .update({ notes: updatedNotes })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        "Added new note"
      );

      toast.success("Note added");
      setNewNote("");
      fetchProspectDetails();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsUpdating(false);
    }
  };

  const enrichProspect = async () => {
    setIsEnriching(true);
    
    try {
      // Show optimistic UI immediately
      toast.info("Enriching prospect... This may take 60-90 seconds", {
        duration: 5000,
      });

      // Start enrichment (fire-and-forget)
      const enrichPromise = supabase.functions.invoke("enrich-single-prospect", {
        body: { prospect_id: prospectId },
      });

      // Poll for status updates every 5 seconds
      const pollInterval = setInterval(async () => {
        const { data: updatedProspect } = await supabase
          .from("prospect_activities")
          .select("status, contact_count")
          .eq("id", prospectId)
          .single();

        console.log("Polling enrichment status:", updatedProspect?.status);

        if (updatedProspect?.status === "enriched" || updatedProspect?.status === "review") {
          clearInterval(pollInterval);
          setIsEnriching(false);
          toast.success(`Enrichment complete! Found ${updatedProspect.contact_count || 0} contacts`);
          fetchProspectDetails();
        } else if (updatedProspect?.status === "new" || updatedProspect?.status === "enrichment_failed") {
          // Enrichment failed or was reset
          clearInterval(pollInterval);
          setIsEnriching(false);
          toast.error("Enrichment failed. Please try again.");
          fetchProspectDetails();
        }
      }, 5000); // Poll every 5 seconds

      // Set a maximum polling time of 2 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isEnriching) {
          setIsEnriching(false);
          toast.warning("Enrichment is taking longer than expected. Check back in a few minutes.");
          fetchProspectDetails();
        }
      }, 120000); // 2 minutes max

      // Try to await the original promise, but don't fail if it times out
      try {
        const { data, error } = await enrichPromise;
        
        // If we get a response before polling completes, handle it
        if (data?.success) {
          clearInterval(pollInterval);
          setIsEnriching(false);
          toast.success(data.message);
          fetchProspectDetails();
        } else if (error) {
          console.error("Error enriching prospect:", error);
          // Don't show error toast here - polling will handle status updates
        }
      } catch (timeoutError) {
        // HTTP timeout - that's OK, polling will handle it
        console.log("HTTP timeout (expected), relying on polling:", timeoutError);
      }

    } catch (error) {
      console.error("Unexpected error enriching prospect:", error);
      toast.error(error instanceof Error ? error.message : "Failed to enrich prospect");
      setIsEnriching(false);
    }
  };

  const regenerateIcebreaker = async () => {
    // Protect manual edits (Fix #13)
    if (prospect?.icebreaker_edited_manually) {
      const confirmed = window.confirm(
        'This icebreaker was manually edited. Regenerating will overwrite your changes. Continue?'
      );
      if (!confirmed) return;
    }

    setIsRegeneratingIcebreaker(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-icebreaker', {
        body: {
          prospect_activity_id: prospectId,
          domain: prospect?.reports?.domain,
          company_name: prospect?.reports?.extracted_company_name,
          force_regenerate: true
        }
      });

      if (error) {
        const errorMsg = error.message || "Failed to regenerate icebreaker";
        if (errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (errorMsg.includes('402') || errorMsg.toLowerCase().includes('credits')) {
          toast.error("AI credits exhausted. Please add credits to your workspace.");
        } else {
          toast.error(errorMsg);
        }
        return;
      }

      if (data?.error) {
        if (data.error.includes('429') || data.error.toLowerCase().includes('rate limit')) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (data.error.includes('402') || data.error.toLowerCase().includes('credits')) {
          toast.error("AI credits exhausted. Please add credits to your workspace.");
        } else {
          toast.error(data.error);
        }
        return;
      }

      toast.success("Icebreaker regenerated!");
      fetchProspectDetails();
    } catch (error) {
      console.error('Error regenerating icebreaker:', error);
      toast.error(error instanceof Error ? error.message : "Failed to regenerate icebreaker");
    } finally {
      setIsRegeneratingIcebreaker(false);
    }
  };

  const saveIcebreaker = async () => {
    if (!icebreakerInput.trim()) {
      toast.error("Icebreaker cannot be empty");
      return;
    }

    setIsSavingIcebreaker(true);
    try {
      const { error } = await supabase
        .from('prospect_activities')
        .update({
          icebreaker_text: icebreakerInput.trim(),
          icebreaker_edited_manually: true
        })
        .eq('id', prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        'prospect_activities',
        prospectId,
        'Icebreaker manually edited'
      );

      toast.success("Icebreaker updated!");
      setIsEditingIcebreaker(false);
      fetchProspectDetails();
    } catch (error) {
      console.error('Error saving icebreaker:', error);
      toast.error("Failed to save icebreaker");
    } finally {
      setIsSavingIcebreaker(false);
    }
  };

  const copyIcebreaker = () => {
    if (prospect?.icebreaker_text) {
      navigator.clipboard.writeText(prospect.icebreaker_text);
      toast.success("Icebreaker copied to clipboard!");
    }
  };

  const saveCompanyName = async () => {
    const trimmedName = companyNameInput.trim();
    
    if (trimmedName.length < 2) {
      toast.error("Company name must be at least 2 characters");
      return;
    }

    // Validate it's not a URL
    if (trimmedName.includes('http://') || trimmedName.includes('https://') || trimmedName.includes('www.')) {
      toast.error("Company name cannot be a URL");
      return;
    }

    setIsSavingCompanyName(true);
    try {
      const oldName = prospect?.report?.extracted_company_name || prospect?.report?.domain;
      
      const { error } = await supabase
        .from('reports')
        .update({ extracted_company_name: trimmedName })
        .eq('id', prospect.report.id);
      
      if (error) throw error;
      
      await auditService.logBusinessContext(
        'reports',
        prospect.report.id,
        `Company name manually updated from "${oldName}" to "${trimmedName}"`
      );
      
      toast.success("Company name updated");
      setIsEditingCompanyName(false);
      setCompanyNameInput("");
      await fetchProspectDetails();
    } catch (error: any) {
      console.error("Error saving company name:", error);
      toast.error(error.message || "Failed to save company name");
    } finally {
      setIsSavingCompanyName(false);
    }
  };

  const nextAction = pendingTasks.length > 0
    ? { type: 'task', date: pendingTasks[0].due_date, title: pendingTasks[0].title }
    : prospect?.next_follow_up
    ? { type: 'follow_up', date: prospect.next_follow_up, title: 'Follow Up' }
    : null;

  return (
    <Sheet open={!!prospectId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : prospect ? (
          <div className="space-y-4">
            <SheetHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-xl truncate">{prospect.report?.domain}</SheetTitle>
                  {!isEditingCompanyName ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {prospect.report?.extracted_company_name || "No company name"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCompanyNameInput(prospect.report?.extracted_company_name || "");
                          setIsEditingCompanyName(true);
                        }}
                        className="h-6 px-2"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={companyNameInput}
                        onChange={(e) => setCompanyNameInput(e.target.value)}
                        className="text-xs px-2 py-1 border rounded flex-1"
                        placeholder="Enter company name"
                        autoFocus
                      />
                      <Button
                        variant="default"
                        size="sm"
                        onClick={saveCompanyName}
                        disabled={isSavingCompanyName}
                        className="h-6 px-2"
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsEditingCompanyName(false);
                          setCompanyNameInput("");
                        }}
                        className="h-6 px-2"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enrichProspect}
                    disabled={isEnriching}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isEnriching ? "Enriching..." : "Enrich with AI"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/report/${prospect.report?.slug}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Report
                  </Button>
                </div>
              </div>
            </SheetHeader>

            {/* Warm Inbound Alert */}
            {prospect.lead_source === 'warm_inbound' && (
              <Alert className="bg-orange-50 border-orange-200">
                <Flame className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-900">🔥 Warm Inbound Lead</AlertTitle>
                <AlertDescription className="text-orange-800">
                  <strong>This prospect came to you!</strong> They ran their own report and saw their{' '}
                  {formatCRMCurrency(prospect.report?.report_data?.monthlyRevenueLost || 0)}/month revenue loss.
                  
                  <div className="mt-2 text-sm space-y-1">
                    <p><strong>Key insight:</strong> They already understand the problem</p>
                    <p><strong>Approach:</strong> Reference the report they ran + specific numbers they saw</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Next Action Indicator */}
            {nextAction && (
              <div className="p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-orange-600 dark:text-orange-400">
                      Next Action: {nextAction.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(nextAction.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status Bar - COMPRESSED */}
            <ProspectStatusBar
              status={prospect.status}
              priority={prospect.priority}
              assignedTo={prospect.assigned_to}
              onStatusChange={updateStatus}
              onPriorityChange={updatePriority}
              isUpdating={isUpdating}
              admins={admins}
            />

            {/* Key Metrics - MOVED TO TOP */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Revenue Opportunity</h3>
              <ProspectMetricsCard
                monthlyRevenueLost={prospect.report?.report_data?.monthlyRevenueLost || 0}
                yearlyRevenueLost={prospect.report?.report_data?.yearlyRevenueLost || 0}
                estimatedLeads={prospect.report?.report_data?.missedLeads || 0}
                monthlyTraffic={prospect.report?.report_data?.organicTraffic || 0}
              />
            </div>

            {/* Company Social - Always Visible */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Company Social</h3>
              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                {!isEditingFacebookUrl ? (
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-muted-foreground" />
                    {prospect.report?.facebook_url ? (
                      <>
                        <a
                          href={prospect.report.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex-1 truncate"
                        >
                          {prospect.report.facebook_url.replace(/^https?:\/\/(www\.)?/, '')}
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFacebookUrlInput(prospect.report.facebook_url);
                            setIsEditingFacebookUrl(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(prospect.report.facebook_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="text-sm text-muted-foreground flex-1">No Facebook URL</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFacebookUrlInput("");
                            setIsEditingFacebookUrl(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Facebook URL
                        </Button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={facebookUrlInput}
                      onChange={(e) => setFacebookUrlInput(e.target.value)}
                      placeholder="https://www.facebook.com/company-page"
                      className="w-full px-3 py-2 text-sm border rounded-md"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the company's Facebook page URL (not sharer or plugin links)
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveFacebookUrl}
                        disabled={isSavingFacebookUrl}
                      >
                        {isSavingFacebookUrl ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingFacebookUrl(false);
                          setFacebookUrlInput("");
                        }}
                        disabled={isSavingFacebookUrl}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Icebreaker Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  💬 Outreach Opener
                </h3>
                {prospect?.icebreaker_generated_at && !isEditingIcebreaker && (
                  <span className="text-xs text-muted-foreground">
                    {prospect.icebreaker_edited_manually ? 'Edited ' : 'Generated '}
                    {format(new Date(prospect.icebreaker_generated_at), "MMM dd, h:mm a")}
                  </span>
                )}
              </div>
              
              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg space-y-2">
                {!isEditingIcebreaker ? (
                  <>
                    {prospect?.icebreaker_text ? (
                      <>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {sanitizeInput(prospect.icebreaker_text)}
                </p>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={copyIcebreaker}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setIcebreakerInput(prospect.icebreaker_text);
                              setIsEditingIcebreaker(true);
                            }}
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={regenerateIcebreaker}
                            disabled={isRegeneratingIcebreaker}
                          >
                            <RefreshCw className={`h-3 w-3 mr-1 ${isRegeneratingIcebreaker ? 'animate-spin' : ''}`} />
                            {isRegeneratingIcebreaker ? 'Generating...' : 'Regenerate'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground">No icebreaker generated yet</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={regenerateIcebreaker}
                          disabled={isRegeneratingIcebreaker}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {isRegeneratingIcebreaker ? 'Generating...' : 'Generate Icebreaker'}
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <Textarea
                      value={icebreakerInput}
                      onChange={(e) => setIcebreakerInput(e.target.value)}
                      placeholder="Write your personalized opener here..."
                      className="min-h-[100px] text-sm"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Tip: Keep it casual and conversational, like you're emailing a colleague
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveIcebreaker}
                        disabled={isSavingIcebreaker}
                      >
                        {isSavingIcebreaker ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingIcebreaker(false);
                          setIcebreakerInput("");
                        }}
                        disabled={isSavingIcebreaker}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contacts Section - MOVED UP */}
            {prospect.contacts && prospect.contacts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Primary Contact</h3>
              <ProspectContactCard 
                contacts={prospect.contacts}
                companyName={prospect.report?.extracted_company_name}
              />
              </div>
            )}

            {/* ContactsSection for adding/editing contacts */}
            <ContactsSection
              prospectActivityId={prospectId}
              reportId={prospect.report_id}
              companyName={prospect.report?.extracted_company_name}
            />

            {/* Task Panel - COLLAPSIBLE */}
            <ProspectTaskPanel
              tasks={pendingTasks}
              newTaskTitle={newTaskTitle}
              newTaskDescription={newTaskDescription}
              newTaskDueDate={newTaskDueDate}
              onTitleChange={setNewTaskTitle}
              onDescriptionChange={setNewTaskDescription}
              onDueDateChange={setNewTaskDueDate}
              onCreateTask={createTask}
              onCompleteTask={completeTask}
              isCreatingTask={isCreatingTask}
            />

            {/* Notes Section */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Notes</h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note about this prospect..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="min-h-[80px] text-sm resize-none"
                />
                <Button onClick={addNote} disabled={!newNote.trim()} size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {prospect.notes && (
                <div className="space-y-2 mt-3">
                  {prospect.notes.split('\n---\n').reverse().slice(0, 3).map((note: string, index: number) => {
                    const [timestamp, ...contentParts] = note.split('\n');
                    const content = contentParts.join('\n');
                    const preview = content.length > 150 ? content.substring(0, 150) + '...' : content;
                    return (
                      <div key={index} className="p-2 bg-muted/30 rounded border border-border/40">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs whitespace-pre-wrap flex-1">{preview}</p>
                          <p className="text-xs text-muted-foreground shrink-0">{timestamp.split(' at ')[0]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Company Information */}
            {prospect.report && (prospect.report.industry || prospect.report.company_size || prospect.report.city) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Company Info</h3>
                <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                  <div className="grid grid-cols-2 gap-3">
                    {prospect.report.industry && (
                      <div>
                        <p className="text-xs text-muted-foreground">Industry</p>
                        <p className="text-sm font-medium mt-0.5">{prospect.report.industry}</p>
                      </div>
                    )}
                    {prospect.report.company_size && (
                      <div>
                        <p className="text-xs text-muted-foreground">Company Size</p>
                        <p className="text-sm font-medium mt-0.5">{prospect.report.company_size}</p>
                      </div>
                    )}
                    {prospect.report.city && (
                      <div className="col-span-2">
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm font-medium mt-0.5">
                          {prospect.report.city}
                          {prospect.report.state && `, ${prospect.report.state}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lost Reason */}
            {prospect.status === 'closed_lost' && prospect.lost_reason && (
              <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Lost Reason</h3>
                <Badge variant="destructive" className="mb-2">{prospect.lost_reason}</Badge>
                {prospect.lost_notes && (
                  <p className="text-xs text-muted-foreground mt-2">{prospect.lost_notes}</p>
                )}
              </div>
            )}

            {/* Audit Trail - COLLAPSIBLE */}
            <Collapsible open={auditTrailOpen} onOpenChange={setAuditTrailOpen}>
              <div className="p-3 bg-muted/30 rounded-lg border border-border/40">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between h-auto p-0 hover:bg-transparent">
                    <span className="text-sm font-semibold">Activity History</span>
                    {auditTrailOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-2 mt-3">
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {prospect.activities && prospect.activities.map((activity: any) => (
                      <div key={activity.id} className="p-2 bg-background rounded border border-border/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{activity.field_name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {activity.old_value && (
                                <span className="text-xs text-muted-foreground line-through truncate">
                                  {activity.old_value}
                                </span>
                              )}
                              {activity.new_value && (
                                <span className="text-xs font-medium truncate">{activity.new_value}</span>
                              )}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground shrink-0">
                            {format(new Date(activity.changed_at), "MMM dd")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Prospect not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
