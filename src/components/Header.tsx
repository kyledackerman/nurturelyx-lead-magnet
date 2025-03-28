
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/b1566634-1aeb-472d-8856-f526a0aa2392.png" 
            alt="NurturelyX Logo" 
            className="h-8 mr-2" 
          />
          <p className="text-xs text-gray-400">Lead Estimation Report</p>
        </div>
        
        <Button className="gradient-bg text-white font-medium">
          Apply for Beta
        </Button>
      </div>
    </header>
  );
};

export default Header;
