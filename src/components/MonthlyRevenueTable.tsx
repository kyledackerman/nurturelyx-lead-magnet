
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MonthlyRevenueData } from "@/services/apiService";

interface MonthlyRevenueTableProps {
  data: MonthlyRevenueData[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value);
};

const MonthlyRevenueTable = ({ data }: MonthlyRevenueTableProps) => {
  // Calculate totals
  const totalLeads = data.reduce((acc, month) => acc + month.leads, 0);
  const totalRevenue = data.reduce((acc, month) => acc + month.revenueLost, 0);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableCaption className="text-gray-400">
          Estimated missed revenue over the last 6 months
        </TableCaption>
        <TableHeader>
          <TableRow className="border-b border-border">
            <TableHead className="text-left">Month</TableHead>
            <TableHead className="text-right">Missed Leads</TableHead>
            <TableHead className="text-right">Lost Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((month, index) => (
            <TableRow 
              key={index} 
              className="border-b border-border hover:bg-secondary/50"
            >
              <TableCell className="font-medium text-left">
                {month.month} {month.year}
              </TableCell>
              <TableCell className="text-right">
                {month.leads.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-accent font-mono">
                {formatCurrency(month.revenueLost)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-secondary/50 border-b border-border">
            <TableCell className="font-bold">TOTAL</TableCell>
            <TableCell className="text-right font-bold">
              {totalLeads.toLocaleString()}
            </TableCell>
            <TableCell className="text-right font-bold text-accent font-mono">
              {formatCurrency(totalRevenue)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};

export default MonthlyRevenueTable;
