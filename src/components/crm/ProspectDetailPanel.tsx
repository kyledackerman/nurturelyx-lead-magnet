import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { ExternalLink, ChevronDown, ChevronUp, Plus, Clock, Sparkles, Facebook } from "lucide-react";
import { ProspectMetricsCard } from "./ProspectMetricsCard";
import { ProspectStatusBar } from "./ProspectStatusBar";
import { ProspectTaskPanel } from "./ProspectTaskPanel";
import { ProspectContactCard } from "./ProspectContactCard";
import { auditService } from "@/services/auditService";
import ContactsSection from "./ContactsSection";

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

  useEffect(() => {
    if (prospectId) {
      fetchProspectDetails();
      fetchPendingTasks();
      fetchAdmins();
    }

    // Real-time subscriptions
    const prospectChannel = supabase
      .channel(`prospect-${prospectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_activities',
          filter: `id=eq.${prospectId}`
        },
        () => {
          fetchProspectDetails();
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel(`tasks-${prospectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_tasks',
          filter: `prospect_activity_id=eq.${prospectId}`
        },
        () => {
          fetchPendingTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(prospectChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [prospectId]);

  const fetchProspectDetails = async () => {
    try {
      const { data, error } = await supabase
        .from("prospect_activities")
        .select(`
          *,
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
      const { data, error } = await supabase.functions.invoke("enrich-single-prospect", {
        body: { prospect_id: prospectId },
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        fetchProspectDetails();
      } else {
        toast.error(data.error || "Enrichment failed");
      }
    } catch (error) {
      console.error("Error enriching prospect:", error);
      toast.error("Failed to enrich prospect");
    } finally {
      setIsEnriching(false);
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
                  {prospect.report?.extracted_company_name && (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground truncate">
                        {prospect.report.extracted_company_name}
                      </p>
                      {prospect.report?.facebook_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(prospect.report.facebook_url, '_blank')}
                        >
                          <Facebook className="h-3 w-3 text-muted-foreground" />
                        </Button>
                      )}
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

            {/* Contacts Section - MOVED UP */}
            {prospect.contacts && prospect.contacts.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Primary Contact</h3>
                <ProspectContactCard contacts={prospect.contacts} />
              </div>
            )}

            {/* ContactsSection for adding/editing contacts */}
            <ContactsSection
              prospectActivityId={prospectId}
              reportId={prospect.report_id}
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
