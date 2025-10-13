import { useEffect, useState, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCRMRealtime } from "@/contexts/CRMRealtimeContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Eye, Search, MoreVertical, ExternalLink, Copy, ChevronUp, ChevronDown, Users, UserPlus, AlertCircle, Upload, Sparkles, MessageSquare } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatCRMCurrency } from "@/lib/crmHelpers";
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
import BulkEnrichmentProgressDialog, { EnrichmentProgress } from "./BulkEnrichmentProgressDialog";

interface ProspectRow {
  id: string;
  domain: string;
  slug: string;
  monthlyRevenue: number;
  missedLeads: number;
  trafficTier: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  reportId: string;
  lostReason: string | null;
  lostNotes: string | null;
  contactCount: number;
  companyName: string | null;
  icebreakerText: string | null;
  leadSource: string;
}

interface CRMTableViewProps {
  onSelectProspect: (id: string) => void;
  compact?: boolean;
  view?: 'warm-inbound' | 'new-prospects' | 'needs-enrichment' | 'ready-outreach' | 'active' | 'closed' | 'needs-review' | 'interested';
  externalStatusFilter?: string | null;
}

type SortKey = 'domain' | 'monthlyRevenue' | 'trafficTier' | 'priority' | 'status';
type SortDirection = 'asc' | 'desc';

