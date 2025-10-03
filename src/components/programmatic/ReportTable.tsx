import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface Report {
  id: string;
  domain: string;
  slug: string;
  industry: string | null;
  extracted_company_name: string | null;
  report_data: any;
}

interface ReportTableProps {
  reports: Report[];
}

export const ReportTable = ({ reports }: ReportTableProps) => {
  const [sortField, setSortField] = useState<'revenue' | 'leads'>('revenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedReports = [...reports].sort((a, b) => {
    const aData = a.report_data as any;
    const bData = b.report_data as any;
    
    const aValue = sortField === 'revenue' 
      ? (aData?.yearlyRevenueLost || 0) 
      : (aData?.totalMissedLeads || 0);
    const bValue = sortField === 'revenue' 
      ? (bData?.yearlyRevenueLost || 0) 
      : (bData?.totalMissedLeads || 0);
    
    return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
  });

  const toggleSort = (field: 'revenue' | 'leads') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Company</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('leads')} className="flex items-center gap-1">
                Missed Leads
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => toggleSort('revenue')} className="flex items-center gap-1">
                Lost Revenue
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedReports.map((report) => {
            const reportData = report.report_data as any;
            const missedLeads = reportData?.totalMissedLeads || 0;
            const revenueLost = reportData?.yearlyRevenueLost || 0;
            const companyName = report.extracted_company_name || report.domain;

            return (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{companyName}</TableCell>
                <TableCell>
                  {report.industry && (
                    <span className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {report.industry}
                    </span>
                  )}
                </TableCell>
                <TableCell>{missedLeads.toLocaleString()}/year</TableCell>
                <TableCell className="font-semibold">${revenueLost.toLocaleString()}/year</TableCell>
                <TableCell>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/report/${report.slug}`}>
                      View Report
                      <ExternalLink className="ml-2 h-3 w-3" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
