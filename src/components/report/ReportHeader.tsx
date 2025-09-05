
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
    <div className="flex items-center gap-2 flex-wrap">
      {onEditData && (
        <Button
          variant="outline"
          onClick={onEditData}
          className="flex items-center gap-1 text-white border-accent hover:bg-accent/10"
          size="xs"
        >
          <Edit size={14} />
          <span className="hidden sm:inline">My Information Isn't Right</span>
          <span className="sm:hidden">Edit Info</span>
        </Button>
      )}

      <Button
        variant="outline"
        onClick={onReset}
        className="flex items-center gap-1 border-accent text-white hover:bg-accent/10"
        size="xs"
      >
        <RefreshCw size={14} />
        <span className="hidden sm:inline">Restart</span>
        <span className="sm:hidden">Reset</span>
      </Button>

      <Button
        variant="outline"
        onClick={handlePrintReport}
        className="flex items-center gap-1 text-white border-accent hover:bg-accent/10"
        size="xs"
      >
        <Printer size={14} />
        <span className="hidden sm:inline">Save as PDF</span>
        <span className="sm:hidden">PDF</span>
      </Button>
    </div>
  );
};

export default ReportHeader;
