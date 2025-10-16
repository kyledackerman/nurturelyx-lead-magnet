import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, Database } from "lucide-react";

export const IndustryDataOwnership = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-accent/5 to-background">
      <div className="container max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-accent/20 rounded-full mb-4">
            <span className="text-sm font-semibold text-accent">
              🔐 Your Data. Your Leads. Your Right.
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            This Is YOUR First-Party Data
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            When someone visits your website, they're interacting with YOUR business. 
            That's YOUR data. You have the legal right to know who's visiting, 
            under legitimate business interest principles.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-accent" />
                </div>
              </div>
              <CardTitle className="text-xl">Your Website</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Someone visits YOUR site, views YOUR services, 
                spends time researching YOUR solutions. This is YOUR first-party data.
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
              </div>
              <CardTitle className="text-xl">Your Right</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                You have the legal right to identify who's engaging with YOUR business 
                under legitimate interest (GDPR Article 6(1)(f)).
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-accent/20">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Lock className="h-5 w-5 text-accent" />
                </div>
              </div>
              <CardTitle className="text-xl">Your Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                These aren't leads we're selling you—they're YOUR visitors 
                that we're helping you identify. You own this data.
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Fully compliant with GDPR, CCPA, and all data privacy regulations
          </p>
        </div>
      </div>
    </section>
  );
};
