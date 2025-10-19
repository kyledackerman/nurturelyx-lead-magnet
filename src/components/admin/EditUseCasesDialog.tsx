import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditUseCasesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  currentText: string | null;
  companyName: string;
  domain: string;
  onUpdate: () => void;
}

export const EditUseCasesDialog = ({
  open,
  onOpenChange,
  reportId,
  currentText,
  companyName,
  domain,
  onUpdate,
}: EditUseCasesDialogProps) => {
  const [text, setText] = useState(currentText || "");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isOptimalLength = wordCount >= 200 && wordCount <= 400;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-use-cases', {
        body: { report_id: reportId }
      });

      if (error) throw error;

      if (data?.text) {
        setText(data.text);
        toast({
          title: "✨ Use cases regenerated",
          description: `${data.word_count} words generated for ${companyName}`,
        });
      }
    } catch (error) {
      console.error('Regeneration error:', error);
      toast({
        variant: "destructive",
        title: "Regeneration failed",
        description: error.message || "Could not generate new use cases",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          personalized_use_cases: text,
          use_cases_approved: true,
          use_cases_generated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "✅ Use cases saved",
        description: "Content updated successfully",
      });
      
      onUpdate();
      onOpenChange(false);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error.message || "Could not save changes",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Use Cases: {companyName}</DialogTitle>
          <DialogDescription>
            {domain} • These are publicly visible on the report page
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className={isOptimalLength ? "text-green-600 font-medium" : "text-muted-foreground"}>
                {wordCount} words
              </span>
              <span className="text-muted-foreground ml-2">(target: 200-400)</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerate}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate with AI
                </>
              )}
            </Button>
          </div>

          {!isOptimalLength && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {wordCount < 200 ? "Content is too short. " : "Content is too long. "}
                Aim for 200-400 words for optimal SEO and readability.
              </AlertDescription>
            </Alert>
          )}

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Write 2-3 specific scenarios showing how ${companyName} can use identity resolution...`}
            className="min-h-[400px] font-mono text-sm"
          />

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Preview</h4>
            <div className="space-y-4 text-sm">
              {text.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => (
                <p key={idx} className="text-foreground/90 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !text.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
