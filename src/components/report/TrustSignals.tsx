import { Users, TrendingUp, Shield } from "lucide-react";

const TrustSignals = () => {
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="space-y-2">
          <div className="flex justify-center">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">115+</div>
          <div className="text-sm text-muted-foreground">Active Businesses</div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">2.3M+</div>
          <div className="text-sm text-muted-foreground">Visitors Identified</div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="text-3xl font-bold text-foreground">100%</div>
          <div className="text-sm text-muted-foreground">GDPR Compliant</div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-primary/20">
        <p className="text-center text-sm text-muted-foreground">
          Recently joined: <span className="text-primary font-medium">HVAC Pro Solutions</span>, 
          <span className="text-primary font-medium"> Elite Legal Group</span>, 
          <span className="text-primary font-medium"> Summit Realty</span>
        </p>
      </div>
    </div>
  );
};

export default TrustSignals;
