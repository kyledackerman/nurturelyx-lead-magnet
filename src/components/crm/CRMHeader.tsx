import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SidebarTrigger } from "@/components/ui/sidebar";
import ActiveEnrichmentJobsIndicator from "./ActiveEnrichmentJobsIndicator";

interface CRMHeaderProps {
  onResumeEnrichment?: (jobId: string) => void;
}

export default function CRMHeader({ onResumeEnrichment }: CRMHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-10 border-b bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
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
            {onResumeEnrichment && (
              <ActiveEnrichmentJobsIndicator onResumeJob={onResumeEnrichment} />
            )}
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
