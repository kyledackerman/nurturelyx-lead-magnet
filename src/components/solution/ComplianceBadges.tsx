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
              Full compliance with European data protection regulations under Article 6(1)(f) legitimate interest. We unlock your first-party data that is lawfully yours.
            </p>
          </div>

          <div className="text-center p-6 bg-background rounded-lg border">
            <Lock className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">CCPA Compliant</h3>
            <p className="text-sm text-muted-foreground">
              Adheres to California Consumer Privacy Act standards. We unlock your own data - never sell it. All processing is transparent and ethical.
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
              <p className="text-sm"><strong>Your data, unlocked:</strong> We reveal the identities behind your own first-party website data that is lawfully yours</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>First-party data matching:</strong> We match your website data with verified business contact databases to identify visitors</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Legitimate interest basis:</strong> Operating under Article 6(1)(f) GDPR - you have a lawful right to this data</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Verified business sources:</strong> All identities from lawful, consent-based business contact databases</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Your data stays yours:</strong> We never sell, share, or use your data for advertising or remarketing</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Encrypted storage:</strong> AES-256 encryption for all sensitive data</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>B2B focused:</strong> Designed for business-to-business lead generation only</p>
            </li>
          </ul>
        </div>

        <div className="mt-8 p-8 bg-background rounded-lg border">
          <h3 className="text-xl font-semibold mb-4 text-center">Data Processing Agreement (DPA)</h3>
          <p className="text-sm text-muted-foreground mb-4 text-center max-w-2xl mx-auto">
            Every customer receives a comprehensive DPA that details:
          </p>
          <ul className="space-y-3 max-w-3xl mx-auto">
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Data matching and storage:</strong> How we match and securely store visitor data</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Retention periods:</strong> Clear timelines for how long data is kept</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Rights of access and erasure:</strong> How visitors can request their data or deletion</p>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm"><strong>Data Protection Officer contact:</strong> Direct line to our compliance team</p>
            </li>
          </ul>
          <p className="text-sm text-center mt-6 text-muted-foreground">
            For EU/UK visitors: Contact our Data Protection Officer at <a href="mailto:privacy@nurturely.io" className="text-primary hover:underline">privacy@nurturely.io</a> to request access, correction, or deletion of your data.
          </p>
        </div>
      </div>
    </section>
  );
};
