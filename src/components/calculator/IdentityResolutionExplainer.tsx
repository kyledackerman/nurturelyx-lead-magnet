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

        <div className="bg-muted/50 rounded-lg p-8 border">
          <h3 className="text-xl font-semibold mb-4 text-center text-foreground">
            Here's How It Works
          </h3>
          <div className="prose prose-sm max-w-none text-muted-foreground">
            <p className="mb-4">
              Every visitor leaves a digital footprint. Our technology connects those footprints to verified company databases—like a detective showing you exactly which businesses visited your site.
            </p>
            <p>
              Without identity resolution, your best prospects vanish in silence. With it, you can follow up, engage, and win deals you would have never known existed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IdentityResolutionExplainer;