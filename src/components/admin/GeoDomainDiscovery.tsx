import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Search } from "lucide-react";

export function GeoDomainDiscovery() {
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [transactionValue, setTransactionValue] = useState("5000");
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [domains, setDomains] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!location.trim()) {
      toast({
        title: "Location Required",
        description: "Please enter a location to search",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    setDomains([]);
    setSelectedDomains(new Set());

    try {
      const { data, error } = await supabase.functions.invoke('discover-geo-domains', {
        body: { 
          location: location.trim(),
          keywords: keywords.trim() || null
        }
      });

      if (error) throw error;

      if (data.domains && data.domains.length > 0) {
        setDomains(data.domains);
        setSelectedDomains(new Set(data.domains));
        toast({
          title: "Search Complete",
          description: `Found ${data.count} domains in ${data.location}`
        });
      } else {
        toast({
          title: "No Results",
          description: "No domains found for this location. Try different keywords or location.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search for domains",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleDomain = (domain: string) => {
    const newSelected = new Set(selectedDomains);
    if (newSelected.has(domain)) {
      newSelected.delete(domain);
    } else {
      newSelected.add(domain);
    }
    setSelectedDomains(newSelected);
  };

  const handleImport = async () => {
    if (selectedDomains.size === 0) {
      toast({
        title: "No Domains Selected",
        description: "Please select at least one domain to import",
        variant: "destructive"
      });
      return;
    }

    setIsImporting(true);

    try {
      // Generate CSV
      const csvHeader = "domain,avg_transaction_value";
      const csvRows = Array.from(selectedDomains).map(
        domain => `${domain},${transactionValue}`
      );
      const csvData = [csvHeader, ...csvRows].join('\n');

      // Call import-prospects
      const { data, error } = await supabase.functions.invoke('import-prospects', {
        body: {
          csvData,
          fileName: `geo_${location.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`
        }
      });

      if (error) throw error;

      toast({
        title: "Import Started",
        description: `${selectedDomains.size} domains queued for enrichment (Job #${data.jobId})`
      });

      // Reset form
      setDomains([]);
      setSelectedDomains(new Set());
      setLocation("");
      setKeywords("");
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import domains",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Domains by Location
          </CardTitle>
          <CardDescription>
            Discover business domains in any geographic area using AI-powered search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., Miami FL, 90210, South Florida"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isSearching}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (Optional)</Label>
              <Input
                id="keywords"
                placeholder="e.g., HVAC, plumbing, contractors"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={isSearching}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction-value">Default Transaction Value</Label>
            <Input
              id="transaction-value"
              type="number"
              placeholder="5000"
              value={transactionValue}
              onChange={(e) => setTransactionValue(e.target.value)}
              disabled={isSearching}
            />
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="w-full"
          >
            {isSearching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Domains
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found {domains.length} Domains</CardTitle>
            <CardDescription>
              Select domains to import into your CRM for enrichment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-96 overflow-y-auto space-y-2 border rounded-lg p-4">
              {domains.map((domain) => (
                <div key={domain} className="flex items-center space-x-2">
                  <Checkbox
                    id={domain}
                    checked={selectedDomains.has(domain)}
                    onCheckedChange={() => toggleDomain(domain)}
                  />
                  <label
                    htmlFor={domain}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {domain}
                  </label>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {selectedDomains.size} of {domains.length} selected
              </p>
              <Button
                onClick={handleImport}
                disabled={isImporting || selectedDomains.size === 0}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${selectedDomains.size} to CRM`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
