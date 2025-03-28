
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportData } from "@/types/report";
import { Check, AlertTriangle, Info } from "lucide-react";

interface ChangelogCardProps {
  reportData: ReportData;
}

const ChangelogCard = ({ reportData }: ChangelogCardProps) => {
  const currentDate = new Date().toLocaleDateString();
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  let dataSourceMessage = "";
  switch(reportData.dataSource) {
    case 'api':
      dataSourceMessage = "Using SearchAtlas API data";
      break;
    case 'manual':
      dataSourceMessage = "Using your manually entered data";
      break;
    case 'both':
      dataSourceMessage = "Using combined API and manual data (averaged)";
      break;
    case 'fallback':
      dataSourceMessage = "Using industry estimates (API unavailable)";
      break;
  }
  
  return (
    <Card className="mb-8 border-l-4 border-l-blue-500 bg-blue-500/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <Info className="mr-2" size={20} />
          Report Summary & Changelog
        </CardTitle>
        <CardDescription className="text-black">
          Generated on {currentDate} at {new Date().toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span className="text-black"><strong>Data Source:</strong> {dataSourceMessage}</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span className="text-black"><strong>Monthly Metrics:</strong> All values represent <strong>monthly averages</strong> unless otherwise stated</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span className="text-black"><strong>Leads Calculation:</strong> Potential leads are based on 20% of your total monthly traffic (organic + paid)</span>
          </li>
          <li className="flex items-start">
            <Check size={16} className="mr-2 mt-0.5 text-green-500" />
            <span className="text-black"><strong>Sales Estimation:</strong> Estimated at 1% conversion of identified leads with {formatCurrency(reportData.avgTransactionValue)} average value</span>
          </li>
          <li className="flex items-start">
            <AlertTriangle size={16} className="mr-2 mt-0.5 text-amber-500" />
            <span className="text-black">The revenue figures represent <strong>additional potential</strong> beyond your current performance</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default ChangelogCard;
