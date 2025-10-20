import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContentSection {
  heading: string;
  content: string[];
}

interface IndustryContentProps {
  industryName: string;
  sections: ContentSection[];
}

export const IndustryContent = ({ industryName, sections }: IndustryContentProps) => {
  return (
    <section className="py-16 bg-background">
      <div className="container max-w-4xl">
        <div className="prose prose-lg max-w-none">
          {sections.map((section, index) => (
            <div key={index} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
                {section.heading}
              </h2>
              <div className="space-y-4">
                {section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
