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
      "We were losing 80% of our website traffic until we implemented NurturelyX. Now we're capturing leads we never knew existed. The pixel identified 847 leads in our first month alone.",
    author: "Sarah Johnson",
    position: "CMO",
    company: "TechVantage Solutions",
    improvement: "847 new leads in month 1",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    quote:
      "Installation literally took 4 minutes. Within hours, we started seeing identified visitors. Our sales team went from 10 qualified leads per week to 35. This is a game-changer.",
    author: "Michael Chen",
    position: "Director of Growth",
    company: "Summit Realty Group",
    improvement: "3.5x more qualified leads",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    quote:
      "As a privacy officer, I was extremely skeptical. But NurturelyX's compliance with GDPR and CCPA is impeccable. We've generated $450K in new revenue while staying 100% compliant.",
    author: "Amanda Williams",
    position: "Chief Privacy Officer",
    company: "Pinnacle Financial",
    improvement: "$450K additional revenue",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
  {
    quote:
      "Before NurturelyX, we had no idea who was visiting our site. Now we know exactly who they are, what they're interested in, and when to reach out. Our close rate jumped from 2% to 8%.",
    author: "David Martinez",
    position: "VP of Sales",
    company: "Elite HVAC Services",
    improvement: "4x increase in close rate",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
  {
    quote:
      "We were spending $15K/month on paid ads with mediocre results. With NurturelyX, we're capturing high-intent visitors we were already getting organically. Saved us thousands.",
    author: "Jennifer Lee",
    position: "Marketing Director",
    company: "Premier Legal Group",
    improvement: "Reduced ad spend by 60%",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop",
  },
  {
    quote:
      "The ROI is insane. We're paying $100/month + about $300 in credits, and generating an extra $12K in monthly revenue. That's a 30x return. Best business decision we've made.",
    author: "Robert Thompson",
    position: "Owner",
    company: "Thompson Plumbing Co",
    improvement: "30x ROI month over month",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  },
];

const Testimonials = () => {
  return (
    <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 mt-8">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-foreground">What Our Customers Say</CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          Real results from businesses just like yours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-background border border-border rounded-lg p-6 relative hover:shadow-lg transition-shadow">
              <Quote className="absolute top-4 right-4 h-6 w-6 text-primary opacity-30" />
              
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-muted-foreground">{testimonial.position}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
              
              <p className="text-sm mb-4 text-muted-foreground leading-relaxed">
                "{testimonial.quote}"
              </p>
              
              <div className="bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
                <p className="text-xs font-semibold text-primary text-center">
                  {testimonial.improvement}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Testimonials;
