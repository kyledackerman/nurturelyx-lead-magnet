import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Eye, Copy, ChevronUp, ChevronDown, AlertTriangle, TrendingUp, Download, UserPlus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditTransactionValueDialog } from "@/components/dialog/EditTransactionValueDialog";

interface ReportData {
  domain: string;
  created_at: string;
  is_public: boolean;
  user_id: string | null;
  slug: string;
  id: string;
  report_data: {
    organicTraffic?: number;
    paidTraffic?: number;
    missedLeads?: number;
    yearlyRevenueLost?: number;
    monthlyRevenueLost?: number;
    avgTransactionValue?: number;
  };
}

interface AdminReportsTableProps {
  reports: ReportData[];
  loading: boolean;
  onReportUpdate?: () => void;
}

type SortKey = 'domain' | 'organicTraffic' | 'paidTraffic' | 'missedLeads' | 'monthlyRevenueLost' | 'created_at';
type SortDirection = 'asc' | 'desc';

export const AdminReportsTable = ({ reports, loading, onReportUpdate }: AdminReportsTableProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('monthlyRevenueLost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [sortedReports, setSortedReports] = useState<ReportData[]>([]);
  const [crmReportIds, setCrmReportIds] = useState<Set<string>>(new Set());
  const [addingToCRM, setAddingToCRM] = useState<string | null>(null);
  const adminUserId = "850078c3-247c-4904-9b9a-ebec624d4ef5";

  // Enhanced formatting functions
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('en-US').format(value);
  };

  const exportReportUrls = () => {
    const baseUrl = 'https://x1.nurturely.io/report';
    const urls = reports.map(report => `${baseUrl}/${report.slug}`).join('\n');
    
    const blob = new Blob([urls], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-urls-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success(`Exported ${reports.length} report URLs`);
  };

  // Color coding functions for key metrics
  const getMissedLeadsColor = (leads?: number) => {
    if (!leads) return 'text-muted-foreground';
    if (leads >= 1000) return 'text-amber-600 font-bold';
    if (leads >= 500) return 'text-orange-600 font-semibold';
    if (leads >= 100) return 'text-orange-600 font-medium';
    if (leads >= 50) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
  };

  const getRevenueColor = (revenue?: number) => {
    if (!revenue) return 'text-muted-foreground';
    if (revenue >= 8500) return 'text-amber-600 font-bold';
    if (revenue >= 4200) return 'text-amber-600 font-bold';
    if (revenue >= 2100) return 'text-orange-600 font-semibold';
    if (revenue >= 850) return 'text-orange-500 font-medium';
    if (revenue >= 420) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
  };

  const isHighPriority = (report: ReportData) => {
    const revenue = report.report_data?.monthlyRevenueLost || 0;
    const leads = report.report_data?.missedLeads || 0;
    return revenue >= 4200 || leads >= 500;
  };

  // Sorting logic
  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('desc');
    }
  };

  const getSortedReports = () => {
    const sorted = [...reports].sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';

      switch (sortBy) {
        case 'domain':
          aValue = a.domain.toLowerCase();
          bValue = b.domain.toLowerCase();
          break;
        case 'organicTraffic':
          aValue = a.report_data?.organicTraffic || 0;
          bValue = b.report_data?.organicTraffic || 0;
          break;
        case 'paidTraffic':
          aValue = a.report_data?.paidTraffic || 0;
          bValue = b.report_data?.paidTraffic || 0;
          break;
        case 'missedLeads':
          aValue = a.report_data?.missedLeads || 0;
          bValue = b.report_data?.missedLeads || 0;
          break;
        case 'monthlyRevenueLost':
          aValue = a.report_data?.monthlyRevenueLost || 0;
          bValue = b.report_data?.monthlyRevenueLost || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  };

  useEffect(() => {
    setSortedReports(getSortedReports());
  }, [reports, sortBy, sortDirection]);

  // Fetch which reports are already in CRM
  useEffect(() => {
    const fetchCRMReports = async () => {
      const { data } = await supabase
        .from('prospect_activities')
        .select('report_id');
      
      if (data) {
        setCrmReportIds(new Set(data.map(item => item.report_id)));
      }
    };

    fetchCRMReports();
  }, [reports]);

  const handleAddToCRM = async (reportId: string) => {
    setAddingToCRM(reportId);
    
    try {
      const { data, error } = await supabase.functions.invoke('add-to-crm', {
        body: { reportId }
      });

      if (error) {
        if (data?.alreadyExists) {
          toast.info("This report is already in the CRM system.");
        } else {
          throw error;
        }
      } else {
        toast.success("Report successfully added to CRM system.");
        setCrmReportIds(prev => new Set(prev).add(reportId));
      }
    } catch (error) {
      console.error('Error adding to CRM:', error);
      toast.error("Failed to add report to CRM. Please try again.");
    } finally {
      setAddingToCRM(null);
    }
  };

  const SortableHeader = ({ 
    label, 
    sortKey, 
    className = "" 
  }: { 
    label: string; 
    sortKey: SortKey; 
    className?: string 
  }) => (
    <TableHead 
      className={`cursor-pointer hover:bg-muted/50 transition-colors ${className}`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-center gap-1">
        {label}
        {sortBy === sortKey ? (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        ) : (
          <div className="h-4 w-4 opacity-30">
            <ChevronDown className="h-4 w-4" />
          </div>
        )}
      </div>
    </TableHead>
  );

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy');
    }
  };

  const openReport = (slug: string) => {
    const url = `${window.location.origin}/report/${slug}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No reports found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={exportReportUrls} variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export URLs
        </Button>
      </div>
      <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHeader label="Domain" sortKey="domain" />
            <SortableHeader label="Organic Traffic" sortKey="organicTraffic" className="text-center" />
            <SortableHeader label="Paid Traffic" sortKey="paidTraffic" className="text-center" />
            <SortableHeader label="Missed Leads" sortKey="missedLeads" className="text-center" />
            <SortableHeader label="Monthly Revenue Lost" sortKey="monthlyRevenueLost" className="text-center" />
            <SortableHeader label="Created" sortKey="created_at" />
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReports.map((report) => {
            const isYourReport = report.user_id === adminUserId;
            const highPriority = isHighPriority(report);
            
            return (
              <TableRow 
                key={report.id}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{report.domain}</span>
                    {highPriority && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    {isYourReport && (
                      <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                        Your Report
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(report.domain, report.id)}
                    >
                      <Copy className={`h-3 w-3 ${copiedId === report.id ? 'text-green-500' : ''}`} />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-foreground font-medium">
                    {formatNumber(report.report_data?.organicTraffic)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-foreground font-medium">
                    {formatNumber(report.report_data?.paidTraffic)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={getMissedLeadsColor(report.report_data?.missedLeads)}>
                    {formatNumber(report.report_data?.missedLeads)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={getRevenueColor(report.report_data?.monthlyRevenueLost)}>
                    {formatCurrency(report.report_data?.monthlyRevenueLost)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(report.created_at)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={report.is_public ? "default" : "secondary"}>
                    {report.is_public ? "Public" : "Private"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {isYourReport ? 'You' : report.user_id ? report.user_id.slice(0, 8) + '...' : 'Anonymous'}
                    </span>
                    {report.user_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(report.user_id!, report.id + '-user')}
                      >
                        <Copy className={`h-3 w-3 ${copiedId === report.id + '-user' ? 'text-green-500' : ''}`} />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openReport(report.slug)}
                      className="h-8"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {onReportUpdate && (
                      <EditTransactionValueDialog
                        reportId={report.id}
                        currentValue={report.report_data.avgTransactionValue || 0}
                        domain={report.domain}
                        onUpdate={onReportUpdate}
                        variant="ghost"
                        size="sm"
                        showIcon={false}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${window.location.origin}/report/${report.slug}`, report.id + '-url')}
                      className="h-8"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {copiedId === report.id + '-url' ? 'Copied!' : 'Copy URL'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddToCRM(report.id)}
                      disabled={crmReportIds.has(report.id) || addingToCRM === report.id}
                      className="h-8"
                    >
                      {addingToCRM === report.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-1" />
                      )}
                      {crmReportIds.has(report.id) ? 'In CRM' : 'Add to CRM'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
    </div>
  );
};