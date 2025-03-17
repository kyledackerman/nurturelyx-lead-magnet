
import { HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface DomainOverviewTabProps {
  domain: string;
  domainPower: number;
  backlinks: number;
  organicTraffic: number;
  organicKeywords: number;
}

const DomainOverviewTab = ({
  domain,
  domainPower,
  backlinks,
  organicTraffic,
  organicKeywords
}: DomainOverviewTabProps) => {
  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle>Domain Performance</CardTitle>
        <CardDescription className="text-gray-400">
          Metrics for {domain}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Domain Power</p>
            <p className="text-2xl font-bold text-accent">{domainPower}/100</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Backlinks</p>
            <p className="text-2xl font-bold text-accent">{backlinks.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Organic Traffic</p>
            <p className="text-2xl font-bold text-accent">{organicTraffic.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-background rounded-lg">
            <p className="text-sm text-gray-400 mb-1">Organic Keywords</p>
            <p className="text-2xl font-bold text-accent">{organicKeywords.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="methodology-card mt-6">
          <div className="flex items-center mb-2">
            <HelpCircle size={16} className="mr-2 text-accent" />
            <h3 className="methodology-title">What is Identity Resolution?</h3>
          </div>
          <p className="methodology-text">
            Identity resolution technology identifies anonymous website visitors without requiring them to opt-in. 
            While traditional lead capture methods only convert 2-5% of visitors, NurturelyX can identify up to 20% 
            of your website traffic, dramatically increasing your lead generation potential.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DomainOverviewTab;
