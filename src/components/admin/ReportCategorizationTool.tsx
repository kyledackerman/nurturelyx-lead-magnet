import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Tags, CheckCircle2, AlertCircle } from "lucide-react";

interface CategorizationResult {
  message: string;
  totalReports: number;
  successCount: number;
  errorCount: number;
  sampleUpdates: Array<{
    domain: string;
    industry: string;
    companySize: string;
    trafficTier: string;
    companyName: string;
  }>;
}

export const ReportCategorizationTool = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<CategorizationResult | null>(null);

  const handleCategorize = async () => {
    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('categorize-reports', {
        method: 'POST',
      });

      if (error) {
        throw error;
      }

      setResult(data as CategorizationResult);
      
      if (data.errorCount === 0) {
        toast.success(`Successfully categorized ${data.successCount} reports!`, {
          description: `Industries assigned, traffic tiers calculated, and SEO metadata generated.`,
          duration: 5000,
        });
      } else {
        toast.warning(`Categorized ${data.successCount} reports with ${data.errorCount} errors`, {
          description: 'Check the results below for details.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error running categorization:', error);
      toast.error('Failed to categorize reports', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        duration: 5000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tags className="h-5 w-5 text-primary" />
            <CardTitle>SEO Report Categorization</CardTitle>
          </div>
          {result && (
            <Badge variant="secondary">
              {result.successCount}/{result.totalReports} categorized
            </Badge>
          )}
        </div>
        <CardDescription>
          Automatically analyze and categorize uncategorized reports with industry, company size, traffic tier, and SEO metadata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleCategorize} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Reports...
              </>
            ) : (
              <>
                <Tags className="w-4 h-4 mr-2" />
                Run Categorization
              </>
            )}
          </Button>
        </div>

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Total Reports</div>
                <div className="text-2xl font-bold">{result.totalReports}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  Success
                </div>
                <div className="text-2xl font-bold text-green-600">{result.successCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 text-orange-600" />
                  Errors
                </div>
                <div className="text-2xl font-bold text-orange-600">{result.errorCount}</div>
              </div>
            </div>

            {result.sampleUpdates && result.sampleUpdates.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Sample Results (First 10):</div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.sampleUpdates.map((update, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-muted rounded-lg space-y-1 text-xs"
                    >
                      <div className="font-medium text-foreground">{update.companyName}</div>
                      <div className="text-muted-foreground">{update.domain}</div>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {update.industry}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {update.companySize}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {update.trafficTier} traffic
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-2 space-y-2 text-xs text-muted-foreground">
          <p><strong>What this does:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Detects industry from domain keywords (HVAC, Legal, Real Estate, etc.)</li>
            <li>Calculates traffic tier (Low, Medium, High, Enterprise)</li>
            <li>Assigns company size (Small, Medium, Large)</li>
            <li>Generates SEO titles and meta descriptions</li>
            <li>Extracts clean company names</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
