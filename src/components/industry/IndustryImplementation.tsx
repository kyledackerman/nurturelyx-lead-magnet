import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Code, Zap, Users, BarChart } from "lucide-react";

interface ImplementationStep {
  title: string;
  description: string;
  duration: string;
  icon: "code" | "zap" | "users" | "chart";
}

interface IndustryImplementationProps {
  industryName: string;
}

const iconMap = {
  code: Code,
  zap: Zap,
  users: Users,
  chart: BarChart,
};

const implementationSteps: ImplementationStep[] = [
  {
    title: "Quick Installation",
    description: "Add a simple tracking pixel to your website (similar to Google Analytics). Takes 5-10 minutes with our step-by-step guide. No technical expertise required.",
    duration: "10 minutes",
    icon: "code"
  },
  {
    title: "Immediate Data Collection",
    description: "Start collecting visitor data immediately. Our system begins identifying website visitors within 24 hours, matching anonymous traffic to verified contact databases.",
    duration: "24 hours",
    icon: "zap"
  },
  {
    title: "CRM Integration",
    description: "Connect to your existing CRM (Salesforce, HubSpot, Pipedrive, or 50+ others). Identified leads automatically sync to your sales workflow with full contact details.",
    duration: "15 minutes",
    icon: "users"
  },
  {
    title: "Optimize & Scale",
    description: "Use our analytics dashboard to track identification rates, lead quality, and conversion metrics. Refine your marketing campaigns based on real visitor intelligence data.",
    duration: "Ongoing",
    icon: "chart"
  }
];

export const IndustryImplementation = ({ industryName }: IndustryImplementationProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Implementation</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Getting Started With Visitor Identification
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From installation to optimization in under 30 minutes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {implementationSteps.map((step, index) => {
            const Icon = iconMap[step.icon];
            return (
              <Card key={index} className="border-2 hover:border-primary transition-colors relative">
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline">{step.duration}</Badge>
                  </div>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl">What Happens After Implementation?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Automatic Visitor Identification</div>
                <p className="text-sm text-muted-foreground">
                  Our system continuously monitors your website traffic, identifying 15-25% of visitors with verified contact information. 
                  Each identified visitor includes name, email, phone, company, and behavioral data.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Real-Time Lead Notifications</div>
                <p className="text-sm text-muted-foreground">
                  Get instant alerts when high-value prospects visit your site. Configure notifications based on pages viewed, time spent, 
                  or specific behaviors to prioritize hot leads for immediate follow-up.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Seamless Sales Workflow Integration</div>
                <p className="text-sm text-muted-foreground">
                  Identified leads flow directly into your existing sales process. No manual data entry required. Your team can focus on 
                  calling warm leads instead of chasing cold prospects or waiting for form submissions that never come.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">Continuous Performance Optimization</div>
                <p className="text-sm text-muted-foreground">
                  Our analytics dashboard shows which marketing channels drive the most identified visitors, what content attracts qualified leads, 
                  and where to allocate budget for maximum ROI. Most {industryName.toLowerCase()} companies see 3-5x return within 90 days.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 bg-muted/30 p-8 rounded-lg">
          <h3 className="text-xl font-bold mb-4">Common Questions About Implementation</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Does this slow down my website?</h4>
              <p className="text-sm text-muted-foreground">
                No. Our tracking pixel loads asynchronously and has zero impact on page speed or user experience. 
                It's lighter than most analytics tools and doesn't affect your SEO or Core Web Vitals scores.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What if I don't have a CRM?</h4>
              <p className="text-sm text-muted-foreground">
                No problem. You can access identified leads directly through our dashboard and export to CSV. 
                Many {industryName.toLowerCase()} companies start this way and add CRM integration later as they scale.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Can I test this before committing?</h4>
              <p className="text-sm text-muted-foreground">
                Yes. We offer a 14-day trial to see real identified visitors from your website. Most companies see dozens 
                of qualified leads in the first week, which makes the ROI decision straightforward.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
