import { Users, Eye, Shield } from "lucide-react";

const IdentityResolutionExplainer = () => {
  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            What Is Identity Resolution?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Think of it as giving your website digital vision—so you can finally see who your visitors really are.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Reveal Hidden Visitors</h3>
            <p className="text-muted-foreground">
              98% of visitors leave without filling out a form. Identity resolution uncovers who they are so you don't lose them.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Turn Traffic Into Leads</h3>
            <p className="text-muted-foreground">
              Match anonymous clicks to real companies and contacts. Convert wasted traffic into real sales opportunities.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Privacy-Safe by Design</h3>
            <p className="text-muted-foreground">
              Your data stays yours. We never rent, sell, or share it—ever.
            </p>
          </div>
        </div>

        {/* Differentiation callout */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-8 mb-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 text-foreground">
              This is <span className="text-primary">NOT</span> Like Those Other Tools
            </h3>
            <p className="text-lg text-muted-foreground mb-6 max-w-3xl mx-auto">
              Forget IP address guessing games. We don't make educated guesses about who <em>might</em> be visiting. 
              We give you the actual verified contact information of real people.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-3">❌ Other Tools (IP-Based Guessing)</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Guess company names from IP addresses</li>
                <li>• Provide generic company info only</li>
                <li>• No actual contact details</li>
                <li>• Low accuracy, lots of assumptions</li>
              </ul>
            </div>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-primary mb-3">✅ Our Identity Resolution</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Real names, emails & phone numbers</li>
                <li>• Verified street addresses</li>
                <li>• Financial data: net worth, income, credit rating</li>
                <li>• Plus 15+ additional verified attributes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* What You Actually Get section */}
        <div className="bg-card border rounded-lg p-8 mb-12">
          <h3 className="text-2xl font-bold text-center mb-6 text-foreground">
            What You Actually Get (Not Guesses, Real Data)
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contact Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full names</li>
                <li>• Email addresses</li>
                <li>• Phone numbers</li>
                <li>• Street addresses</li>
                <li>• Job titles & companies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Financial Profile</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Net worth estimates</li>
                <li>• Annual income ranges</li>
                <li>• Mortgage values</li>
                <li>• Credit rating indicators</li>
                <li>• Property ownership</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Demographics & More</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Age & family status</li>
                <li>• Education level</li>
                <li>• Lifestyle indicators</li>
                <li>• Purchase behavior</li>
                <li>• 10+ additional attributes</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground italic">
              All data sourced from verified databases and public records—not IP address guesswork.
            </p>
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-8 border">
          <h3 className="text-xl font-semibold mb-4 text-center text-foreground">
            Here's How Our Precision Process Works
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="mb-4">
              Every visitor leaves a unique digital fingerprint. Our advanced technology matches these fingerprints to verified contact databases—like having a private investigator instantly identify every person who visits your website.
            </p>
            <p>
              The difference? While IP-based tools make educated guesses about companies, we reveal the actual individuals: their names, how to reach them, and detailed profiles to help you close the deal.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdentityResolutionExplainer;