import { ArrowRight, Eye, Database, Mail } from "lucide-react";

export const TrackingDiagram = () => {
  return (
    <section className="py-16">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Reveal The Invisible 97%</h2>
          <p className="text-lg text-muted-foreground">
            Our identity resolution technology turns anonymous traffic into follow-up-ready leads in real-time
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          <div className="flex-1 flex flex-col items-center text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:shadow-lg transition-shadow">
            <Eye className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">1. They Visit</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Someone lands on your site from Google, an ad, social media—anywhere
            </p>
            <p className="text-xs text-primary font-medium">
              Could be your next $50k deal browsing pricing right now
            </p>
          </div>

          <div className="hidden md:flex">
            <ArrowRight className="h-10 w-10 text-primary flex-shrink-0" />
          </div>

          <div className="flex-1 flex flex-col items-center text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:shadow-lg transition-shadow">
            <Database className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">2. We Match</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Our AI cross-references their digital fingerprint with 250M+ contact profiles
            </p>
            <p className="text-xs text-primary font-medium">
              IP + device data + behavior = identity match in seconds
            </p>
          </div>

          <div className="hidden md:flex">
            <ArrowRight className="h-10 w-10 text-primary flex-shrink-0" />
          </div>

          <div className="flex-1 flex flex-col items-center text-center p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:shadow-lg transition-shadow">
            <Mail className="h-16 w-16 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">3. You Get Leads</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Full contact info appears in your dashboard: name, email, phone, company
            </p>
            <p className="text-xs text-primary font-medium">
              Follow up while they're hot. Close deals you didn't know existed
            </p>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border">
          <h3 className="text-2xl font-bold mb-6 text-center">The 3 Things That Happen After You Install</h3>
          <ul className="space-y-4 max-w-3xl mx-auto">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
              <div>
                <p className="font-semibold mb-1">Add our tracking pixel to your website</p>
                <p className="text-sm text-muted-foreground">Copy-paste one line of code. Takes 5 minutes. Works with any platform—WordPress, Shopify, custom sites</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
              <div>
                <p className="font-semibold mb-1">We match visitors to real people in real-time</p>
                <p className="text-sm text-muted-foreground">Our AI cross-references IP data, device fingerprints, and behavior patterns against 250M+ verified contacts. Matches happen instantly</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
              <div>
                <p className="font-semibold mb-1">You receive leads you can actually contact</p>
                <p className="text-sm text-muted-foreground">Get decision-maker names, verified emails, direct phone numbers, company details, and which pages they viewed—delivered to your dashboard daily</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
