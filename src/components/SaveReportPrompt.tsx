import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, TrendingUp, History } from 'lucide-react';

interface SaveReportPromptProps {
  onDismiss: () => void;
}

const SaveReportPrompt = ({ onDismiss }: SaveReportPromptProps) => {
  return (
    <Card className="mt-8 border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Save className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Save This Report</CardTitle>
        </div>
        <CardDescription>
          Create a free account to save this report and track your progress over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <History className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Report History</h4>
                <p className="text-sm text-muted-foreground">
                  Access all your past reports in one place
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium">Track Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor improvements to your lead generation
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link to="/auth">Create Free Account</Link>
            </Button>
            <Button variant="outline" onClick={onDismiss}>
              Continue Without Saving
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SaveReportPrompt;