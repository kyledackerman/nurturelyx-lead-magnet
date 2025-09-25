import { useState } from "react";
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
import { ExternalLink, Eye, Copy } from "lucide-react";
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
    avgTransactionValue?: number;
  };
}

interface AdminReportsTableProps {
  reports: ReportData[];
  loading: boolean;
}

export const AdminReportsTable = ({ reports, loading }: AdminReportsTableProps) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const adminUserId = "850078c3-247c-4904-9b9a-ebec624d4ef5";

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

  const getTrafficColor = (traffic?: number) => {
    if (!traffic) return 'text-muted-foreground';
    if (traffic >= 50000) return 'text-green-600';
    if (traffic >= 10000) return 'text-yellow-600';
    return 'text-red-600';
  };

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
            <TableHead>Domain</TableHead>
            <TableHead className="text-center">Organic Traffic</TableHead>
            <TableHead className="text-center">Paid Traffic</TableHead>
            <TableHead className="text-center">Missed Leads</TableHead>
            <TableHead className="text-center">Revenue Lost</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => {
            const isYourReport = report.user_id === adminUserId;
            return (
              <TableRow 
                key={report.id}
                className={isYourReport ? "bg-primary/5 border-primary/20" : ""}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{report.domain}</span>
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
                  <span className={`font-medium ${getTrafficColor(report.report_data?.organicTraffic)}`}>
                    {formatNumber(report.report_data?.organicTraffic)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`font-medium ${getTrafficColor(report.report_data?.paidTraffic)}`}>
                    {formatNumber(report.report_data?.paidTraffic)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-medium text-red-600">
                    {formatNumber(report.report_data?.missedLeads)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-bold text-red-600">
                    {formatCurrency(report.report_data?.yearlyRevenueLost)}
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