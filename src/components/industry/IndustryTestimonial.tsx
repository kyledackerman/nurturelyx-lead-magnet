import { User } from "lucide-react";

interface IndustryTestimonialProps {
  quote: string;
  name: string;
  company: string;
  industry: string;
}

export const IndustryTestimonial = ({ quote, name, company, industry }: IndustryTestimonialProps) => {
  return (
    <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-lg max-w-3xl mx-auto">
      <p className="text-lg italic mb-4">
        "{quote}"
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-accent" />
        </div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">{company} • {industry}</div>
        </div>
      </div>
    </div>
  );
};
