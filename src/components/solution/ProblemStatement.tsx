import { AlertCircle } from "lucide-react";

export const ProblemStatement = () => {
  return (
    <section className="py-16 bg-destructive/5">
      <div className="container max-w-5xl">
        <div className="flex items-center justify-center gap-4 mb-8">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-3xl md:text-4xl font-bold">The Problem</h2>
        </div>
        
        <div className="text-center space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-background rounded-lg border">
              <div className="text-4xl font-bold text-destructive mb-2">97-98%</div>
              <p className="text-muted-foreground">
                Browse, research, and vanish without a trace
              </p>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <div className="text-4xl font-bold text-destructive mb-2">$127k</div>
              <p className="text-muted-foreground">
                Average annual revenue lost per business
              </p>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <div className="text-4xl font-bold text-destructive mb-2">0 Names</div>
              <p className="text-muted-foreground">
                You have zero contact info for these visitors
              </p>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground mt-8 max-w-3xl mx-auto">
            You're spending thousands on ads, SEO, and content marketing to drive traffic. But <span className="font-semibold text-foreground">97% of visitors leave without converting</span>. They don't fill out forms, they don't call, they just browse and vanish. You have no idea who they were, which pages they viewed, or how to follow up. That's not a lead generation problem—that's a <span className="font-semibold text-foreground">lead identification problem</span>.
          </p>
          
          <p className="text-sm text-muted-foreground mt-4 italic">
            * Industry averages based on data from 6sense, Leadpipe, and Factors.ai (2024-2025)
          </p>
        </div>
      </div>
    </section>
  );
};
