import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, DollarSign, TrendingUp, Users, Calendar as CalendarIcon, Save, Plus, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuditTrailViewer } from "@/components/admin/AuditTrailViewer";
import { AssignmentDropdown } from "@/components/admin/AssignmentDropdown";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { auditService } from "@/services/auditService";

interface ProspectDetailPanelProps {
  prospectId: string;
  onClose: () => void;
}

export default function ProspectDetailPanel({ prospectId, onClose }: ProspectDetailPanelProps) {
  const [prospect, setProspect] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDueDate, setTaskDueDate] = useState<Date | undefined>();
  const [taskDueTime, setTaskDueTime] = useState("09:00");
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspectDetails();
    fetchPendingTasks();
    
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
            state
          )
        `)
        .eq("id", prospectId)
        .single();

      if (error) throw error;
      setProspect(data);
    } catch (error) {
      console.error("Error fetching prospect details:", error);
    } finally {
      setLoading(false);
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
    setUpdating(true);
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
      setUpdating(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdating(true);
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
      setUpdating(false);
    }
  };

  const createTask = async () => {
    if (!taskTitle.trim() || !taskDueDate) {
      toast.error("Please provide a task title and due date");
      return;
    }

    setUpdating(true);
    try {
      // Combine date and time
      const [hours, minutes] = taskDueTime.split(':');
      const dueDateTime = new Date(taskDueDate);
      dueDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const { data: user } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("prospect_tasks")
        .insert({
          title: taskTitle,
          description: taskDescription || null,
          due_date: dueDateTime.toISOString(),
          report_id: prospect.report_id,
          prospect_activity_id: prospectId,
          status: "pending",
          assigned_to: prospect.assigned_to,
          created_by: user.user?.id,
        });

      if (error) throw error;

      // Update next_follow_up for backwards compatibility
      await supabase
        .from("prospect_activities")
        .update({ next_follow_up: dueDateTime.toISOString() })
        .eq("id", prospectId);

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Created task: ${taskTitle} (due ${format(dueDateTime, "MMM d, yyyy HH:mm")})`
      );

      toast.success("Task created");
      setTaskTitle("");
      setTaskDescription("");
      setTaskDueDate(undefined);
      setTaskDueTime("09:00");
      fetchPendingTasks();
      fetchProspectDetails();
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Failed to create task");
    } finally {
      setUpdating(false);
    }
  };

  const completeTask = async (taskId: string) => {
    setUpdating(true);
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
      setUpdating(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    setUpdating(true);
    try {
      const currentNotes = prospect.notes || "";
      const timestamp = new Date().toISOString();
      const updatedNotes = currentNotes 
        ? `${currentNotes}\n\n[${format(new Date(timestamp), "MMM d, yyyy HH:mm")}]\n${newNote}`
        : `[${format(new Date(timestamp), "MMM d, yyyy HH:mm")}]\n${newNote}`;

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
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Loading...</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    );
  }

  if (!prospect) {
    return null;
  }

  const reportData = prospect.reports.report_data;

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>{prospect.reports.domain}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/report/${prospect.reports.slug}`)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Editable Status & Priority */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select
                value={prospect.status}
                onValueChange={updateStatus}
                disabled={updating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="closed_won">Closed Won</SelectItem>
                  <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  <SelectItem value="not_viable">Not Viable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Priority</label>
              <Select
                value={prospect.priority}
                onValueChange={updatePriority}
                disabled={updating}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  <SelectItem value="hot">🔥 Hot</SelectItem>
                  <SelectItem value="warm">☀️ Warm</SelectItem>
                  <SelectItem value="cold">❄️ Cold</SelectItem>
                  <SelectItem value="not_viable">❌ Not Viable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Assigned To</label>
              <AssignmentDropdown
                currentAssignedTo={prospect.assigned_to}
                reportId={prospect.report_id}
                onAssignmentChange={fetchProspectDetails}
                disabled={updating}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">Create Task</label>
              
              {/* Existing Pending Tasks */}
              {pendingTasks.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">Pending Tasks:</p>
                  {pendingTasks.map((task) => (
                    <div key={task.id} className="flex items-start gap-2 p-2 border rounded-md bg-muted/20">
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => completeTask(task.id)}
                        disabled={updating}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{task.title}</p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {format(new Date(task.due_date), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Task Creation Form */}
              <div className="space-y-3">
                <div>
                  <Input
                    placeholder="Task title (required)"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    disabled={updating}
                  />
                </div>
                
                <div>
                  <Textarea
                    placeholder="Task description (optional)"
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    disabled={updating}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !taskDueDate && "text-muted-foreground"
                          )}
                          disabled={updating}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {taskDueDate ? format(taskDueDate, "MMM d") : "Date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <Calendar
                          mode="single"
                          selected={taskDueDate}
                          onSelect={setTaskDueDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Input
                      type="time"
                      value={taskDueTime}
                      onChange={(e) => setTaskDueTime(e.target.value)}
                      disabled={updating}
                    />
                  </div>
                </div>

                <Button 
                  onClick={createTask} 
                  disabled={updating || !taskTitle.trim() || !taskDueDate}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border shadow-sm ${
              (reportData?.monthlyRevenueLost || 0) > 5000 
                ? "border-orange-300 bg-orange-100" 
                : "border"
            }`}>
              <div className={`flex items-center gap-2 text-sm mb-1 ${
                (reportData?.monthlyRevenueLost || 0) > 5000 ? "text-gray-700" : "text-muted-foreground"
              }`}>
                <DollarSign className={`h-4 w-4 ${
                  (reportData?.monthlyRevenueLost || 0) > 5000 ? "text-orange-700" : ""
                }`} />
                Monthly Revenue Lost
              </div>
              <p className={`text-2xl font-bold ${
                (reportData?.monthlyRevenueLost || 0) > 5000 ? "text-orange-900" : ""
              }`}>
                ${(reportData?.monthlyRevenueLost / 1000 || 0).toFixed(1)}K
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Yearly Revenue Lost
              </div>
              <p className="text-2xl font-bold">
                ${(reportData?.yearlyRevenueLost / 1000 || 0).toFixed(1)}K
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Missed Leads/Month
              </div>
              <p className="text-2xl font-bold">
                {reportData?.missedLeads || 0}
              </p>
            </div>
            <div className="p-4 border rounded-lg shadow-sm">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                Organic Traffic
              </div>
              <p className="text-2xl font-bold">
                {(reportData?.organicTraffic || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Company Info */}
          {(prospect.reports.industry || prospect.reports.city) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2">Company Information</h3>
                <div className="space-y-1 text-sm">
                  {prospect.reports.industry && (
                    <p>
                      <span className="text-muted-foreground">Industry:</span>{" "}
                      {prospect.reports.industry}
                    </p>
                  )}
                  {prospect.reports.city && (
                    <p>
                      <span className="text-muted-foreground">Location:</span>{" "}
                      {prospect.reports.city}
                      {prospect.reports.state && `, ${prospect.reports.state}`}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Lost Reason */}
          {prospect.status === 'closed_lost' && prospect.lost_reason && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Lost Reason</h3>
                <div className="space-y-2 text-sm">
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="font-medium text-red-900">{prospect.lost_reason}</p>
                    {prospect.lost_notes && (
                      <p className="text-red-700 mt-2 text-xs">{prospect.lost_notes}</p>
                    )}
                    {prospect.closed_at && (
                      <p className="text-red-600 mt-2 text-xs">
                        Closed: {format(new Date(prospect.closed_at), "MMM d, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}


          {/* Activity Notes */}
          <Separator />
          <div className="space-y-3">
            <h3 className="font-semibold">Notes</h3>
            {prospect.notes && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">
                  {prospect.notes}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Textarea
                placeholder="Add a new note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={updating}
                rows={3}
              />
              <Button 
                onClick={addNote} 
                disabled={updating || !newNote.trim()}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>
          </div>

          {/* Audit Trail */}
          <Separator />
          <AuditTrailViewer
            recordId={prospectId}
            tableName="prospect_activities"
            title="Activity Timeline"
            maxHeight="400px"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
