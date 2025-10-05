import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, DollarSign, TrendingUp, Users, Calendar as CalendarIcon, Save } from "lucide-react";
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
  const [nextFollowUp, setNextFollowUp] = useState<Date | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProspectDetails();
    
    // Real-time subscription
    const channel = supabase
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

    return () => {
      supabase.removeChannel(channel);
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
      setNextFollowUp(data.next_follow_up ? new Date(data.next_follow_up) : undefined);
    } catch (error) {
      console.error("Error fetching prospect details:", error);
    } finally {
      setLoading(false);
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

  const updateFollowUpDate = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ next_follow_up: nextFollowUp?.toISOString() })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Follow-up date updated to ${nextFollowUp ? format(nextFollowUp, "MMM d, yyyy") : "none"}`
      );

      toast.success("Follow-up date updated");
      fetchProspectDetails();
    } catch (error) {
      console.error("Error updating follow-up date:", error);
      toast.error("Failed to update follow-up date");
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
              <label className="text-sm font-medium mb-1.5 block">Next Follow-Up</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !nextFollowUp && "text-muted-foreground"
                      )}
                      disabled={updating}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {nextFollowUp ? format(nextFollowUp, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={nextFollowUp}
                      onSelect={setNextFollowUp}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Button 
                  onClick={updateFollowUpDate} 
                  disabled={updating}
                  size="icon"
                >
                  <Save className="h-4 w-4" />
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
