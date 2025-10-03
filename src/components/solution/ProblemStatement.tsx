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
          <p className="text-2xl md:text-3xl font-bold text-destructive">
            95% of your website visitors are completely anonymous
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-background rounded-lg border">
              <div className="text-4xl font-bold text-destructive mb-2">95%</div>
              <p className="text-muted-foreground">
                Never fill out a form or contact you
              </p>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <div className="text-4xl font-bold text-destructive mb-2">$127k</div>
              <p className="text-muted-foreground">
                Average annual revenue lost per business
              </p>
            </div>
            
            <div className="p-6 bg-background rounded-lg border">
              <div className="text-4xl font-bold text-destructive mb-2">72%</div>
              <p className="text-muted-foreground">
                Leave without you knowing who they are
              </p>
            </div>
          </div>
          
          <p className="text-lg text-muted-foreground mt-8 max-w-3xl mx-auto">
            You're spending money on ads, SEO, and content marketing to drive traffic to your website. 
            But when visitors don't convert immediately, they vanish forever. You have no idea who they were, 
            what they wanted, or how to follow up.
          </p>
        </div>
      </div>
    </section>
  );
};
