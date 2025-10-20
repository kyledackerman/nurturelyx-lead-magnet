import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface ContentSection {
  heading: string;
  content: string[];
}

interface IndustryContentProps {
  industryName: string;
  sections: ContentSection[];
}

// Helper function to add contextual internal links to content
const enrichContentWithLinks = (content: string, industryName: string): (string | JSX.Element)[] => {
  const segments: (string | JSX.Element)[] = [];
  let remaining = content;
  let keyIndex = 0;

  // Define keyword-to-link mappings for contextual internal linking
  const linkMap: Record<string, { text: string; url: string }> = {
    "visitor identification": { text: "visitor identification", url: "/how-it-works" },
    "identity resolution": { text: "identity resolution", url: "/how-it-works" },
    "lead generation": { text: "lead generation", url: "/" },
    "anonymous traffic": { text: "anonymous traffic", url: "/learn" },
    "pricing": { text: "pricing", url: "/pricing" },
    "ROI": { text: "ROI calculator", url: "/pricing" },
  };

  // Process each keyword match
  Object.entries(linkMap).forEach(([keyword, { text, url }]) => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    const match = remaining.match(regex);
    
    if (match && match.index !== undefined) {
      const beforeMatch = remaining.substring(0, match.index);
      if (beforeMatch) segments.push(beforeMatch);
      
      segments.push(
        <Link 
          key={`link-${keyIndex++}`}
          to={url}
          className="text-primary hover:underline font-medium"
        >
          {match[0]}
        </Link>
      );
      
      remaining = remaining.substring(match.index + match[0].length);
    }
  });

  // Add any remaining text
  if (remaining) segments.push(remaining);
  
  return segments.length > 0 ? segments : [content];
};

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
                    {enrichContentWithLinks(paragraph, industryName)}
                  </p>
                ))}
                {index === 0 && (
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Related Resources:</strong>{" "}
                      <Link to="/how-it-works" className="text-primary hover:underline">
                        How Identity Resolution Works
                      </Link>
                      {" • "}
                      <Link to="/pricing" className="text-primary hover:underline">
                        View Pricing & ROI Calculator
                      </Link>
                      {" • "}
                      <Link to="/blog" className="text-primary hover:underline">
                        Read Our Blog
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
