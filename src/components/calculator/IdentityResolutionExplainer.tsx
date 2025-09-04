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
            Think of it as giving your website digital glasses to see who your visitors really are
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">See Hidden Visitors</h3>
            <p className="text-muted-foreground">
              Most website visitors browse without filling out forms. Identity resolution reveals who they are.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Turn Traffic Into Leads</h3>
            <p className="text-muted-foreground">
              Connect anonymous visitors to real companies and contacts. Turn website traffic into sales opportunities.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Privacy Safe</h3>
            <p className="text-muted-foreground">
              Uses business data only. No personal information is collected or stored about individual visitors.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg p-8 border">
          <h3 className="text-xl font-semibold mb-4 text-center text-foreground">
            Here's How It Works
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="mb-4">
              Imagine your website visitors leave digital footprints. Identity resolution technology 
              follows these footprints to match them with company databases. It's like having a 
              detective that can tell you which businesses visited your site.
            </p>
            <p>
              Without this technology, 98% of your website visitors remain anonymous. You never know 
              who they are or how to follow up. With identity resolution, you can identify many of 
              these visitors and turn them into sales opportunities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdentityResolutionExplainer;