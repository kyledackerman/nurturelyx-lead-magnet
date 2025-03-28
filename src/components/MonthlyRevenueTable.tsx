
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthlyRevenueData } from "@/types/report";

interface MonthlyRevenueTableProps {
  data: MonthlyRevenueData[];
}

const MonthlyRevenueTable = ({ data }: MonthlyRevenueTableProps) => {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-secondary-foreground/5">
            <TableHead className="text-black">Month</TableHead>
            <TableHead className="text-right text-black">Visitors</TableHead>
            <TableHead className="text-right text-black">Missed Leads</TableHead>
            <TableHead className="text-right text-black">Lost Sales</TableHead>
            <TableHead className="text-right text-black">Lost Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((month, index) => (
            <TableRow key={index} className={index % 2 === 0 ? "bg-secondary-foreground/5" : ""}>
              <TableCell className="font-medium text-black">{month.month}</TableCell>
              <TableCell className="text-right text-black">{month.visitors.toLocaleString()}</TableCell>
              <TableCell className="text-right text-black">{(month.missedLeads || month.leads).toLocaleString()}</TableCell>
              <TableCell className="text-right text-black">{(month.lostSales || month.sales).toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold text-black">
                {formatCurrency(month.lostRevenue || month.revenueLost)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyRevenueTable;
