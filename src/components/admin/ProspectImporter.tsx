import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const ProspectImporter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{
    success: number;
    failed: number;
    errors: Array<{ row: number; domain: string; error: string }>;
  } | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV file",
          variant: "destructive",
        });
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 5MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const csvData = await file.text();
      const lines = csvData.split('\n').filter(line => line.trim());
      
      if (lines.length > 1001) {
        toast({
          title: "Too many rows",
          description: "Maximum 1000 rows per import",
          variant: "destructive",
        });
        setImporting(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('import-prospects', {
        body: { csvData, fileName: file.name },
      });

      if (error) throw error;

      setResult(data);
      
      if (data.failed === 0) {
        toast({
          title: "Import successful",
          description: `Successfully imported ${data.success} prospects with contacts`,
        });
      } else {
        toast({
          title: "Import completed with errors",
          description: `${data.success} succeeded, ${data.failed} failed`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error.message || "Failed to import prospects",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `domain,first_name,last_name,email,phone,title,linkedin_url,company_name
example.com,John,Doe,john@example.com,555-1234,CEO,https://linkedin.com/in/johndoe,Example Corp
another.com,Jane,Smith,jane@another.com,555-5678,CTO,,Another Company`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prospect_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Import Enriched Prospects</h3>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              Upload a CSV file with columns: <strong>domain</strong>, <strong>first_name</strong>, <strong>last_name</strong> (required),
              plus optional: email, phone, title, linkedin_url, company_name
            </AlertDescription>
          </Alert>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90
                  cursor-pointer"
              />
            </div>
            <Button
              onClick={handleImport}
              disabled={!file || importing}
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </>
              )}
            </Button>
          </div>

          {file && !importing && !result && (
            <p className="text-sm text-muted-foreground">
              Ready to import: <strong>{file.name}</strong>
            </p>
          )}
        </div>
      </Card>

      {result && (
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Import Results</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">{result.success} succeeded</span>
              </div>
              {result.failed > 0 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">{result.failed} failed</span>
                </div>
              )}
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Errors:</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {result.errors.map((err, idx) => (
                    <div key={idx} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      <strong>Row {err.row} ({err.domain}):</strong> {err.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
