
import { Button } from "@/components/ui/button";
import { FileBarChart } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <FileBarChart className="h-8 w-8 text-accent mr-2" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">NurturelyX</h1>
            <p className="text-xs text-gray-400">Lead Estimation Report</p>
          </div>
        </div>
        
        <Button className="gradient-bg text-background font-medium">
          Apply for Beta
        </Button>
      </div>
    </header>
  );
};

export default Header;
