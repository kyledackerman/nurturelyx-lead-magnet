import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, TrendingUp, Users } from "lucide-react";

interface InternalLink {
  title: string;
  href: string;
  description: string;
}

const keyPages: InternalLink[] = [
  {
    title: "How It Works",
    href: "/how-it-works",
    description: "Learn about visitor identification technology"
  },
  {
    title: "Pricing",
    href: "/pricing",
    description: "Simple, transparent pricing with ROI calculator"
  },
  {
    title: "Industry Reports",
    href: "/industries",
    description: "See real examples from your industry"
  },
  {
    title: "Blog",
    href: "/blog",
    description: "Lead generation insights and best practices"
  }
];

interface InternalLinkingWidgetProps {
  title?: string;
  links?: InternalLink[];
  className?: string;
}

export const InternalLinkingWidget = ({ 
  title = "Helpful Resources", 
  links = keyPages,
  className = ""
}: InternalLinkingWidgetProps) => {
  return (
    <aside className={`py-12 bg-muted/30 ${className}`}>
      <div className="container max-w-6xl">
        <h2 className="text-2xl font-bold mb-6 text-center">{title}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {links.map((link) => (
            <Link 
              key={link.href} 
              to={link.href}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-md hover:border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base group-hover:text-primary transition-colors flex items-center justify-between">
                    {link.title}
                    <ArrowRight className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
};
