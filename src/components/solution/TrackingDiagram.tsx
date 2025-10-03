import { ArrowRight, Eye, Database, Mail } from "lucide-react";

export const TrackingDiagram = () => {
  return (
    <section className="py-16">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Solution</h2>
          <p className="text-lg text-muted-foreground">
            NurturelyX reveals who's visiting your website, even if they don't fill out a form
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
            <Eye className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">1. Visitor Lands</h3>
            <p className="text-sm text-muted-foreground">
              Someone visits your website from any source
            </p>
          </div>

          <div className="hidden md:flex justify-center">
            <ArrowRight className="h-8 w-8 text-primary" />
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
            <Database className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">2. We Identify</h3>
            <p className="text-sm text-muted-foreground">
              Our pixel identifies the business behind the visit
            </p>
          </div>

          <div className="hidden md:flex justify-center">
            <ArrowRight className="h-8 w-8 text-primary" />
          </div>

          <div className="flex flex-col items-center text-center p-6 bg-primary/5 rounded-lg border border-primary/20">
            <Mail className="h-12 w-12 text-primary mb-4" />
            <h3 className="font-semibold mb-2">3. You Follow Up</h3>
            <p className="text-sm text-muted-foreground">
              Contact them with full company details
            </p>
          </div>
        </div>

        <div className="mt-12 p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border">
          <h3 className="text-2xl font-bold mb-4 text-center">How It Works</h3>
          <ul className="space-y-4 max-w-3xl mx-auto">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
              <p><strong>Add our tracking pixel to your website</strong> - Takes 5 minutes, just paste one line of code</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
              <p><strong>We match visitors to business databases</strong> - Our system identifies companies using IP data, reverse lookup, and identity resolution</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
              <p><strong>Receive daily leads with full contact info</strong> - Company name, decision-maker emails, phone numbers, and pages they visited</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
