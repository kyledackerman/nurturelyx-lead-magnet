import { AlertCircle, Check, X } from "lucide-react";

interface IndustryCompetitorComparisonProps {
  industryName: string;
}

export const IndustryCompetitorComparison = ({ industryName }: IndustryCompetitorComparisonProps) => {
  return (
    <section className="py-16 bg-background border-y">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full mb-4">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-semibold text-destructive">
              Not Another IP-Based Tool
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            LeadFeeder, Clearbit & Leadfeeder Only Show Company Names
            <br />
            <span className="text-primary">You Need to Know the PERSON</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            IP-based visitor trackers were built for B2B SaaS companies. 
            They're useless for {industryName}—you're not selling to "Acme Corp", 
            you're selling to <strong>real people who need your services</strong>.
          </p>
        </div>

        {/* The Problem with IP-Based Tools */}
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 md:p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">🤷</span>
            <span>What You Get from IP-Based Tools</span>
          </h3>
          <div className="bg-background border border-destructive/20 rounded-lg p-6 mb-4">
            <div className="font-mono text-xs md:text-sm text-muted-foreground mb-2">LeadFeeder Report:</div>
            <div className="text-base md:text-lg mb-2">
              <strong>"ABC Company visited your website"</strong>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>📍 IP Address: 192.168.1.1</div>
              <div>🏢 Company: ABC Company (best guess)</div>
              <div>📞 Contact: <span className="text-destructive">(No contact information available)</span></div>
              <div>✉️ Email: <span className="text-destructive">(No email address available)</span></div>
            </div>
          </div>
          <p className="text-muted-foreground italic">
            Great... now what? You can't call them. You can't email them. 
            You don't even know if it was a real customer or a competitor checking prices.
          </p>
        </div>

        {/* What You Actually Need */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 md:p-8 mb-8">
          <h3 className="text-xl md:text-2xl font-bold mb-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <span>What You Get from NurturelyX</span>
          </h3>
          <div className="bg-background border border-primary/20 rounded-lg p-6 mb-4">
            <div className="font-mono text-xs md:text-sm text-muted-foreground mb-2">NurturelyX Identified Visitor:</div>
            <div className="text-base md:text-lg mb-2">
              <strong>Sarah Johnson</strong> viewed your services
            </div>
            <div className="text-sm space-y-1">
              <div>👤 Name: Sarah Johnson</div>
              <div>✉️ Email: sarah.johnson@email.com</div>
              <div>📞 Phone: (555) 123-4567</div>
              <div>📍 Address: 123 Main St, Austin, TX</div>
              <div>💰 Income: $85k-$120k</div>
              <div>🏠 Homeowner: Yes, $340k property value</div>
            </div>
          </div>
          <p className="text-foreground font-semibold">
            Now you know WHO to call, WHAT they're interested in, and if they can AFFORD your services. 
            That's a real lead you can close.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse bg-background rounded-lg overflow-hidden">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left p-4 font-semibold min-w-[150px]">Feature</th>
                <th className="text-left p-4 font-semibold bg-destructive/5 min-w-[200px]">
                  <div>IP-Based Tools</div>
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    LeadFeeder, Clearbit, Leadfeeder
                  </div>
                </th>
                <th className="text-left p-4 font-semibold bg-primary/5 min-w-[200px]">
                  <div>NurturelyX</div>
                  <div className="text-xs font-normal text-muted-foreground mt-1">
                    Identity Resolution
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-4 font-medium">What They Identify</td>
                <td className="p-4 bg-destructive/5">Company name (IP guess)</td>
                <td className="p-4 bg-primary/5">Individual people (verified)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Contact Information</td>
                <td className="p-4 bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    <span>None (just company name)</span>
                  </div>
                </td>
                <td className="p-4 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Name, email, phone, address</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Best For</td>
                <td className="p-4 bg-destructive/5">B2B SaaS selling to businesses</td>
                <td className="p-4 bg-primary/5">Home services, real estate, automotive (selling to consumers)</td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Actionable Lead?</td>
                <td className="p-4 bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    <span>"Someone from a company visited"</span>
                  </div>
                </td>
                <td className="p-4 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>"Sarah needs service, here's her number"</span>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-border">
                <td className="p-4 font-medium">Can You Call Them?</td>
                <td className="p-4 bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    <span>No phone number provided</span>
                  </div>
                </td>
                <td className="p-4 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Direct dial phone number</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Financial Qualification</td>
                <td className="p-4 bg-destructive/5">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-destructive" />
                    <span>No income/credit data</span>
                  </div>
                </td>
                <td className="p-4 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Income, net worth, credit indicators</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Call Out */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
            <h4 className="text-xl font-bold mb-3">
              The Bottom Line for {industryName}
            </h4>
            <p className="text-muted-foreground">
              If you're selling to <strong>businesses</strong>, use LeadFeeder. 
              If you're selling to <strong>people</strong> (homeowners, car buyers, patients, property seekers), 
              you need <strong>individual identity resolution</strong>—not company guesses.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
