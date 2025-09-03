import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "We were losing 80% of our website traffic until we implemented NurturelyX. Now we're capturing leads we never knew we had.",
    author: "Sarah Johnson",
    position: "CMO at TechVantage",
    company: "SaaS Platform",
    improvement: "143% increase in lead generation",
  },
  {
    quote:
      "Installation took less than 5 minutes and we started seeing results immediately. Our sales team now has 3x more qualified leads to work with.",
    author: "Michael Chen",
    position: "Director of Growth",
    company: "E-commerce Retailer",
    improvement: "285% ROI in first month",
  },
  {
    quote:
      "As a privacy officer, I was skeptical. But NurturelyX is fully compliant with regulations while still delivering incredible results.",
    author: "Amanda Williams",
    position: "Chief Privacy Officer",
    company: "Financial Services Firm",
    improvement: "$450K additional annual revenue",
  },
];

const Testimonials = () => {
  return (
    <Card className="bg-secondary mt-8">
      <CardHeader>
        <CardTitle className="text-white">What Our Customers Say</CardTitle>
        <CardDescription className="text-white">
          Real results from businesses like yours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background rounded-lg p-6 relative">
              <Quote className="absolute top-4 right-4 h-6 w-6 text-accent opacity-50" />
              <p className="text-sm mb-6 italic text-white">
                "{testimonial.quote}"
              </p>
              <div>
                <div>
                  <p className="font-medium text-sm text-white">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-white">{testimonial.position}</p>
                  <p className="text-xs text-accent mt-1">
                    {testimonial.improvement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Testimonials;
