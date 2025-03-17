
import { Button } from "@/components/ui/button";
import { FileBarChart } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <FileBarChart className="h-8 w-8 text-brand-purple mr-2" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">NurturelyX</h1>
            <p className="text-xs text-gray-500">Lead Estimation Report</p>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-purple">How It Works</a>
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-purple">Case Studies</a>
          <a href="#" className="text-sm font-medium text-gray-600 hover:text-brand-purple">Pricing</a>
        </nav>
        
        <Button className="gradient-bg">
          Request a Demo
        </Button>
      </div>
    </header>
  );
};

export default Header;
