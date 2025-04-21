
import { Button } from "@/components/ui/button";
import { Edit, Printer, RefreshCw } from "lucide-react";

interface ReportHeaderProps {
  onEditData?: () => void;
  onReset: () => void;
}

const ReportHeader = ({ onEditData, onReset }: ReportHeaderProps) => {
  const handlePrintReport = () => {
    document.body.classList.add("printing-report");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-report");
    }, 1000);
  };

  return (
    <div className="flex flex-wrap gap-4">
      {onEditData && (
        <Button
          variant="outline"
          onClick={onEditData}
          className="flex items-center gap-2 text-white border-accent hover:bg-accent/10"
          size="sm"
        >
          <Edit size={16} />
          My Information Isn't Right
        </Button>
      )}

      <div className="flex gap-2 ml-auto">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2 border-accent text-white hover:bg-accent/10"
          size="sm"
        >
          <RefreshCw size={16} />
          Restart
        </Button>

        <Button
          variant="outline"
          onClick={handlePrintReport}
          className="flex items-center gap-2 text-white"
          size="sm"
        >
          <Printer size={16} />
          Save as PDF
        </Button>
      </div>
    </div>
  );
};

export default ReportHeader;
