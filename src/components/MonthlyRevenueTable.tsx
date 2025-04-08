import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyRevenueData } from "@/types/report";

interface MonthlyRevenueTableProps {
  data: MonthlyRevenueData[];
}

const MonthlyRevenueTable = ({ data }: MonthlyRevenueTableProps) => {
  // Format currency values
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-secondary-foreground/5">
            <TableHead className="text-white">Month</TableHead>
            <TableHead className="text-right text-white">Visitors</TableHead>
            <TableHead className="text-right text-white">
              Missed Leads
            </TableHead>
            <TableHead className="text-right text-white">Lost Sales</TableHead>
            <TableHead className="text-right text-white">
              Lost Revenue
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((month, index) => (
            <TableRow
              key={index}
              className={index % 2 === 0 ? "bg-secondary-foreground/5" : ""}
            >
              <TableCell className="font-medium text-white">
                {month.month}
              </TableCell>
              <TableCell className="text-right text-white">
                {month.visitors.toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-white">
                {(month.missedLeads || month.leads).toLocaleString()}
              </TableCell>
              <TableCell className="text-right text-white">
                {(month.lostSales || month.sales).toLocaleString()}
              </TableCell>
              <TableCell className="text-right font-bold text-white">
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
