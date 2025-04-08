
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

  // Get min and max values for each column to create the heatmap scale
  const getMinMax = (key: keyof MonthlyRevenueData) => {
    if (data.length === 0) return { min: 0, max: 0 };
    
    const values = data.map(item => typeof item[key] === 'number' ? Number(item[key]) : 0);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  };

  const visitorsRange = getMinMax('visitors');
  const leadsRange = getMinMax('leads');
  const salesRange = getMinMax('sales');
  const revenueLostRange = getMinMax('revenueLost');

  // Calculate the intensity of the color based on the value's position in the range
  const getHeatmapColor = (value: number, min: number, max: number, isRevenue: boolean = false) => {
    if (max === min) return 'bg-gray-100'; // Prevent division by zero
    
    const range = max - min;
    const normalizedValue = (value - min) / range;
    
    // For revenue (red = bad, green = good)
    if (isRevenue) {
      // Green (low values) to Red (high values) - because losing more revenue is worse
      const hue = 120 - (normalizedValue * 120); // 120 is green, 0 is red
      return `bg-[hsl(${hue},85%,90%)] text-[hsl(${hue},80%,20%)]`;
    } else {
      // Red (low values) to Green (high values) - because more visitors/leads/sales is better
      const hue = normalizedValue * 120; // 0 is red, 120 is green
      return `bg-[hsl(${hue},85%,90%)] text-[hsl(${hue},80%,20%)]`;
    }
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
              <TableCell 
                className={`text-right text-base font-medium ${getHeatmapColor(month.visitors, visitorsRange.min, visitorsRange.max)}`}
              >
                {month.visitors.toLocaleString()}
              </TableCell>
              <TableCell 
                className={`text-right text-base font-medium ${getHeatmapColor(month.leads, leadsRange.min, leadsRange.max)}`}
              >
                {month.leads.toLocaleString()}
              </TableCell>
              <TableCell 
                className={`text-right text-base font-medium ${getHeatmapColor(month.sales, salesRange.min, salesRange.max)}`}
              >
                {month.sales.toLocaleString()}
              </TableCell>
              <TableCell 
                className={`text-right font-bold text-base ${getHeatmapColor(month.revenueLost, revenueLostRange.min, revenueLostRange.max, true)}`}
              >
                {formatCurrency(month.revenueLost)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between mt-4">
        <div className="text-xs text-gray-400">
          * Historical data is based on typical traffic patterns for websites in your industry.
          Actual results may vary based on your specific implementation and market conditions.
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Heatmap:</span>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[hsl(0,85%,90%)]"></div>
            <span className="text-xs mx-1">Low</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[hsl(60,85%,90%)]"></div>
            <span className="text-xs mx-1">Medium</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[hsl(120,85%,90%)]"></div>
            <span className="text-xs mx-1">High</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyRevenueTable;
