import { Building2, Mail, Phone, MapPin, Globe, Clock, TrendingUp, Users } from "lucide-react";

export const DataPointsShowcase = () => {
  const dataPoints = [
    { icon: Building2, label: "Company Name", description: "Full legal business name" },
    { icon: Mail, label: "Email Addresses", description: "Decision-maker contacts" },
    { icon: Phone, label: "Phone Numbers", description: "Direct business lines" },
    { icon: MapPin, label: "Physical Address", description: "Office location" },
    { icon: Globe, label: "Industry & Size", description: "Business classification" },
    { icon: Users, label: "Employee Count", description: "Company size data" },
    { icon: TrendingUp, label: "Revenue Range", description: "Annual revenue estimates" },
    { icon: Clock, label: "Visit Timestamp", description: "When they visited" },
    { icon: Globe, label: "Pages Viewed", description: "What they looked at" },
    { icon: Clock, label: "Time on Site", description: "How long they stayed" },
    { icon: TrendingUp, label: "Intent Signals", description: "Buying indicators" },
    { icon: Globe, label: "Technology Stack", description: "Tools they use" },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            30+ Data Points Per Visitor
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to qualify and reach out to leads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dataPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-4 p-6 bg-background rounded-lg border hover:shadow-lg transition-shadow">
              <point.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">{point.label}</h3>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Plus: Social media profiles, web technologies, firmographics, and more
          </p>
        </div>
      </div>
    </section>
  );
};
