
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MonthlyRevenueData } from "@/services/apiService";

interface MonthlyRevenueTableProps {
  data: MonthlyRevenueData[];
}

const MonthlyRevenueTable = ({ data }: MonthlyRevenueTableProps) => {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="overflow-x-auto">
      <Table className="border-collapse w-full">
        <TableHeader>
          <TableRow className="bg-secondary-foreground/5">
            <TableHead className="text-base font-semibold">Month</TableHead>
            <TableHead className="text-base font-semibold text-right">Visitors</TableHead>
            <TableHead className="text-base font-semibold text-right">Missed Leads</TableHead>
            <TableHead className="text-base font-semibold text-right">Lost Sales</TableHead>
            <TableHead className="text-base font-semibold text-right">Revenue Lost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((month, index) => (
            <TableRow key={index} className={index % 2 === 0 ? "bg-secondary-foreground/5" : ""}>
              <TableCell className="font-medium text-base">{month.month} {month.year}</TableCell>
              <TableCell className="text-right text-base">{month.visitors.toLocaleString()}</TableCell>
              <TableCell className="text-right text-base">{month.leads.toLocaleString()}</TableCell>
              <TableCell className="text-right text-base">{month.sales.toLocaleString()}</TableCell>
              <TableCell className="text-right font-bold text-base">
                {formatCurrency(month.revenueLost)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <p className="text-xs text-gray-400 mt-4">
        * Historical data is based on typical traffic patterns for websites in your industry.
        Actual results may vary based on your specific implementation and market conditions.
      </p>
    </div>
  );
};

export default MonthlyRevenueTable;