export default function CRMTableView({ onSelectProspect, compact = false, view = 'new-prospects', externalStatusFilter = null }: CRMTableViewProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { refreshProspects: triggerRealtimeRefresh } = useCRMRealtime();
  const [prospects, setProspects] = useState<ProspectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [revenueFilter, setRevenueFilter] = useState("all");
  const [trafficFilter, setTrafficFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;
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
  const [updatingBulkStatus, setUpdatingBulkStatus] = useState(false);
  const [bulkEnriching, setBulkEnriching] = useState(false);
  const [showEnrichmentProgress, setShowEnrichmentProgress] = useState(false);
  const [enrichmentProgress, setEnrichmentProgress] = useState<Map<string, any>>(new Map());

  // Performance optimization: Query caching (10 seconds)
  const cacheRef = useRef<{
    data: ProspectRow[];
    timestamp: number;
    searchTerm: string;
    view: string;
    statusFilter: string;
  }>({ 
    data: [], 
    timestamp: 0, 
    searchTerm: '',
    view: '',
    statusFilter: ''
  });
  const CACHE_DURATION = 10000; // 10 seconds

  // Optimized search debounce with minimum character requirement
  useEffect(() => {
    // Don't search single characters (too many false matches)
    if (searchTerm.length === 1) {
      return;
    }
    
    // Empty search = clear immediately (no debounce needed)
    if (searchTerm.length === 0) {
      setDebouncedSearchTerm('');
      setPage(0);
      setProspects([]);
      return;
    }
    
    // For 2+ characters, debounce for 500ms
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
      setProspects([]);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    // Only fetch on initial load, view change, or search change
    // Do NOT fetch on page change (that's handled by loadMore)
    fetchProspects();
    fetchAdminUsers();
  }, [view, debouncedSearchTerm]);

  useEffect(() => {
    // Reset page when view changes
    setPage(0);
    setProspects([]);
  }, [view]);

  // Listen to real-time updates from CRMRealtimeContext
  useEffect(() => {
    // Clear cache and refetch when real-time changes detected
    cacheRef.current.timestamp = 0; // Force cache miss
    fetchProspects();
  }, [triggerRealtimeRefresh]);

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

  const fetchProspects = async (append = false) => {
    // Check cache first (skip for append/pagination)
    if (!append) {
      const now = Date.now();
      const cacheKey = `${view}-${debouncedSearchTerm}-${statusFilter}`;
      const cachedKey = `${cacheRef.current.view}-${cacheRef.current.searchTerm}-${cacheRef.current.statusFilter}`;
      
      if (cacheKey === cachedKey && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
        console.log('📦 Using cached CRM data');
        setProspects(cacheRef.current.data);
        setLoading(false);
        return;
      }
    }

    if (!append) setLoading(true);
    console.log('🔄 Fetching fresh CRM data', { 
      view, 
      assignedFilter, 
      page,
      statusFilter,
      p_view: view,
      p_lead_source: view === 'warm-inbound' ? 'warm_inbound' : null 
    });
    
    try {
      // Use optimized database function with pagination and view filtering
      const { data, error } = await supabase.rpc('get_crm_prospects_with_stats', {
        p_status_filter: null, // Let view handle filtering
        p_assigned_filter: null,
        p_view: view,
        p_lead_source: view === 'warm-inbound' ? 'warm_inbound' : null,
        p_limit: PAGE_SIZE,
        p_offset: page * PAGE_SIZE
      });

      console.log('✅ RPC Response:', { 
        view, 
        error: error ? error.message : null,
        recordCount: data?.length || 0,
        firstRecord: data?.[0],
        statuses: data?.map((d: any) => d.status).slice(0, 5)
      });

      if (error) throw error;

      // Map database function results to ProspectRow format
      const mapped = data?.map((p: any) => ({
        id: p.id,
        reportId: p.report_id,
        domain: p.domain,
        slug: p.slug,
        monthlyRevenue: p.monthly_revenue || 0,
        missedLeads: p.missed_leads || 0,
        trafficTier: p.traffic_tier,
        priority: p.priority,
        status: p.status,
        assignedTo: p.assigned_to,
        lostReason: p.lost_reason,
        lostNotes: p.lost_notes,
        contactCount: p.contact_count || 0,
        companyName: p.company_name,
        icebreakerText: p.icebreaker_text,
        leadSource: p.lead_source || 'cold_outbound',
      })) || [];

      setHasMore(mapped.length === PAGE_SIZE);
      
      if (append) {
        setProspects(prev => [...prev, ...mapped]);
      } else {
        setProspects(mapped);
        // Update cache on successful fetch
        cacheRef.current = {
          data: mapped,
          timestamp: Date.now(),
          searchTerm: debouncedSearchTerm,
          view,
          statusFilter
        };
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchProspects(true);
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
    
    // Optimistic update
    setProspects(prev => prev.map(p => 
      p.id === prospectId ? { ...p, priority: newPriority } : p
    ));
    
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
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Failed to update priority");
      // Revert on error
      fetchProspects();
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
    
    // Optimistic update
    setProspects(prev => prev.map(p => 
      p.id === prospectId ? { ...p, status: newStatus } : p
    ));
    
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
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
      // Revert on error
      fetchProspects();
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

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedProspectIds.size === 0) {
      toast.error("No prospects selected");
      return;
    }

    if (['closed_lost', 'not_viable'].includes(newStatus)) {
      const confirmed = window.confirm(
        `Are you sure you want to mark ${selectedProspectIds.size} prospect(s) as "${newStatus.replace('_', ' ')}"? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    setUpdatingBulkStatus(true);

    try {
      const response = await supabase.functions.invoke('bulk-update-status', {
        body: {
          prospectIds: Array.from(selectedProspectIds),
          newStatus: newStatus,
        },
      });

      if (response.error) throw response.error;

      const statusLabel = newStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      toast.success(`Updated ${selectedProspectIds.size} prospect(s) to ${statusLabel}`);
      
      setSelectedProspectIds(new Set());
      await fetchProspects();
    } catch (error: any) {
      console.error("Bulk update error:", error);
      toast.error(error?.message || "Failed to update prospects");
    } finally {
      setUpdatingBulkStatus(false);
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
    if (debouncedSearchTerm && !p.domain.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
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

  const handleBulkEnrich = async () => {
    if (selectedProspectIds.size === 0) {
      toast.error("No prospects selected");
      return;
    }

    const confirmed = window.confirm(
      `Enrich ${selectedProspectIds.size} prospect(s) with AI? This will scrape their websites and extract contact information.`
    );
    if (!confirmed) return;

    setBulkEnriching(true);
    setShowEnrichmentProgress(true);
    
    // Initialize progress tracking
    const progressMap = new Map<string, EnrichmentProgress>();
    selectedProspectIds.forEach(id => {
      const prospect = displayedProspects.find(p => p.id === id);
      if (prospect) {
        progressMap.set(id, {
          prospectId: id,
          domain: prospect.domain,
          status: 'pending'
        });
      }
    });
    setEnrichmentProgress(progressMap);

    try {
      const response = await fetch(
        `https://apjlauuidcbvuplfcshg.supabase.co/functions/v1/bulk-enrich-prospects`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwamxhdXVpZGNidnVwbGZjc2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1NjMsImV4cCI6MjA3MzUzNjU2M30.1Lv6xs2zAbg24V-7f0nzC8OxoZUVw03_ZD2QIkS_hDU`,
          },
          body: JSON.stringify({
            prospect_ids: Array.from(selectedProspectIds),
          }),
        }
      );

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        console.error('Bulk enrichment failed:', response.status, errorText);
        throw new Error(`Failed to start bulk enrichment: ${response.status} ${errorText}`);
      }

      // Parse SSE stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.type === 'progress' || data.type === 'success' || data.type === 'error') {
              setEnrichmentProgress(prev => {
                const newMap = new Map(prev);
                const existing = newMap.get(data.prospectId);
                if (existing) {
                  newMap.set(data.prospectId, {
                    ...existing,
                    status: data.status || (data.type === 'success' ? 'success' : data.type === 'error' ? 'failed' : 'processing'),
                    contactsFound: data.contactsFound,
                    error: data.error,
                  });
                }
                return newMap;
              });
            }
            
            if (data.type === 'complete') {
              toast.success(
                `Enrichment complete: ${data.summary.succeeded}/${data.summary.total} successful`
              );
            }
          } catch (e) {
            console.error('Failed to parse SSE message:', e);
          }
        }
      }

      // Refresh table
      await fetchProspects();
      setSelectedProspectIds(new Set());
      
    } catch (error: any) {
      console.error('Bulk enrichment error:', error);
      toast.error(error?.message || 'Failed to enrich prospects');
    } finally {
      setBulkEnriching(false);
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

      {!compact && (
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
              onBulkStatusUpdate={handleBulkStatusUpdate}
              updatingStatus={updatingBulkStatus}
              onBulkEnrich={handleBulkEnrich}
              enriching={bulkEnriching}
              showEnrichAction={view === 'needs-enrichment'}
              showMarkContactedOption={view === 'ready-outreach'}
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
              {!compact && <TableHead className="w-20">Opener</TableHead>}
              {view !== 'needs-enrichment' && <SortableHeader label="Revenue & Leads" sortKey="monthlyRevenue" className="text-right w-32" />}
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
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {prospect.leadSource === 'warm_inbound' && (
                          <Badge className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
                            🔥 Warm
                          </Badge>
                        )}
                        <span>{prospect.companyName || prospect.domain}</span>
                      </div>
                      {prospect.companyName && (
                        <span className="text-xs text-muted-foreground">{prospect.domain}</span>
                      )}
                    </div>
                  </TableCell>
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
                  {!compact && (
                    <TableCell className="w-20">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center">
                              {prospect.icebreakerText ? (
                                <MessageSquare className="h-4 w-4 text-green-500" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{prospect.icebreakerText ? 'Has icebreaker' : 'Missing icebreaker - select and bulk enrich'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  )}
                  {view !== 'needs-enrichment' && (
                    <TableCell className="text-right w-32 px-2">
                      <div className="flex flex-col gap-0.5">
                        <span className={cn(
                          "text-sm font-medium",
                          prospect.monthlyRevenue > 50000 && "text-green-600 font-semibold"
                        )}>
                          {formatCRMCurrency(prospect.monthlyRevenue)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {prospect.missedLeads.toLocaleString()} leads
                        </span>
                      </div>
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

      {/* Pagination - Load More button */}
      {hasMore && !loading && displayedProspects.length > 0 && (
        <div className="flex justify-center py-4">
          <Button 
            onClick={loadMore}
            variant="outline"
            disabled={loading}
          >
            Load More ({displayedProspects.length} loaded)
          </Button>
        </div>
      )}

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

      <BulkEnrichmentProgressDialog
        open={showEnrichmentProgress}
        onOpenChange={setShowEnrichmentProgress}
        progress={enrichmentProgress}
      />
    </div>
  );
}
