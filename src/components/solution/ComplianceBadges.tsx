import { Shield, Lock, CheckCircle } from "lucide-react";

export const ComplianceBadges = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Enterprise-Grade Security & Compliance
          </h2>
          <p className="text-lg text-muted-foreground">
            We take data privacy seriously
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-background rounded-lg border">
            <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">GDPR Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Full compliance with European data protection regulations. We only collect business data, never personal information.
            </p>
          </div>

          <div className="text-center p-6 bg-background rounded-lg border">
            <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">CCPA Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Adheres to California Consumer Privacy Act standards. All data collection is transparent and ethical.
            </p>
          </div>

          <div className="text-center p-6 bg-background rounded-lg border">
            <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">SOC 2 Type II</h3>
            <p className="text-sm text-muted-foreground">
              Independently audited security controls. Your data is encrypted at rest and in transit.
            </p>
          </div>
        </div>

        <div className="mt-12 p-8 bg-background rounded-lg border">
          <h3 className="text-xl font-semibold mb-4 text-center">How We Protect Privacy</h3>
          <ul className="space-y-3 max-w-3xl mx-auto">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Business data only:</strong> We identify companies, not individual consumers</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Public information:</strong> All data comes from publicly available sources</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Encrypted storage:</strong> AES-256 encryption for all sensitive data</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>No cookies required:</strong> Works without invasive tracking cookies</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>B2B focused:</strong> Designed for business-to-business lead generation only</p>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
};
