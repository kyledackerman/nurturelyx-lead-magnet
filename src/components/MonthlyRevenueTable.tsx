
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
            <TableHead className="font-medium text-foreground text-base lg:text-lg">Month</TableHead>
            <TableHead className="font-medium text-foreground text-right text-base lg:text-lg">Visitors</TableHead>
            <TableHead className="font-medium text-foreground text-right text-base lg:text-lg">Leads</TableHead>
            <TableHead className="font-medium text-foreground text-right text-base lg:text-lg">Sales</TableHead>
            <TableHead className="font-medium text-foreground text-right text-base lg:text-lg">Revenue Lost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} className="hover:bg-secondary/40">
              <TableCell className="font-medium text-base">
                {item.month} {item.year}
              </TableCell>
              <TableCell className="text-right text-base">
                {item.visitors.toLocaleString()}
                <div className="text-xs text-gray-400 mt-1">(Organic + Paid)</div>
              </TableCell>
              <TableCell className="text-right text-base">{item.leads.toLocaleString()}</TableCell>
              <TableCell className="text-right text-base">{item.sales.toLocaleString()}</TableCell>
              <TableCell className="text-right text-base text-accent font-bold">{formatCurrency(item.revenueLost)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold bg-secondary/50">
            <TableCell className="text-base lg:text-lg">TOTAL (6 Months)</TableCell>
            <TableCell className="text-right text-base lg:text-lg">{totalVisitors.toLocaleString()}</TableCell>
            <TableCell className="text-right text-base lg:text-lg">{totalLeads.toLocaleString()}</TableCell>
            <TableCell className="text-right text-base lg:text-lg">{totalSales.toLocaleString()}</TableCell>
            <TableCell className="text-right text-base lg:text-lg text-accent font-extrabold">{formatCurrency(totalRevenueLost)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyRevenueTable;
