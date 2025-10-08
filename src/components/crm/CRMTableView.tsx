import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Search, MoreVertical, ExternalLink, Copy, ChevronUp, ChevronDown, Users, UserPlus, AlertCircle, Upload, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AssignmentDropdown } from "@/components/admin/AssignmentDropdown";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ExportToolbar from "./ExportToolbar";
import ExportConfirmationDialog from "./ExportConfirmationDialog";
import { LostReasonDialog } from "./LostReasonDialog";
import { useAuth } from "@/hooks/useAuth";
import { auditService } from "@/services/auditService";
import BulkEnrichmentDialog from "./BulkEnrichmentDialog";

interface ProspectRow {
  id: string;
  domain: string;
  slug: string;
  monthlyRevenue: number;
  trafficTier: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  reportId: string;
  lostReason: string | null;
  lostNotes: string | null;
  contactCount: number;
}

interface CRMTableViewProps {
  onSelectProspect: (id: string) => void;
  compact?: boolean;
  view?: 'active' | 'closed' | 'needs-enrichment';
  externalStatusFilter?: string | null;
}

type SortKey = 'domain' | 'monthlyRevenue' | 'trafficTier' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export default function CRMTableView({ onSelectProspect, compact = false, view = 'active', externalStatusFilter = null }: CRMTableViewProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [trafficFilter, setTrafficFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedProspectIds, setSelectedProspectIds] = useState<Set<string>>(new Set());
  const [autoMarkContacted, setAutoMarkContacted] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [adminUsers, setAdminUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [showLostReasonDialog, setShowLostReasonDialog] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{ prospectId: string; status: string; domain: string } | null>(null);
  const [showBulkEnrichment, setShowBulkEnrichment] = useState(false);
  const [domainActivityMap, setDomainActivityMap] = useState<Map<string, { activityId: string; reportId: string }>>(new Map());

  useEffect(() => {
    fetchProspects();
    fetchAdminUsers();
    
    // Real-time subscription
    const channel = supabase
      .channel('crm-table-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'prospect_activities'
        },
        () => {
          fetchProspects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-admins');
      if (error) throw error;
      setAdminUsers(data?.admins || []);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      setAdminUsers([]);
    }
  };

  const fetchProspects = async () => {
    try {
      let query = supabase
        .from("prospect_activities")
        .select(`
          id,
          report_id,
          status,
          priority,
          assigned_to,
          lost_reason,
          lost_notes,
          reports!inner(
            domain,
            slug,
            report_data
          )
        `);

      // Filter based on view
      if (view === 'closed') {
        query = query.in('status', ['closed_won', 'closed_lost']);
      } else if (view === 'needs-enrichment') {
        query = query.in('status', ['new', 'enriching', 'review']);
      } else {
        // Default to active pipeline
        query = query.in('status', ['new', 'enriching', 'enriched', 'contacted', 'proposal']);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get all unique domains from prospects
      const domains = [...new Set(data?.map((p: any) => p.reports.domain) || [])];
      
      // Fetch ALL reports for these domains to count contacts at domain level
      const { data: allReports } = await supabase
        .from('reports')
        .select('id, domain')
        .in('domain', domains);
      
      const reportIdsByDomain = new Map<string, string[]>();
      allReports?.forEach((r: any) => {
        if (!reportIdsByDomain.has(r.domain)) {
          reportIdsByDomain.set(r.domain, []);
        }
        reportIdsByDomain.get(r.domain)!.push(r.id);
      });
      
      // Fetch contacts for all report_ids and count by domain
      const allReportIds = allReports?.map((r: any) => r.id) || [];
      const { data: allContacts } = await supabase
        .from('prospect_contacts')
        .select('report_id')
        .in('report_id', allReportIds);
      
      const domainContactCount = new Map<string, number>();
      allContacts?.forEach((c: any) => {
        const report = allReports?.find((r: any) => r.id === c.report_id);
        if (report) {
          domainContactCount.set(report.domain, (domainContactCount.get(report.domain) || 0) + 1);
        }
      });
      
      // Create map of domain -> {activityId, reportId} for the displayed row
      const domainActivityMap = new Map<string, { activityId: string; reportId: string }>();
      data?.forEach((p: any) => {
        domainActivityMap.set(p.reports.domain, {
          activityId: p.id,
          reportId: p.report_id
        });
      });

      let mapped = data?.map((p: any) => ({
        id: p.id,
        reportId: p.report_id,
        domain: p.reports.domain,
        slug: p.reports.slug,
        monthlyRevenue: p.reports.report_data?.monthlyRevenueLost || 0,
        trafficTier: getTrafficTier(p.reports.report_data?.organicTraffic || 0),
        priority: p.priority,
        status: p.status,
        assignedTo: p.assigned_to,
        lostReason: p.lost_reason,
        lostNotes: p.lost_notes,
        contactCount: domainContactCount.get(p.reports.domain) || 0,
      })) || [];

      // Filter for needs-enrichment view: only show prospects with 0 contacts
      if (view === 'needs-enrichment') {
        mapped = mapped.filter(p => p.contactCount === 0);
      }

      setProspects(mapped);
      setDomainActivityMap(domainActivityMap);
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTrafficTier = (traffic: number): string => {
    if (traffic < 10000) return "low";
    if (traffic < 100000) return "medium";
    if (traffic < 500000) return "high";
    return "enterprise";
  };

  const getPriorityBadge = (priority: string, isOverdueRow: boolean) => {
    const variants: Record<string, string> = {
      hot: "bg-orange-600 text-white border-orange-400",
      warm: "bg-accent text-black border-accent",
      cold: "bg-gray-600 text-white border-gray-400",
      not_viable: "bg-gray-700 text-gray-300 line-through border-gray-500",
    };
    
    return (
      <Badge variant="outline" className={cn(variants[priority])}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string, isOverdueRow: boolean) => {
    const variants: Record<string, string> = {
      new: "bg-brand-purple text-white border-brand-purple",
      enriching: "bg-purple-500 text-white border-purple-400",
      review: "bg-orange-500 text-white border-orange-400",
      enriched: "bg-green-500 text-white border-green-400",
      contacted: "bg-accent text-black border-accent",
      interested: "bg-yellow-500 text-white border-yellow-400",
      qualified: "bg-yellow-500 text-white border-yellow-400", // Legacy status, mapped to interested
      proposal: "bg-blue-600 text-white border-blue-400",
      closed_won: "bg-green-600 text-white border-green-400",
      closed_lost: "bg-red-600 text-white border-red-400",
      not_viable: "bg-gray-700 text-gray-300 border-gray-500 line-through",
    };
    
    // Fallback for unknown statuses
    const variant = variants[status] || "bg-gray-500 text-white border-gray-400";
    
    return (
      <Badge variant="outline" className={cn(variant)}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const updatePriority = async (prospectId: string, newPriority: string) => {
    setUpdatingId(prospectId);
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
      fetchProspects();
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStatus = async (prospectId: string, newStatus: string, domain?: string) => {
    // If marking as closed_lost, show the dialog first
    if (newStatus === 'closed_lost') {
      const prospectDomain = domain || prospects.find(p => p.id === prospectId)?.domain || '';
      setPendingStatusUpdate({ prospectId, status: newStatus, domain: prospectDomain });
      setShowLostReasonDialog(true);
      return;
    }

    setUpdatingId(prospectId);
    try {
      const updateData: any = { status: newStatus };
      
      // Set closed_at when closing a deal
      if (newStatus === 'closed_won' || newStatus === 'closed_lost') {
        updateData.closed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("prospect_activities")
        .update(updateData)
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        `Status updated to ${newStatus}`
      );

      toast.success("Status updated");
      fetchProspects();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const retryEnrichment = async (prospectId: string) => {
    setUpdatingId(prospectId);
    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ 
          status: 'enriching',
          enrichment_retry_count: 0,
          last_enrichment_attempt: null
        })
        .eq("id", prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        prospectId,
        "Manual re-enrichment initiated - reset retry count and status to enriching"
      );

      toast.success("Re-enrichment initiated - will be processed in next auto-enrichment run");
      fetchProspects();
    } catch (error) {
      console.error("Error retrying enrichment:", error);
      toast.error("Failed to initiate re-enrichment");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLostReasonConfirm = async (reason: string, notes: string) => {
    if (!pendingStatusUpdate) return;

    setUpdatingId(pendingStatusUpdate.prospectId);
    setShowLostReasonDialog(false);

    try {
      const { error } = await supabase
        .from("prospect_activities")
        .update({ 
          status: pendingStatusUpdate.status,
          lost_reason: reason,
          lost_notes: notes,
          closed_at: new Date().toISOString()
        })
        .eq("id", pendingStatusUpdate.prospectId);

      if (error) throw error;

      await auditService.logBusinessContext(
        "prospect_activities",
        pendingStatusUpdate.prospectId,
        `Status updated to ${pendingStatusUpdate.status} - Lost Reason: ${reason}`
      );

      toast.success("Marked as closed lost");
      fetchProspects();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
      setPendingStatusUpdate(null);
    }
  };

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    toast.success("Domain copied to clipboard");
  };

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  const getTrafficTierValue = (tier: string): number => {
    const values: Record<string, number> = { low: 1, medium: 2, high: 3, enterprise: 4 };
    return values[tier] || 0;
  };

  const getPriorityValue = (priority: string): number => {
    const values: Record<string, number> = { not_viable: 0, cold: 1, warm: 2, hot: 3 };
    return values[priority] || 0;
  };

  const getStatusValue = (status: string): number => {
    const values: Record<string, number> = { 
      new: 1, enriching: 2, enriched: 3, contacted: 4, proposal: 5, closed_won: 6, closed_lost: 7, not_viable: 8 
    };
    return values[status] || 0;
  };

  const SortableHeader = ({ 
    label, 
    sortKey, 
    className = "" 
  }: { 
    label: string; 
    sortKey: SortKey; 
    className?: string;
  }) => {
    const isActive = sortBy === sortKey;
    return (
      <TableHead 
        className={cn("cursor-pointer select-none hover:bg-muted/50 transition-colors", className)}
        onClick={() => handleSort(sortKey)}
      >
        <div className="flex items-center gap-1">
          {label}
          <div className="flex flex-col">
            <ChevronUp 
              className={cn(
                "h-3 w-3 -mb-1",
                isActive && sortDirection === 'asc' ? "text-primary" : "text-muted-foreground/30"
              )} 
            />
            <ChevronDown 
              className={cn(
                "h-3 w-3 -mt-1",
                isActive && sortDirection === 'desc' ? "text-primary" : "text-muted-foreground/30"
              )} 
            />
          </div>
        </div>
      </TableHead>
    );
  };

  const filteredProspects = prospects.filter((p) => {
    if (searchTerm && !p.domain.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // External filter takes precedence over internal filter
    const activeStatusFilter = externalStatusFilter || statusFilter;
    if (activeStatusFilter !== "all" && p.status !== activeStatusFilter) {
      return false;
    }
    if (priorityFilter !== "all" && p.priority !== priorityFilter) {
      return false;
    }
    if (revenueFilter !== "all") {
      const threshold = parseInt(revenueFilter);
      if (p.monthlyRevenue < threshold) {
        return false;
      }
    }
    if (trafficFilter !== "all" && p.trafficTier !== trafficFilter) {
      return false;
    }
    if (assignedFilter !== "all") {
      if (assignedFilter === "unassigned" && p.assignedTo !== null) {
        return false;
      }
      if (assignedFilter === "me" && p.assignedTo !== user?.id) {
        return false;
      }
      if (assignedFilter !== "unassigned" && assignedFilter !== "me" && p.assignedTo !== assignedFilter) {
        return false;
      }
    }
    return true;
  });

  const sortedProspects = useMemo(() => {
    const sorted = [...filteredProspects].sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (sortBy) {
        case 'domain':
          aVal = a.domain.toLowerCase();
          bVal = b.domain.toLowerCase();
          break;
        case 'monthlyRevenue':
          aVal = a.monthlyRevenue;
          bVal = b.monthlyRevenue;
          break;
        case 'trafficTier':
          aVal = getTrafficTierValue(a.trafficTier);
          bVal = getTrafficTierValue(b.trafficTier);
          break;
        case 'priority':
          aVal = getPriorityValue(a.priority);
          bVal = getPriorityValue(b.priority);
          break;
        case 'status':
          aVal = getStatusValue(a.status);
          bVal = getStatusValue(b.status);
          break;
        default:
          return 0;
      }

      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredProspects, sortBy, sortDirection]);

  const displayedProspects = compact ? sortedProspects.slice(0, 10) : sortedProspects;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProspectIds(new Set(displayedProspects.map(p => p.id)));
    } else {
      setSelectedProspectIds(new Set());
    }
  };

  const handleSelectProspect = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedProspectIds);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedProspectIds(newSelection);
  };

  const handleExport = () => {
    if (selectedProspectIds.size === 0) {
      toast.error("No prospects selected");
      return;
    }
    setShowExportDialog(true);
  };

  const handleConfirmExport = async () => {
    setShowExportDialog(false);
    setExporting(true);

    try {
      const selectedProspects = displayedProspects.filter(p => selectedProspectIds.has(p.id));
      const domains = selectedProspects.map(p => p.domain);

      const filters = {
        status: statusFilter,
        priority: priorityFilter,
        revenue: revenueFilter,
        traffic: trafficFilter,
        assigned: assignedFilter,
        search: searchTerm,
      };

      const response = await supabase.functions.invoke('export-prospects', {
        body: {
          prospectIds: Array.from(selectedProspectIds),
          autoUpdateStatus: autoMarkContacted,
          filtersApplied: filters,
        },
      });

      if (response.error) throw response.error;

      // Check if response is an error JSON or CSV
      const contentType = response.data?.type || typeof response.data;
      
      if (typeof response.data === 'string' && response.data.startsWith('{')) {
        // It's an error JSON
        const errorData = JSON.parse(response.data);
        throw new Error(errorData.error || 'Export failed');
      }

      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      a.download = `prospects_export_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      const successMessage = autoMarkContacted 
        ? `Exported ${selectedProspectIds.size} prospects and marked as Contacted`
        : `Exported ${selectedProspectIds.size} prospects`;
      toast.success(successMessage);
      
      // Clear selection and refresh
      setSelectedProspectIds(new Set());
      setAutoMarkContacted(false);
      
      // Refresh table if status was updated
      if (autoMarkContacted) {
        await fetchProspects();
      }
    } catch (error: any) {
      console.error("Export error:", error);
      const errorMessage = error?.message || "Failed to export prospects";
      toast.error(errorMessage);
    } finally {
      setExporting(false);
    }
  };

  const getFilterSummary = () => {
    const filters = [];
    if (statusFilter !== "all") filters.push(`Status: ${statusFilter}`);
    if (priorityFilter !== "all") filters.push(`Priority: ${priorityFilter}`);
    if (revenueFilter !== "all") filters.push(`Revenue: >$${parseInt(revenueFilter)/1000}K`);
    if (trafficFilter !== "all") filters.push(`Traffic: ${trafficFilter}`);
    if (assignedFilter !== "all") {
      if (assignedFilter === "unassigned") filters.push("Unassigned");
      else if (assignedFilter === "me") filters.push("Assigned to me");
      else {
        const admin = adminUsers.find(a => a.id === assignedFilter);
        if (admin) filters.push(`Assigned: ${admin.email}`);
      }
    }
    return filters.length > 0 ? filters.join(", ") : undefined;
  };

  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      {view === 'needs-enrichment' && (
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <h3 className="font-semibold text-lg">Enrich Your Prospects</h3>
              <p className="text-sm text-muted-foreground">
                Import enriched data via CSV or paste raw contact info for AI processing
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/admin?tab=import')} variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Import CSV
              </Button>
              <Button onClick={() => setShowBulkEnrichment(true)} variant="secondary">
                <Sparkles className="h-4 w-4 mr-2" />
                Smart Paste Enrichment
              </Button>
            </div>
          </div>
        </div>
      )}

      {!compact && view !== 'needs-enrichment' && (
        <>
          <ExportToolbar
            selectedCount={selectedProspectIds.size}
            totalCount={displayedProspects.length}
            allSelected={selectedProspectIds.size === displayedProspects.length && displayedProspects.length > 0}
            onSelectAll={handleSelectAll}
            autoMarkContacted={autoMarkContacted}
            onAutoMarkChange={setAutoMarkContacted}
            onExport={handleExport}
            onClear={() => setSelectedProspectIds(new Set())}
            filterSummary={getFilterSummary()}
            exporting={exporting}
          />

          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {view === 'closed' ? (
                  <>
                    <SelectItem value="closed_won">Closed Won</SelectItem>
                    <SelectItem value="closed_lost">Closed Lost</SelectItem>
                  </>
                 ) : (
                  <>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="enriching">Enriching</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="enriched">Enriched</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                  </>
                 )}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="not_viable">Not Viable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Revenue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Revenue</SelectItem>
                <SelectItem value="1000">&gt;$1K</SelectItem>
                <SelectItem value="2500">&gt;$2.5K</SelectItem>
                <SelectItem value="5000">&gt;$5K</SelectItem>
                <SelectItem value="10000">&gt;$10K</SelectItem>
              </SelectContent>
            </Select>
            <Select value={trafficFilter} onValueChange={setTrafficFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Traffic" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Traffic</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="me">Me</SelectItem>
                {adminUsers.map(admin => (
                  <SelectItem key={admin.id} value={admin.id}>
                    {admin.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}

      <div className="border rounded-lg overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            <TableRow className="h-12">
              {!compact && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProspectIds.size === displayedProspects.length && displayedProspects.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <SortableHeader label="Domain" sortKey="domain" />
              {!compact && <TableHead>Contacts</TableHead>}
              {view !== 'needs-enrichment' && <SortableHeader label="Monthly Revenue" sortKey="monthlyRevenue" className="text-right" />}
              {!compact && view !== 'needs-enrichment' && <SortableHeader label="Traffic" sortKey="trafficTier" />}
              {view !== 'needs-enrichment' && <SortableHeader label="Priority" sortKey="priority" />}
              <SortableHeader label="Status" sortKey="status" />
              {view !== 'needs-enrichment' && <TableHead>Assigned To</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedProspects.map((prospect) => {
              const isSelected = selectedProspectIds.has(prospect.id);
              return (
                <TableRow 
                  key={prospect.id} 
                  className={cn(
                    "h-14 even:bg-muted/30 hover:bg-muted/50",
                    isSelected && "bg-primary/20 border-l-4 border-primary"
                  )}
                >
                  {!compact && (
                    <TableCell>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleSelectProspect(prospect.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">{prospect.domain}</TableCell>
                  {!compact && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "flex items-center gap-1",
                            prospect.contactCount === 0 
                              ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800" 
                              : "bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                          )}
                        >
                          <Users className="h-3 w-3" />
                          {prospect.contactCount}
                        </Badge>
                      </div>
                    </TableCell>
                  )}
                  {view !== 'needs-enrichment' && (
                    <TableCell className={cn("text-right", prospect.monthlyRevenue > 5000 && "font-semibold")}>
                      ${(prospect.monthlyRevenue / 1000).toFixed(1)}K
                    </TableCell>
                  )}
                  {!compact && view !== 'needs-enrichment' && (
                    <TableCell>
                      <Badge variant="outline">{prospect.trafficTier}</Badge>
                    </TableCell>
                  )}
                  {view !== 'needs-enrichment' && (
                    <TableCell>
                      <Select
                        value={prospect.priority}
                        onValueChange={(value) => updatePriority(prospect.id, value)}
                        disabled={updatingId === prospect.id}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-50 bg-popover">
                          <SelectItem value="hot">🔥 Hot</SelectItem>
                          <SelectItem value="warm">☀️ Warm</SelectItem>
                          <SelectItem value="cold">❄️ Cold</SelectItem>
                          <SelectItem value="not_viable">❌ Not Viable</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                  <TableCell>
                    <Select
                      value={prospect.status}
                      onValueChange={(value) => updateStatus(prospect.id, value)}
                      disabled={updatingId === prospect.id}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                        <SelectContent className="z-50 bg-popover">
                         <SelectItem value="new">New</SelectItem>
                         <SelectItem value="enriching">Enriching</SelectItem>
                         <SelectItem value="review">⚠️ Review</SelectItem>
                         <SelectItem value="enriched">Enriched</SelectItem>
                         <SelectItem value="contacted">Contacted</SelectItem>
                         <SelectItem value="interested">Interested</SelectItem>
                         <SelectItem value="proposal">Proposal</SelectItem>
                         <SelectItem value="closed_won">Closed Won</SelectItem>
                         <SelectItem value="closed_lost">Closed Lost</SelectItem>
                         <SelectItem value="not_viable">Not Viable</SelectItem>
                       </SelectContent>
                    </Select>
                  </TableCell>
                  {view !== 'needs-enrichment' && (
                    <TableCell>
                      <AssignmentDropdown
                        currentAssignedTo={prospect.assignedTo}
                        reportId={prospect.reportId}
                        onAssignmentChange={() => fetchProspects()}
                        disabled={updatingId === prospect.id}
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="z-50 bg-popover">
                        <DropdownMenuItem onClick={() => onSelectProspect(prospect.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {prospect.contactCount === 0 && (
                          <DropdownMenuItem 
                            onClick={() => onSelectProspect(prospect.id)}
                            className="text-orange-600 dark:text-orange-400"
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Contact
                          </DropdownMenuItem>
                        )}
                        {prospect.status === 'review' && (
                          <DropdownMenuItem 
                            onClick={() => retryEnrichment(prospect.id)}
                            className="text-blue-600 dark:text-blue-400"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Re-try Enrichment
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => window.open(`/report/${prospect.slug}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Report
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyDomain(prospect.domain)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Domain
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {displayedProspects.length === 0 && (
              <TableRow>
                <TableCell colSpan={compact ? 6 : 9} className="text-center text-muted-foreground py-8">
                  {view === 'needs-enrichment' 
                    ? "No prospects need enrichment - great job!" 
                    : "No prospects found"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {compact && filteredProspects.length > 10 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing 10 of {filteredProspects.length} prospects. Switch to Table view to see all.
        </p>
      )}

      <ExportConfirmationDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        onConfirm={handleConfirmExport}
        prospectCount={selectedProspectIds.size}
        domains={displayedProspects.filter(p => selectedProspectIds.has(p.id)).map(p => p.domain)}
        autoUpdateEnabled={autoMarkContacted}
        filterSummary={getFilterSummary()}
      />

      <LostReasonDialog
        open={showLostReasonDialog}
        onOpenChange={setShowLostReasonDialog}
        onConfirm={handleLostReasonConfirm}
        domain={pendingStatusUpdate?.domain || ''}
      />

      <BulkEnrichmentDialog
        open={showBulkEnrichment}
        onOpenChange={setShowBulkEnrichment}
        knownDomains={sortedProspects.map(p => p.domain)}
        onSuccess={fetchProspects}
        domainActivityMap={domainActivityMap}
      />
    </div>
  );
}
