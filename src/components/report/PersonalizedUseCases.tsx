import { Card } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface PersonalizedUseCasesProps {
  companyName: string;
  industry: string;
  useCasesText: string | null;
}

export const PersonalizedUseCases = ({ 
  companyName, 
  industry, 
  useCasesText 
}: PersonalizedUseCasesProps) => {
  if (!useCasesText) return null;

  const paragraphs = useCasesText.split('\n\n').filter(p => p.trim().length > 0);
  const safeIndustry = typeof industry === 'string' ? industry : 'business';

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-accent/30 p-8 my-8">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 bg-accent/20 rounded-lg">
          <Lightbulb className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            How {companyName} Can Convert More Visitors
          </h2>
          <p className="text-muted-foreground text-sm">
            Specific scenarios for your {safeIndustry.replace(/-/g, ' ')} business
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {paragraphs.map((paragraph, idx) => (
          <div 
            key={idx} 
            className="relative pl-6 before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-accent/60"
          >
            <p className="text-foreground/90 leading-relaxed">
              {paragraph}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
