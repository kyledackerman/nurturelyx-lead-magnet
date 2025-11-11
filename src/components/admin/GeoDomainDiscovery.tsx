import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Search, AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

interface VerifiedDomain {
  domain: string;
  name: string;
  address?: string;
  city: string;
  state: string;
  zip?: string;
  confidence: 'high' | 'medium' | 'low';
}

interface FilteredDomain {
  domain: string;
  name?: string;
  reason: string;
  actual_location?: string;
}

export function GeoDomainDiscovery() {
  const [location, setLocation] = useState("");
  const [keywords, setKeywords] = useState("");
  const [transactionValue, setTransactionValue] = useState("5000");
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [verifiedDomains, setVerifiedDomains] = useState<VerifiedDomain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<FilteredDomain[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<any>(null);
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
    setVerifiedDomains([]);
    setFilteredDomains([]);
    setSelectedDomains(new Set());
    setStats(null);

    try {
      const { data, error } = await supabase.functions.invoke('discover-geo-domains', {
        body: { 
          location: location.trim(),
          keywords: keywords.trim() || null
        }
      });

      if (error) throw error;

      if (data.verified && data.verified.length > 0) {
        setVerifiedDomains(data.verified);
        setFilteredDomains(data.filtered || []);
        setStats(data.stats);
        setSelectedDomains(new Set(data.verified.map((d: VerifiedDomain) => d.domain)));
        
        toast({
          title: "Search Complete",
          description: `✅ ${data.stats.verified_count} verified domains in ${data.location}. ${data.stats.filtered_count} filtered out.`
        });
      } else {
        toast({
          title: "No Results",
          description: "No domains found in this exact location. Try different keywords or verify the location is correct.",
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
      // Get selected domain objects with full geo data
      const selected = verifiedDomains.filter(d => selectedDomains.has(d.domain));
      
      // Generate CSV with geo columns
      const csvHeader = "domain,avg_transaction_value,city,state,zip";
      const csvRows = selected.map(domain => 
        `${domain.domain},${transactionValue},${domain.city},${domain.state},${domain.zip || ''}`
      );
      const csvData = [csvHeader, ...csvRows].join('\n');

      // Call import-prospects with geo metadata
      const { data, error } = await supabase.functions.invoke('import-prospects', {
        body: {
          csvData,
          fileName: `geo_${location.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`,
          geoMetadata: {
            searchLocation: location,
            isGeoDiscovery: true,
            searchedAt: new Date().toISOString(),
            domainGeoData: selected.reduce((acc, d) => {
              acc[d.domain] = {
                city: d.city,
                state: d.state,
                zip: d.zip,
                confidence: d.confidence
              };
              return acc;
            }, {} as Record<string, any>)
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Import Started",
        description: `${selectedDomains.size} domains queued for enrichment (Job #${data.jobId})`
      });

      // Reset form
      setVerifiedDomains([]);
      setFilteredDomains([]);
      setSelectedDomains(new Set());
      setStats(null);
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

      {verifiedDomains.length > 0 && (
        <>
          {stats && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{stats.verified_count}</div>
                    <div className="text-xs text-muted-foreground">Verified in {stats.search_location}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">{stats.filtered_count}</div>
                    <div className="text-xs text-muted-foreground">Filtered Out</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.total_found}</div>
                    <div className="text-xs text-muted-foreground">Total Found</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      <Badge variant="outline">{stats.location_type}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">Location Type</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                {verifiedDomains.length} Verified Domains
              </CardTitle>
              <CardDescription>
                All domains confirmed to be physically located in {location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                {verifiedDomains.map((item) => (
                  <div key={item.domain} className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                    <Checkbox
                      id={item.domain}
                      checked={selectedDomains.has(item.domain)}
                      onCheckedChange={() => toggleDomain(item.domain)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <label
                        htmlFor={item.domain}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {item.domain}
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          📍 {item.city}, {item.state} {item.zip || ''}
                        </p>
                        <Badge 
                          variant={item.confidence === 'high' ? 'default' : item.confidence === 'medium' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {item.confidence} confidence
                        </Badge>
                      </div>
                      {item.name && (
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {selectedDomains.size} of {verifiedDomains.length} selected
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

          {filteredDomains.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 w-full hover:opacity-80">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <CardTitle className="flex-1 text-left">
                      {filteredDomains.length} Domains Filtered Out (Wrong Location)
                    </CardTitle>
                    <ChevronDown className="h-4 w-4" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <CardDescription className="pb-4">
                      These domains were excluded because they are not physically located in {location}
                    </CardDescription>
                    <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3 bg-muted/30">
                      {filteredDomains.map((item, idx) => (
                        <div key={idx} className="text-sm p-2 bg-background rounded">
                          <div className="font-medium">{item.domain || item.name}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            ❌ {item.reason}
                            {item.actual_location && (
                              <span className="ml-2 text-destructive">
                                (Actually in: {item.actual_location})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardHeader>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
