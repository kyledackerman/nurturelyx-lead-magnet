import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ActiveEnrichmentJobsIndicator from "./ActiveEnrichmentJobsIndicator";

interface CRMHeaderProps {
  onOpenProgressDialog?: (jobId: string) => void;
  currentView: string;
  onRefreshData: () => void;
  onDomainSelect?: (prospectId: string) => void;
}

export default function CRMHeader({ onOpenProgressDialog, currentView, onRefreshData, onDomainSelect }: CRMHeaderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDomains = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      const { data, error } = await supabase
        .from('reports')
        .select('id, domain, extracted_company_name, slug')
        .ilike('domain', `%${searchQuery}%`)
        .limit(10);

      if (error) {
        console.error('Search error:', error);
        return;
      }

      setSearchResults(data || []);
      setShowResults(true);
    };

    const debounce = setTimeout(searchDomains, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleSelectDomain = async (reportId: string) => {
    const { data, error } = await supabase
      .from('prospect_activities')
      .select('id')
      .eq('report_id', reportId)
      .limit(1)
      .single();

    if (error || !data) {
      toast({
        title: "Not found",
        description: "No prospect activity found for this domain",
        variant: "destructive",
      });
      return;
    }

    setSearchQuery("");
    setShowResults(false);
    onDomainSelect?.(data.id);
  };

  return (
    <div className="sticky top-0 z-10 border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1" />
            <div>
              <h1 className="text-2xl font-bold">CRM Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Manage your sales pipeline and convert prospects
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div ref={searchRef} className="relative hidden md:block">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search domain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults.length > 0 && setShowResults(true)}
                  className="pl-9 h-9"
                />
              </div>
              
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-popover border rounded-md shadow-lg max-h-96 overflow-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleSelectDomain(result.id)}
                      className="w-full px-3 py-2 text-left hover:bg-accent transition-colors border-b last:border-b-0"
                    >
                      <div className="font-medium text-sm">
                        {result.extracted_company_name || result.domain}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.domain}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {onOpenProgressDialog && (
              <ActiveEnrichmentJobsIndicator onOpenProgressDialog={onOpenProgressDialog} />
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={onRefreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Refresh Data</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
