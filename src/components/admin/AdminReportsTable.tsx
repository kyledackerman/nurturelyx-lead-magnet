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
import { ExternalLink, Eye, Copy, ChevronUp, ChevronDown, AlertTriangle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

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
}

type SortKey = 'domain' | 'organicTraffic' | 'paidTraffic' | 'missedLeads' | 'monthlyRevenueLost' | 'created_at';
type SortDirection = 'asc' | 'desc';

export const AdminReportsTable = ({ reports, loading }: AdminReportsTableProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortKey>('monthlyRevenueLost');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [sortedReports, setSortedReports] = useState<ReportData[]>([]);
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

  // Enhanced color coding functions
  const getOrganicTrafficColor = (traffic?: number) => {
    if (!traffic) return 'text-muted-foreground';
    if (traffic >= 100000) return 'text-emerald-600 font-bold';
    if (traffic >= 50000) return 'text-green-600 font-semibold';
    if (traffic >= 20000) return 'text-lime-600 font-medium';
    if (traffic >= 5000) return 'text-yellow-600 font-medium';
    return 'text-red-500 font-medium';
  };

  const getPaidTrafficColor = (traffic?: number) => {
    if (!traffic) return 'text-muted-foreground';
    if (traffic >= 50000) return 'text-blue-600 font-bold';
    if (traffic >= 20000) return 'text-blue-500 font-semibold';
    if (traffic >= 5000) return 'text-cyan-600 font-medium';
    if (traffic >= 1000) return 'text-orange-500 font-medium';
    return 'text-red-500 font-medium';
  };

  const getMissedLeadsColor = (leads?: number) => {
    if (!leads) return 'text-muted-foreground';
    if (leads >= 1000) return 'text-red-700 font-bold';
    if (leads >= 500) return 'text-red-600 font-semibold';
    if (leads >= 100) return 'text-orange-600 font-medium';
    if (leads >= 50) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
  };

  const getRevenueColor = (revenue?: number) => {
    if (!revenue) return 'text-muted-foreground';
    if (revenue >= 8500) return 'text-red-700 font-bold';
    if (revenue >= 4200) return 'text-red-600 font-bold';
    if (revenue >= 2100) return 'text-orange-600 font-semibold';
    if (revenue >= 850) return 'text-orange-500 font-medium';
    if (revenue >= 420) return 'text-yellow-600 font-medium';
    return 'text-green-600 font-medium';
  };

  const getRowBackground = (report: ReportData) => {
    const revenue = report.report_data?.monthlyRevenueLost || 0;
    const leads = report.report_data?.missedLeads || 0;
    const isYourReport = report.user_id === adminUserId;
    
    if (isYourReport) return "bg-primary/10 border-primary/30 hover:bg-primary/15";
    if (revenue >= 4200 || leads >= 500) return "bg-red-50 border-red-200 hover:bg-red-100";
    if (revenue >= 2100 || leads >= 200) return "bg-orange-50 border-orange-200 hover:bg-orange-100";
    return "hover:bg-muted/50";
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
                className={getRowBackground(report)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{report.domain}</span>
                    {highPriority && (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
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
                  <span className={getOrganicTrafficColor(report.report_data?.organicTraffic)}>
                    {formatNumber(report.report_data?.organicTraffic)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={getPaidTrafficColor(report.report_data?.paidTraffic)}>
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
                    <span className={`text-sm font-medium ${isYourReport ? 'text-primary' : report.user_id ? 'text-foreground' : 'text-muted-foreground'}`}>
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`${window.location.origin}/report/${report.slug}`, report.id + '-url')}
                      className="h-8"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      {copiedId === report.id + '-url' ? 'Copied!' : 'Copy URL'}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};