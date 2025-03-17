
import { MonthlyRevenueData } from "@/services/apiService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MonthlyRevenueTableProps {
  data: MonthlyRevenueData[];
}

const MonthlyRevenueTable = ({ data }: MonthlyRevenueTableProps) => {
  // Calculate totals
  const totalVisitors = data.reduce((sum, item) => sum + item.visitors, 0);
  const totalLeads = data.reduce((sum, item) => sum + item.leads, 0);
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const totalRevenueLost = data.reduce((sum, item) => sum + item.revenueLost, 0);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            <TableHead className="font-medium text-foreground">Month</TableHead>
            <TableHead className="font-medium text-foreground text-right">Visitors</TableHead>
            <TableHead className="font-medium text-foreground text-right">Leads</TableHead>
            <TableHead className="font-medium text-foreground text-right">Sales</TableHead>
            <TableHead className="font-medium text-foreground text-right">Revenue Lost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-secondary/40">
              <TableCell className="font-medium">
                {item.month} {item.year}
              </TableCell>
              <TableCell className="text-right">{item.visitors.toLocaleString()}</TableCell>
              <TableCell className="text-right">{item.leads.toLocaleString()}</TableCell>
              <TableCell className="text-right">{item.sales.toLocaleString()}</TableCell>
              <TableCell className="text-right text-accent">{formatCurrency(item.revenueLost)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-secondary/50">
            <TableCell>TOTAL (6 Months)</TableCell>
            <TableCell className="text-right">{totalVisitors.toLocaleString()}</TableCell>
            <TableCell className="text-right">{totalLeads.toLocaleString()}</TableCell>
            <TableCell className="text-right">{totalSales.toLocaleString()}</TableCell>
            <TableCell className="text-right text-accent">{formatCurrency(totalRevenueLost)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyRevenueTable;
